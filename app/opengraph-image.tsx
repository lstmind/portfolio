import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";
export const alt = "Алексей (lstmind) — веб-разработчик. Сайты, которые работают";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const font = await readFile(join(process.cwd(), "app/og/manrope.woff"));
  // кадр рабочего места фоном — превью ссылки перестаёт быть плашкой с текстом
  const bg = await readFile(join(process.cwd(), "public/img/scene/og-bg.jpg"));
  const bgSrc = `data:image/jpeg;base64,${bg.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgSrc}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover", opacity: 0.5 }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: "linear-gradient(100deg, #08080A 32%, rgba(8,8,10,0.88) 62%, rgba(8,8,10,0.6) 100%)",
          }}
        />
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
