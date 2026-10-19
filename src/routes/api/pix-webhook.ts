import { createFileRoute } from "@tanstack/react-router";

const getOrderId = (payload: Record<string, any>): number => {
  const data = payload.data && typeof payload.data === "object" ? payload.data : {};
  const sale = payload.venda && typeof payload.venda === "object" ? payload.venda : {};
  const id = payload.venda_id ?? payload.vendaId ?? payload.transaction_id ??
    data.venda_id ?? data.vendaId ?? data.transaction_id ?? sale.id ?? payload.id;
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
          return Response.json({ ok: true, paid: status.paid, utmify: status.utmify, facebook: status.facebook });
        } catch (error) {
          console.error("[Pix webhook] Erro de reconciliação:", error instanceof Error ? error.message : "erro");
          return Response.json({ ok: false, error: "Reconciliação temporariamente indisponível." }, { status: 502 });
        }
      },
    },
  },
});
