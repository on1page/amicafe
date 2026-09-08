import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // COMMENTATO: Non usare 'standalone' su Vercel!
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: false,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob: https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https:; media-src 'self' data: https:; object-src 'none'; frame-src 'self' https:; base-uri 'self'; form-action 'self';"
          },
        ],
      },
    ]
  },
};

export default nextConfig;