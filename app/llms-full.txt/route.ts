import { llmsFull } from "@/lib/llms";

/**
 * /llms-full.txt — полная машинная версия сайта: по каждой услуге, нише и разбору
 * что входит, цена и срок с пояснениями, вопросы и ответы. Те же данные, что на страницах (lib/llms.ts).
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFull(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
