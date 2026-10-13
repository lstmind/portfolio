import { notFound } from "next/navigation";
import { INDUSTRY_PAGES, industryBySlug } from "@/lib/industries";
import { ogCardV4, OG_SIZE } from "@/components/v4/misc/og";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Сайт для отрасли | lstmind";

export function generateStaticParams() {
  return INDUSTRY_PAGES.map((i) => ({ slug: i.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = industryBySlug(slug);
  if (!i) notFound();
  return ogCardV4({ kicker: "САЙТ ДЛЯ НИШИ", title: i.h1, note: i.price.value, pose: "j7" });
}
