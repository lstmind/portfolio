import { PAY, payFor } from "@/lib/content";
import { tie } from "../typo";

/** лист с загнутым углом и стрелкой вниз: ссылка ведёт на файл, а не на страницу */
const DocIco = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M9.5 1.8H4.2a1 1 0 0 0-1 1v10.4a1 1 0 0 0 1 1h7.6a1 1 0 0 0 1-1V5.1z" />
    <path d="M9.5 1.8v3.3h3.3M8 7.2v4.4M6 9.7l2 2 2-2" />
  </svg>
);

/**
 * Оплата и гарантия у шагов работы, под "Сметой": три коротких факта цифрой и подписью, как цена и срок первого экрана,
 * и образец договора файлом. Данные общие (PAY в lib/content.ts), у почасовых услуг и абонемента своя строка "Как платим".
 */
export function Pay({ slug }: { slug: string }) {
  return (
    <div className="u-pay" id="oplata">
      <h3 className="u-fc-h">Оплата и гарантия</h3>
      <dl className="u-pay-facts">
        {payFor(slug).map((f) => (
          <div className="u-fact" key={f.k}>
            <dt>{f.k}</dt>
            <dd>
              <span className="u-num">
                <span>{f.v}</span>
              </span>
              <span className="u-fnote">{tie(f.note)}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="u-pay-doc">
        <a href={PAY.doc.href} target="_blank" rel="noopener" type="application/pdf">
          <DocIco />
          {PAY.doc.label}
        </a>
        <span>{tie(PAY.doc.note)}</span>
      </p>
    </div>
  );
}
