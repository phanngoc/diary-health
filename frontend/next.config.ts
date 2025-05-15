import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizeFonts: true,
  },
  images: {
    domains: ['fonts.gstatic.com'],
  },
};

export default nextConfig;
