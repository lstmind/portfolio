import { ogCardV4, OG_SIZE } from "@/components/v4/misc/og";
import { SERVICE_PAGES } from "@/lib/services";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Услуги и цены | lstmind";

export default function Image() {
  return ogCardV4({ kicker: "УСЛУГИ", title: "Услуги и цены", note: `${SERVICE_PAGES.length} направлений · сайт ${SERVICE_PAGES[0].price.value}`, pose: "j5" });
}
