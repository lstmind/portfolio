import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE } from "@/lib/content";
import { HERO_SIDES } from "@/lib/home";
import ADV from "./og/fira900-adv.json";

/**
 * Превью ссылок в языке нового дизайна: бумага, тушь, персонаж, крупное слово Fira Sans Condensed 900.
 * Шрифты лежат файлами рядом (og/fira900.ttf, og/mont700.ttf): next/og не читает woff2, а в стандартном
 * шрифте нет кириллицы. Это подмножества тех же шрифтов, что подключает next/font: латиница, кириллица и знак ₽.
 * Позы: og/pose-<id>.png, холст 400x984 (тот же, что /img/v4/pose-<id>-984.webp), прозрачный фон.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const DIR = join(process.cwd(), "components/v4/misc/og");
const C = { paper: "#f7f6f3", ink: "#0c0b0b", ink2: "#55524e", red: "#e01f1b" };
type Pose = "j1" | "j2" | "j5" | "j7";

async function load(pose: Pose, cards: string[] = []) {
  const [display, sans, img, ...shots] = await Promise.all([
    readFile(join(DIR, "fira900.ttf")),
    readFile(join(DIR, "mont700.ttf")),
    readFile(join(DIR, `pose-${pose}.png`)),
    ...cards.map((c) => readFile(join(DIR, `card-${c}.jpg`))),
  ]);
  return {
    fonts: [
      { name: "Display", data: display, weight: 900 as const, style: "normal" as const },
      { name: "Sans", data: sans, weight: 700 as const, style: "normal" as const },
    ],
    pose: `data:image/png;base64,${img.toString("base64")}`,
    cards: shots.map((b) => `data:image/jpeg;base64,${b.toString("base64")}`),
  };
}

/* кольцо сайтов из героя, плоской проекцией: карточки по дуге за фигурой, дальние мельче и тише.
   скрины те же, что на дуге героя, заранее обесцвечены тем же фильтром (grayscale, contrast .46, brightness 1.36) */
const RING = ["chemrar", "qayna", "almytech"];
function Ring({ srcs, cx, cy, R = 300, P = 900, h = 330, angles = [-38, 38, -78, 78] }: { srcs: string[]; cx: number; cy: number; R?: number; P?: number; h?: number; angles?: number[] }) {
  const items = angles
    .map((a, i) => {
      const r = (a * Math.PI) / 180;
      const z = R * (1 - Math.cos(r));
      const k = P / (P + z);
      const ch = h * k;
      const cw = (ch * 390) / 844;
      return { src: srcs[i % srcs.length], k, x: cx + R * Math.sin(r) * k - cw / 2, y: cy - ch / 2, cw, ch, fog: Math.min(0.5, z / 260) };
    })
    .sort((a, b) => a.k - b.k);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex" }}>
      {items.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: c.x,
            top: c.y,
            width: c.cw,
            height: c.ch,
            display: "flex",
            borderRadius: c.cw * 0.085,
            overflow: "hidden",
            background: "#efede9",
            boxShadow: "0 0 0 1px rgba(12,11,11,.06)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.src} alt="" width={c.cw} height={c.ch} style={{ width: c.cw, height: c.ch, objectFit: "cover", objectPosition: "top" }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: c.cw, height: c.ch, background: C.paper, opacity: 0.22 + c.fog }} />
        </div>
      ))}
    </div>
  );
}

/* фигура крупно, от макушки до колен, низ уходит за край кадра: в превью мессенджера лицо видно,
   а ростовая фигура на 630 px была бы мелкой. стоит справа, текст слева ничем не перекрыт */
function Figure({ src, k = 0.86, right = 70 }: { src: string; k?: number; right?: number }) {
  const w = Math.round(400 * k);
  const h = Math.round(984 * k);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={w} height={h} style={{ position: "absolute", right, top: 30, width: w, height: h }} />
  );
}

