import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const itemSchema = z.object({
  id: z.string().max(100),
  nome: z.string().max(200),
  quantidade: z.number().int().min(1).max(100),
  preco_unitario: z.number().min(0.01).max(1_000_000),
});

const trackSchema = z.object({
  stage: z.enum(["checkout", "paid"]),
  order_id: z.string().max(100),
  valor: z.number().min(0.01).max(1_000_000),
  evento_id: z.string().max(100),
  nome: z.string().trim().max(200),
  email: z.string().trim().email().max(255),
  cpf: z.string().trim().max(20).optional(),
  telefone: z.string().trim().max(20).optional(),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(200).optional(),
  user_agent: z.string().max(500).optional(),
  source_url: z.string().max(500).optional(),
  created_at: z.string().max(40).optional(),
  itens: z.array(itemSchema).max(20).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
});

export type TrackDonationInput = z.infer<typeof trackSchema>;

export const trackDonation = createServerFn({ method: "POST" })
  .inputValidator((data: TrackDonationInput) => trackSchema.parse(data))
  .handler(async ({ data }): Promise<{ facebook: string; utmify: string }> => {
    const { sendFacebookEvent } = await import("./tracking.server");

    let ip: string | undefined;
    try {
      const req = getRequest();
      ip =
        req.headers.get("cf-connecting-ip") ??
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        undefined;
    } catch {
      ip = undefined;
    }

    // Eventos de pagamento passam exclusivamente pelo conciliador com os
    // dados originais salvos no servidor e status confirmado na UrusPay.
    if (data.stage === "paid") {
      const { reconcilePixOrder } = await import("./pix-reconcile.server");
      const result = await reconcilePixOrder(Number(data.order_id));
      return { facebook: result.facebook, utmify: result.utmify };
    }

    const { sendWaitingForOrder } = await import("./utmify-queue.server");
    const [facebook, utmify] = await Promise.all([
      sendFacebookEvent({
        eventName: "InitiateCheckout",
        eventId: data.evento_id,
        value: data.valor,
        email: data.email,
        phone: data.telefone,
        cpf: data.cpf,
        fbp: data.fbp,
        fbc: data.fbc,
        ip,
        userAgent: data.user_agent,
        sourceUrl: data.source_url,
      }),
      sendWaitingForOrder(Number(data.order_id)),
    ]);
    if (facebook !== "enviado") console.error("[Meta CAPI] InitiateCheckout:", facebook);
    return { facebook, utmify };
  });


const pixOpenSchema = z.object({
  event_id: z.string().min(8).max(100),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(250).optional(),
  source_url: z.string().url().max(500),
});

export type PixOpenInput = z.infer<typeof pixOpenSchema>;

/**
 * InitiateCheckout ao entrar em /pix, mesmo antes de gerar a cobrança.
 * O mesmo event_id é usado no Pixel do navegador e na Meta CAPI.
 */
export const trackPixPageOpen = createServerFn({ method: "POST" })
  .inputValidator((data: PixOpenInput) => pixOpenSchema.parse(data))
  .handler(async ({ data }): Promise<{ facebook: string }> => {
    const { sendFacebookEvent } = await import("./tracking.server");
    const req = getRequest();
    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-real-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;

    const facebook = await sendFacebookEvent({
      eventName: "InitiateCheckout",
      eventId: data.event_id,
      fbp: data.fbp,
      fbc: data.fbc,
      ip,
      userAgent,
      sourceUrl: data.source_url,
    });
    if (facebook !== "enviado") {
      console.error("[Meta CAPI] InitiateCheckout /pix:", facebook);
    }
    return { facebook };
  });
