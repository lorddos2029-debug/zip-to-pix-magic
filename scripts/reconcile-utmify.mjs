#!/usr/bin/env node
// Reconciliacao UTMify: sempre confirma a cobranca na UrusPay ANTES de enviar paid.
// Execute com ID especifico (ex.: 49002) ou sem argumentos para varrer a fila local.
// Credenciais: URUSPAY_API_KEY (ou URUS_API_KEY) e UTMIFY_API_TOKEN no ambiente.
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const folder = process.env.UTMIFY_QUEUE_DIR?.trim() || resolve(process.cwd(), ".utmify-queue");
const urusKey = process.env.URUSPAY_API_KEY?.trim() || process.env.URUS_API_KEY?.trim();
const utmifyKey = process.env.UTMIFY_API_TOKEN?.trim();
const offset = process.env.URUSPAY_TIME_OFFSET?.trim() || "-03:00";
const providerBase = "https://uruspaypagamentos.com/api/v1";
const utmifyUrl = "https://api.utmify.com.br/api-credentials/orders";

function isoUtcDate(value, provider = false) {
  if (typeof value !== "string" || !value.trim()) return null;
  const normalized = value.trim().replace(" ", "T");
  const explicitZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized);
  // A UrusPay costuma retornar data/hora brasileira sem fuso; ajuste pelo
  // URUSPAY_TIME_OFFSET caso sua conta retorne outro fuso horario.
  const date = new Date(normalized + (explicitZone ? "" : provider ? offset : "Z"));
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 19).replace("T", " ");
}

