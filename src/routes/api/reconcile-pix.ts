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
          const { listQueuedUtmifyOrders } = await import("../../lib/utmify-queue.server");
          const { reconcilePixOrder } = await import("../../lib/pix-reconcile.server");
          const orders = await listQueuedUtmifyOrders(40);
          const results = await Promise.allSettled(orders.map(id => reconcilePixOrder(id)));
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
