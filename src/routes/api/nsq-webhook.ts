import { createFileRoute } from "@tanstack/react-router";

const json = (body: unknown, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const Route = createFileRoute("/api/nsq-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (Number(request.headers.get("content-length") || 0) > 65536) return json({ ok: false }, 413);
        const raw = await request.text();
        if (new TextEncoder().encode(raw).length > 65536) return json({ ok: false }, 413);
        try {
          const { applyVerifiedWebhook } = await import("../../lib/nsq-payments.server");
          // Apenas o SDK verifica a assinatura do corpo BRUTO.
          // Apenas a transação Redis atómica pode tornar um pedido pago.
          const result = await applyVerifiedWebhook(raw, request.headers);
          return json(result, 200);
        } catch (error) {
          const invalid = error && typeof error === "object" && "code" in error && error.code === "INVALID_WEBHOOK";
          console.error("[NSQ webhook]", invalid ? "Assinatura inválida" : "Falha de validação/persistência");
          // Reenviar em erros transitórios; nunca confirmar antes do commit.
          return json({ ok: false }, invalid ? 401 : 503);
        }
      },
    },
  },
});
