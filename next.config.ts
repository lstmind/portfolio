import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // NB: never set output: 'export' on Vercel — it disables next/image and route handlers.
  // standalone нужен для собственного сервера (VPS): собирает .next/standalone/server.js
  // со всеми зависимостями. На Vercel игнорируется — там своя сборка.
  output: "standalone",
};

export default nextConfig;
