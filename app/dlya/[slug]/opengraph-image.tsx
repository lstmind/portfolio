import { notFound } from "next/navigation";
import { INDUSTRY_PAGES, industryBySlug } from "@/lib/industries";
import { ogNiche, OG_SIZE } from "@/components/v4/misc/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return INDUSTRY_PAGES.map((i) => ({ slug: i.slug }));
}

/** подпись картинки из данных ниши: для кого сайт и цена, как на самой картинке */
export async function generateImageMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = industryBySlug(slug);
  return [
    {
      id: "og",
      size: OG_SIZE,
      contentType: "image/png",
      alt: i ? `${i.h1}: ${i.price.value}, живые примеры` : "Сайт для ниши: цена и живые примеры | lstmind",
    },
  ];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = industryBySlug(slug);
  if (!i) notFound();
  return ogNiche(i);
}
