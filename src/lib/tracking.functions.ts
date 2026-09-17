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
    const { sendFacebookEvent, sendUtmifyOrder, utmifyDate } = await import("./tracking.server");

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

    const [facebook, utmify] = await Promise.all([
      sendFacebookEvent({
        eventName: data.stage === "paid" ? "Purchase" : "InitiateCheckout",
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
      data.order_id
        ? sendUtmifyOrder({
            orderId: data.order_id,
            status: data.stage === "paid" ? "paid" : "waiting_payment",
            createdAt: data.created_at ?? utmifyDate(new Date()),
            valor: data.valor,
            nome: data.nome,
            email: data.email,
            cpf: data.cpf,
            telefone: data.telefone,
            ip,
            itens: data.itens,
            utm: data.utm,
          })
        : Promise.resolve("sem_pedido"),
    ]);

    return { facebook, utmify };
  });
