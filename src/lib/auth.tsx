import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
};

export function useSession() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["session"],
    queryFn: async (): Promise<Session | null> => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        queryClient.invalidateQueries({ queryKey: ["session"] });
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  return query;
}

export function useProfile() {
  const { data: session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone, email, avatar_url")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useIsAdmin() {
  const { data: session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}
