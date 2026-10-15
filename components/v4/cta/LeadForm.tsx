import { SITE, HOURS } from "@/lib/content";
import { AUDIT, AUDIT_DIAG, LEAD, type LeadMode } from "@/lib/cta";
import { tie } from "../typo";
import { LeadIsland } from "./islands";
import "./lead.css";

/**
 * Короткая форма для тех, у кого нет Telegram. Свёрнута за ссылкой, раскрывается по нажатию.
 *   mode="audit"   сайт и куда ответить: запасной путь у кнопки "прислать сайт на аудит"
 *   mode="contact" как обращаться, куда ответить, задача одной фразой: финалы услуг и ниш
 * Поле "куда ответить" с autocomplete="tel": браузер подскажет телефон, почту или @ник можно вписать руками.
 * После отправки фокус переходит на строку ответа, иначе он теряется на отключённой кнопке.
 * Строка согласия как у формы главной, поле-ловушка для ботов, поля скрыты от Вебвизора (ym-disable-keys).
 * Заявка уходит на /api/contact с типом формы, страницей и блоком (place): их видно в Telegram и в файле заявок.
 *
 * place: где стоит форма, одним словом латиницей (final, strip, hero). Идёт в заявку и в цели Метрики.
 * id: нужен, только если на странице две формы одного режима в одном блоке; по умолчанию lead-<mode>-<place>.
 * diag: у аудита формулировка "диагностика" (/uslugi/pochinit-sayt): другой текст в Telegram при сбое.
 * alt: свой текст раскрывашки вместо "Нет Telegram? ..." (в полосе цены: "оставить контакт").
 * pre: что стоит в той же строке перед раскрывашкой (в полосе цены: "или почта · ").
 */
export function LeadForm({
  mode,
  place = "final",
  id,
  diag = false,
  className = "",
  alt,
  pre,
}: {
  mode: LeadMode;
  place?: string;
  id?: string;
  diag?: boolean;
  className?: string;
  alt?: string;
  pre?: React.ReactNode;
}) {
  const fid = id || `lead-${mode}-${place}`;
  const audit = mode === "audit";
  const t = LEAD[mode];
  const F = LEAD.fields;
  const send = audit && diag ? LEAD.audit.sendDiag : t.send;
  const data = {
    mode,
    place,
    alt: alt || t.alt,
    close: LEAD.close,
    send,
    sending: LEAD.sending,
    sent: LEAD.sent,
    err: LEAD.err,
    fail: LEAD.err.fail,
    okNow: LEAD.okNow,
    okLater: LEAD.okLater,
    okAudit: LEAD.okAudit,
    from: HOURS.from,
    to: HOURS.to,
    tg: SITE.telegram,
    email: SITE.email,
    // начало сообщения в Telegram при сбое: к нему форма допишет сайт или задачу
    tgDraft: audit ? (diag ? AUDIT_DIAG : AUDIT).tg : "Здравствуйте!",
  };
  const field = (name: "name" | "contact" | "task" | "site" | "issue", input: React.ReactNode) => (
    <div className="lead-f">
      <label htmlFor={`${fid}-${name}`}>{F[name].label}</label>
      {input}
    </div>
  );
  return (
    <div className={`lead lead--${mode} ${className}`.trim()} id={fid} data-lead={JSON.stringify(data)} data-goal-place={place} data-lead-mode={mode}>
      <p className="lead-bar">
        {pre}
        <button className="lead-alt" type="button" aria-expanded="false" aria-controls={`${fid}-form`}>
          {alt || t.alt}
        </button>
      </p>
      <form className="lead-form" id={`${fid}-form`} hidden noValidate aria-label={audit ? (diag ? AUDIT_DIAG : AUDIT).title : "Оставить контакт"}>
        <input className="lead-hp" type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        {audit ? (
          <>
            {field(
              "site",
              <input className="ym-disable-keys" id={`${fid}-site`} name="site" type="text" inputMode="url" autoComplete="url" placeholder={F.site.ph} required aria-describedby={`${fid}-status`} />,
            )}
            {/* диагностика: "одной фразой, что не так", по желанию; уходит в заявку полем задачи */}
            {diag && field("issue", <input className="ym-disable-keys" id={`${fid}-issue`} name="task" type="text" autoComplete="off" placeholder={F.issue.ph} maxLength={500} />)}
            {field(
              "contact",
              <input className="ym-disable-keys" id={`${fid}-contact`} name="contact" type="text" autoComplete="tel" enterKeyHint="send" placeholder={F.contact.ph} required aria-describedby={`${fid}-status`} />,
            )}
          </>
        ) : (
          <>
            {field(
              "name",
              <input className="ym-disable-keys" id={`${fid}-name`} name="name" type="text" autoComplete="name" placeholder={F.name.ph} required minLength={2} aria-describedby={`${fid}-status`} />,
            )}
            {field(
              "contact",
              <input className="ym-disable-keys" id={`${fid}-contact`} name="contact" type="text" autoComplete="tel" placeholder={F.contact.ph} required aria-describedby={`${fid}-status`} />,
            )}
            {field("task", <input className="ym-disable-keys" id={`${fid}-task`} name="task" type="text" autoComplete="off" enterKeyHint="send" placeholder={F.task.ph} maxLength={500} />)}
          </>
        )}
        <button className="lead-send" type="submit">
          {send}
        </button>
        <p className="lead-consent">
          {tie(`Нажимая "${send}", вы даёте `)}
          <a href="/soglasie">{tie("согласие на обработку данных")}</a>
          {tie(" из заявки. Как я с ними обращаюсь, написано в ")}
          <a href="/politika">политике</a>.
        </p>
        <p className="lead-status" id={`${fid}-status`} role="status" tabIndex={-1} />
      </form>
      <LeadIsland id={fid} />
    </div>
  );
}
