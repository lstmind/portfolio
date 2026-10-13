import { Header } from "@/components/v4/Header";
import { nfRun } from "./notfound.run";
import { NotFoundIsland } from "./islands";
import { NF_CSS } from "./notfound.styles";

const BACK =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M12 8H4.5M8 4.5L4.5 8 8 11.5"/></svg>';

/**
 * Сцена 404 строкой, как герой главной: её сразу, ещё до гидрации, раскладывает скрипт (позиции слов и фигуры
 * считаются по ладоням позы 9). React эту часть не сверяет: dangerouslySetInnerHTML + suppressHydrationWarning.
 *
 * Стили лежат в странице, а не css-файлом: стили корневой 404 Next подтягивает предзагрузкой на каждую страницу,
 * а нужны они только здесь.
 */
function nfHtml() {
  const boot = `(function(){var run=${nfRun.toString()};window.__v4nf=run;var n=document.querySelector('main.nf');if(n&&!n.__v4run)n.__v4run=run(n);})();`;
  return (
    `<h1 class="nf-word" id="nf-word"><span class="sr">Страницы нет</span><span class="nf-w" id="nf-l" aria-hidden="true">Страницы</span><span class="nf-w" id="nf-r" aria-hidden="true">нет</span></h1>` +
    `<div class="nf-figs" id="nf-figs">` +
    `<img class="nf-me" id="nf-9" alt="Алексей пожимает плечами" width="532" height="984" fetchpriority="high" decoding="async">` +
    `<img class="nf-me alt" id="nf-3" alt="" aria-hidden="true" width="400" height="984" decoding="async">` +
    `</div>` +
    `<p class="nf-side nf-side-l">Ошибка 404</p>` +
    `<p class="nf-side nf-side-r">Или её уже починили</p>` +
    `<a class="nf-cta" href="/">${BACK}На главную</a>` +
    `<script>${boot}</script>`
  );
}

export function NotFoundScene() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NF_CSS }} />
      <Header inner />
      <main
        className="nf"
        id="main"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: nfHtml() }}
      />
      <NotFoundIsland />
    </>
  );
}
