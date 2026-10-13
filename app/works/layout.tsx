import { Header } from "@/components/v4/Header";
import { Footer } from "@/components/v4/Footer";
import { Tongue } from "@/components/v4/Tongue";

/** раздел работ в языке новой главной: шапка с тремя разделами, подвал, язычок Telegram на телефоне */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header inner current="/works" />
      {children}
      <Footer />
      <Tongue after="" until="#w-cta-title" />
    </>
  );
}
