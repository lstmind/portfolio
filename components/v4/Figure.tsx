/**
 * Персонаж: позы лежат в /img/v4/pose-<id>-<высота>.webp на общем холсте 400x984 (поза j8 сидит: 400x790).
 * Высоты файлов и ширины, которые им соответствуют, для srcset.
 */
export const IMG = "/img/v4/";

export const POSES: Record<string, { w: number; h: number; hs: number[]; ws: number[] }> = (() => {
  const tall = { w: 400, h: 984, hs: [560, 780, 984, 1400, 1600, 1968], ws: [228, 317, 400, 569, 650, 800] };
  const short = { w: 400, h: 984, hs: [560, 780, 984, 1400], ws: [228, 317, 400, 569] };
  return {
    j1: tall,
    j2: tall,
    j3: tall,
    j4: short,
    j5: short,
    j6: short,
    j7: short,
    j9: short,
    j8: { w: 400, h: 790, hs: [450, 626, 790, 1124], ws: [228, 317, 400, 569] },
  };
})();

export const poseSrcSet = (id: string) => {
  const p = POSES[id];
  return p.hs.map((h, i) => `${IMG}pose-${id}-${h}.webp ${p.ws[i]}w`).join(", ");
};
/** кадр по умолчанию: второй по величине файл */
export const poseSrc = (id: string) => `${IMG}pose-${id}-${POSES[id].hs[1]}.webp`;

type Props = {
  pose: string;
  alt?: string;
  sizes: string;
  className?: string;
  id?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
};

/** одна поза картинкой; размеры холста в width/height, чтобы место было занято до загрузки */
export function Figure({ pose, alt = "", sizes, className, id, loading = "lazy", fetchPriority }: Props) {
  const p = POSES[pose];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      id={id}
      alt={alt}
      width={p.w}
      height={p.h}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      src={poseSrc(pose)}
      srcSet={poseSrcSet(pose)}
      sizes={sizes}
    />
  );
}
