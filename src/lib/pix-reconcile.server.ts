/**
 * Reconciliacao duravel de Pix: nunca confie em um evento de navegador ou no
 * corpo do webhook para aprovar pagamentos. Consulte a UrusPay sempre.
 */
import { getQueuedUtmifyOrder, markUtmifyOrderFlags, sendWaitingForOrder, withUtmifyOrderLock } from "./utmify-queue.server";
import { sendFacebookEvent, sendUtmifyOrder } from "./tracking.server";

const URUS_BASE = "https://uruspaypagamentos.com/api/v1";

export interface PixSyncResult {
  order_id: number;
  paid: boolean;
  utmify: string;
  facebook: string;
}

export async function reconcilePixOrder(orderId: number): Promise<PixSyncResult> {
  if (!Number.isSafeInteger(orderId) || orderId <= 0) throw new Error("ID da venda inválido.");

  const result = await withUtmifyOrderLock(orderId, async (): Promise<PixSyncResult> => {
    const order = await getQueuedUtmifyOrder(orderId);
    if (!order) throw new Error("Pedido não localizado na fila de rastreamento.");

    const key = process.env["URUSPAY_API_KEY"]?.trim() || process.env["URUS_API_KEY"]?.trim();
    if (!key) throw new Error("URUSPAY_API_KEY não configurada.");
    const response = await fetch(URUS_BASE + "/status/" + orderId, {
      headers: { Authorization: "Bearer " + key },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error("UrusPay não confirmou consulta: HTTP " + response.status);
    const payment = await response.json() as Record<string, unknown>;
    if (payment["ok"] === false) throw new Error("Consulta UrusPay recusada.");
    const paid = payment["pago"] === true || payment["paid"] === true ||
      String(payment["status"] || "").toLowerCase() === "paid";

    if (!paid) {
      const utmify = await sendWaitingForOrder(orderId);
      return { order_id: orderId, paid: false, utmify, facebook: "aguardando_pagamento" };
    }

    const gatewayValue = Number(payment["valor"]);
    if (payment["valor"] !== undefined && payment["valor"] !== null &&
        Number.isFinite(gatewayValue) && Math.abs(gatewayValue - order.valor) > 0.01) {
      throw new Error("Valor confirmado na UrusPay difere do pedido persistido.");
    }

    // Se a primeira tentativa de pendente falhou, recupere antes do envio paid.
    if (!order.synced_pending) await sendWaitingForOrder(orderId);
    const current = await getQueuedUtmifyOrder(orderId) || order;

    let utmify = current.synced_paid ? "ja_enviado" : "pendente";
    if (!current.synced_paid) {
      const approvedDate = String(payment["pago_em"] || payment["paid_at"] || payment["approved_at"] || "").trim();
      utmify = await sendUtmifyOrder({
        orderId: String(orderId),
        status: "paid",
        createdAt: current.created_at,
        approvedDate: approvedDate || undefined,
        valor: current.valor,
        nome: current.nome,
        email: current.email,
        cpf: current.cpf,
        telefone: current.telefone,
        ip: current.ip,
        itens: current.itens,
        utm: current.utm,
      });
      if (utmify === "enviado") await markUtmifyOrderFlags(orderId, { synced_paid: true });
      else console.error("[UTMify] Venda " + orderId + ": " + utmify);
    }

    let facebook = current.synced_meta_paid ? "ja_enviado" : "pendente";
    if (!current.synced_meta_paid) {
      facebook = await sendFacebookEvent({
        eventName: "Purchase",
        eventId: current.evento_id || "pix_purchase_" + orderId,
        value: current.valor,
        email: current.email,
        phone: current.telefone,
        cpf: current.cpf,
        fbp: current.fbp,
        fbc: current.fbc,
        ip: current.ip,
        userAgent: current.user_agent,
        sourceUrl: current.source_url,
      });
      if (facebook === "enviado") await markUtmifyOrderFlags(orderId, { synced_meta_paid: true });
      else console.error("[Meta CAPI] Venda " + orderId + ": " + facebook);
    }
    return { order_id: orderId, paid: true, utmify, facebook };
  });

  return result ?? { order_id: orderId, paid: false, utmify: "processando", facebook: "processando" };
}
