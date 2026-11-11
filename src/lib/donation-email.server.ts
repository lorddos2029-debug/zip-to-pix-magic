import { createHash, randomUUID } from "node:crypto";
import { redisCommand } from "./utmify-queue.server";
import { createDonationReceipt } from "./donation-receipt.server";

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
  attachments: { filename: string; content: string }[];
};
type Attempt = { startedAt: number; payload: EmailPayload };
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );

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
    const text = `Olá, ${name}!\n\nA sua doação de ${amount} foi confirmada.\n\nPedido: ${receipt.orderId}\nMétodo: ${method}\n\nObrigado por apoiar o Juntos por Vidas. A sua solidariedade faz a diferença.\n\nEsta mensagem confirma o pagamento e não constitui um recibo fiscal.`;
    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#263238;padding:24px"><h1 style="color:#178947">Doação confirmada!</h1><p>Olá, ${escapeHtml(name)}!</p><p>Recebemos a sua doação de <strong>${escapeHtml(amount)}</strong>.</p><p>Pedido: <strong>${escapeHtml(receipt.orderId)}</strong><br>Método: ${method}</p><p>Obrigado por apoiar o <strong>Juntos por Vidas</strong>. A sua solidariedade faz a diferença.</p><p style="font-size:12px;color:#666">Esta mensagem confirma o pagamento e não constitui um recibo fiscal.</p></div>`;
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
