import { ogWorks, OG_SIZE } from "@/components/v4/misc/og";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Работы: живые сайты и разборы | lstmind";

export default function Image() {
  return ogWorks();
}
