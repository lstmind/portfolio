import { notFound } from "next/navigation";
import { CASE_PAGES, caseBySlug } from "@/lib/cases";
import { WORKS } from "@/lib/content";
import { ogCard, OG_SIZE } from "@/app/og/card";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Кейс — lstmind";

export function generateStaticParams() {
  return CASE_PAGES.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = caseBySlug(slug);
  const w = c && WORKS.find((x) => x.href === c.href);
  if (!c || !w) notFound();
  return ogCard({ kicker: "КЕЙС", title: w.title, note: w.kind });
}
