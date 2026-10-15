import { ogHome, OG_SIZE } from "@/components/v4/misc/og";

/** своей картинки у юридической страницы нет: та же, что у главной, чтобы ссылка не была пустой карточкой */
export const dynamic = "force-static";
export const alt = "Алексей (lstmind), веб-разработчик: делаю сайты без менеджеров";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogHome();
}
