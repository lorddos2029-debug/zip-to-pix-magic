import { createHash, randomUUID } from "node:crypto";
import { redisCommand } from "./utmify-queue.server";
import { createDonationReceipt } from "./donation-receipt.server";
import { donationLogoBase64 } from "./donation-brand.server";

export type DonationReceipt = {
  orderId: string;
  email: string;
  name: string;
  amountInCents: number;
  currency: "EUR" | "BRL";
  method: "mbway" | "multibanco" | "pix";
  confirmedAt: string;
};

type EmailPayload = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  attachments: { filename: string; content: string; content_id?: string }[];
};
type Attempt = { startedAt: number; payload: EmailPayload };
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );

export function buildDonationEmail(details: {
  name: string;
  amount: string;
  method: string;
  orderId: string;
}) {
  const paragraphs = [
    `Olá, ${escapeHtml(details.name)}! ❤️`,
    "É com muita alegria e gratidão que confirmamos que <strong>sua doação foi realizada com sucesso!</strong>",
    "Em nome de toda a equipe do <strong>Juntos por Vidas</strong>, queremos agradecer de coração por sua generosidade, confiança e, principalmente, por escolher fazer a diferença na vida de quem mais precisa.",
    "<strong>Você não fez apenas uma doação. Você levou esperança!</strong> ❤️",
    "Por trás de cada campanha, existe uma história, uma família, um sonho e alguém que enfrenta desafios diariamente. E são pessoas como você que nos ajudam a transformar momentos de dificuldade em novas oportunidades de recomeço.",
    "Cada contribuição representa muito mais do que um valor financeiro. Ela representa cuidado, empatia, solidariedade e a certeza de que ninguém precisa enfrentar suas dificuldades sozinho.",
    "<h2>💝 Seu gesto faz a diferença!</h2>",
    "Graças à sua solidariedade, podemos continuar nossa missão de conectar pessoas dispostas a ajudar àquelas que mais precisam de apoio.",
    "<strong>Sua atitude de hoje pode representar o sorriso, o alívio e a esperança de alguém amanhã.</strong>",
    "Acreditamos que, quando pessoas se unem por uma boa causa, grandes transformações acontecem. E agora você também faz parte dessa corrente do bem!",
    "<h2>🙏 Nossa gratidão a você!</h2>",
    "Que Deus abençoe grandemente sua vida, sua família e seus caminhos. Que todo o amor e a generosidade que você compartilhou retornem em forma de bênçãos, paz e felicidade.",
    "<strong>O mundo precisa de mais pessoas como você: pessoas que não apenas se sensibilizam com a dor do próximo, mas escolhem fazer algo para ajudar.</strong>",
    "Mais uma vez, muito obrigado por acreditar nessa missão e por fazer parte dessa história.",
    "<strong>Juntos, podemos transformar vidas. Juntos, podemos espalhar esperança. Juntos por Vidas!</strong> ❤️",
    "Com carinho e gratidão,<br><strong>Equipe Juntos por Vidas</strong> ❤️<br><em>Unindo corações, transformando histórias e levando esperança a quem mais precisa.</em>",
  ];
  const year = new Date().getUTCFullYear();
  const footer =
    "Este é um email automático de confirmação e agradecimento pela sua doação. Não é necessário responder a esta mensagem.";
  const summary = `Valor: ${details.amount}\nMétodo: ${details.method}\nPedido: ${details.orderId}\nSeu recibo de doação em PDF está anexado. Documento sem valor fiscal.`;
  const text = `❤️ JUNTOS POR VIDAS\nTransformando solidariedade em esperança.\n\n✅ Sua doação foi confirmada com sucesso!\n\n${summary}\n\n${paragraphs
    .join("\n\n")
    .replace(/<br>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(
      /&amp;/g,
      "&",
    )}\n\n${footer}\n\nRua da Alegria, nº 123, 2º Esquerdo, 4000-032 Porto, Portugal\nNIF Empresarial: 245443371\n\n© ${year} Juntos por Vidas. Todos os direitos reservados.`;
  const body = paragraphs
    .map((paragraph) =>
      paragraph.startsWith("<h2>")
        ? paragraph.replace(
            "<h2>",
            '<h2 style="margin:32px 0 16px;color:#176442;font-size:21px;line-height:1.4">',
          )
        : `<p style="margin:0 0 18px;font-size:16px;line-height:1.8;color:#37474f">${paragraph}</p>`,
    )
    .join("");
  const html = `<!doctype html><html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Doação confirmada | Juntos por Vidas</title></head><body style="margin:0;padding:0;background:#f2f6f3;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">Sua doação foi confirmada. Obrigado por transformar solidariedade em esperança. Seu recibo está anexado.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f6f3"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e0e9e2;border-radius:16px"><tr><td style="padding:30px 28px;text-align:center;background:#ffffff;border-top:6px solid #176442;border-bottom:1px solid #e0e9e2;border-radius:16px 16px 0 0"><img src="cid:juntos-por-vidas-logo" alt="Juntos por Vidas" width="112" height="112" style="display:block;width:112px;height:112px;margin:0 auto 16px;border:0"><div style="font-size:22px;font-weight:bold;letter-spacing:1px;color:#176442">JUNTOS POR VIDAS</div><p style="margin:12px 0 0;color:#6d7e73;font-size:14px;line-height:1.6">Transformando solidariedade em esperança.</p></td></tr><tr><td style="padding:32px 28px"><div style="display:inline-block;padding:7px 12px;margin:0 0 16px;background:#edf7f0;color:#176442;border-radius:30px;font-size:12px;font-weight:bold;letter-spacing:1px">PAGAMENTO CONFIRMADO</div><h1 style="margin:0 0 24px;color:#176442;font-size:26px;line-height:1.4">Sua doação foi confirmada com sucesso!</h1><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf7f0;border:1px solid #d6e9dc;border-radius:10px;margin-bottom:28px"><tr><td style="padding:20px;font-size:14px;color:#41564a;line-height:1.9;word-break:break-word">Valor confirmado<br><strong style="font-size:27px;color:#176442">${escapeHtml(details.amount)}</strong><br>Método: <strong>${escapeHtml(details.method)}</strong><br>Pedido: ${escapeHtml(details.orderId)}<br><span style="font-size:12px">Seu recibo com a logo Juntos por Vidas está anexado em PDF.<br>Documento sem valor fiscal.</span></td></tr></table>${body}</td></tr><tr><td style="padding:24px 28px;border-top:1px solid #e8eee9;text-align:center"><p style="margin:0 0 12px;color:#6d7e73;font-size:12px;line-height:1.7">${footer}</p><p style="margin:0 0 12px;color:#6d7e73;font-size:12px;line-height:1.7">Rua da Alegria, nº 123, 2º Esquerdo,<br>4000-032 Porto, Portugal<br><strong>NIF Empresarial: 245443371</strong></p><p style="margin:0;color:#6d7e73;font-size:12px;line-height:1.7">© ${year} Juntos por Vidas. Todos os direitos reservados.</p></td></tr></table></td></tr></table></body></html>`;
  return { text, html };
}

