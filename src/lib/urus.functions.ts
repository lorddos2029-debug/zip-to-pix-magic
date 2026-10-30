import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

function getClientIp(): string | undefined {
  try {
    const req = getRequest();
    return (
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-real-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      undefined
    );
  } catch {
    return undefined;
  }
}

const URUS_BASE = "https://uruspaypagamentos.com/api/v1";

// A UrusPay processa Pix em BRL: doações em EUR devem ser convertidas no servidor.
type EurBrlRate = { brlPerEur: number; date: string };
let cachedEurBrl: { quote: EurBrlRate; expires: number } | null = null;
const roundMoney = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;

async function readEurBrlRate(): Promise<EurBrlRate> {
  if (cachedEurBrl && cachedEurBrl.expires > Date.now()) return cachedEurBrl.quote;
  const response = await fetch("https://api.frankfurter.dev/v2/rate/eur/brl", {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  const payload = (await response.json().catch(() => null)) as { rate?: unknown; date?: unknown } | null;
  const rate = Number(payload?.rate);
  const date = typeof payload?.date === "string" ? payload.date : "";
  if (!response.ok || !Number.isFinite(rate) || rate < 1 || rate > 25 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Não foi possível consultar a cotação EUR/BRL. Tente novamente mais tarde.");
  }
  const quote = { brlPerEur: rate, date };
  cachedEurBrl = { quote, expires: Date.now() + 10 * 60 * 1000 };
  return quote;
}

export const getEurBrlRate = createServerFn({ method: "GET" }).handler(readEurBrlRate);

function getUrusApiKey(): string {
  const key = process.env["URUSPAY_API_KEY"]?.trim() || process.env["URUS_API_KEY"]?.trim();
  if (!key) {
    throw new Error("Pagamento indisponível: configure URUSPAY_API_KEY no ambiente do servidor e reinicie a aplicação.");
  }
  return key;
}

const itemSchema = z.object({
  id: z.string().max(100),
  nome: z.string().max(200),
  quantidade: z.number().int().min(1).max(100),
  preco_unitario: z.number().min(0.01).max(1_000_000),
});

const chargeSchema = z.object({
  valor: z.number().min(1).max(1_000_000),
  moeda: z.enum(["EUR", "BRL"]).optional(),
  nome: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  cpf: z.string().trim().max(14).optional(),
  telefone: z.string().trim().max(20).optional(),
  descricao: z.string().trim().max(300).optional(),
  itens: z.array(itemSchema).max(20).optional(),
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
  utm_content: z.string().max(200).optional(),
  utm_term: z.string().max(200).optional(),
  src: z.string().max(200).optional(),
  sck: z.string().max(200).optional(),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(200).optional(),
  evento_id: z.string().max(100).optional(),
  ip: z.string().max(64).optional(),
  user_agent: z.string().max(500).optional(),
});

export type UrusChargeInput = z.infer<typeof chargeSchema>;

export interface UrusChargeResult {
  venda_id: number;
  created_at?: string;
  pix_code: string;
  qr_code_url: string;
  expira_em?: string | undefined;
  valor: number;
  status: string;
  valor_eur?: number;
  cotacao_eur_brl?: number;
  cotacao_data?: string;
  itens_brl?: UrusChargeInput["itens"];
  check_status_url?: string | undefined;
}

export const createUrusCharge = createServerFn({ method: "POST" })
  .inputValidator((data: UrusChargeInput) => chargeSchema.parse(data))
  .handler(async ({ data }): Promise<UrusChargeResult> => {
    const apiKey = getUrusApiKey();

    const quote = data.moeda === "EUR" ? await readEurBrlRate() : null;
    const valorBrl = quote ? roundMoney(data.valor * quote.brlPerEur) : data.valor;
    if (!Number.isFinite(valorBrl) || valorBrl < 1 || valorBrl > 1_000_000) {
      throw new Error("Valor convertido fora do limite permitido para pagamento Pix.");
    }
    const itensBrl = data.itens?.map((item) => ({
      ...item,
      preco_unitario: quote ? roundMoney(item.preco_unitario * quote.brlPerEur) : item.preco_unitario,
    }));
    // Compensa os centavos de arredondamento entre itens e total.
    if (quote && itensBrl?.length && itensBrl[0]?.quantidade === 1) {
      const somaItens = itensBrl.reduce((sum, item) => sum + item.preco_unitario * item.quantidade, 0);
      itensBrl[0].preco_unitario = roundMoney(itensBrl[0].preco_unitario + (valorBrl - somaItens));
    }

    // A UrusPay envia a notificação a um endpoint fixo. Nunca inclua
    // os dados do doador na URL; os detalhes estão no armazenamento privado.
    let webhookUrl = process.env["URUSPAY_WEBHOOK_URL"]?.trim() || "";
    if (!webhookUrl) {
      try {
        const origin = new URL(getRequest().url).origin;
        if (origin.startsWith("https://")) webhookUrl = origin + "/api/pix-webhook";
      } catch {}
    }
    if (webhookUrl && (!webhookUrl.startsWith("https://") || webhookUrl.length > 220)) {
      webhookUrl = "";
    }
    const chargeBody: Record<string, unknown> = { ...data, valor: valorBrl, itens: itensBrl, ip: data.ip ?? getClientIp() };
    delete chargeBody["moeda"];
    if (webhookUrl) chargeBody["webhook_url"] = webhookUrl;

    const res = await fetch(URUS_BASE + "/charge", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chargeBody),
    });

    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok || !body || body["ok"] !== true) {
      const msg = typeof body?.["message"] === "string" ? (body["message"] as string) : "Não foi possível gerar o Pix. Tente novamente.";
      throw new Error(msg);
    }

    const result: UrusChargeResult = {
      venda_id: Number(body["venda_id"]),
      pix_code: String(body["pix_code"] ?? ""),
      qr_code_url: String(body["qr_code_url"] ?? ""),
      valor: Number(body["valor"] ?? data.valor),
      status: String(body["status"] ?? "pending"),
    };
    if (quote) {
      result.valor_eur = roundMoney(data.valor);
      result.cotacao_eur_brl = quote.brlPerEur;
      result.cotacao_data = quote.date;
      result.itens_brl = itensBrl;
    }
    if (typeof body["expira_em"] === "string") result.expira_em = body["expira_em"];
    if (typeof body["check_status_url"] === "string") result.check_status_url = body["check_status_url"];

    result.created_at = new Date().toISOString().slice(0, 19).replace("T", " ");
    // Fila durável na Vercel (Upstash) ou disco quando executado na VPS.
    // Envia o pedido waiting_payment do servidor assim que o Pix é criado.
    const sourceUrl = (() => {
      try { return getRequest().headers.get("referer") || ""; }
      catch { return ""; }
    })();
    const trackingOrder = {
      order_id: result.venda_id,
      created_at: result.created_at,
      valor: result.valor,
      nome: data.nome,
      email: data.email,
      cpf: data.cpf,
      telefone: data.telefone,
      ip: getClientIp(),
      itens: itensBrl,
      fbp: data.fbp,
      fbc: data.fbc,
      evento_id: data.evento_id,
      user_agent: data.user_agent,
      source_url: sourceUrl,
      utm: Object.fromEntries(
        Object.entries({
          utm_source: data.utm_source, utm_medium: data.utm_medium,
          utm_campaign: data.utm_campaign, utm_content: data.utm_content,
          utm_term: data.utm_term, src: data.src, sck: data.sck,
        }).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
      ),
    };
    try {
      const { queueUtmifyOrder, sendWaitingForOrder } = await import("./utmify-queue.server");
      await queueUtmifyOrder(trackingOrder);
      await sendWaitingForOrder(result.venda_id);
    } catch (error) {
      console.error("[Pix] Falha na fila persistente da Vercel:", error instanceof Error ? error.message : "erro");
      // Mesmo sem armazenamento configurado, a venda gerada pode ser enviada
      // imediatamente à UTMify; a aprovação exige a fila durável.
      try {
        const { sendUtmifyOrder } = await import("./tracking.server");
        const response = await sendUtmifyOrder({
          orderId: String(result.venda_id),
          status: "waiting_payment",
          createdAt: result.created_at,
          valor: result.valor,
          nome: data.nome,
          email: data.email,
          cpf: data.cpf,
          telefone: data.telefone,
          ip: trackingOrder.ip,
          itens: itensBrl,
          utm: trackingOrder.utm,
        });
        if (response !== "enviado") console.error("[UTMify] Pix gerado:", response);
      } catch (sendError) {
        console.error("[UTMify] Falha no envio pendente:", sendError instanceof Error ? sendError.message : "erro");
      }
    }
    return result;
  });

export interface UrusStatusResult {
  pago: boolean;
  status: string;
}

export const checkUrusStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { venda_id: number }) =>
    z.object({ venda_id: z.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }): Promise<UrusStatusResult> => {
    const apiKey = getUrusApiKey();

    const res = await fetch(`${URUS_BASE}/status/${data.venda_id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok || !body) return { pago: false, status: "pending" };

    const status = String(body["status"] ?? "pending");
    return { pago: body["pago"] === true || status === "paid", status };
  });
