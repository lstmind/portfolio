import { notFound } from "next/navigation";
import { CASE_PAGES, caseBySlug } from "@/lib/cases";
import { ogCase, OG_SIZE } from "@/components/v4/misc/og";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Разбор проекта: сайт на ноутбуке и телефоне | lstmind";

export function generateStaticParams() {
  return CASE_PAGES.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = caseBySlug(slug);
  if (!c) notFound();
  return ogCase(c);
}
