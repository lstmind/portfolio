import { notFound } from "next/navigation";
import { INDUSTRY_PAGES, industryBySlug } from "@/lib/industries";
import { ogCard, OG_SIZE } from "@/app/og/card";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Сайт для отрасли — lstmind";

export function generateStaticParams() {
  return INDUSTRY_PAGES.map((i) => ({ slug: i.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = industryBySlug(slug);
  if (!i) notFound();
  return ogCard({ kicker: "САЙТ ДЛЯ НИШИ", title: i.h1, note: i.price.value });
}
