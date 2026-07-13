/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  }
};

export default nextConfig;
