import { notFound } from "next/navigation";
import { CASE_PAGES, caseBySlug } from "@/lib/cases";
import { WORKS } from "@/lib/content";
import { ogCase, OG_SIZE } from "@/components/v4/misc/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return CASE_PAGES.map((c) => ({ slug: c.slug }));
}

/** подпись картинки с названием проекта: на ней десктоп и телефонная версия этого сайта */
export async function generateImageMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = caseBySlug(slug);
  const w = c && WORKS.find((x) => x.href === c.href);
  return [
    {
      id: "og",
      size: OG_SIZE,
      contentType: "image/png",
      alt: w ? `Разбор проекта ${w.title}: сайт на ноутбуке и телефоне` : "Разбор проекта: сайт на ноутбуке и телефоне | lstmind",
    },
  ];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = caseBySlug(slug);
  if (!c) notFound();
  return ogCase(c);
}
