import { llmsShort } from "@/lib/llms";

/**
 * /llms.txt — короткая машинная выжимка о том, кто я и что делаю.
 * Формат для поисковых роботов и ассистентов: им проще взять факты отсюда,
 * чем вытаскивать их из вёрстки. Текст собирается в lib/llms.ts из тех же данных,
 * что и страницы, поэтому не может разойтись с сайтом. Полная версия: /llms-full.txt.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsShort(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
