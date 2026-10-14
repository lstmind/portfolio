import type { Metadata } from "next";
import { NotFoundScene } from "@/components/v4/misc/NotFound";
import { SITE } from "@/lib/content";

// без своих метаданных 404 наследует title, description и canonical главной —
// то есть заявляет поисковику, что это дубль главной страницы
const NF_TITLE = "Страница не найдена | lstmind";
const NF_TEXT = "Такой страницы нет. Услуги, работы и контакты на главной.";

// robots оставлен: без него 404 унаследует "index, follow" из layout рядом с noindex от Next.
// openGraph и twitter свои и без url: иначе превью 404 выдаёт себя за главную
export const metadata: Metadata = {
  title: NF_TITLE,
  description: NF_TEXT,
  robots: { index: false, follow: true },
  alternates: {},
  openGraph: { type: "website", locale: "ru_RU", siteName: SITE.ogName, title: NF_TITLE, description: NF_TEXT },
  twitter: { card: "summary_large_image", title: NF_TITLE, description: NF_TEXT },
};

/* сцена из design-concepts/v4/karusel/404.html: поза 9 пожимает плечами и держит "СТРАНИЦЫ" и "НЕТ" на ладонях,
   красный язычок ведёт на главную. css-файлов не импортирует: их Next предзагружал бы на каждой странице сайта */
export default function NotFound() {
  return <NotFoundScene />;
}
