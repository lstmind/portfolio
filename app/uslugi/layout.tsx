import { Header } from "@/components/v4/Header";
import { Footer } from "@/components/v4/Footer";
import { Tongue } from "@/components/v4/Tongue";
import "@/components/v4/uslugi/uslugi.css";

/** раздел услуг в новом дизайне: общая шапка с разделами, подвал и язычок Telegram на телефоне */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header inner current="/uslugi" />
      <main id="main" className="u-page">
        {children}
      </main>
      <Footer />
      <Tongue after=".u-hero .u-tg" until="#u-final-t" />
    </>
  );
}
