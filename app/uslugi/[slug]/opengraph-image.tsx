import { notFound } from "next/navigation";
import { SERVICE_PAGES, serviceBySlug } from "@/lib/services";
import { ogService, OG_SIZE } from "@/components/v4/misc/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return SERVICE_PAGES.map((s) => ({ slug: s.slug }));
}

/** подпись картинки из данных страницы: что за услуга, цена и срок, как на самой картинке */
export async function generateImageMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  return [
    {
      id: "og",
      size: OG_SIZE,
      contentType: "image/png",
      alt: s ? `${s.h1}: ${s.price.value}, ${s.term.value}` : "Услуга: цена и срок | lstmind",
    },
  ];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) notFound();
  return ogService(s);
}
