import { createFileRoute } from "@tanstack/react-router";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const Route = createFileRoute("/api/nsq-payments")({
  server: {
    handlers: {
      GET: async () => {
        const { publicConfig } = await import("../../lib/nsq-payments.server");
        return json(publicConfig());
      },
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin) {
          try {
            if (new URL(origin).origin !== new URL(request.url).origin) return json({ error: "Origem não autorizada." }, 403);
          } catch { return json({ error: "Origem inválida." }, 403); }
        }
        const body = await request.text();
        if (body.length > 16000) return json({ error: "Pedido demasiado grande." }, 413);
        let payload: Record<string, unknown>;
        try { payload = JSON.parse(body) as Record<string, unknown>; }
        catch { return json({ error: "JSON inválido." }, 400); }
        try {
          const { prepareOrder, startPayment, orderStatus } = await import("../../lib/nsq-payments.server");
          if (payload.action === "prepare") {
            const ip = request.headers.get("cf-connecting-ip") ||
              request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
            return json(await prepareOrder(payload.data, ip));
          }
          if (payload.action === "pay") return json(await startPayment(payload.data));
          if (payload.action === "status") return json(await orderStatus(payload.data));
          return json({ error: "Operação desconhecida." }, 400);
        } catch (error) {
          const zod = error && typeof error === "object" && "name" in error && error.name === "ZodError";
          return json({ error: zod ? "Revise os campos do pedido." :
            error instanceof Error ? error.message.slice(0, 200) : "Falha temporária." }, zod ? 400 : 503);
        }
      },
    },
  },
});
