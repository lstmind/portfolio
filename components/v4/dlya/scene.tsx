/**
 * Сцены персонажа для ниш: листы niche-food, niche-work, niche-home (public/img/v4/ill/*.json).
 * Холст высотой 984 как у pose-j: подошвы на 978, ось корпуса ax. Холсты шире 400, потому что предмет торчит вбок;
 * ширина холста w и ось ax нужны, чтобы при смене позы ось фигуры осталась на месте.
 * crop: поясной кроп для строк списков [x0, y0, x1, y1] в px холста 984 (голова и предмет целиком).
 */
const IMG = "/img/v4/ill/";
const HS = [560, 780, 984, 1400];

type SceneDef = { img: string; w: number; ax: number; crop: [number, number, number, number]; alt: string };

export const SCENES: Record<string, SceneDef> = {
  proizvodstvo: { img: "n-proizvodstvo", w: 400, ax: 188, crop: [16, 0, 358, 470], alt: "Алексей держит стальную шестерню" },
  "transportnaya-kompaniya": { img: "n-transport", w: 436, ax: 223, crop: [0, 0, 400, 430], alt: "Алексей держит на ладони игрушечную фуру" },
  "kafe-bar-restoran": { img: "n-kafe", w: 496, ax: 277, crop: [0, 0, 496, 470], alt: "Алексей с подносом, на нём бокалы и кофе" },
  "okna-i-osteklenie": { img: "n-okna", w: 490, ax: 278, crop: [0, 0, 436, 600], alt: "Алексей стоит у белой оконной рамы" },
  "salon-krasoty": { img: "n-salon", w: 438, ax: 207, crop: [0, 0, 438, 460], alt: "Алексей с феном и круглой щёткой" },
  "dostavka-edy": { img: "n-dostavka", w: 488, ax: 276, crop: [0, 0, 446, 460], alt: "Алексей держит на ладони коробку с пиццей" },
  "remont-i-otdelka": { img: "n-remont", w: 458, ax: 226, crop: [0, 0, 458, 440], alt: "Алексей растянул строительную рулетку" },
  "mebel-na-zakaz": { img: "n-mebel", w: 590, ax: 378, crop: [0, 0, 560, 984], alt: "Алексей держит за спинку деревянный стул" },
  "magazin-odezhdy": { img: "n-odezhda", w: 572, ax: 360, crop: [0, 0, 540, 600], alt: "Алексей показывает рубашку на вешалке" },
};

export function sceneOf(slug: string) {
  const s = SCENES[slug];
  if (!s) throw new Error(`нет сцены персонажа для ниши ${slug} в components/v4/dlya/scene.tsx`);
  return s;
}

/** ширины файлов сцены: высота файла * w / 984 */
const widthsOf = (s: SceneDef) => HS.map((h) => Math.round((h * s.w) / 984));
export const sceneSrcSet = (s: SceneDef) => HS.map((h, i) => `${IMG}${s.img}-${h}.webp ${widthsOf(s)[i]}w`).join(", ");
export const sceneSrc = (s: SceneDef) => `${IMG}${s.img}-780.webp`;

/**
 * Сцена целиком. Размер задаётся высотой в CSS, поэтому sizes считается из высоты:
 * hd на десктопе и hm на телефоне в css-пикселях.
 */
export function Scene({ slug, hd, hm, className }: { slug: string; hd: number; hm: number; className?: string }) {
  const s = sceneOf(slug);
  const w = (h: number) => Math.round((h * s.w) / 984);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      alt={s.alt}
      width={s.w}
      height={984}
      loading="lazy"
      decoding="async"
      src={sceneSrc(s)}
      srcSet={sceneSrcSet(s)}
      sizes={`(max-width: 699px) ${w(hm)}px, ${w(hd)}px`}
      style={{ "--sw": s.w } as React.CSSProperties}
    />
  );
}

/**
 * Поясной кроп сцены: рамка с пропорциями кропа, картинка внутри сдвинута и увеличена так,
 * что в рамку попадает ровно crop. Высота рамки задаётся в CSS, ширина выходит из пропорций.
 */
export function SceneCrop({ slug, className, h = 120 }: { slug: string; className?: string; h?: number }) {
  const s = sceneOf(slug);
  const [x0, y0, x1, y1] = s.crop;
  const cw = x1 - x0;
  const ch = y1 - y0;
  // ширина картинки на экране: высота рамки h, картинка во столько раз шире рамки, во сколько холст шире кропа
  const imgW = Math.round((h * s.w) / ch);
  return (
    <span
      className={`dl-crop${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      style={{ aspectRatio: `${cw} / ${ch}` } as React.CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        loading="lazy"
        decoding="async"
        width={s.w}
        height={984}
        src={`${IMG}${s.img}-560.webp`}
        srcSet={sceneSrcSet(s)}
        sizes={`${imgW}px`}
        style={{
          width: `${((s.w / cw) * 100).toFixed(2)}%`,
          left: `${((-x0 / cw) * 100).toFixed(2)}%`,
          top: `${((-y0 / ch) * 100).toFixed(2)}%`,
        }}
      />
    </span>
  );
}
