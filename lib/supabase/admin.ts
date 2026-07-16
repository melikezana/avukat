import "server-only";

import { createClient } from "@supabase/supabase-js";

function getSupabaseAdminConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    const missingVariables = [
      ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
      ["SUPABASE_SECRET_KEY", supabaseSecretKey]
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);

    throw new Error(
      `Supabase admin client could not be created. Missing environment variable(s): ${missingVariables.join(", ")}.`
    );
  }

  return {
    supabaseUrl,
    supabaseSecretKey
  };
}

export function createSupabaseAdminClient() {
  const { supabaseUrl, supabaseSecretKey } = getSupabaseAdminConfig();

  const adminClient = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });

  return adminClient;
}
