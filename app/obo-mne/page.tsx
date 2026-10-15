import type { Metadata } from "next";
import { SITE, TITLE_TAIL } from "@/lib/content";
import { getKworkReviewsCount } from "@/lib/kwork";
import { PERSON_EXTRA_LD } from "@/lib/person-ld";
import { Header } from "@/components/v4/Header";
import { Footer } from "@/components/v4/Footer";
import { Tongue } from "@/components/v4/Tongue";
import { About } from "@/components/v4/about/About";
import { PERSON, SINCE } from "@/components/v4/about/data";
import { tgText } from "@/lib/cta";

/** первое сообщение в Telegram со страницы "Обо мне": то же, что у кнопок на самой странице */
const TG = tgText({ kind: "page", name: "Обо мне" });

/**
 * Обо мне и контакты: кто делает сайты, как с ним связаться и реквизиты для договора.
 * Старые адреса /kontakty, /about, /contacts ведут сюда (next.config.ts).
 */
const TITLE = `Веб-разработчик на фрилансе в Москве: ${PERSON.name}${TITLE_TAIL}`;
const DESCRIPTION = `${PERSON.name}, веб-разработчик с ${SINCE} года. Сайты, интернет-магазины, боты, доработка чужих сайтов. Самозанятый, договор и чек. Москва, работаю удалённо.`;
const OG_TITLE = `${PERSON.name}, веб-разработчик`;
const OG_TEXT = `С ${SINCE} года делаю сайты, магазины и ботов. Цена заранее, договор и чек.`;
const URL = `${SITE.url}/obo-mne`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/obo-mne" },
  openGraph: {
    type: "profile",
    locale: "ru_RU",
    siteName: SITE.ogName,
    url: URL,
    title: OG_TITLE,
    description: OG_TEXT,
    firstName: PERSON.given,
    lastName: PERSON.family,
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_TEXT,
  },
};

export default async function AboutPage() {
  const kwork = await getKworkReviewsCount();

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${URL}#page`,
        url: URL,
        name: `${PERSON.name}, веб-разработчик на фрилансе`,
        inLanguage: "ru",
        isPartOf: { "@id": `${SITE.url}#website` },
        mainEntity: { "@id": `${SITE.url}#person` },
      },
      // фамилия и учёба дополняют общий Person из layout (lib/person-ld.ts), имя и описание там
      PERSON_EXTRA_LD,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Обо мне", item: URL },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Header inner current="/obo-mne" tg={TG} />
      <main id="main" className="ab-page">
        <About kwork={kwork} />
      </main>
      <Footer tg={TG} />
      <Tongue after=".ab-hero .ab-tg" until="#ab-con-t" tg={TG} />
    </>
  );
}
