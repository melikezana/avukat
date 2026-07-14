export function getSupabaseConfig() {
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
      `Supabase client could not be created. Missing environment variable(s): ${missingVariables.join(
        ", "
      )}. Add them to .env.local and your deployment environment.`
    );
  }

  return {
    supabaseUrl,
    supabasePublishableKey
  };
}
