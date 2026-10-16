import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { WORKS, hostOf, LIVE_SITES, plural } from "@/lib/content";
import { HERO_SIDES, HERO_SITES } from "@/lib/home";
import { SERVICE_PAGES, type ServicePage } from "@/lib/services";
import { INDUSTRY_PAGES, type IndustryPage } from "@/lib/industries";
import { CASE_PAGES, type CasePage } from "@/lib/cases";
import { previewOf, sitesOf, wordOf } from "../dlya/data";
import { SCENES as NICHE_SCENES } from "../dlya/scene";
import { sceneOf } from "../uslugi/scenes";
import { siteCards } from "../uslugi/data";
import { NAV_META, serviceLabel } from "../nav.data";
import ADV from "./og/fira900-adv.json";
import META from "./og/figs.json";

/**
 * Превью ссылок в чатах: бумага, тушь, персонаж по смыслу страницы, крупное слово Fira Sans Condensed 900, лого l’stmind.
 * Две подачи (стенд design-concepts/v4/brand, раздел "Превью ссылок"):
 *  v2 "центр держит": главная и хабы. Всё главное в квадрате 630x630 посередине, по краям настоящие сайты,
 *     поэтому квадратная обрезка WhatsApp и VK ничего не теряет.
 *  v1 "крупно": услуги, разборы, ниши. Слово во всю левую половину, фигура с предметом справа:
 *     длинные заголовки в превью Telegram шириной около 400 px так остаются читаемыми.
 * Картинки заранее перегнаны из тех же кадров, что на сайте (next/og не читает webp):
 * design-concepts/v4/brand/tools/og_assets.py пишет og/fig-*.png, og/site-*.jpg, og/scr-*.jpg и og/figs.json.
 * Шрифты лежат файлами рядом: next/og не читает woff2, а в стандартном шрифте нет кириллицы.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const DIR = join(process.cwd(), "components/v4/misc/og");
const C = { paper: "#f7f6f3", ink: "#0c0b0b", ink2: "#55524e", card: "#efede9" };
const W = 1200;
const H = 630;

/** кадр: размер видимой части, центр головы hx и края непрозрачного l..r в долях ширины */
type Fig = { w: number; h: number; full: number; top: number; hx: number; l: number; r: number; screen?: number[] };
const FIGS = META.figs as Record<string, Fig>;
const SITES = new Set(META.sites);
const COLOR = new Set(META.color);
const SHOTS = new Set(META.shots);

const uri = (b: Buffer, type: string) => `data:${type};base64,${b.toString("base64")}`;
const file = (name: string) => readFile(join(DIR, name));

async function fonts() {
  const [display, sans] = await Promise.all([file("fira900.ttf"), file("mont700.ttf")]);
  return [
    { name: "Display", data: display, weight: 900 as const, style: "normal" as const },
    { name: "Sans", data: sans, weight: 700 as const, style: "normal" as const },
  ];
}

/* ── картинки ── */

/** "/img/v4/works/wellevent-ru" -> файл карточки og/site-works-wellevent-ru.jpg */
const siteFile = (img: string, color = false) => `site-${img.replace(/^\/img\/v4\//, "").replace(/\//g, "-")}${color && COLOR.has(img) ? "-c" : ""}.jpg`;

/** карточки сайтов: только те, что перегнаны, без повторов; пустой серой карточки в превью не бывает */
function pickSites(imgs: string[], n: number) {
  const out: string[] = [];
  for (const i of imgs) if (SITES.has(i) && !out.includes(i)) out.push(i);
  for (const s of HERO_SITES) if (out.length < n && !out.includes(`/img/v4/${s.img}`)) out.push(`/img/v4/${s.img}`);
  return out.slice(0, n);
}

const live = new Set(LIVE_SITES.map((s) => s.host));
const caseSite = (c: CasePage) => previewOf(hostOf(c.href));
const caseBy = (slug: string) => CASE_PAGES.find((c) => c.slug === slug);

/** верх десктопного скрина разбора для экрана ноутбука: /img/tall/chemrar.jpg -> og/scr-chemrar.jpg */
function shotOf(c: CasePage | undefined) {
  const w = c && WORKS.find((x) => x.href === c.href);
  const base = w?.imgTall.replace(/^\/img\/tall\/|\.\w+$/g, "");
  return base && SHOTS.has(base) ? base : undefined;
}

/* ── заголовок: кегль по ширине строк ── */

