import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";

const EXPECTED: Record<number, { amount: number; createdAt: string }> = {
  65424: { amount: 20, createdAt: "2026-10-19 08:25:00" },
  65416: { amount: 20, createdAt: "2026-10-19 08:11:00" },
  65393: { amount: 30, createdAt: "2026-10-19 05:46:00" },
};
const IDS = [65424, 65416, 65393];

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
}
function objects(...items: unknown[]): Record<string, unknown>[] {
  return items.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item)));
}
function pick(containers: Record<string, unknown>[], keys: string[]): unknown {
  for (const o of containers) {
    for (const key of keys) {
      if (o[key] !== null && o[key] !== undefined && o[key] !== "") return o[key];
    }
  }
  return undefined;
}
function str(v: unknown): string {
  return typeof v === "string" || typeof v === "number" ? String(v).trim() : "";
}
function paid(p: Record<string, unknown>): boolean {
  const sources = objects(p, p.data, p.venda, p.transaction, p.payment);
  const flag = pick(sources, ["pago", "paid", "isPaid"]);
  const status = str(pick(sources, ["status", "situacao", "situation"])).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return flag === true || ["paid", "pago", "approved", "aprovado", "completed", "concluido"].includes(status);
}
function amount(p: Record<string, unknown>): number | null {
  const sources = objects(p, p.data, p.venda, p.transaction, p.payment);
  const raw = pick(sources, ["valor", "amount", "total", "valor_total"]);
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const value = raw.replace(/[R$\s]/g, "").replace(",", ".");
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}
async function gatewayStatus(id: number) {
  const key = process.env["URUSPAY_API_KEY"]?.trim() || process.env["URUS_API_KEY"]?.trim();
  if (!key) throw new Error("URUSPAY_API_KEY ausente");
  const res = await fetch("https://uruspaypagamentos.com/api/v1/status/" + id, {
    headers: { Authorization: "Bearer " + key },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("Consulta UrusPay recusada: HTTP " + res.status);
  const payment = await res.json() as Record<string, unknown>;
  if (!payment || typeof payment !== "object" || payment.ok === false) throw new Error("UrusPay não confirmou a consulta");
  return payment;
}
type LegacyMetadata = {
  nome?: string;
  email?: string;
  fbp?: string;
  fbc?: string;
  event_id?: string;
  utm?: Record<string, string>;
};
function getFallback(id: number): LegacyMetadata {
  try {
    const data = JSON.parse(process.env["LEGACY_PIX_REPAIR_META"] || "{}") as Record<string, LegacyMetadata>;
    return data[String(id)] || {};
  } catch { return {}; }
}
async function processSale(id: number, sync: boolean) {
  const expected = EXPECTED[id];
  const payment = await gatewayStatus(id);
  const sources = objects(payment, payment.data, payment.venda, payment.transaction, payment.payment);
  const track = objects(
    pick(sources, ["rastreamento", "tracking", "trackingParameters", "utm", "metadata"]),
    ...sources,
  );
  const charged = amount(payment);
  const validAmount = charged !== null && Math.abs(charged - expected.amount) < 0.01;
  const verifiedPaid = paid(payment);
  const fallback = getFallback(id);
  const { getQueuedUtmifyOrder } = await import("../../lib/utmify-queue.server");
  const queued = await getQueuedUtmifyOrder(id);
  const hasOriginalTracking = [
    "utm_campaign", "utm_source", "utm_medium", "utm_content", "utm_term", "src", "sck",
  ].filter(k => Boolean(str(pick(track, [k]))));
  if (!sync) {
    return { order_id: id, gateway_paid: verifiedPaid, gateway_amount: charged,
      expected_amount: expected.amount, amount_verified: validAmount,
      gateway_keys: Object.keys(payment).filter(k => !/senha|token|key/i.test(k)),
      gateway_tracking_fields: hasOriginalTracking,
      gateway_event_id: Boolean(pick(track, ["evento_id", "event_id"])),
      has_customer: Boolean(pick(sources, ["email", "customer"])),
      recorded: Boolean(queued), synced_utmify: Boolean(queued?.synced_paid), synced_meta: Boolean(queued?.synced_meta_paid) };
  }
  if (!verifiedPaid || !validAmount) {
    return { order_id: id, skipped: true, reason: !verifiedPaid ? "Não está paga na UrusPay" : "Valor não confirmado na UrusPay",
      gateway_paid: verifiedPaid, gateway_amount: charged };
  }
  const existing = queued;
  if (!existing) {
    const nestedCustomer = objects(...sources.map(s => s.customer), ...sources.map(s => s.comprador));
    const contactSources = [...nestedCustomer, ...sources];
    const customerEmail = str(pick(contactSources, ["email", "email_comprador"])) || fallback.email || "";
    if (!customerEmail || !customerEmail.includes("@")) {
      return { order_id: id, skipped: true, reason: "Gateway não forneceu e-mail para a UTMify" };
    }
    const customerName = str(pick(contactSources, ["nome", "name", "nome_comprador"])) || fallback.nome || "Doador Anônimo";
    const item = {
      id: "doacao", nome: "Doação",
      quantidade: 1, preco_unitario: charged!,
    };
    const utm: Record<string, string> = {};
    for (const k of ["src", "sck", "utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term"]) {
      const val = str(pick(track, [k])) || fallback.utm?.[k] || "";
      if (val) utm[k] = val;
    }
    const { queueUtmifyOrder } = await import("../../lib/utmify-queue.server");
    await queueUtmifyOrder({
      order_id: id,
      created_at: str(pick(sources, ["created_at", "createdAt", "criado_em", "data_criacao"])) || expected.createdAt,
      valor: charged!, nome: customerName, email: customerEmail,
      cpf: str(pick(contactSources, ["cpf", "document", "documento"])) || undefined,
      telefone: str(pick(contactSources, ["telefone", "phone"])) || undefined,
      itens: [item], utm,
      evento_id: str(pick(track, ["evento_id", "event_id"])) || fallback.event_id || "pix_purchase_" + id,
      fbp: str(pick(track, ["fbp", "_fbp"])) || fallback.fbp || undefined,
      fbc: str(pick(track, ["fbc", "_fbc"])) || fallback.fbc || undefined,
      source_url: "https://juntos-por-vidas.online/pix",
      user_agent: str(pick(track, ["user_agent", "userAgent"])) || undefined,
      ip: str(pick(track, ["ip"])) || undefined,
    });
  }
  const { reconcilePixOrder } = await import("../../lib/pix-reconcile.server");
  const result = await reconcilePixOrder(id);
  return { order_id: id, gateway_paid: verifiedPaid, amount_verified: validAmount, sync: result };
}
export const Route = createFileRoute("/api/recover-verified-pix")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const expected = process.env["LEGACY_PIX_REPAIR_SECRET"]?.trim();
        const u = new URL(request.url);
        if (!expected || !safeEqual(u.searchParams.get("key") || "", expected)) {
          return Response.json({ ok: false }, { status: 401 });
        }
        const sync = u.searchParams.get("mode") === "sync";
        const ids = u.searchParams.get("id") ? [Number(u.searchParams.get("id"))] : IDS;
        if (ids.some(id => !IDS.includes(id))) return Response.json({ ok: false, error: "Venda não autorizada" }, { status: 403 });
        const reports = [];
        for (const id of ids) {
          try {
            reports.push(await processSale(id, sync));
          } catch (error) {
            console.error("[Legacy Pix repair] Venda " + id, error instanceof Error ? error.message : "Erro desconhecido");
            reports.push({ order_id: id, error: error instanceof Error ? error.message : "Falha ao consultar pagamento" });
          }
        }
        return Response.json({ ok: true, mode: sync ? "sync" : "audit", reports }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
