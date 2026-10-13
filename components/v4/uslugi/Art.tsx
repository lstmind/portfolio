import type { Art } from "./scenes";

/** картинка сцены или позы с srcset; размеры холста в width/height, чтобы место было занято до загрузки */
export function ArtImg({
  art,
  alt = "",
  sizes,
  loading = "lazy",
  fetchPriority,
  className,
  style,
}: {
  art: Art;
  alt?: string;
  sizes: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      style={style}
      alt={alt}
      width={art.w}
      height={art.h}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      src={art.src}
      srcSet={art.srcSet}
      sizes={sizes}
    />
  );
}
