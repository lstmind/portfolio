import { ogCardV4, OG_SIZE } from "@/components/v4/misc/og";
import { INDUSTRY_PAGES } from "@/lib/industries";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Сайты по нишам | lstmind";

export default function Image() {
  return ogCardV4({ kicker: "НИШИ", title: "Сайты по нишам", note: `${INDUSTRY_PAGES.length} ниш · цены и сроки`, pose: "j7" });
}
