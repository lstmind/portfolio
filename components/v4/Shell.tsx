import { Header } from "./Header";
import { Footer } from "./Footer";
import { Tongue } from "./Tongue";

/**
 * Шапка, подвал и язычок Telegram вокруг страницы раздела. Стоят в самой странице, а не в layout:
 * у каждой страницы своё первое сообщение в Telegram (tg), а layout не знает, какая страница у него внутри.
 * main: класс обёртки <main>; без него страница рисует <main> сама (разделы работ).
 * after, until: когда выезжает и уезжает язычок (см. Tongue).
 */
export function Shell({
  current,
  tg,
  main,
  after,
  until,
  children,
}: {
  current: string;
  tg: string;
  main?: string;
  after: string;
  until: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header inner current={current} tg={tg} />
      {main ? (
        <main id="main" className={main}>
          {children}
        </main>
      ) : (
        children
      )}
      <Footer tg={tg} />
      <Tongue after={after} until={until} tg={tg} />
    </>
  );
}