/* ширина в em по реальным advance-ширинам Fira 900 (капс, трекинг -.012em).
   next/og не переносит внутри слова, поэтому строки режутся здесь: по словам, длинное слово по дефису */
const adv = ADV as Record<string, number>;
const em = (w: string) => [...w.toUpperCase()].reduce((a, c) => a + (adv[c] ?? 0.6) - 0.012, 0);
const SP = adv[" "] ?? 0.2;

/** предлог или союз в одну-две буквы не висит в конце строки: склеен со следующим словом */
const glue = (text: string) => text.replace(/(^|\s)([а-яёa-z]{1,2})\s+/gi, "$1$2\u00a0");

function wrap(text: string, size: number, box: number) {
  const words = glue(text).split(/[ \t\n]+/).flatMap((w) => (em(w) * size > box && w.includes("-") ? w.replace(/-/g, "-\u0000").split("\u0000") : [w]));
  const lines: string[] = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    const sep = last && !last.endsWith("-") ? " " : "";
    if (last !== undefined && (em(last) + (sep ? SP : 0) + em(w)) * size <= box) lines[lines.length - 1] = last + sep + w;
    else lines.push(w);
  }
  return lines;
}

/** крупнее всего, что влезает: каждая строка в box, строк не больше maxLines, общая высота не больше maxH */
function fit(text: string, box: number, maxLines: number, maxSize: number, maxH: number) {
  for (let size = maxSize; size >= 40; size -= 2) {
    const lines = wrap(text, size, box);
    const extra = lines.filter((l) => /[ЙЁ]/i.test(l)).length * 0.26;
    if (lines.length <= maxLines && lines.every((l) => em(l) * size <= box) && (lines.length * 0.88 + extra) * size <= maxH) return { size, lines };
  }
  return { size: 40, lines: wrap(text, 40, box) };
}

function Title({ text, box, maxLines, maxSize, maxH }: { text: string; box: number; maxLines: number; maxSize: number; maxH: number }) {
  const { size, lines } = fit(text, box, maxLines, maxSize, maxH);
  return (
    <div style={{ display: "flex", flexDirection: "column", fontFamily: "Display", fontSize: size, lineHeight: 0.88, letterSpacing: -size * 0.012, textTransform: "uppercase" }}>
      {lines.map((l, i) => (
        // при межстрочном .88 кратка Й и точки Ё упираются в строку выше (у первой строки в надзаголовок): такой строке воздуха сверху
        <div key={i} style={{ display: "flex", whiteSpace: "nowrap", marginTop: /[ЙЁ]/i.test(l) ? Math.round(size * 0.26) : 0 }}>
          {l}
        </div>
      ))}
    </div>
  );
}

/* ── детали ── */

/** лого l’stmind вектором (og/logo.svg = final-logo/svg/lstmind-ink-red.svg): тушь и красный апостроф, тот же знак, что в шапке */
function Logo({ src, h }: { src: string; h: number }) {
  const w = Math.round((h * 3310) / 847);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={w} height={h} style={{ width: w, height: h }} />;
}

function Kick({ children, size = 21 }: { children: string; size?: number }) {
  return <div style={{ display: "flex", fontFamily: "Sans", fontSize: size, letterSpacing: size * 0.06, textTransform: "uppercase", color: C.ink2 }}>{children}</div>;
}

function Note({ lines }: { lines: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", fontFamily: "Sans", fontSize: 21, lineHeight: 1.35, letterSpacing: 1.26, textTransform: "uppercase" }}>
      {lines.map((l) => (
        <div key={l} style={{ display: "flex" }}>
          {l}
        </div>
      ))}
    </div>
  );
}

/** пилюля факта: подпись Montserrat, число крупно Fira. "от" мельче, как в меню цен */
type ChipT = { label?: string; big: string; tail?: string };
function Chip({ c }: { c: ChipT }) {
  const m = c.big.match(/^(от|аудит)\s+(.+)$/);
  const pre = m ? m[1] : "";
  const big = m ? m[2] : c.big;
  return (
    <div style={{ display: "flex", alignItems: "baseline", padding: "10px 18px 9px", border: `2.5px solid ${C.ink}`, borderRadius: 999, fontFamily: "Sans", fontSize: 20, whiteSpace: "nowrap" }}>
      {c.label && <div style={{ display: "flex", marginRight: 9 }}>{c.label}</div>}
      {pre && <div style={{ display: "flex", marginRight: 7, color: C.ink2 }}>{pre}</div>}
      <div style={{ display: "flex", fontFamily: "Display", fontSize: 34, lineHeight: 0.8, letterSpacing: -0.2 }}>{big}</div>
      {c.tail && <div style={{ display: "flex", marginLeft: 9 }}>{c.tail}</div>}
    </div>
  );
}

