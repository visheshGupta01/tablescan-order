import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if ((supabaseKey.startsWith("sb_publishable_") || supabaseKey.startsWith("sb_secret_")) && headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function createSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the deployment environment, then redeploy.");
  }
  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    global: { fetch: createSupabaseFetch(supabasePublishableKey) },
    auth: { storage: typeof window === "undefined" ? undefined : window.localStorage, persistSession: true, autoRefreshToken: true },
  });
}

let instance: ReturnType<typeof createSupabaseClient> | undefined;
export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_target, property, receiver) {
    instance ??= createSupabaseClient();
    return Reflect.get(instance, property, receiver);
  },
});
