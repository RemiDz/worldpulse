import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://plausible.io",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "connect-src 'self' https://plausible.io https://services.swpc.noaa.gov https://air-quality-api.open-meteo.com https://api.waqi.info",
            "media-src 'self'",
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;
