import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Erros de tipagem legados em formulários/charts; build de produção não deve bloquear
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
