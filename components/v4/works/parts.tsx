import { SITE } from "@/lib/content";
import { Figure } from "../Figure";
import { illPose } from "./data";

export const Out = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
);
export const Next = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
    <path d="M2.5 8h10M8.5 4l4 4-4 4" />
  </svg>
);

/**
 * Крупное слово по буквам: тот же барабан rotateX, что в герое и в секции работ, только на CSS, без скрипта
 * и без мигания до гидрации. Текст элемента остаётся словом целиком, экранный диктор читает aria-label.
 */
export function Drum({ as: Tag = "h1", text, className, id }: { as?: "h1" | "span"; text: string; className?: string; id?: string }) {
  let k = 0;
  return (
    <Tag className={`w-drum ${className ?? ""}`} aria-label={text} id={id}>
      {text.split(" ").map((w, wi) => (
        <span key={wi}>
          {wi > 0 && " "}
          <span className="w-drum__w">
            {Array.from(w).map((ch, ci) => (
              <span className="w-drum__ch" key={ci}>
                <i style={{ "--k": k++ } as React.CSSProperties}>{ch}</i>
              </span>
            ))}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** хлебные крошки: мелко над крупным словом */
export function Crumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav className="w-crumbs" aria-label="Хлебные крошки">
      <ol>
        {items.map((it) => (
          <li key={it.name}>{it.href ? <a href={it.href}>{it.name}</a> : <span aria-current="page">{it.name}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}

/** связь в конце страницы: крупное слово, строка, красная кнопка; персонаж на связи стоит рядом, текст не перекрывает */
export function Cta({ title, text }: { title: string; text: string }) {
  return (
    <section className="w-cta" aria-labelledby="w-cta-title">
      <div className="w-cta__text">
        <h2 className="w-cta__h" id="w-cta-title">
          {title}
        </h2>
        <p className="w-cta__p">{text}</p>
        <p className="w-cta__row">
          <a className="w-cta__btn" href={SITE.telegram} target="_blank" rel="noopener">
            Написать в Telegram
            <Out />
          </a>
          <a className="w-cta__mail" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
        </p>
      </div>
      <Figure pose="j4" className="w-cta__fig" alt="Алексей на связи с телефоном" sizes="(max-width: 699px) 46vw, 260px" />
    </section>
  );
}

/** сцена персонажа из листа hubs-cases: холст и srcset из манифеста, место занято до загрузки */
export function Ill({
  pose,
  className,
  sizes,
  alt = "",
}: {
  pose: "h-papka" | "h-shema" | "h-priglashaet";
  className?: string;
  sizes: string;
  alt?: string;
}) {
  const p = illPose(pose);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={p.src}
      srcSet={p.srcSet}
      sizes={sizes}
      width={p.w}
      height={p.h}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}
