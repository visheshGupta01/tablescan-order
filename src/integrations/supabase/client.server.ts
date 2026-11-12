import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function createSupabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
    if (init?.headers) new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    if ((key.startsWith("sb_publishable_") || key.startsWith("sb_secret_")) && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment.");
  return createClient<Database>(url, key, {
    global: { fetch: createSupabaseFetch(key) },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let instance: ReturnType<typeof createSupabaseAdminClient> | undefined;
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_target, property, receiver) {
    instance ??= createSupabaseAdminClient();
    return Reflect.get(instance, property, receiver);
  },
});
