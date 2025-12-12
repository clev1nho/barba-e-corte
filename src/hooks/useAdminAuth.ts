import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "owner" | "staff" | "user";

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [checkingRole, setCheckingRole] = useState(false);

  const checkUserRole = async (userId: string): Promise<UserRole | null> => {
    setCheckingRole(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error checking role:", error);
        setRole(null);
        return null;
      }

      const userRole = data?.role as UserRole;
      setRole(userRole);
      return userRole;
    } catch (error) {
      console.error("Error checking user role:", error);
      setRole(null);
      return null;
    } finally {
      setCheckingRole(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error, role: null };
    }

    if (data.user) {
      const userRole = await checkUserRole(data.user.id);
      return { error: null, role: userRole };
    }

    return { error: null, role: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setRole(null);
    return { error };
  };

  // Helper booleans
  const isAdmin = role === "admin";
  const isOwner = role === "owner";
  const isStaff = role === "staff";
  const isAdminOrOwner = role === "admin" || role === "owner";
  const hasAdminAccess = isAdminOrOwner || isStaff;

  return {
    user,
    session,
    loading: loading || checkingRole,
    role,
    isAdmin,
    isOwner,
    isStaff,
    isAdminOrOwner,
    hasAdminAccess,
    signIn,
    signOut,
    isAuthenticated: !!session,
  };
}
