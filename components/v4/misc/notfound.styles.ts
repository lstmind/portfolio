/* Стили сцены 404 (статика design-concepts/v4/karusel/404.html, блок .nf и кнопка героя).
   Строкой, а не css-файлом: стили корневой not-found Next предзагружает на каждой странице сайта отдельным файлом,
   и в консоли всех страниц висит предупреждение о неиспользованной предзагрузке.
   Шапка общая (<Header inner />): её стили подключены в app/layout.tsx и есть на каждой странице. */
export const NF_CSS = `
.nf{position:relative;height:100vh;height:100svh;min-height:560px;overflow:hidden}
.nf-word{position:absolute;inset:0;z-index:2;margin:0;font:900 100px/1 var(--display);letter-spacing:-.012em;text-transform:uppercase;color:var(--ink);pointer-events:none}
.nf-w{position:absolute;left:0;top:0;white-space:nowrap}
.nf-figs{position:absolute;inset:0;z-index:6;pointer-events:none;will-change:transform}
.nf-me{position:absolute;display:block;height:auto;max-width:none;transition:transform .3s cubic-bezier(.16,1,.3,1)}
.nf-me.alt{opacity:0}
.nf.hot .nf-me,.nf.hint .nf-me{transform:translateY(-8px)}
.nf-side{position:absolute;z-index:4;top:var(--nf-side-y,73.5%);font:700 clamp(13px,1.2vw,17px)/1 var(--sans);letter-spacing:.03em;text-transform:uppercase;white-space:nowrap;pointer-events:none}
.nf-side-l{left:var(--nf-m,40px);transform:rotate(-4deg);transform-origin:left center}
.nf-side-r{right:var(--nf-m,40px);transform:rotate(4deg);transform-origin:right center}
.nf-cta{position:absolute;z-index:5;left:var(--fx,50%);bottom:0;transform:translateX(-50%);display:inline-flex;align-items:center;gap:12px;
  height:calc(64px + env(safe-area-inset-bottom));padding:0 30px env(safe-area-inset-bottom);border-radius:22px 22px 0 0;
  background:var(--red);color:#fff;font:700 15px/1 var(--sans);letter-spacing:.02em;white-space:nowrap;cursor:pointer;
  -webkit-tap-highlight-color:transparent;transition:background-color .2s ease-out,height .3s cubic-bezier(.16,1,.3,1)}
.nf-cta svg{width:18px;height:18px;transition:transform .3s cubic-bezier(.16,1,.3,1)}
.nf-cta:hover{height:calc(72px + env(safe-area-inset-bottom))}
.nf-cta:hover svg{transform:translateX(-2px)}
.nf-cta:active{background:var(--red-press)}
.nf.hint .nf-cta{height:calc(68px + env(safe-area-inset-bottom))}
@media (max-width:699px){
  .nf-cta{padding:0 26px env(safe-area-inset-bottom);justify-content:center;height:calc(60px + env(safe-area-inset-bottom));border-radius:20px 20px 0 0;font-size:15px}
  .nf-cta:hover{height:calc(60px + env(safe-area-inset-bottom))}
  .nf-side{font-size:12px;white-space:normal;width:6.4em;line-height:1.18}
  .nf-side-l{left:16px;right:auto;transform:rotate(-5deg);transform-origin:left center}
  .nf-side-r{right:16px;left:auto;text-align:right;transform:rotate(5deg);transform-origin:right center}
}
@media (prefers-reduced-motion:reduce){.nf-me,.nf-cta,.nf-cta svg{transition:none!important}}
`;
