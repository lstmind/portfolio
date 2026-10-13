import { SITE } from "@/lib/content";
import { TongueIsland } from "./islands";
import "./tongue.css";

/**
 * Нижний красный язычок Telegram на телефоне.
 * after: селектор кнопки, после которой он выезжает (на главной кнопка героя); until: заголовок, перед которым уезжает.
 */
export function Tongue({ after = "#hero .cta", until = "#final-title" }: { after?: string; until?: string }) {
  return (
    <>
      <a className="dock" id="dock" href={SITE.telegram} target="_blank" rel="noopener" aria-hidden="true" tabIndex={-1}>
        Написать в Telegram
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
          <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
        </svg>
      </a>
      <TongueIsland after={after} until={until} />
    </>
  );
}
