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
          const code = error && typeof error === "object" && "code" in error && typeof error.code === "string"
            ? error.code : "UNKNOWN";
          const invalid = code === "INVALID_WEBHOOK";
          const detail = error instanceof Error ? error.message : "";
          // Não imprimir segredo, payload, dados do cliente nem HMAC.
          // O código distingue erro de assinatura de falha de persistência.
          const classification = invalid ? "assinatura/formato inválido"
            : detail.includes("por configurar") ? "configuração ausente"
            : detail.includes("Transação, valor ou encomenda") ? "encomenda/transação divergente"
            : detail.includes("dados suficientes") ? "evento financeiro incompleto"
            : "erro transitório no processamento";
          console.error("[NSQ webhook]", { code, classification });
          // Resposta 2xx apenas após assinatura e, para eventos financeiros,
          // gravação atómica. Assinatura inválida não é um erro temporário.
          return json({ ok: false, error: invalid ? "invalid_signature" : "processing_failed" }, invalid ? 401 : 503);
        }
      },
    },
  },
});
