import { tgHref, tgText } from "@/lib/cta";
import { TongueIsland } from "./islands";
import "./tongue.css";

/**
 * Нижний красный язычок Telegram на телефоне.
 * after: селектор кнопки, после которой он выезжает (на главной кнопка героя); until: заголовок, перед которым уезжает.
 * tg: первое сообщение в Telegram для этой страницы, как у шапки.
 */
export function Tongue({ after = "#hero .cta", until = "#final-title", tg }: { after?: string; until?: string; tg?: string }) {
  return (
    <>
      <a className="dock" id="dock" href={tgHref(tg ?? tgText({ kind: "site" }))} target="_blank" rel="noopener" aria-hidden="true" tabIndex={-1}>
        Написать в Telegram
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
          <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
        </svg>
      </a>
      <TongueIsland after={after} until={until} />
    </>
  );
}
