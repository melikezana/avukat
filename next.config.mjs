function getSupabaseStorageHostname() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return null;
  }
}

const supabaseStorageHostname = getSupabaseStorageHostname();
const supabaseStorageRemotePatterns = [
  {
    protocol: "https",
    hostname: "**.supabase.co",
    pathname: "/storage/v1/object/public/article-images/**"
  },
  {
    protocol: "https",
    hostname: "**.supabase.in",
    pathname: "/storage/v1/object/public/article-images/**"
  },
  ...(supabaseStorageHostname
    ? [
        {
          protocol: "https",
          hostname: supabaseStorageHostname,
          pathname: "/storage/v1/object/public/article-images/**"
        }
      ]
    : [])
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: supabaseStorageRemotePatterns,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  }
};

export default nextConfig;
