import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import ADV from "../misc/og/fira900-adv.json";
import { PROJECTS_ALL } from "@/lib/content";
import { CAN, PERSON, SINCE } from "./data";

/**
 * Превью ссылки на "Обо мне" в подаче v2 "центр держит", как главная и хабы (components/v4/misc/og.tsx):
 * всё главное в квадрате 630x630 посередине, по краям живые сайты из "Что получается лучше всего".
 * Персонаж с телефоном перегнан в png тем же способом, что кадры og.tsx (og/fig-about-phone.png, высота 1000, верх на 48).
 * Шрифты, лого и карточки сайтов берутся из общей папки превью.
 */
export const OG_SIZE = { width: 1200, height: 630 };
const W = 1200;
const H = 630;
const C = { paper: "#f7f6f3", ink: "#0c0b0b", ink2: "#55524e", card: "#efede9" };
const SHARED = join(process.cwd(), "components/v4/misc/og");
const OWN = join(process.cwd(), "components/v4/about/og");
/** кадр: видимая часть, верх, центр головы и края непрозрачного в долях ширины (вывод og_fig) */
const FIG = { file: "fig-about-phone.png", w: 407, h: 582, top: 48, hx: 0.3843 };

const uri = (b: Buffer, type: string) => `data:${type};base64,${b.toString("base64")}`;

/* кегль заголовка по реальным ширинам Fira 900 (как в og.tsx): next/og не переносит внутри слова */
const adv = ADV as Record<string, number>;
const em = (w: string) => [...w.toUpperCase()].reduce((a, c) => a + (adv[c] ?? 0.6) - 0.012, 0);
function fit(words: string[], box: number, maxSize: number) {
  for (let size = maxSize; size >= 40; size -= 2) if (words.every((w) => em(w) * size <= box)) return size;
  return 40;
}

function Card({ src, x, y, h, rot, fog }: { src: string; x: number; y: number; h: number; rot: number; fog: number }) {
  const w = Math.round((h * 400) / 866);
  return (
    <div
      style={{
        position: "absolute",
        left: Math.round(x - w / 2),
        top: y,
        width: w,
        height: h,
        display: "flex",
        borderRadius: Math.round(w * 0.085),
        overflow: "hidden",
        background: C.card,
        boxShadow: "0 0 0 1.5px rgba(12,11,11,.09)",
        transform: `rotate(${rot}deg)`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={w} height={h} style={{ width: w, height: h, objectFit: "cover", objectPosition: "top" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, background: C.paper, opacity: fog }} />
    </div>
  );
}

export async function ogAbout() {
  const sites = CAN.map((c) => `site-${c.img}.jpg`);
  const [display, sans, logo, fig, ...cards] = await Promise.all([
    readFile(join(SHARED, "fira900.ttf")),
    readFile(join(SHARED, "mont700.ttf")),
    readFile(join(SHARED, "logo.svg")),
    readFile(join(OWN, FIG.file)),
    ...sites.map((s) => readFile(join(SHARED, s))),
  ]);
  const wing: [number, number, number, number, number][] = [
    [118, 64, 340, -6, 0.1],
    [36, 300, 310, 4, 0.22],
    [1082, 56, 340, 6, 0.1],
    [1168, 292, 310, -4, 0.22],
  ];
  const words = [PERSON.given, PERSON.family];
  const size = fit(words, 300, 112);
  const logoH = 34;
  const logoW = Math.round((logoH * 3310) / 847);
  const figLeft = Math.max(560, Math.round(795 - FIG.hx * FIG.w));
  // строка на кегле 21 вмещает ~22 знака: "проектов и доработок" не лезет в одну, поэтому три короткие
  const note = [`сайты с ${SINCE} года`, `${PROJECTS_ALL} проектов`, "и доработок"];

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: W, height: H, display: "flex", overflow: "hidden", background: C.paper, color: C.ink }}>
        {wing.map(([x, y, h, r, fog], i) => (
          <Card key={i} src={uri(cards[i], "image/jpeg")} x={x} y={y} h={h} rot={r} fog={fog} />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={uri(fig, "image/png")} alt="" width={FIG.w} height={FIG.h} style={{ position: "absolute", left: figLeft, top: FIG.top, width: FIG.w, height: FIG.h }} />
        <div style={{ position: "absolute", left: 305, top: 44, width: 330, height: H - 44 - 46, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={uri(logo, "image/svg+xml")} alt="" width={logoW} height={logoH} style={{ width: logoW, height: logoH }} />
          <div style={{ display: "flex", flexGrow: 1 }} />
          <div style={{ display: "flex", marginBottom: 12, fontFamily: "Sans", fontSize: 19, letterSpacing: 19 * 0.06, textTransform: "uppercase", color: C.ink2 }}>
            Обо мне
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Display", fontSize: size, lineHeight: 0.88, letterSpacing: -size * 0.012, textTransform: "uppercase" }}>
            {words.map((w) => (
              // кратка Й упирается в строку выше (у первой в надзаголовок): у такой строки воздух сверху, как в og.tsx
              <div key={w} style={{ display: "flex", whiteSpace: "nowrap", marginTop: /[ЙЁ]/i.test(w) ? Math.round(size * 0.26) : 0 }}>
                {w}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontFamily: "Sans", fontSize: 21, lineHeight: 1.35, letterSpacing: 1.26, textTransform: "uppercase" }}>
            {note.map((l) => (
              <div key={l} style={{ display: "flex" }}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Display", data: display, weight: 900, style: "normal" },
        { name: "Sans", data: sans, weight: 700, style: "normal" },
      ],
    },
  );
}
