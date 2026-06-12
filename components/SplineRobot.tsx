"use client";

// ВРЕМЕННО — превью 3D-робота со Spline. Убрать: удалить этот файл и <SplineRobot/> в app/page.tsx.
import { useEffect, useRef } from "react";

export function SplineRobot() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.querySelector("script[data-spline]")) {
      const s = document.createElement("script");
      s.type = "module";
      s.src = "https://unpkg.com/@splinetool/viewer@1.12.97/build/spline-viewer.js";
      s.dataset.spline = "1";
      document.head.appendChild(s);
    }
    if (ref.current && !ref.current.firstChild) {
      ref.current.innerHTML =
        '<spline-viewer url="https://prod.spline.design/YzkkVA6r4JjyPYwL/scene.splinecode" style="width:100%;height:100%;"></spline-viewer>';
    }
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "55%", zIndex: 4, pointerEvents: "auto" }}
    />
  );
}
