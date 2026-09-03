/**
 * Загрузчик для запуска lib/*.ts обычным node: понимает алиас @/ и импорты без расширения.
 * Нужен только проверкам из scripts/, в сборку не попадает.
 */
const ROOT = new URL("../", import.meta.url).href;
const HAS_EXT = /\.[cm]?[jt]sx?$|\.json$/;

export async function resolve(spec, ctx, next) {
  if (spec.startsWith("@/")) return next(`${ROOT}${spec.slice(2)}.ts`, ctx);
  if ((spec.startsWith("./") || spec.startsWith("../")) && !HAS_EXT.test(spec)) return next(`${spec}.ts`, ctx);
  return next(spec, ctx);
}
