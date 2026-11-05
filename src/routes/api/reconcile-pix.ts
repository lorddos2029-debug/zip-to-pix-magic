import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/reconcile-pix")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env["CRON_SECRET"]?.trim();
        if (!secret) return Response.json({ ok: false, error: "CRON_SECRET não configurado." }, { status: 503 });
        if (request.headers.get("authorization") !== "Bearer " + secret) {
          return Response.json({ ok: false }, { status: 401 });
        }
        try {
          // Reprocessamento pontual, protegido pelo CRON_SECRET, para recuperar
          // uma venda aprovada cuja conversão não tenha sido entregue à Meta.
          // O conciliador valida a transação no gateway e usa o estado
          // persistido para impedir Purchase duplicado.
          const replay = new URL(request.url).searchParams.get("order_id");
          if (replay !== null) {
            if (!/^[0-9]{1,12}$/.test(replay) || !Number.isSafeInteger(Number(replay)) || Number(replay) <= 0) {
              return Response.json({ ok: false, error: "ID inválido." }, { status: 400 });
            }
            const { reconcilePixOrder } = await import("../../lib/pix-reconcile.server");
            const status = await reconcilePixOrder(Number(replay));
            return Response.json({ ok: true, ...status }, { headers: { "Cache-Control": "no-store" } });
          }
          const { listQueuedUtmifyOrders, getQueuedUtmifyOrder, deferQueuedPixOrder, clearExpiredQueuedPixOrder } = await import("../../lib/utmify-queue.server");
          const { reconcilePixOrder } = await import("../../lib/pix-reconcile.server");
          const orders = await listQueuedUtmifyOrders(40);
          const results = await Promise.allSettled(orders.map(async id => {
            if (!await getQueuedUtmifyOrder(id)) {
              await clearExpiredQueuedPixOrder(id);
              return { order_id: id, paid: false, utmify: "expirado", facebook: "expirado" };
            }
            const result = await reconcilePixOrder(id);
            // Uma conciliação simultânea retorna "processando". Não adie
            // esse pedido por 24h; deixe-o disponível na próxima tentativa.
            if (!result.paid && result.facebook !== "processando" &&
                result.utmify !== "processando") {
              await deferQueuedPixOrder(id);
            }
            return result;
          }));
          const processed = results.filter(r => r.status === "fulfilled").length;
          const paid = results.filter(r => r.status === "fulfilled" && r.value.paid).length;
          results.forEach((r, i) => {
            if (r.status === "rejected") console.error("[Pix cron] Venda " + orders[i] + ":", r.reason instanceof Error ? r.reason.message : "erro");
          });
          return Response.json({ ok: true, attempted: orders.length, processed, paid, failed: results.length - processed });
        } catch (error) {
          console.error("[Pix cron]", error instanceof Error ? error.message : "erro");
          return Response.json({ ok: false, error: "Fila indisponível." }, { status: 502 });
        }
      },
    },
  },
});
