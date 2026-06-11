import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Алексей (lstmind) — веб-разработчик. Сайты, которые работают";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const font = await readFile(join(process.cwd(), "app/og/manrope.woff"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08080A",
          color: "#F4F2EC",
          padding: 72,
          fontFamily: "Manrope",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 24, height: 24, background: "#FF2E1F" }} />
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#9A9AA2" }}>
            АЛЕКСЕЙ · ВЕБ-РАЗРАБОТЧИК
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 80, lineHeight: 1.04, letterSpacing: -3 }}>
          <div style={{ display: "flex" }}>Делаю сайты,</div>
          <div style={{ display: "flex" }}>которые работают.</div>
          <div style={{ display: "flex", color: "#FF2E1F" }}>Чужие — чиню.</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 24 }}>
          <div style={{ display: "flex", color: "#9A9AA2" }}>
            lstmind · сайты под ключ, магазины, ускорение
          </div>
          <div style={{ display: "flex", color: "#FF2E1F" }}>Рейтинг 5.0 на Kwork</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Manrope", data: font, weight: 800, style: "normal" }],
    }
  );
}
