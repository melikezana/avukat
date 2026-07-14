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
const supabaseStorageRemotePatterns = supabaseStorageHostname
  ? [
      {
        protocol: "https",
        hostname: supabaseStorageHostname,
        pathname: "/storage/v1/object/public/article-images/**"
      }
    ]
  : [];

function getSupabaseOrigin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  try {
    return new URL(supabaseUrl).origin;
  } catch {
    return null;
  }
}

function getContentSecurityPolicy() {
  const isProduction = process.env.NODE_ENV === "production";
  const supabaseOrigin = getSupabaseOrigin();
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isProduction ? [] : ["'unsafe-eval'"]),
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com"
  ];
  const connectSrc = [
    "'self'",
    "https://vitals.vercel-insights.com",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://*.supabase.co",
    "https://*.supabase.in",
    ...(supabaseOrigin ? [supabaseOrigin] : [])
  ];
  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https://www.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://*.supabase.co",
    "https://*.supabase.in",
    ...(supabaseOrigin ? [supabaseOrigin] : [])
  ];
  const directives = [
    ["default-src", "'self'"],
    ["base-uri", "'self'"],
    ["object-src", "'none'"],
    ["frame-ancestors", "'self'"],
    ["form-action", "'self'"],
    ["script-src", ...scriptSrc],
    ["style-src", "'self'", "'unsafe-inline'"],
    ["img-src", ...imgSrc],
    ["font-src", "'self'", "data:"],
    ["connect-src", ...connectSrc],
    ["frame-src", "'self'", "https://www.google.com", "https://maps.google.com"],
    ["media-src", "'self'", "https://*.supabase.co", "https://*.supabase.in"],
    ...(isProduction ? [["upgrade-insecure-requests"]] : [])
  ];

  return directives.map((directive) => directive.join(" ")).join("; ");
}

function getSecurityHeaders() {
  const headers = [
    {
      key: "X-Content-Type-Options",
      value: "nosniff"
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin"
    },
    {
      key: "X-Frame-Options",
      value: "SAMEORIGIN"
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
    },
    {
      key: "Content-Security-Policy",
      value: getContentSecurityPolicy()
    }
  ];

  if (process.env.VERCEL_ENV === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload"
    });
  }

  return headers;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: supabaseStorageRemotePatterns,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: getSecurityHeaders()
      }
    ];
  }
};

export default nextConfig;
