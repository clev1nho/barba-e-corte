import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { email, password, setup_key } = await req.json();

    // Allow initial setup with a special bypass key
    const isInitialSetup = setup_key === "initial_setup_bypass";
    
    if (!isInitialSetup) {
      // Require admin authentication for subsequent calls
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if the requesting user is an admin
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData?.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Only admins can create users" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // For initial setup, check if admin already exists
      const { data: existingAdmins } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("role", "admin")
        .limit(1);

      if (existingAdmins && existingAdmins.length > 0) {
        return new Response(
          JSON.stringify({ error: "An admin user already exists. Initial setup is disabled." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the user using admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      // If user already exists, try to get their ID
      if (createError.message.includes("already been registered")) {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);
        
        if (existingUser) {
          // Update their role to admin
          const { error: upsertError } = await supabaseAdmin
            .from("user_roles")
            .upsert({ user_id: existingUser.id, role: "admin" });

          if (upsertError) {
            // Try delete then insert
            await supabaseAdmin
              .from("user_roles")
              .delete()
              .eq("user_id", existingUser.id);
            
            await supabaseAdmin
              .from("user_roles")
              .insert({ user_id: existingUser.id, role: "admin" });
          }

          return new Response(
            JSON.stringify({ message: "User already exists, role updated to admin", user_id: existingUser.id }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      throw createError;
    }

    // Update the user's role to admin
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .update({ role: "admin" })
      .eq("user_id", userData.user.id);

    if (roleError) {
      // If update fails, try delete then insert
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", userData.user.id);
      
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userData.user.id, role: "admin" });
    }

    return new Response(
      JSON.stringify({ message: "Admin user created successfully", user_id: userData.user.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating admin user:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
