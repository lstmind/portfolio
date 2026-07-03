"use client";

import { useEffect, useState } from "react";

/** Местное время в футере — живая деталь «здесь есть человек» */
export function FooterClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Moscow",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="fclock" suppressHydrationWarning>
      Россия {time ? `· ${time} мск` : ""}
    </span>
  );
}
