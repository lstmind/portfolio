import { connect, type TLSSocket } from "node:tls";
import { randomBytes } from "node:crypto";

/**
 * Копия заявки письмом. Без библиотек: SMTP через SSL (порт 465), AUTH PLAIN, одно письмо и выход.
 * Включается, только если в окружении есть SMTP_USER и SMTP_PASS (для Яндекса это пароль приложения, не пароль от почты).
 *   SMTP_HOST  по умолчанию smtp.yandex.ru
 *   SMTP_PORT  по умолчанию 465 (только SSL сразу, STARTTLS не поддерживается)
 *   SMTP_USER  логин, он же адрес отправителя (Яндекс не даёт слать от чужого адреса)
 *   SMTP_PASS  пароль приложения
 *   SMTP_TO    куда слать, по умолчанию lstmind@yandex.ru
 */
export function mailOn() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

type Reply = { code: number; text: string };

/** текст ответа сервера не логируем целиком: в нём бывает эхо логина */
class Smtp {
  private buf = "";
  private lines: string[] = [];
  private queue: Reply[] = [];
  private wait: ((r: Reply) => void) | null = null;
  private fail: ((e: Error) => void) | null = null;
  private err: Error | null = null;

  private sock: TLSSocket;

  constructor(sock: TLSSocket) {
    this.sock = sock;
    sock.setEncoding("utf8");
    sock.on("data", (d: string) => {
      this.buf += d;
      let i;
      while ((i = this.buf.indexOf("\r\n")) >= 0) {
        const line = this.buf.slice(0, i);
        this.buf = this.buf.slice(i + 2);
        this.lines.push(line);
        // последняя строка ответа: код и пробел (в многострочном ответе после кода дефис)
        if (/^\d{3}(?: |$)/.test(line)) {
          const r = { code: +line.slice(0, 3), text: this.lines.join("\n") };
          this.lines = [];
          if (this.wait) {
            const w = this.wait;
            this.wait = this.fail = null;
            w(r);
          } else this.queue.push(r);
        }
      }
    });
    const die = (e: Error) => {
      this.err = e;
      if (this.fail) {
        const f = this.fail;
        this.wait = this.fail = null;
        f(e);
      }
    };
    sock.on("error", die);
    sock.on("close", () => die(new Error("smtp: соединение закрыто")));
  }

  read(): Promise<Reply> {
    const r = this.queue.shift();
    if (r) return Promise.resolve(r);
    if (this.err) return Promise.reject(this.err);
    return new Promise((res, rej) => {
      this.wait = res;
      this.fail = rej;
    });
  }

  async cmd(line: string | null, expect: number, what: string) {
    if (line !== null) this.sock.write(line + "\r\n");
    const r = await this.read();
    if (Math.floor(r.code / 100) !== expect) throw new Error(`smtp: ${what} -> ${r.code}`);
    return r;
  }
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
/**
 * заголовок с кириллицей: encoded-word, переводы строк из пользовательского текста вырезаны.
 * Одно слово не длиннее 75 знаков (RFC 2047): текст режется по 40 байт, слова переносятся на новые строки заголовка
 */
function word(s: string) {
  const parts: string[] = [];
  let cur = "";
  for (const ch of s.replace(/[\r\n]+/g, " ")) {
    if (cur && Buffer.byteLength(cur + ch) > 40) {
      parts.push(cur);
      cur = "";
    }
    cur += ch;
  }
  if (cur) parts.push(cur);
  return parts.map((p) => `=?UTF-8?B?${b64(p)}?=`).join("\r\n ");
}

export async function sendMail({ subject, text, replyTo }: { subject: string; text: string; replyTo?: string }) {
  const host = process.env.SMTP_HOST || "smtp.yandex.ru";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const to = process.env.SMTP_TO || "lstmind@yandex.ru";

  const sock = connect({ host, port, servername: host });
  sock.setTimeout(10000, () => sock.destroy(new Error("smtp: таймаут")));
  const s = new Smtp(sock);
  try {
    await s.cmd(null, 2, "приветствие");
    await s.cmd("EHLO lstmind.ru", 2, "EHLO");
    await s.cmd("AUTH PLAIN " + b64(`\0${user}\0${pass}`), 2, "AUTH");
    await s.cmd(`MAIL FROM:<${user}>`, 2, "MAIL FROM");
    await s.cmd(`RCPT TO:<${to}>`, 2, "RCPT TO");
    await s.cmd("DATA", 3, "DATA");
    const head = [
      `From: ${word("Сайт lstmind.ru")} <${user}>`,
      `To: <${to}>`,
      `Subject: ${word(subject)}`,
      `Date: ${new Date().toUTCString().replace("GMT", "+0000")}`,
      `Message-ID: <${Date.now()}.${randomBytes(6).toString("hex")}@lstmind.ru>`,
      ...(replyTo ? [`Reply-To: <${replyTo}>`] : []),
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: base64",
    ];
    // тело в base64 строками по 76: точка в начале строки (конец письма в SMTP) в base64 не встречается
    const body = (b64(text).match(/.{1,76}/g) || []).join("\r\n");
    await s.cmd(head.join("\r\n") + "\r\n\r\n" + body + "\r\n.", 2, "отправка");
    sock.write("QUIT\r\n");
  } finally {
    sock.end();
  }
}
