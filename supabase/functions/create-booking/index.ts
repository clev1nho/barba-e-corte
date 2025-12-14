import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (resets on function restart)
// For production, consider using Redis or a database-backed solution
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 bookings per minute per IP

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  entry.count++;
  return false;
}

// Clean up old entries periodically
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Check rate limit
    if (isRateLimited(clientIp)) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Muitas solicitações. Por favor, aguarde um momento antes de tentar novamente." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Periodic cleanup
    if (Math.random() < 0.1) {
      cleanupRateLimitMap();
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await req.json();
    const { 
      service_id, 
      service_ids,
      barber_id, 
      date, 
      time, 
      duration_minutes, 
      client_name, 
      client_whatsapp,
      client_email,
      client_birth_date,
      referral_source,
      total_price,
      total_deposit,
      honeypot
    } = body;

    // Honeypot check
    if (honeypot) {
      console.log(`Honeypot triggered by IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ success: true, id: "fake-id" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!date || !time || !duration_minutes || !client_name || !client_whatsapp) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios não preenchidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate client_name length (2-100 chars)
    const trimmedName = client_name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Nome deve ter entre 2 e 100 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate WhatsApp format (basic check for digits only, 10-20 chars)
    const cleanedWhatsapp = client_whatsapp.replace(/\D/g, "");
    if (cleanedWhatsapp.length < 10 || cleanedWhatsapp.length > 20) {
      return new Response(
        JSON.stringify({ error: "Número de WhatsApp inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing appointment at the same time slot (only active statuses)
    const { data: existingAppointment, error: checkError } = await supabase
      .from("appointments")
      .select("id")
      .eq("date", date)
      .eq("time", time)
      .eq("barber_id", barber_id)
      .in("status", ["Pendente", "Confirmado"])
      .limit(1);

    if (checkError) {
      console.error("Error checking existing appointments:", checkError);
      return new Response(
        JSON.stringify({ error: "Erro ao verificar disponibilidade do horário." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingAppointment && existingAppointment.length > 0) {
      console.log(`Slot conflict: barber=${barber_id}, date=${date}, time=${time}`);
      return new Response(
        JSON.stringify({ 
          error: "HORARIO_INDISPONIVEL", 
          message: "Este horário já está reservado. Por favor, escolha outro horário." 
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the appointment
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        service_id: service_id || null,
        service_ids: service_ids || [],
        barber_id: barber_id || null,
        date,
        time,
        duration_minutes,
        client_name: trimmedName,
        client_whatsapp: cleanedWhatsapp,
        client_email: client_email?.trim() || null,
        client_birth_date: client_birth_date || null,
        referral_source: referral_source || null,
        total_price: total_price || 0,
        total_deposit: total_deposit || 0,
        status: "Pendente"
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating appointment:", error);
      
      // Handle unique constraint violation (race condition protection)
      if (error.code === "23505") {
        console.log(`Unique constraint violation: barber=${barber_id}, date=${date}, time=${time}`);
        return new Response(
          JSON.stringify({ 
            error: "HORARIO_INDISPONIVEL", 
            message: "Este horário acabou de ser reservado. Por favor, escolha outro horário." 
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao criar agendamento. Por favor, tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Appointment created: ${data.id} by IP: ${clientIp}`);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in create-booking function:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
