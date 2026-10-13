import { SITE } from "@/lib/content";
import { HERO_SITES, HERO_SIDES, HERO_WORDS } from "@/lib/home";
import { IMG, poseSrc, poseSrcSet } from "../Figure";
import { heroRun } from "./hero.run";
import { HeroIsland } from "./islands";
import "./hero.css";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const ARROW =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M4.5 11.5l7-7M5.5 4.5h6v6"/></svg>';

/**
 * Разметка героя целиком строкой: её сразу, ещё до гидрации, берёт скрипт карусели (как в статике),
 * двигает карточки, пишет буквы и переменные геометрии. React эту часть не сверяет и не перерисовывает:
 * dangerouslySetInnerHTML + suppressHydrationWarning, своё состояние у кода героя.
 */
function heroHtml() {
  // заголовок для чтения и поиска: "Делаю, чиню и ускоряю сайты". на экране те же слова буквами на дуге
  const w = HERO_WORDS.map((x, i) => (i ? x : x[0].toUpperCase() + x.slice(1)));
  const title = `${w.slice(0, -1).join(", ")} и ${w[w.length - 1]} сайты`;
  const cards = HERO_SITES.map(
    (s) =>
      `<a class="card" href="${esc(s.href)}" target="_blank" rel="noopener" aria-label="${esc(`${s.name}, ${s.host}, откроется в новой вкладке`)}" draggable="false" role="listitem" data-name="${esc(s.name)}" data-host="${esc(s.host)}">` +
      `<img class="sharp" alt="" draggable="false" decoding="async" src="${IMG}${s.img}-240.webp" srcset="${IMG}${s.img}-240.webp 240w, ${IMG}${s.img}-400.webp 400w" sizes="(max-width: 699px) 190px, 220px">` +
      `<img class="soft" alt="" draggable="false" decoding="async" src="${IMG}${s.img}-blur.webp">` +
      `<span class="fog"></span></a>`,
  ).join("");
  const boot = `(function(){var run=${heroRun.toString()};window.__v4hero=run;var h=document.getElementById('hero');if(h&&!h.__v4run)h.__v4run=run(h);})();`;
  return (
    `<h1 class="word"><span class="sr">${esc(title)}</span><span class="word-in" id="word"></span></h1>` +
    `<div class="ring" id="ring" aria-label="Мои сайты, тяните в сторону"><div class="track" id="cards" role="list">${cards}</div></div>` +
    `<div class="figs" id="figs">` +
    `<img class="me" id="me" alt="Алексей, веб-разработчик" fetchpriority="high" decoding="async" width="400" height="984" srcset="${poseSrcSet("j1")}" sizes="(max-width: 699px) calc((100svh - 300px) * .41), calc(100vh * .36)" src="${poseSrc("j1")}">` +
    `<img class="me alt" id="me2" alt="" aria-hidden="true" decoding="async">` +
    `<img class="me alt" id="me3" alt="" aria-hidden="true" decoding="async">` +
    `</div>` +
    `<p class="side side-l">${esc(HERO_SIDES[0])}</p>` +
    `<p class="side side-r">${esc(HERO_SIDES[1])}</p>` +
    `<a class="cap" id="cap" href="#" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"><b></b><span></span>${ARROW}</a>` +
    `<a class="cta" href="${SITE.telegram}" target="_blank" rel="noopener">Написать в Telegram ${ARROW}</a>` +
    `<svg class="point" id="point" aria-hidden="true" focusable="false"><defs>` +
    `<filter id="ink" x="-20%" y="-5%" width="140%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".028" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter>` +
    `<mask id="pm" maskUnits="userSpaceOnUse"><path class="m" id="pmL" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/><path class="m" id="pmH" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></mask>` +
    `</defs><g mask="url(#pm)" filter="url(#ink)"><path class="rim" id="rL"/><path class="rim" id="rH"/><path class="ink" id="pL"/><path class="ink" id="pH"/></g></svg>` +
    `<script>${boot}</script>`
  );
}

export function Hero() {
  return (
    <>
      <section
        className="hero"
        id="hero"
        aria-label="Кто я и мои сайты"
        data-words={HERO_WORDS.join(",")}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: heroHtml() }}
      />
      <HeroIsland />
    </>
  );
}
