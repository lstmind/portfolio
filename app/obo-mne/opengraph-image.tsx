import { ogAbout, OG_SIZE } from "@/components/v4/about/og";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Алексей Кунцевич, веб-разработчик | lstmind";

export default function Image() {
  return ogAbout();
}
