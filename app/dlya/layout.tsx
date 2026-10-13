import { Header } from "@/components/v4/Header";
import { Footer } from "@/components/v4/Footer";
import { Tongue } from "@/components/v4/Tongue";
import "@/components/v4/dlya/dlya.css";

/** раздел ниш в новом дизайне: общая шапка с разделами, подвал и язычок Telegram на телефоне */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header inner current="/dlya" />
      <main id="main" className="dl-page">
        {children}
      </main>
      <Footer />
      <Tongue after=".dl-hero .dl-tg" until="#dl-final-t" />
    </>
  );
}
