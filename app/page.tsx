import Image from "next/image";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ContactForm } from "@/components/ContactForm";
import { MobileNav } from "@/components/MobileNav";
import { FaqList } from "@/components/FaqList";
import {
  SITE,
  NAV,
  FACTS,
  MARQUEE,
  PAIN,
  SERVICES,
  PROCESS,
  BAND,
  WORKS,
} from "@/lib/content";

function MarqueeSeg() {
  return (
    <div className="seg mono">
      <span>
        {MARQUEE.map((m, i) => (
          <span key={i} style={{ padding: 0, gap: 0 }}>
            {m.strong ? <b>{m.text}</b> : m.text} <span className="s">—</span>{" "}
          </span>
        ))}
      </span>
    </div>
  );
}

function BandSeg() {
  return (
    <div className="seg">
      <span>
        {BAND.map((w, i) => (
          <span key={i} style={{ padding: 0, gap: "30px" }}>
            <span className={i % 2 === 0 ? "f1" : "f2"}>{w}</span>
            <span className="d">●</span>
          </span>
        ))}
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header id="hdr">
        <nav>
          <div className="logo">
            <span className="sq" />
            {SITE.name}
          </div>
          <div className="nav-r">
            {NAV.map((n) => (
              <a key={n.href} className="l" href={n.href} data-cursor>
                {n.label}
              </a>
            ))}
            <a className="nav-tg" href={SITE.telegram} data-cursor>
              [ Telegram ↗ ]
            </a>
          </div>
          <MobileNav />
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="legib" />
        <div className="legib2" />
        <div className="wrap">
          <div className="status mono">
            <span className="pulse" />
            Беру проекты в работу · отвечаю в течение часа
          </div>
          <h1>
            <span className="ln">
              <i>Делаю сайты,</i>
            </span>
            <span className="ln">
              <i>которые работают.</i>
            </span>
            <span className="ln">
              <i>
                Чужие —{" "}
                <span className="acc" data-t="чиню.">
                  чиню.
                </span>
              </i>
            </span>
          </h1>
          <p className="sub">
            Я разработчик, а не сборщик шаблонов на коленке. Собираю с нуля и спасаю чужое:{" "}
            <b>чистый код, скорость, ноль «почти работает»</b>. Сайт, который не стыдно пустить в рекламу и
            показать клиенту.
          </p>
          <div className="cta-row">
            <a className="magnet" href="#contact" data-cursor data-magnet>
              <span className="lab">Обсудить проект →</span>
            </a>
            <a className="ghost" href="#works" data-cursor>
              Сначала покажи работы <span className="ar">↘</span>
            </a>
          </div>
          <div className="facts mono">
            {FACTS.map((f, i) => (
              <div key={i} style={{ display: "contents" }}>
                <div className="f">
                  <b>
                    {f.value}
                    {f.suffix && <span className="s">{f.suffix}</span>}
                  </b>
                  <span>{f.label}</span>
                </div>
                {i < FACTS.length - 1 && <div className="sep" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marq">
        <div className="track">
          <MarqueeSeg />
          <MarqueeSeg />
        </div>
      </div>

      {/* PAIN */}
      <section className="blk" id="why">
        <div className="wrap">
          <div className="reveal">
            <div className="eyebrow">
              <span className="n">01</span> <span className="scramble">Почему сайты молчат</span>
            </div>
            <h2>
              Красивый — <span className="acc">не значит</span> работающий
            </h2>
            <p className="lead">
              Можно вбухать деньги в сайт и получить ноль заявок. Чаще всего виноваты три вещи:
            </p>
          </div>
          <div className="pain reveal">
            {PAIN.map((p) => (
              <div className="p" key={p.n}>
                <div className="pn mono">{p.n}</div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
          <div className="painclose reveal">
            Я делаю <span className="acc">наоборот</span> — быстро, понятно, под тебя.
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="blk" id="services" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <div className="reveal">
            <div className="eyebrow">
              <span className="n">02</span> <span className="scramble">Что я делаю</span>
            </div>
            <h2>
              От точечной правки до <span className="acc">сайта под ключ</span>
            </h2>
            <p className="lead">
              Берусь и за большие проекты с нуля, и за аккуратные доработки. Стек подбираю под задачу и
              бюджет, а не под моду. Ставка {SITE.ratePerHour} ₽/час, по проекту — фикс-смета после разбора.
            </p>
          </div>
          <div className="svc reveal">
            {SERVICES.map((s) => (
              <div className="card" key={s.title}>
                <ServiceIcon name={s.icon} />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className="pr" dangerouslySetInnerHTML={{ __html: s.price }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="blk" id="process">
        <div className="wrap">
          <div className="reveal">
            <div className="eyebrow">
              <span className="n">03</span> <span className="scramble">Как я работаю</span>
            </div>
            <h2>
              Один человек. <span className="acc">Никаких сюрпризов</span>
            </h2>
            <p className="lead">
              Без пинг-понга между подрядчиками и без «ой, это считается отдельно». Пять шагов от задачи до
              рабочего сайта.
            </p>
          </div>
          <div className="steps reveal">
            {PROCESS.map((s) => (
              <div className="step" key={s.n}>
                <div className="num mono">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GIANT BAND */}
      <div className="band">
        <div className="bt">
          <BandSeg />
          <BandSeg />
        </div>
      </div>

      {/* WORKS */}
      <section className="blk" id="works" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <div className="reveal">
            <div className="eyebrow">
              <span className="n">04</span> <span className="scramble">Работы</span>
            </div>
            <h2>
              Не скриншоты. <span className="acc">Сами сайты.</span>
            </h2>
            <p className="lead">
              Открой любой в новой вкладке и потыкай руками — это рабочие коммерческие проекты в проде, а не
              картинки.
            </p>
          </div>
          <div className="works reveal">
            {WORKS.map((w) => (
              <a className="work" href={w.href} target="_blank" rel="noopener noreferrer" data-cursor key={w.href}>
                <div className="shot">
                  <span className="tag mono">
                    <i />
                    {w.tag}
                  </span>
                  <Image src={w.img} alt={w.alt} fill sizes="(max-width:920px) 100vw, 380px" />
                  <span className="openbadge mono">Открыть ↗</span>
                </div>
                <div className="body">
                  <div className="top">
                    <h3>{w.title}</h3>
                    <span className="yr mono">{w.kind}</span>
                  </div>
                  <p>{w.text}</p>
                  <div className="stk mono">
                    {w.stack.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="blk" id="faq">
        <div className="wrap">
          <div className="reveal rev-head">
            <div>
              <div className="eyebrow">
                <span className="n">05</span> <span className="scramble">Частые вопросы</span>
              </div>
              <h2>
                Отвечаю <span className="acc">заранее</span>
              </h2>
            </div>
            <div className="faq-badge">
              <b>
                5.0<span className="s">★</span>
              </b>
              <span>
                высший рейтинг
                <br />
                28 отзывов на Kwork
              </span>
              <a href={SITE.kwork} target="_blank" rel="noopener noreferrer" data-cursor>
                читать →
              </a>
            </div>
          </div>
          <FaqList />
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="contact">
        <div className="wrap grid">
          <div className="reveal">
            <div className="eyebrow">
              <span className="n">06</span> <span className="scramble">Контакт</span>
            </div>
            <h2>
              Расскажи <span className="acc">задачу</span>
            </h2>
            <p className="note">
              Опиши в двух словах, что нужно — отвечу в течение часа и скажу честно, что стоит сделать и
              сколько. Консультация бесплатная, без обязательств.
            </p>
            <div className="direct mono">
              <a href={SITE.telegram} target="_blank" rel="noopener noreferrer" data-cursor data-magnet>
                <span className="ic">↗</span>Telegram<span className="pull">{SITE.telegramHandle}</span>
              </a>
              <a href={`mailto:${SITE.email}`} data-cursor>
                <span className="ic">@</span>Почта<span className="pull">{SITE.email}</span>
              </a>
              <a href={SITE.kwork} target="_blank" rel="noopener noreferrer" data-cursor>
                <span className="ic">✦</span>Kwork<span className="pull">Профиль · 5.0★</span>
              </a>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="logo">
            <span className="sq" />
            {SITE.name}
          </div>
          <div className="made mono">
            Этот сайт собран на Next.js без шаблонов <span className="s">—</span> и он тоже мой кейс
          </div>
          <div className="fl mono">
            <a href={SITE.telegram} target="_blank" rel="noopener noreferrer" data-cursor>
              Telegram
            </a>
            <a href={SITE.kwork} target="_blank" rel="noopener noreferrer" data-cursor>
              Kwork
            </a>
            <a href="#top" data-cursor data-top>
              Наверх ↑
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
