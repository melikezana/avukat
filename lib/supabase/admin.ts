import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

function getSupabaseAdminKey() {
  const supabaseAdminKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseAdminKey) {
    throw new Error(
      "Supabase admin client could not be created. Missing environment variable: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY."
    );
  }

  return supabaseAdminKey;
}

export function createSupabaseAdminClient() {
  const { supabaseUrl } = getSupabaseConfig();

  return createClient(supabaseUrl, getSupabaseAdminKey(), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}
