import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // NB: never set output: 'export' on Vercel — it disables next/image and route handlers.
  // standalone нужен для собственного сервера (VPS): собирает .next/standalone/server.js
  // со всеми зависимостями. На Vercel игнорируется — там своя сборка.
  output: "standalone",
  // отдельная папка сборки для замеров скорости, пока рядом работает dev-сервер (по умолчанию .next)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // контакты живут на "Обо мне": привычные адреса не отдают 404. permanent даёт 308, вес переходит на новый адрес
  async redirects() {
    return ["/kontakty", "/about", "/contacts"].map((source) => ({ source, destination: "/obo-mne", permanent: true }));
  },
};

export default nextConfig;
