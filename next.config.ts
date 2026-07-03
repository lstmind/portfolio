import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // NB: never set output: 'export' on Vercel — it disables next/image and route handlers.
};

export default nextConfig;
