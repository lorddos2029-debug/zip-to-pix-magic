/**
 * Envio server-side de eventos para Facebook CAPI e UTMify.
 * Nunca importar diretamente em componentes — use tracking.functions.ts.
 */

const FB_VERSION = "v21.0";
const UTMIFY_URL = "https://api.utmify.com.br/api-credentials/orders";

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface CapiPayload {
  eventName: "InitiateCheckout" | "Purchase";
  eventId: string;
  value: number;
  email?: string | undefined;
  phone?: string | undefined;
  cpf?: string | undefined;
  fbp?: string | undefined;
  fbc?: string | undefined;
  ip?: string | undefined;
  userAgent?: string | undefined;
  sourceUrl?: string | undefined;
}

export async function sendFacebookEvent(p: CapiPayload): Promise<string> {
  const pixelId = process.env["FB_PIXEL_ID"];
  const token = process.env["FB_CAPI_ACCESS_TOKEN"];
  if (!pixelId || !token) return "sem_credencial";

  const userData: Record<string, unknown> = {};
  if (p.email) userData["em"] = [await sha256(p.email)];
  if (p.phone) userData["ph"] = [await sha256(`55${p.phone.replace(/\D/g, "")}`)];
  if (p.cpf) userData["external_id"] = [await sha256(p.cpf.replace(/\D/g, ""))];
  if (p.fbp) userData["fbp"] = p.fbp;
  if (p.fbc) userData["fbc"] = p.fbc;
  if (p.ip) userData["client_ip_address"] = p.ip;
  if (p.userAgent) userData["client_user_agent"] = p.userAgent;
  userData["country"] = [await sha256("br")];

  const body = {
    data: [
      {
        event_name: p.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: p.eventId,
        action_source: "website",
        event_source_url: p.sourceUrl,
        user_data: userData,
        custom_data: { value: Number(p.value.toFixed(2)), currency: "BRL" },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${FB_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    );
    return res.ok ? "enviado" : `erro: ${res.status}`;
  } catch {
    return "erro: rede";
  }
}

function utmifyDate(d: Date): string {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export interface UtmifyPayload {
  orderId: string;
  status: "waiting_payment" | "paid";
  createdAt: string;
  valor: number;
  nome: string;
  email: string;
  cpf?: string | undefined;
  telefone?: string | undefined;
  ip?: string | undefined;
  itens?: { id: string; nome: string; quantidade: number; preco_unitario: number }[] | undefined;
  utm?: Record<string, string> | undefined;
}

export async function sendUtmifyOrder(p: UtmifyPayload): Promise<string> {
  const token = process.env["UTMIFY_API_TOKEN"];
  if (!token) return "sem_credencial";

  const cents = Math.round(p.valor * 100);
  const utm = p.utm ?? {};
  const body = {
    orderId: p.orderId,
    platform: "UrusPay",
    paymentMethod: "pix",
    status: p.status,
    createdAt: p.createdAt,
    approvedDate: p.status === "paid" ? utmifyDate(new Date()) : null,
    refundedAt: null,
    customer: {
      name: p.nome,
      email: p.email,
      phone: p.telefone ? p.telefone.replace(/\D/g, "") : null,
      document: p.cpf ? p.cpf.replace(/\D/g, "") : null,
      country: "BR",
      ip: p.ip ?? null,
    },
    products:
      p.itens && p.itens.length > 0
        ? p.itens.map((i) => ({
            id: i.id,
            name: i.nome,
            planId: null,
            planName: null,
            quantity: i.quantidade,
            priceInCents: Math.round(i.preco_unitario * 100),
          }))
        : [
            {
              id: "doacao",
              name: "Doação",
              planId: null,
              planName: null,
              quantity: 1,
              priceInCents: cents,
            },
          ],
    trackingParameters: {
      src: utm["src"] ?? null,
      sck: utm["sck"] ?? null,
      utm_source: utm["utm_source"] ?? null,
      utm_campaign: utm["utm_campaign"] ?? null,
      utm_medium: utm["utm_medium"] ?? null,
      utm_content: utm["utm_content"] ?? null,
      utm_term: utm["utm_term"] ?? null,
    },
    commission: {
      totalPriceInCents: cents,
      gatewayFeeInCents: 0,
      userCommissionInCents: cents,
      currency: "BRL",
    },
    isTest: false,
  };

  try {
    const res = await fetch(UTMIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-token": token },
      body: JSON.stringify(body),
    });
    return res.ok ? "enviado" : `erro: ${res.status}`;
  } catch {
    return "erro: rede";
  }
}

export { utmifyDate };
