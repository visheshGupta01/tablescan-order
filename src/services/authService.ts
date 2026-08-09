import { supabase } from "@/integrations/supabase/client";

export const authService = {
  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` },
    });
    if (error) throw error;
  },
  async signOut() {
    await supabase.auth.signOut();
  },
  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  },
};
