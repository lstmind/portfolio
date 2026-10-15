import { ogHome, OG_SIZE } from "@/components/v4/misc/og";

export const dynamic = "force-static";
export const alt = "Алексей (lstmind), веб-разработчик: делаю сайты без менеджеров";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogHome();
}
