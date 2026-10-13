import { notFound } from "next/navigation";
import { SERVICE_PAGES, serviceBySlug } from "@/lib/services";
import { ogCardV4, OG_SIZE } from "@/components/v4/misc/og";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Услуга | lstmind";

export function generateStaticParams() {
  return SERVICE_PAGES.map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) notFound();
  return ogCardV4({ kicker: "УСЛУГА", title: s.h1, note: s.price.value, pose: "j5" });
}
