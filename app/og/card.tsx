import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Карточка превью для внутренних страниц: та же сцена и типографика, что на главной,
 * но с заголовком конкретной страницы. Ссылку на кейс или услугу чаще всего кидают
 * в мессенджер — без этого превью разворачивалось голым текстом.
 */
export const OG_SIZE = { width: 1200, height: 630 };

export async function ogCard(opts: { kicker: string; title: string; note?: string }) {
  const font = await readFile(join(process.cwd(), "app/og/manrope.woff"));
  const bg = await readFile(join(process.cwd(), "public/img/scene/og-bg.jpg"));
  const bgSrc = `data:image/jpeg;base64,${bg.toString("base64")}`;
  // длинный заголовок ужимаем кеглем, иначе он вылезает за кадр
  const size = opts.title.length > 46 ? 56 : opts.title.length > 30 ? 66 : 76;
  // в подключённом начертании Manrope нет глифа ₽: он рисуется пустым квадратом
  const note = opts.note?.replace(/\s*₽/g, " руб.");

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
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover", opacity: 0.42 }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background: "linear-gradient(100deg, #08080A 34%, rgba(8,8,10,0.9) 64%, rgba(8,8,10,0.62) 100%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 24, height: 24, background: "#FF2E1F" }} />
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#9A9AA2" }}>{opts.kicker}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: size, lineHeight: 1.06, letterSpacing: -2 }}>
          <div style={{ display: "flex" }}>{opts.title}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 24 }}>
          <div style={{ display: "flex", color: "#9A9AA2" }}>lstmind · Алексей, веб-разработчик</div>
          {note && <div style={{ display: "flex", color: "#FF2E1F" }}>{note}</div>}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Manrope", data: font, weight: 800, style: "normal" }],
    }
  );
}