function Logo() {
  return <div style={{ display: "flex", fontFamily: "Display", fontSize: 44, lineHeight: 1, letterSpacing: -0.4 }}>{SITE.name}</div>;
}

function Caps({ children, color = C.ink2 }: { children: string; color?: string }) {
  return (
    <div style={{ display: "flex", fontFamily: "Sans", fontSize: 21, letterSpacing: 0.8, textTransform: "uppercase", color }}>
      {children}
    </div>
  );
}

/* кадр: бумага, сзади картинки (кольцо, фигура), поверх колонка текста слева.
   колонка отдельным слоем: иначе next/og считает абсолютные слои участниками раскладки и сдвигает текст */
function Frame({ back, children }: { back: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", background: C.paper, color: C.ink }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex" }}>{back}</div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "50px 64px 48px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** главная: "ДЕЛАЮ / САЙТЫ" во всю левую половину, справа машет на фоне своих сайтов */
export async function ogHome() {
  const { fonts, pose, cards } = await load("j1", RING);
  return new ImageResponse(
    (
      <Frame
        back={[
          <Ring key="r" srcs={cards} cx={930} cy={322} R={220} h={350} angles={[0, -46, 46]} />,
          <Figure key="f" src={pose} right={89} />,
        ]}
      >
        <Logo />
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Display", fontSize: 190, lineHeight: 0.84, letterSpacing: -2.3 }}>
          <div style={{ display: "flex" }}>ДЕЛАЮ</div>
          <div style={{ display: "flex" }}>САЙТЫ</div>
        </div>
        <Caps>{HERO_SIDES.join(" · ")}</Caps>
      </Frame>
    ),
    { ...OG_SIZE, fonts },
  );
}

/* ширина строки заголовка в em по реальным advance-ширинам Fira 900 (капс, трекинг -.012em).
   next/og не переносит внутри слова: длинное слово вроде "КОРПОРАТИВНЫЙ" иначе уходит на фигуру */
const adv = ADV as Record<string, number>;
const em = (w: string) => [...w.toUpperCase()].reduce((a, c) => a + (adv[c] ?? 0.6) - 0.012, 0);
function fitTitle(title: string, box: number, maxLines: number) {
  const words = title.split(/\s+/);
  for (const size of [128, 116, 104, 96, 88, 80, 72, 66, 60, 54]) {
    if (Math.max(...words.map(em)) * size > box) continue;
    let lines = 1, cur = 0;
    for (const w of words) {
      const ww = em(w) * size, gap = cur ? adv[" "] * size : 0;
      if (cur + gap + ww > box) { lines++; cur = ww; } else cur += gap + ww;
    }
    if (lines <= maxLines) return size;
  }
  return 48;
}

/**
 * Внутренние страницы: надпись раздела мелко, заголовок страницы крупно, строка с ценой или сроком внизу.
 * Кегль заголовка подбирается по ширине самого длинного слова и числу строк (не больше трёх) в левых 640 px.
 */
const BOX = 640;
export async function ogCardV4(opts: { kicker: string; title: string; note?: string; pose?: Pose }) {
  const { fonts, pose } = await load(opts.pose ?? "j1");
  const size = fitTitle(opts.title, BOX, 3);
  return new ImageResponse(
    (
      <Frame back={<Figure src={pose} right={89} />}>
        <Logo />
        <div style={{ display: "flex", flexDirection: "column", gap: 24, width: BOX }}>
          <Caps>{opts.kicker}</Caps>
          <div style={{ display: "flex", fontFamily: "Display", fontSize: size, lineHeight: 0.9, letterSpacing: -size * 0.012, textTransform: "uppercase" }}>
            {opts.title}
          </div>
        </div>
        <Caps color={C.ink}>{opts.note ?? HERO_SIDES.join(" · ")}</Caps>
      </Frame>
    ),
    { ...OG_SIZE, fonts },
  );
}
