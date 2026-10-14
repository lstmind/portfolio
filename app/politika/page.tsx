import type { Metadata } from "next";
import { SITE, TITLE_TAIL } from "@/lib/content";
import { Header } from "@/components/v4/Header";
import { Footer } from "@/components/v4/Footer";
import { Tongue } from "@/components/v4/Tongue";
import { LegalDoc } from "@/components/v4/legal/LegalDoc";
import { POLICY } from "@/components/v4/legal/docs";

const TITLE = `Политика обработки персональных данных${TITLE_TAIL}`;
const TEXT =
  "Какие данные я получаю через сайт lstmind.ru, зачем, где и сколько храню, кому передаю и как отозвать согласие. Яндекс Метрика, заявки, Telegram.";

export const metadata: Metadata = {
  title: TITLE,
  description: TEXT,
  alternates: { canonical: "/politika" },
  openGraph: { type: "website", locale: "ru_RU", siteName: SITE.ogName, url: `${SITE.url}/politika`, title: TITLE, description: TEXT },
  twitter: { card: "summary_large_image", title: TITLE, description: TEXT },
};

export default function Page() {
  return (
    <>
      <Header inner />
      <LegalDoc doc={POLICY} path="/politika" />
      <Footer />
      <Tongue after="" until="#lg-ask" />
    </>
  );
}
