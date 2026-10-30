import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { redisCommand } from "./utmify-queue.server";

type Method = "mbway" | "multibanco";
type Status = "prepared" | "initiating" | "pending" | "processing" | "uncertain" | "paid" | "refunded" | "failed" | "cancelled";
type Item = { id: string; name: string; quantity: number; priceInCents: number };
type Order = {
  id: string; accessHash: string; status: Status; amountInCents: number; currency: "EUR";
  method: Method; customer: { name: string; email: string; country: "PT"; phone?: string };
  phoneNumber?: string; items: Item[]; transactionId?: string;
  payment?: { entity?: string; reference?: string; expiresAt?: string };
  createdAt: string; updatedAt: string;
};
const PREFIX = "jpv:nsq:v1:";
const TTL = 60 * 60 * 24 * 30;
const EXTRAS = { cabaz: { name: "Cabaz alimentar", cents: 2500 }, energia: { name: "Apoio energético", cents: 2990 }, saude: { name: "Medicamentos", cents: 2790 } } as const;
const prepareSchema = z.object({
  donationCents: z.number().int().min(100).max(500000),
  extras: z.array(z.enum(["cabaz", "energia", "saude"])).max(3).default([]),
  method: z.enum(["mbway", "multibanco"]),
  name: z.string().trim().min(3).max(160),
  email: z.string().trim().email().max(200),
  phoneNumber: z.string().regex(/^9\d{8}$/).optional(),
}).strict();
const accessSchema = z.object({ orderId: z.string().regex(/^PT-[a-f0-9-]{36}$/), token: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
const paySchema = accessSchema.extend({
  originToken: z.string().max(4096).nullable().optional(),
  trackingParameters: z.record(z.string(), z.string().max(500)).optional(),
});
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const key = (id: string) => PREFIX + "order:" + id;
const enabled = () => process.env["NSQPAY_PAYMENTS_ENABLED"] === "true";
const env = (): "live" | "test" => process.env["NSQPAY_ENVIRONMENT"] === "live" ? "live" : "test";
export function publicConfig() {
  return { enabled: enabled(), environment: env(), publicKey: process.env["NSQPAY_PUBLIC_KEY"] || "" };
}
function ensureProviderConfigured() {
  for (const name of ["NSQPAY_SECRET_KEY", "NSQPAY_WEBHOOK_SECRET", "NSQPAY_STORE_URL", "NSQPAY_INSTALL_ID"]) {
    if (!process.env[name]?.trim()) throw new Error("Integração de pagamentos por configurar.");
  }
}
function ensureReady() {
  if (!enabled()) throw new Error("Os pagamentos encontram-se temporariamente indisponíveis.");
  ensureProviderConfigured();
}
async function sdk() {
  const { createNSQPay } = await import("../vendor/nsqpay.mjs");
  return createNSQPay({
    secretKey: process.env["NSQPAY_SECRET_KEY"]!,
    webhookSecret: process.env["NSQPAY_WEBHOOK_SECRET"]!,
    storeUrl: process.env["NSQPAY_STORE_URL"]!,
    installId: process.env["NSQPAY_INSTALL_ID"]!,
    environment: env(),
  });
}
function authorized(order: Order, token: string) {
  const a = Buffer.from(order.accessHash, "hex");
  const b = Buffer.from(hash(token), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
async function load(id: string): Promise<Order | null> {
  const value = await redisCommand("GET", key(id));
  return typeof value === "string" ? JSON.parse(value) as Order : null;
}
function safe(order: Order) {
  return { orderId: order.id, amountInCents: order.amountInCents, currency: order.currency,
    status: order.status, method: order.method, payment: order.payment || null };
}
export async function prepareOrder(input: unknown, ip?: string) {
  ensureReady();
  const data = prepareSchema.parse(input);
  if (data.method === "mbway" && !data.phoneNumber) throw new Error("O MB WAY exige telemóvel português com 9 dígitos.");
  if (new Set(data.extras).size !== data.extras.length) throw new Error("Apoio adicional repetido.");
  if (ip) {
    const k = PREFIX + "limit:" + hash(ip).slice(0, 32) + ":" + Math.floor(Date.now() / 3600000);
    const count = Number(await redisCommand("INCR", k));
    if (count === 1) await redisCommand("EXPIRE", k, 3600);
    if (count > 30) throw new Error("Limite horário de pedidos atingido.");
  }
  const items: Item[] = [{ id: "donativo", name: "Donativo Juntos por Vidas", quantity: 1, priceInCents: data.donationCents }];
  for (const id of data.extras) items.push({ id, name: EXTRAS[id].name, quantity: 1, priceInCents: EXTRAS[id].cents });
  const amountInCents = items.reduce((sum, item) => sum + item.priceInCents * item.quantity, 0);
  if (amountInCents > 500000) throw new Error("O donativo não pode ultrapassar 5 000 €.");
  const id = "PT-" + randomUUID(), token = randomBytes(32).toString("hex"), now = new Date().toISOString();
  const customer: Order["customer"] = { name: data.name, email: data.email, country: "PT" };
  if (data.phoneNumber) customer.phone = data.phoneNumber;
  const order: Order = { id, accessHash: hash(token), status: "prepared", amountInCents, currency: "EUR",
    method: data.method, customer, items, createdAt: now, updatedAt: now };
  if (data.phoneNumber) order.phoneNumber = data.phoneNumber;
  if (await redisCommand("SET", key(id), JSON.stringify(order), "EX", TTL, "NX") !== "OK") throw new Error("Não foi possível criar a encomenda.");
  return { orderId: id, token, amountInCents, currency: "EUR" as const };
}
export async function orderStatus(input: unknown) {
  const data = accessSchema.parse(input);
  const order = await load(data.orderId);
  if (!order || !authorized(order, data.token)) throw new Error("Pedido não encontrado ou acesso não autorizado.");
  return safe(order);
}
const beginScript = [
  "local raw = redis.call('GET',KEYS[1])",
  "if not raw then return 'missing' end",
  "local o = cjson.decode(raw)",
  "if o.accessHash ~= ARGV[1] then return 'unauthorized' end",
  "if o.status ~= 'prepared' then return 'started' end",
  "o.status='initiating'; o.updatedAt=ARGV[2]",
  "redis.call('SET',KEYS[1],cjson.encode(o),'EX',ARGV[3])",
  "return 'ok'",
].join("\n");
const finishScript = [
  "local raw = redis.call('GET',KEYS[1])",
  "if not raw then return 'missing' end",
  "local o = cjson.decode(raw)",
  "if o.status ~= 'initiating' then return 'conflict' end",
  "o.status=ARGV[1]; o.updatedAt=ARGV[2]",
  "if ARGV[3] ~= '' then o.transactionId=ARGV[3] end",
  "if ARGV[4] ~= '' then o.payment=cjson.decode(ARGV[4]) end",
  "redis.call('SET',KEYS[1],cjson.encode(o),'EX',ARGV[5])",
  "return 'ok'",
].join("\n");
function cleanPayment(record: Record<string, unknown>) {
  // Respostas do método e da consulta podem envolver os dados numa chave
  // "payment" ou "data". Recolher apenas campos efetivamente devolvidos.
  const nested = (value: unknown): Record<string, unknown> | null =>
    value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
  const candidates = [record, nested(record["payment"]), nested(record["data"]), nested(record["details"]),
    nested(nested(record["data"])?.["payment"])].filter((x): x is Record<string, unknown> => x !== null);
  const payment: { entity?: string; reference?: string; expiresAt?: string } = {};
  for (const name of ["entity", "reference", "expiresAt"] as const) {
    const value = candidates.map((candidate) => candidate[name])
      .find((entry) => (typeof entry === "string" && entry.trim().length > 0) || typeof entry === "number");
    if (typeof value === "string" || typeof value === "number") payment[name] = String(value).slice(0, 100);
  }
  return payment;
}
const trackKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "ttclid", "src", "sck"];
export async function startPayment(input: unknown) {
  ensureReady();
  const data = paySchema.parse(input);
  const order = await load(data.orderId);
  if (!order || !authorized(order, data.token)) throw new Error("Pedido não encontrado ou acesso não autorizado.");
  const begin = await redisCommand("EVAL", beginScript, 1, key(order.id), order.accessHash, new Date().toISOString(), TTL);
  if (begin !== "ok") throw new Error("Pedido já iniciado; consulte o estado antes de repetir.");
  let transactionId = "";
  try {
    const trackingParameters: Record<string, string> = {};
    for (const name of trackKeys) {
      const value = data.trackingParameters?.[name];
      if (typeof value === "string" && value) trackingParameters[name] = value.slice(0, 500);
    }
    const paymentInput = {
      orderId: order.id, amountInCents: order.amountInCents, currency: "EUR" as const, method: order.method,
      customer: order.customer, items: order.items, originToken: data.originToken ?? null, trackingParameters,
      ...(order.method === "mbway" && order.phoneNumber ? { phoneNumber: order.phoneNumber } : {}),
    };
    const nsq = await sdk();
    const result = await nsq.payments.create(paymentInput);
    transactionId = result.transactionId;
    let payment = cleanPayment(result.payment);
    if (order.method === "multibanco" && (!payment.entity || !payment.reference)) {
      // Consulta única e só de leitura ao pedido já criado. Não reemitir
      // nem repetir a cobrança quando a resposta inicial vier sem referência.
      try {
        const details = await nsq.payments.get(transactionId);
        payment = { ...cleanPayment(details), ...payment };
      } catch (error) {
        console.warn("[VorkPay] Referência multibanco ainda não disponível", {
          code: error && typeof error === "object" && "code" in error ? String(error.code).slice(0, 60) : "lookup_failed",
        });
      }
    }
    const saved = await redisCommand("EVAL", finishScript, 1, key(order.id), "pending", new Date().toISOString(), transactionId, JSON.stringify(payment), TTL);
    if (saved !== "ok") throw new Error("Foi gerada uma transação mas a referência não ficou guardada. Não repita a cobrança.");
    const missingReference = order.method === "multibanco" && (!payment.entity || !payment.reference);
    if (missingReference) console.warn("[VorkPay] Multibanco pendente sem entidade/referência", { orderId: order.id });
    return {
      ...safe({ ...order, status: "pending", payment }),
      message: missingReference ? "O processador ainda não disponibilizou a entidade e a referência. Não efetue pagamento sem estes dados."
        : "Aguarde a confirmação do pagamento.",
    };
  } catch (error) {
    const found = error && typeof error === "object" && "transactionId" in error && typeof error.transactionId === "string" ? error.transactionId : transactionId;
    await redisCommand("EVAL", finishScript, 1, key(order.id), "uncertain", new Date().toISOString(), found || "", "", TTL).catch(() => null);
    console.error("[VorkPay] Pedido de estado incerto:", error instanceof Error ? error.name : "erro");
    return { ...safe({ ...order, status: "uncertain" }), message: "Não foi possível confirmar o pagamento. Não tente novamente antes de verificar o estado com o suporte." };
  }
}
const eventScript = [
  "local raw=redis.call('GET',KEYS[1])",
  "if not raw then return 'missing' end",
  "local o=cjson.decode(raw)",
  "if o.transactionId ~= ARGV[1] or tonumber(o.amountInCents) ~= tonumber(ARGV[2]) or o.currency ~= 'EUR' then return 'mismatch' end",
  "if redis.call('EXISTS',KEYS[2]) == 1 then return 'duplicate' end",
  "local newStatus=ARGV[3]",
  "if o.status == 'refunded' then newStatus='refunded'",
  "elseif o.status == 'paid' and newStatus ~= 'refunded' then newStatus='paid' end",
  "o.status=newStatus; o.updatedAt=ARGV[4]",
  "redis.call('SET',KEYS[1],cjson.encode(o),'EX',ARGV[5])",
  "redis.call('SET',KEYS[2],'1','EX',ARGV[5])",
  "return 'updated'",
].join("\n");
export async function applyVerifiedWebhook(raw: string, headers: Headers) {
  // O webhook deve continuar a confirmar/reembolsar pedidos antigos mesmo quando
  // o checkout estiver desativado. Nunca o bloquear pelo feature flag de cobranças.
  ensureProviderConfigured();
  const nsq = await sdk();
  const verified = await nsq.webhooks.verify(raw, headers);
  const event = verified.payload.event;
  const statuses: Record<string, Status> = { "payment.success": "paid", "payment.refunded": "refunded",
    "payment.failed": "failed", "payment.cancelled": "cancelled", "payment.pending": "pending", "payment.processing": "processing" };
  if (typeof event !== "string" || !statuses[event]) return { ok: true, ignored: true };
  const rawData = verified.payload.data;
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) throw new Error("Payload do pagamento inválido.");
  const data = rawData as Record<string, unknown>;
  const orderId = typeof data.orderId === "string" ? data.orderId : data.order_id;
  const transactionId = typeof data.transactionId === "string" ? data.transactionId : data.id;
  const amountInCents = data.amountInCents !== undefined ? Number(data.amountInCents) : Number(data.amount) * 100;
  if (typeof orderId !== "string" || !/^PT-[a-f0-9-]{36}$/.test(orderId) || typeof transactionId !== "string" ||
      !Number.isSafeInteger(amountInCents) || amountInCents < 1 || data.currency !== "EUR") {
    throw new Error("Webhook assinado sem dados suficientes para conciliação.");
  }
  const result = await redisCommand("EVAL", eventScript, 2, key(orderId), PREFIX+"event:"+hash(verified.deduplicationKey),
    transactionId, amountInCents, statuses[event], new Date().toISOString(), TTL);
  if (result === "missing" || result === "mismatch") throw new Error("Transação, valor ou encomenda divergentes.");
  if (result !== "updated" && result !== "duplicate") throw new Error("Não foi possível aplicar o pagamento.");
  return { ok: true, duplicate: result === "duplicate" };
}
