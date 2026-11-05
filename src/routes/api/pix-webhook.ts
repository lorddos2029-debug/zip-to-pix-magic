import { createFileRoute } from "@tanstack/react-router";

const getOrderId = (payload: Record<string, any>): number => {
  const data = payload.data && typeof payload.data === "object" ? payload.data : {};
  const sale = payload.venda && typeof payload.venda === "object" ? payload.venda : {};
  const payment = payload.payment && typeof payload.payment === "object" ? payload.payment : {};
  const id = payload.venda_id ?? payload.vendaId ?? payload.order_id ?? payload.orderId ??
    payload.transaction_id ?? payload.sale_id ?? data.venda_id ?? data.vendaId ??
    data.order_id ?? data.orderId ?? data.transaction_id ?? data.id ??
    sale.venda_id ?? sale.id ?? payment.venda_id ?? payment.id ?? payload.id;
  const parsed = Number(id);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
};

export const Route = createFileRoute("/api/pix-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const raw = await request.text();
          if (raw.length > 32768) return Response.json({ ok: false, error: "Payload muito grande." }, { status: 413 });
          let payload: Record<string, any>;
          try {
            payload = JSON.parse(raw) as Record<string, any>;
          } catch {
            payload = Object.fromEntries(new URLSearchParams(raw));
          }
          const orderId = getOrderId(payload);
          if (!orderId) return Response.json({ ok: false, error: "Venda sem identificador." }, { status: 400 });

          // O corpo do webhook NUNCA aprova uma compra: a UrusPay é consultada
          // pelo servidor antes de qualquer evento de conversão.
          const { reconcilePixOrder } = await import("../../lib/pix-reconcile.server");
          const status = await reconcilePixOrder(orderId);
          // Se o pedido estava bloqueado por uma reconciliação simultânea ou
          // a UTMify ainda não aceitou o pedido pago, sinalize falha temporária
          // para o gateway tentar a notificação novamente. Não dê 200 prematuro.
          const processing = status.facebook === "processando" || status.utmify === "processando";
          const utmifyPending = status.paid && !["enviado", "ja_enviado"].includes(status.utmify);
          console.info("[Pix webhook] Venda conciliada:", {
            orderId,
            paid: status.paid,
            utmify: status.utmify,
            facebook: status.facebook,
          });
          if (processing || utmifyPending) {
            return Response.json({
              ok: false,
              retry: true,
              paid: status.paid,
              utmify: status.utmify,
              facebook: status.facebook,
            }, { status: 503, headers: { "Cache-Control": "no-store" } });
          }
          return Response.json({
            ok: true,
            paid: status.paid,
            utmify: status.utmify,
            facebook: status.facebook,
          }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          console.error("[Pix webhook] Erro de reconciliação:", error instanceof Error ? error.message : "erro");
          return Response.json({ ok: false, error: "Reconciliação temporariamente indisponível." }, { status: 502 });
        }
      },
    },
  },
});
