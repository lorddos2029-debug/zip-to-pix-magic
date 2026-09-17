import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const URUS_BASE = "https://urusbot.online/api/v1";

const itemSchema = z.object({
  id: z.string().max(100),
  nome: z.string().max(200),
  quantidade: z.number().int().min(1).max(100),
  preco_unitario: z.number().min(0.01).max(1_000_000),
});

const chargeSchema = z.object({
  valor: z.number().min(1).max(1_000_000),
  nome: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  cpf: z.string().trim().max(14).optional(),
  telefone: z.string().trim().max(20).optional(),
  descricao: z.string().trim().max(300).optional(),
  itens: z.array(itemSchema).max(20).optional(),
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
  utm_content: z.string().max(200).optional(),
  utm_term: z.string().max(200).optional(),
  src: z.string().max(200).optional(),
  sck: z.string().max(200).optional(),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(200).optional(),
  evento_id: z.string().max(100).optional(),
  ip: z.string().max(64).optional(),
  user_agent: z.string().max(500).optional(),
});

export type UrusChargeInput = z.infer<typeof chargeSchema>;

export interface UrusChargeResult {
  venda_id: number;
  pix_code: string;
  qr_code_url: string;
  expira_em?: string | undefined;
  valor: number;
  status: string;
  check_status_url?: string | undefined;
}

export const createUrusCharge = createServerFn({ method: "POST" })
  .inputValidator((data: UrusChargeInput) => chargeSchema.parse(data))
  .handler(async ({ data }): Promise<UrusChargeResult> => {
    const apiKey = process.env["URUS_API_KEY"];
    if (!apiKey) throw new Error("Pagamento indisponível: a chave URUS_API_KEY não está configurada neste servidor.");

    const res = await fetch(`${URUS_BASE}/charge`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok || !body || body["ok"] !== true) {
      const msg = typeof body?.["message"] === "string" ? (body["message"] as string) : "Não foi possível gerar o Pix. Tente novamente.";
      throw new Error(msg);
    }

    const result: UrusChargeResult = {
      venda_id: Number(body["venda_id"]),
      pix_code: String(body["pix_code"] ?? ""),
      qr_code_url: String(body["qr_code_url"] ?? ""),
      valor: Number(body["valor"] ?? data.valor),
      status: String(body["status"] ?? "pending"),
    };
    if (typeof body["expira_em"] === "string") result.expira_em = body["expira_em"];
    if (typeof body["check_status_url"] === "string") result.check_status_url = body["check_status_url"];
    return result;
  });

export interface UrusStatusResult {
  pago: boolean;
  status: string;
}

export const checkUrusStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { venda_id: number }) =>
    z.object({ venda_id: z.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }): Promise<UrusStatusResult> => {
    const apiKey = process.env["URUS_API_KEY"];
    if (!apiKey) throw new Error("Pagamento indisponível: a chave URUS_API_KEY não está configurada neste servidor.");

    const res = await fetch(`${URUS_BASE}/status/${data.venda_id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok || !body) return { pago: false, status: "pending" };

    const status = String(body["status"] ?? "pending");
    return { pago: body["pago"] === true || status === "paid", status };
  });