/** мобильный первый экран сайта карточкой; x — центр, y — верх */
function Card({ src, x, y, h, rot = 0, fog = 0 }: { src: string; x: number; y: number; h: number; rot?: number; fog?: number }) {
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
        ...(rot ? { transform: `rotate(${rot}deg)` } : {}),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={w} height={h} style={{ width: w, height: h, objectFit: "cover", objectPosition: "top" }} />
      {fog > 0 && <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, background: C.paper, opacity: fog }} />}
    </div>
  );
}

/** фигура: голова по x в headX, верх кадра на f.top, низ уходит за край */
function Figure({ src, f, headX, minLeft = 0 }: { src: string; f: Fig; headX: number; minLeft?: number }) {
  const left = Math.max(minLeft, Math.round(headX - f.hx * f.w));
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={f.w} height={f.h} style={{ position: "absolute", left, top: f.top, width: f.w, height: f.h }} />;
}
const figLeft = (f: Fig, headX: number, minLeft = 0) => Math.max(minLeft, Math.round(headX - f.hx * f.w));

/** экран ноутбука позы 6: настоящий скрин сайта поверх серого экрана кадра */
function Screen({ src, f, left }: { src: string; f: Fig; left: number }) {
  const [x, y, w, h] = f.screen ?? [0, 0, 0, 0];
  return (
    <div style={{ position: "absolute", left: left + x, top: f.top + y, width: w, height: h, display: "flex", overflow: "hidden", borderRadius: 2, background: "#fff" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={w} height={h} style={{ width: w, height: h }} />
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div style={{ position: "relative", width: W, height: H, display: "flex", overflow: "hidden", background: C.paper, color: C.ink }}>{children}</div>;
}

/* ── две подачи ── */

type Facts = { chips?: ChipT[]; note?: string[] };
type Spec = {
  kick?: string;
  title: string;
  facts: Facts;
  fig: string;
  sites: string[];
  /** разбор: скрин на экране ноутбука и цветная карточка его сайта */
  shot?: string;
  /** v2: фигура с жестом вбок, голова левее */
  wide?: boolean;
};

async function assets(s: Spec, colorFirst: boolean) {
  const [logo, fig, shot, ...cards] = await Promise.all([
    file("logo.svg"),
    file(`fig-${s.fig}.png`),
    s.shot ? file(`scr-${s.shot}.jpg`) : Promise.resolve(null),
    ...s.sites.map((img, i) => file(siteFile(img, colorFirst && i === 0))),
  ]);
  const f = FIGS[s.fig];
  if (!f) throw new Error(`нет кадра fig-${s.fig}: перегнать design-concepts/v4/brand/tools/og_assets.py`);
  return { logo: uri(logo, "image/svg+xml"), fig: uri(fig, "image/png"), shot: shot && uri(shot, "image/jpeg"), cards: cards.map((b) => uri(b, "image/jpeg")), f };
}

/** v1 "крупно": слово во всю левую половину, фигура крупно справа на фоне двух-трёх своих сайтов */
async function v1(s: Spec) {
  const [a, ff] = await Promise.all([assets(s, !!s.shot), fonts()]);
  const { f } = a;
  // фигура как можно левее: голова у x 850, внутри квадрата 285..915, который остаётся при обрезке WhatsApp и VK по центру.
  // ради этого колонка заголовка сужается до 520 px (длинное слово мельчает на 10-13%, в превью Telegram всё равно крупно),
  // короткому заголовку колонка нужна ровно по его ширине при кегле, как в колонке 600.
  // кадр с предметом целиком в карточке (справа можно срезать 20 px) и не заходит на заголовок
  const maxSize = s.facts.chips ? 156 : 172;
  const maxH = s.facts.chips ? 300 : 330;
  const t = fit(s.title, 600, 3, maxSize, maxH);
  const need = Math.min(520, Math.ceil(Math.max(...t.lines.map((l) => em(l) * t.size))));
  const headL = (f.hx - f.l) * f.w;
  const headR = (f.r - f.hx) * f.w;
  const headX = Math.round(Math.min(Math.max(850, 64 + need + 20 + headL), W + 20 - headR));
  const left = figLeft(f, headX);
  const box = Math.min(600, Math.round(left + f.l * f.w - 64 - 20));
  const facts = s.facts.chips ? (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
      {s.facts.chips.map((c, i) => (
        <Chip key={i} c={c} />
      ))}
    </div>
  ) : (
    <div style={{ display: "flex", marginTop: 32 }}>
      <Note lines={s.facts.note ?? []} />
    </div>
  );
  return new ImageResponse(
    (
      <Frame>
        {s.shot ? (
          // разбор: справа телефонная версия того же сайта в цвете, в руках ноутбук с десктопной
          <Card src={a.cards[0]} x={1100} y={120} h={360} />
        ) : (
          [
            <Card key={0} src={a.cards[0]} x={760} y={150} h={330} rot={-5} fog={0.18} />,
            <Card key={1} src={a.cards[1]} x={1095} y={116} h={360} rot={5} fog={0.08} />,
            a.cards[2] ? <Card key={2} src={a.cards[2]} x={1160} y={340} h={250} rot={9} fog={0.24} /> : null,
          ]
        )}
        <Figure src={a.fig} f={f} headX={headX} />
        {a.shot && <Screen src={a.shot} f={f} left={left} />}
        <div style={{ position: "absolute", left: 64, top: 52, width: 640, height: H - 52 - 50, display: "flex", flexDirection: "column" }}>
          <Logo src={a.logo} h={42} />
          <div style={{ display: "flex", flexGrow: 1 }} />
          {s.kick && (
            <div style={{ display: "flex", marginBottom: 16 }}>
              <Kick>{s.kick}</Kick>
            </div>
          )}
          <Title text={s.title} box={box} maxLines={3} maxSize={maxSize} maxH={maxH} />
          {facts}
        </div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: ff },
  );
}

/** v2 "центр держит": текст и фигура в квадрате 285..915, по краям настоящие сайты уходят за край кадра */
async function v2(s: Spec) {
  const [a, ff] = await Promise.all([assets(s, false), fonts()]);
  const { f } = a;
  const wing: [number, number, number, number, number][] = [
    [118, 64, 340, -6, 0.1],
    [36, 300, 310, 4, 0.22],
    [1082, 56, 340, 6, 0.1],
    [1168, 292, 310, -4, 0.22],
  ];
  const facts = s.facts.chips ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 9, marginTop: 26 }}>
      {s.facts.chips.slice(0, 2).map((c, i) => (
        <Chip key={i} c={c} />
      ))}
    </div>
  ) : (
    <div style={{ display: "flex", marginTop: 26 }}>
      <Note lines={s.facts.note ?? []} />
    </div>
  );
  return new ImageResponse(
    (
      <Frame>
        {wing.map(([x, y, h, r, fog], i) => (a.cards[i] ? <Card key={i} src={a.cards[i]} x={x} y={y} h={h} rot={r} fog={fog} /> : null))}
        <Figure src={a.fig} f={f} headX={s.wide ? 760 : 795} minLeft={560} />
        <div style={{ position: "absolute", left: 305, top: 44, width: 330, height: H - 44 - 46, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Logo src={a.logo} h={34} />
          <div style={{ display: "flex", flexGrow: 1 }} />
          {s.kick && (
            <div style={{ display: "flex", marginBottom: 12 }}>
              <Kick size={19}>{s.kick}</Kick>
            </div>
          )}
          <Title text={s.title} box={300} maxLines={3} maxSize={128} maxH={260} />
          {facts}
        </div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: ff },
  );
}

/* ── страницы ── */

const svcBy = (slug: string) => {
  const s = SERVICE_PAGES.find((x) => x.slug === slug);
  if (!s) throw new Error(`нет услуги ${slug} в lib/services.ts`);
  return s;
};
const priceChip = (label: string, s: ServicePage): ChipT => ({ label, big: s.price.value });

/** главная: машет на фоне своих сайтов, "ДЕЛАЮ САЙТЫ", без менеджеров и общий опыт, те же строки, что у фигуры в герое */
export function ogHome() {
  return v2({
    title: "Делаю сайты",
    facts: { note: HERO_SIDES.flat() },
    fig: "j1",
    sites: pickSites(HERO_SITES.map((s) => `/img/v4/${s.img}`), 4),
  });
}

/** хаб услуг: пишет смету, цены сайта и магазина пилюлями */
export function ogServices() {
  return v2({
    kick: NAV_META.services,
    title: "Услуги и цены",
    facts: { chips: [priceChip("Сайт", svcBy("sayt-pod-klyuch")), priceChip("Магазин", svcBy("internet-magazin"))] },
    fig: "j5",
    sites: pickSites(["internet-magazin", "sayt-pod-klyuch", "telegram-bot", "korporativnyy-sayt"].flatMap((x) => svcBy(x).cases.slice(0, 1).map((c) => caseBy(c)).filter((c) => !!c).map((c) => caseSite(c!))), 4),
  });
}

/** хаб работ: папка с работами, число живых сайтов и разборов */
export function ogWorks() {
  return v2({
    kick: "Работы",
    title: "Живые сайты",
    facts: { note: [NAV_META.works, `${CASE_PAGES.length} разборов`] },
    fig: "h-papka",
    sites: pickSites(CASE_PAGES.map(caseSite), 4),
  });
}

/** хаб ниш: приглашает жестом, число ниш и живых сайтов в них */
export function ogNiches() {
  return v2({
    kick: "Ниши",
    title: "Сайты для вашей ниши",
    facts: { note: [NAV_META.niches, NAV_META.nicheSites] },
    fig: "h-priglashaet",
    wide: true,
    sites: pickSites(
      INDUSTRY_PAGES.flatMap((i) => sitesOf(i).filter((x) => live.has(x.host)).slice(0, 1).map((x) => x.img)),
      4,
    ),
  });
}

/** кадр услуги из сцен раздела: /img/v4/ill/s-magazin-780.webp -> s-magazin, /img/v4/pose-j7-780.webp -> j7 */
function svcFig(slug: string) {
  const sc = sceneOf(slug);
  const m = sc?.src.match(/\/(?:ill\/)?(?:pose-)?([a-z0-9-]+?)-\d+\.webp$/);
  return m && FIGS[m[1]] ? m[1] : undefined;
}

/** услуга: человек уже делает эту работу (корзина, ключ, лупа), цена и срок пилюлями.
    у типов сайтов своей сцены нет: поза 6 с ноутбуком, на экране настоящий сайт из разборов услуги */
export function ogService(s: ServicePage) {
  const cases = s.cases.map(caseBy).filter((c): c is CasePage => !!c);
  const fig = svcFig(s.slug);
  const shot = fig ? undefined : cases.map(shotOf).find(Boolean);
  return v1({
    kick: "Услуга",
    title: serviceLabel(s.slug) ?? s.h1,
    facts: { chips: [{ big: s.price.value }, { big: s.term.value }] },
    fig: fig ?? "j6",
    shot,
    // живые сайты под услугу (поле sites) первыми: у переноса и языков разборов нет вовсе
    sites: pickSites([...siteCards(s.sites ?? []).map((w) => `/img/v4/${w.card}`), ...cases.map(caseSite)], shot ? 1 : 3),
  });
}

/** разбор: ноутбук с десктопной версией сайта в руках, рядом телефонная, адрес и движок */
export function ogCase(c: CasePage) {
  const w = WORKS.find((x) => x.href === c.href);
  if (!w) throw new Error(`нет работы ${c.href} в lib/content.ts`);
  return v1({
    kick: `Разбор · ${w.kind}`,
    title: w.title,
    facts: { note: [`${hostOf(c.href)} · ${w.engine.replace(/ · /g, ", ")}`] },
    fig: "j6",
    shot: shotOf(c),
    sites: pickSites([caseSite(c)], 1),
  });
}

/** ниша: персонаж с предметом ниши, сколько живых сайтов в ней и цена */
export function ogNiche(i: IndustryPage) {
  const scene = NICHE_SCENES[i.slug];
  const sites = sitesOf(i).filter((x) => live.has(x.host));
  const n = sites.length;
  const word = plural(n, ["живой сайт", "живых сайта", "живых сайтов"]);
  return v1({
    kick: "Сайты для",
    title: wordOf(i.slug),
    facts: { chips: [...(n ? [{ big: String(n), tail: word }] : []), { big: i.price.value }] },
    fig: scene?.img && FIGS[scene.img] ? scene.img : "j6",
    sites: pickSites(sites.map((x) => x.img), 3),
  });
}
