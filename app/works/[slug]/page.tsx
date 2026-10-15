import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASE_PAGES, caseBySlug } from "@/lib/cases";
import { SITE } from "@/lib/content";
import { Case } from "@/components/v4/works/Case";
import { caseView } from "@/components/v4/works/data";
import { tgText } from "@/lib/cta";
import { Shell } from "@/components/v4/Shell";

// чужой slug сразу получает готовую 404, без рендера на запрос
export const dynamicParams = false;

export function generateStaticParams() {
  return CASE_PAGES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = caseBySlug(slug);
  if (!c) notFound();
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `/works/${c.slug}` },
    openGraph: {
      type: "article",
      locale: "ru_RU",
      siteName: SITE.ogName,
      url: `${SITE.url}/works/${c.slug}`,
      title: c.metaTitle,
      description: c.metaDescription,
    },
    // без своего twitter-блока карточка наследует заголовок главной и врёт про страницу
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.metaDescription,
    },
  };
}

export default async function CasePageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = caseBySlug(slug);
  if (!c) notFound();
  const v = caseView(c);
  if (!v) notFound();
  const { site, kind, stack } = v;

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: site.title,
        headline: c.metaTitle,
        description: c.answer,
        url: `${SITE.url}/works/${c.slug}`,
        // превью 760x471, а не лента во всю страницу: поисковику нужна картинка,
        // которую можно показать в выдаче, а не полотно в мегабайт
        image: `${SITE.url}/img/prev/${c.slug}.webp`,
        inLanguage: "ru",
        about: { "@type": "Thing", name: kind },
        creator: { "@id": `${SITE.url}#person` },
        keywords: stack.join(", "),
        mainEntityOfPage: `${SITE.url}/works/${c.slug}`,
        // разбор и сам сайт клиента разные сущности: сайт упомянут, а не "тот же объект" (sameAs)
        mentions: { "@type": "WebSite", name: site.title, url: c.href },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Работы", item: `${SITE.url}/works` },
          { "@type": "ListItem", position: 3, name: site.title, item: `${SITE.url}/works/${c.slug}` },
        ],
      },
    ],
  };

  return (
    <Shell current="/works" tg={tgText({ kind: "case", name: site.title })} after="" until="#w-cta-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Case v={v} />
    </Shell>
  );
}