/** Called only after server-side payment verification. Never expose this through a browser action. */
export async function sendDonationConfirmation(
  receipt: DonationReceipt,
): Promise<"sent" | "already_sent" | "no_email"> {
  const email = receipt.email.trim();
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    /@(example\.(com|org|net)|invalid|localhost)$/i.test(email)
  ) {
    return "no_email";
  }
  if (
    !receipt.orderId ||
    !Number.isSafeInteger(receipt.amountInCents) ||
    receipt.amountInCents <= 0
  ) {
    throw new Error("Dados do comprovativo inválidos.");
  }
  const id = createHash("sha256").update(receipt.orderId).digest("hex");
  const key = "jpv:donation-email:v1:" + id;
  if (await redisCommand("GET", key + ":sent")) return "already_sent";
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  const from = process.env["RESEND_FROM_EMAIL"]?.trim();
  if (!apiKey || !from)
    throw new Error("Resend por configurar: RESEND_API_KEY e RESEND_FROM_EMAIL.");
  const owner = randomUUID();
  if ((await redisCommand("SET", key + ":lock", owner, "EX", 60, "NX")) !== "OK") {
    throw new Error("Email de confirmação em processamento.");
  }
  try {
    if (await redisCommand("GET", key + ":sent")) return "already_sent";
    const locale = receipt.currency === "EUR" ? "pt-PT" : "pt-BR";
    const amount = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: receipt.currency,
    }).format(receipt.amountInCents / 100);
    const method = { mbway: "MB WAY", multibanco: "Multibanco", pix: "Pix" }[receipt.method];
    const name = receipt.name.trim() || "amigo(a)";
    const { text, html } = buildDonationEmail({ name, amount, method, orderId: receipt.orderId });
    // Keep the exact same request body across retries, even if configuration changes.
    const saved = await redisCommand("GET", key + ":attempt");
    const attempt: Attempt =
      typeof saved === "string"
        ? (JSON.parse(saved) as Attempt)
        : {
            startedAt: Date.now(),
            payload: {
              from,
              to: [email],
              subject: "Doação confirmada | Juntos por Vidas",
              text,
              html,
              attachments: [
                {
                  filename:
                    "recibo-doacao-" + receipt.orderId.replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf",
                  content: Buffer.from(await createDonationReceipt(receipt)).toString("base64"),
                },
                {
                  filename: "juntos-por-vidas.png",
                  content: donationLogoBase64,
                  content_id: "juntos-por-vidas-logo",
                },
              ],
            },
          };
    // Resend only retains idempotency keys for 24h. Do not risk a duplicate after an uncertain send.
    if (Date.now() - attempt.startedAt >= 23 * 60 * 60 * 1000) {
      throw new Error("Confirmação de email requer revisão: janela de reenvio expirada.");
    }
    if (typeof saved !== "string")
      await redisCommand("SET", key + ":attempt", JSON.stringify(attempt));
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
        "Idempotency-Key": "donation-confirmed/" + id,
      },
      body: JSON.stringify(attempt.payload),
      signal: AbortSignal.timeout(10000),
    });
    const result = (await response.json().catch(() => null)) as { id?: unknown } | null;
    if (!response.ok || typeof result?.id !== "string")
      throw new Error("Envio Resend indisponível: HTTP " + response.status);
    // No TTL: a delayed duplicate webhook must not send another receipt.
    await redisCommand("SET", key + ":sent", result.id);
    await redisCommand("DEL", key + ":attempt");
    return "sent";
  } finally {
    await redisCommand(
      "EVAL",
      "if redis.call('GET',KEYS[1]) == ARGV[1] then return redis.call('DEL',KEYS[1]) else return 0 end",
      1,
      key + ":lock",
      owner,
    ).catch(() => undefined);
  }
}
