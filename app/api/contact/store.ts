import { appendFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export type Lead = {
  t: string;
  name: string;
  contact: string;
  task: string;
  budget: string;
  page: string;
  from: string;
};

/**
 * Куда пишутся заявки: LEADS_FILE из окружения. По умолчанию на сервере /srv/lstmind/data/leads.jsonl:
 * вне папки релиза (релизы меняются целиком при каждом деплое), вне public (по ссылке не открыть).
 * На Windows (локальная сборка) по умолчанию во временную папку, чтобы не плодить D:\srv.
 */
export function leadsFile() {
  return process.env.LEADS_FILE || (process.platform === "win32" ? path.join(tmpdir(), "lstmind-leads.jsonl") : "/srv/lstmind/data/leads.jsonl");
}

/**
 * Первая запись заявки: строка JSON в конец файла (JSON Lines). Папка 700, файл 600: читает только владелец процесса.
 * Строка короткая и пишется одним вызовом с O_APPEND, две заявки разом не перемешаются.
 */
export async function saveLead(lead: Lead) {
  const file = leadsFile();
  await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  await appendFile(file, JSON.stringify(lead) + "\n", { encoding: "utf8", mode: 0o600 });
}
