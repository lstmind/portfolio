import { COOKIE_V } from "@/lib/legal";
import { IMG } from "../Figure";
import { tie } from "../typo";
import { CookieIsland } from "./islands";
import "./cookie.css";

/**
 * Плашка cookie, вариант А (design-concepts/v4/about/mock/cookie-a.html): бумажный стикер, персонаж с печеньем в углу.
 * Только уведомление (решение владельца, FACTS.md): Метрика грузится как раньше, кнопка одна, "Понятно"; текст обычный, без шуток.
 * В разметке с сервера скрыта; показывает её cookie.run.js не раньше 3 с и после первого скролла или касания,
 * а без действий через 11 с, раньше Метрики. Картинка (lazy в скрытом блоке) до показа не качается.
 */
export function Cookie() {
  return (
    <section className="ck" id="ck" role="region" aria-label="Cookie и Яндекс Метрика" aria-describedby="ck-p" data-v={COOKIE_V} hidden>
      <div className="ck-top">
        <div className="ck-txt">
          <p className="ck-h">
            Файлы <br />
            cookie
          </p>
          <p className="ck-p" id="ck-p">
            {tie("Сайт использует файлы cookie и Яндекс Метрику для статистики посещений. Подробнее в ")}
            <a href="/politika#metrika">{tie("политике конфиденциальности")}</a>.
          </p>
        </div>
        <div className="ck-fig" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${IMG}about/about-cookie-tight-240.webp`}
            srcSet={`${IMG}about/about-cookie-tight-160.webp 160w, ${IMG}about/about-cookie-tight-240.webp 240w, ${IMG}about/about-cookie-tight-320.webp 320w`}
            sizes="(max-width: 359px) 88px, (max-width: 699px) 112px, 140px"
            width={240}
            height={261}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <div className="ck-btns">
        <button type="button" className="ck-ok">
          Понятно
        </button>
      </div>
      <CookieIsland />
    </section>
  );
}
