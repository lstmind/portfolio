import type { Metadata } from "next";
import { SITE, TITLE_TAIL } from "@/lib/content";
import { Header } from "@/components/v4/Header";
import { Footer } from "@/components/v4/Footer";
import { Tongue } from "@/components/v4/Tongue";
import { LegalDoc } from "@/components/v4/legal/LegalDoc";
import { CONSENT } from "@/components/v4/legal/docs";

const TITLE = `Согласие на обработку персональных данных${TITLE_TAIL}`;
const TEXT = "Текст согласия на обработку данных из заявки на сайте lstmind.ru и на cookie с Яндекс Метрикой: какие данные, зачем, срок и как отозвать.";

export const metadata: Metadata = {
  title: TITLE,
  description: TEXT,
  alternates: { canonical: "/soglasie" },
  openGraph: { type: "website", locale: "ru_RU", siteName: SITE.ogName, url: `${SITE.url}/soglasie`, title: TITLE, description: TEXT },
  twitter: { card: "summary_large_image", title: TITLE, description: TEXT },
};

export default function Page() {
  return (
    <>
      <Header inner />
      <LegalDoc doc={CONSENT} path="/soglasie" />
      <Footer />
      <Tongue after="" until="#lg-ask" />
    </>
  );
}
