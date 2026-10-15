import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // не светить движок в заголовке X-Powered-By
  poweredByHeader: false,
  // NB: never set output: 'export' on Vercel — it disables next/image and route handlers.
  // standalone нужен для собственного сервера (VPS): собирает .next/standalone/server.js
  // со всеми зависимостями. На Vercel игнорируется — там своя сборка.
  output: "standalone",
  // отдельная папка сборки для замеров скорости, пока рядом работает dev-сервер (по умолчанию .next)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // контакты живут на "Обо мне": привычные адреса не отдают 404. permanent даёт 308, вес переходит на новый адрес
  // HSTS: браузер сразу идёт по https. без includeSubDomains, чтобы не задеть поддомены демо
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] }];
  },
  async redirects() {
    return ["/kontakty", "/about", "/contacts"].map((source) => ({ source, destination: "/obo-mne", permanent: true }));
  },
};

export default nextConfig;
