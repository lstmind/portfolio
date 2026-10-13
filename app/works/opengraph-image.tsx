import { ogCardV4, OG_SIZE } from "@/components/v4/misc/og";
import { PROJECTS_TOTAL } from "@/lib/content";
import { liveSitesWord } from "@/lib/home";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Работы: живые сайты и разборы | lstmind";

export default function Image() {
  return ogCardV4({ kicker: "РАБОТЫ", title: "Живые сайты и разборы", note: `${PROJECTS_TOTAL} ${liveSitesWord()} · каждый открывается`, pose: "j2" });
}
