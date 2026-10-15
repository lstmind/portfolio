import { FAQ_CHEAPER, PRICE_FACTORS } from "@/lib/cta";
import { tie } from "../typo";
import { Block } from "./bits";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Из чего складывается цена: пять пунктов коротко, отдельной строкой домен и хостинг,
 * и честный ответ на "можно дешевле?". Тексты и цифры из lib/cta.ts, здесь только раскладка.
 */
export function PriceFactors() {
  return (
    <Block id="u-pf" label={PRICE_FACTORS.title} className="u-pf">
      <ol className="u-pf-list">
        {PRICE_FACTORS.items.map((x, i) => (
          <li key={x.k}>
            <span className="u-pf-n">{pad(i + 1)}</span>
            <b>{x.k}</b>
            <span>{tie(x.t)}</span>
          </li>
        ))}
      </ol>
      <p className="u-pf-extra">{tie(PRICE_FACTORS.extra)}</p>
      <div className="u-pf-q">
        <h3>{FAQ_CHEAPER.q}</h3>
        <p>{tie(FAQ_CHEAPER.a)}</p>
      </div>
    </Block>
  );
}