async function readQueued(id) {
  try {
    return JSON.parse(await readFile(join(folder, String(id) + ".json"), "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function positiveAmount(x) {
  const n = Number(x);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function valueFrom(object, keys) {
  for (const key of keys) {
    const v = object?.[key];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
}

function trackingFrom(payment, existing) {
  const source = {
    ...(payment?.trackingParameters && typeof payment.trackingParameters === "object" ? payment.trackingParameters : {}),
    ...(payment?.utm && typeof payment.utm === "object" ? payment.utm : {}),
  };
  const fields = ["src", "sck", "utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term"];
  const found = {};
  for (const key of fields) {
    const stored = existing?.utm?.[key];
    const provider = payment?.[key] ?? payment?.metadata?.[key] ?? source[key];
    const value = typeof stored === "string" && stored.trim() ? stored : provider;
    if (typeof value === "string" && value.trim()) found[key] = value.trim();
  }
  return found;
}

async function fetchPayment(id) {
  const response = await fetch(providerBase + "/status/" + id, {
    headers: { Authorization: "Bearer " + urusKey },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Falha ao consultar UrusPay (HTTP " + response.status + ")");
  const payment = await response.json();
  if (!payment || payment.ok === false) throw new Error("UrusPay nao confirmou a consulta");
  return payment;
}

async function inspectOrder(id) {
  const existing = await readQueued(id);
  const payment = await fetchPayment(id);
  const fields = Object.keys(trackingFrom(payment, existing));
  // Nunca mostra dados pessoais, valores de UTMs ou tokens.
  return JSON.stringify({
    id,
    pago_na_uruspay: payment.pago === true || String(payment.status || "").toLowerCase() === "paid",
    sincronizado_localmente: existing?.synced_paid === true,
    fila_local: Boolean(existing),
    campos_atribuicao_presentes: fields,
    tem_utm_campaign: fields.includes("utm_campaign"),
  });
}

async function syncOrder(id, repairAttribution = false) {
  const existing = await readQueued(id);
  if (existing?.synced_paid === true && !repairAttribution) {
    const fields = Object.keys(existing?.utm || {});
    return fields.includes("utm_campaign") ? "ja_sincronizado_com_utm_campaign" : "ja_sincronizado_sem_utm_campaign_local";
  }
  const payment = await fetchPayment(id);
  const paid = payment.pago === true || String(payment.status || "").toLowerCase() === "paid";
  if (!paid) return "aguardando_pagamento";

  const amount = positiveAmount(payment.valor) || positiveAmount(existing?.valor);
  if (!amount) throw new Error("Valor da cobranca ausente");
  if (existing?.valor && Math.abs(Number(existing.valor) - amount) > 0.01)
    throw new Error("Divergencia entre valor salvo e valor confirmado na UrusPay");

  const name = valueFrom(existing, ["nome"]) || valueFrom(payment, ["comprador", "nome"]);
  const email = valueFrom(existing, ["email"]) || valueFrom(payment, ["email"]);
  const createdAt = isoUtcDate(existing?.created_at) ||
    isoUtcDate(valueFrom(payment, ["criado_em", "created_at"]), true);
  const approvedDate = isoUtcDate(valueFrom(payment, ["pago_em", "paid_at", "approved_at"]), true);
  if (!name || !email || !createdAt || !approvedDate)
    throw new Error("UrusPay nao forneceu nome/email ou datas reais suficientes para sincronizar");

  const items = Array.isArray(existing?.itens) && existing.itens.length
    ? existing.itens.map((item) => ({
        id: String(item.id), name: item.nome, planId: null, planName: null,
        quantity: Number(item.quantidade), priceInCents: Math.round(Number(item.preco_unitario) * 100),
      }))
    : [{ id: "doacao", name: "Doacao", planId: null, planName: null,
         quantity: 1, priceInCents: Math.round(amount * 100) }];

  const utm = trackingFrom(payment, existing);
  // Uma atualização retroativa só pode usar o identificador da campanha
  // realmente registrado na origem; nunca inventar atribuição.
  if (repairAttribution && !utm.utm_campaign) {
    return "sem_utm_campaign_original_para_recuperar";
  }
  const utmParam = (key) => typeof utm?.[key] === "string" ? utm[key] : null;
  const payload = {
    orderId: String(id), platform: "UrusPay", paymentMethod: "pix", status: "paid",
    createdAt, approvedDate, refundedAt: null,
    customer: {
      name: String(name), email: String(email),
      phone: valueFrom(existing, ["telefone"]) || valueFrom(payment, ["telefone"]) || null,
      document: valueFrom(existing, ["cpf"]) || valueFrom(payment, ["cpf"]) || null,
      country: "BR", ip: valueFrom(existing, ["ip"]) || null,
    },
    products: items,
    trackingParameters: {
      src: utmParam("src"), sck: utmParam("sck"),
      utm_source: utmParam("utm_source"), utm_campaign: utmParam("utm_campaign"),
      utm_medium: utmParam("utm_medium"), utm_content: utmParam("utm_content"),
      utm_term: utmParam("utm_term"),
    },
    commission: {
      totalPriceInCents: Math.round(amount * 100),
      gatewayFeeInCents: 0,
      userCommissionInCents: Math.round(amount * 100),
      currency: "BRL",
    },
    isTest: false,
  };

  const out = await fetch(utmifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-token": utmifyKey },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  if (!out.ok) throw new Error("UTMify recusou a venda (HTTP " + out.status + ")");
  await mkdir(folder, { recursive: true, mode: 0o700 });
  await writeFile(join(folder, String(id) + ".json"), JSON.stringify({
    ...(existing || { order_id: id, created_at: createdAt, valor: amount, nome: name, email }),
    utm,
    synced_paid: true, synced_at: new Date().toISOString(),
  }), { encoding: "utf8", mode: 0o600 });
  return utm.utm_campaign ? "paid_enviado_com_utm_campaign" : "paid_enviado_sem_utm_campaign";
}

async function main() {
  if (!urusKey) throw new Error("Credencial URUSPAY_API_KEY/URUS_API_KEY ausente no servidor");
  if (!utmifyKey) throw new Error("UTMIFY_API_TOKEN ausente no servidor");
  let ids = process.argv.slice(2);
  const inspect = ids[0] === "--inspect";
  const repair = ids[0] === "--repair-attribution";
  if (inspect || repair) ids = ids.slice(1);
  if ((inspect || repair) && ids.length !== 1) throw new Error("Uso: node scripts/reconcile-utmify.mjs --inspect|--repair-attribution 49002");
  if (!ids.length) {
    await mkdir(folder, { recursive: true, mode: 0o700 });
    ids = (await readdir(folder)).filter((x) => /^\d+\.json$/.test(x)).map((x) => x.slice(0, -5));
  }
  if (ids.some((id) => !/^[1-9]\d*$/.test(id))) throw new Error("ID deve ser um numero positivo");
  for (const rawId of ids) {
    const id = Number(rawId);
    if (!Number.isSafeInteger(id)) throw new Error("ID fora do limite");
    try {
      console.log("Pedido #" + id + ": " + await (inspect ? inspectOrder(id) : syncOrder(id, repair)));
    } catch (error) {
      process.exitCode = 1;
      console.error("Pedido #" + id + ": ERRO - " + (error instanceof Error ? error.message : "indefinido"));
    }
  }
}

main().catch((error) => {
  console.error("Reconciliacao UTMify: " + (error instanceof Error ? error.message : "falha"));
  process.exitCode = 1;
});
