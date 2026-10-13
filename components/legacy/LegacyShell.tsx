import { ClientFX } from "@/components/ClientFX";
import "@/app/legacy.css";

/**
 * Старый тёмный стиль (legacy.css) и эффекты (ClientFX: Lenis, курсор).
 * Больше нигде не подключается: все разделы переехали на новый дизайн. Шрифтов старого стиля в layout уже нет,
 * файл оставлен до чистки вместе с legacy.css, doc.css и app/og/card.tsx.
 */
export function LegacyShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientFX />
      {children}
    </>
  );
}
