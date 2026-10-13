import { ogServices, OG_SIZE } from "@/components/v4/misc/og";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Услуги и цены: сайты, магазины, боты, починка | lstmind";

export default function Image() {
  return ogServices();
}
