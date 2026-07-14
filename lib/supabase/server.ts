import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseServerConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    const missingVariables = [
      ["NEXT_PUBLIC_SUPABASE_URL", supabaseUrl],
      ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", supabasePublishableKey]
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);

    throw new Error(
      `Supabase server client could not be created. Missing environment variable(s): ${missingVariables.join(
        ", "
      )}. Add them to .env.local and your deployment environment.`
    );
  }

  return {
    supabaseUrl,
    supabasePublishableKey
  };
}

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const { supabaseUrl, supabasePublishableKey } = getSupabaseServerConfig();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write response cookies; middleware or route handlers can.
        }
      }
    }
  });
}
