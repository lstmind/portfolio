import type { Metadata } from "next";
import { NotFoundScene } from "@/components/v4/misc/NotFound";

// без своих метаданных 404 наследует title, description и canonical главной —
// то есть заявляет поисковику, что это дубль главной страницы
export const metadata: Metadata = {
  title: "Страница не найдена | lstmind",
  description: "Такой страницы нет. Услуги, работы и контакты на главной.",
  robots: { index: false, follow: true },
  alternates: {},
};

/* сцена из design-concepts/v4/karusel/404.html: поза 9 пожимает плечами и держит "СТРАНИЦЫ" и "НЕТ" на ладонях,
   красный язычок ведёт на главную. css-файлов не импортирует: их Next предзагружал бы на каждой странице сайта */
export default function NotFound() {
  return <NotFoundScene />;
}
