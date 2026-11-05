/**
 * Envio server-side de eventos para Facebook CAPI e UTMify.
 * Nunca importar diretamente em componentes — use tracking.functions.ts.
 */

const FB_VERSION = "v25.0";
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
  value?: number;
  email?: string | undefined;
  phone?: string | undefined;
  cpf?: string | undefined;
  fbp?: string | undefined;
  fbc?: string | undefined;
  ip?: string | undefined;
  userAgent?: string | undefined;
  sourceUrl?: string | undefined;
  eventTime?: number | undefined;
}

export async function sendFacebookEvent(p: CapiPayload): Promise<string> {
  const pixelId = "2165302517752672"; // Pixel do site de doações (navegador e CAPI).
  const token = process.env["FB_CAPI_ACCESS_TOKEN"];
  if (!token) return "sem_credencial";

  const userData: Record<string, unknown> = {};
  if (p.email && !/@example\.(?:com|org|net)$/i.test(p.email.trim())) userData["em"] = [await sha256(p.email)];
  if (p.phone) { const digits = p.phone.replace(/\D/g, ""); userData["ph"] = [await sha256(digits.startsWith("55") ? digits : "55" + digits)]; }
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
        event_time: Number.isSafeInteger(p.eventTime) && Number(p.eventTime) > Math.floor(Date.now() / 1000) - 7 * 86400 && Number(p.eventTime) <= Math.floor(Date.now() / 1000) ? p.eventTime : Math.floor(Date.now() / 1000),
        event_id: p.eventId,
        action_source: "website",
        event_source_url: p.sourceUrl || "https://juntos-por-vidas.online/pix",
        user_data: userData,
        custom_data: typeof p.value === "number" && Number.isFinite(p.value)
          ? { value: Number(p.value.toFixed(2)), currency: "BRL" }
          : { currency: "BRL" },
      },
    ],
  };

  // Falhas transitórias de rede e HTTP 429/5xx merecem uma segunda tentativa.
  // Mantemos o MESMO event_id nos dois envios para deduplicação na Meta.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/${FB_VERSION}/${pixelId}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(9000),
        },
      );
      const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
      if (res.ok && Number(payload?.["events_received"]) === 1) {
        if (p.eventName === "Purchase") {
          // Registra apenas presença dos sinais: nunca seus valores ou dados pessoais.
          console.info("[Meta CAPI] Purchase recebido:", {
            hasFbc: Boolean(p.fbc),
            hasFbp: Boolean(p.fbp),
            hasIp: Boolean(p.ip),
            hasUserAgent: Boolean(p.userAgent),
            hasExternalId: Boolean(p.cpf),
            // Receber o evento NÃO implica atribuição à campanha.
          });
        }
        return "enviado";
      }
      const error = payload?.["error"] && typeof payload["error"] === "object"
        ? payload["error"] as Record<string, unknown> : null;
      const code = typeof error?.["code"] === "number" ? error["code"] : undefined;
      const subcode = typeof error?.["error_subcode"] === "number" ? error["error_subcode"] : undefined;
      const temporary = res.status === 429 || res.status >= 500 || (res.ok && Number(payload?.["events_received"]) !== 1);
      console.error("[Meta CAPI] Evento não recebido:", {
        event: p.eventName,
        httpStatus: res.status,
        eventsReceived: payload?.["events_received"] ?? 0,
        code,
        subcode,
        attempt,
      });
      if (temporary && attempt === 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      return `erro: meta_http_${res.status}${code ? "_code_" + code : ""}`;
    } catch (error) {
      console.error("[Meta CAPI] Falha de comunicação:", {
        event: p.eventName,
        reason: error instanceof Error ? error.name : "desconhecida",
        attempt,
      });
      if (attempt === 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      return "erro: rede";
    }
  }
  return "erro: retentativas_esgotadas";
}

function utmifyDate(d: Date): string {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * As cobranças do nosso servidor (incluindo registros anteriores) guardam
 * created_at em UTC, às vezes sem sufixo Z. Datas de pagamento sem fuso
 * vindas do gateway são tratadas como horário de Brasília.
 */
function normalizeUtmifyDate(input: string | undefined, naiveZone: "UTC" | "BR" = "UTC"): string {
  if (!input?.trim()) return utmifyDate(new Date());
  const normalized = input.trim().replace(" ", "T");
  const explicitZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized);
  const parsed = new Date(explicitZone ? normalized : normalized + (naiveZone === "BR" ? "-03:00" : "Z"));
  return Number.isNaN(parsed.getTime()) ? utmifyDate(new Date()) : utmifyDate(parsed);
}

export interface UtmifyPayload {
  orderId: string;
  status: "waiting_payment" | "paid";
  createdAt: string;
  approvedDate?: string | undefined;
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
    createdAt: normalizeUtmifyDate(p.createdAt, "UTC"),
    approvedDate: p.status === "paid" ? normalizeUtmifyDate(p.approvedDate, "BR") : null,
    refundedAt: null,
    customer: {
      name: p.nome,
      email: p.email,
      phone: p.telefone ? p.telefone.replace(/\D/g, "") : null,
      document: p.cpf ? p.cpf.replace(/\D/g, "") : null,
      country: "BR",
      ip: p.ip || undefined,
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

  // A mesma orderId permite reenvio idempotente no endpoint da UTMify.
  // Repetimos apenas erros transitórios. Nunca altere o status financeiro sem
  // consultar a UrusPay no reconciliador.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(UTMIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-token": token },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
      const response = (await res.json().catch(() => null)) as Record<string, unknown> | null;
      const accepted = res.ok && response?.["success"] !== false &&
        response?.["ok"] !== false && !response?.["error"];
      if (accepted) return "enviado";

      // Não exponha dados do comprador em logs de erros de validação.
      const temporary = res.status === 429 || res.status >= 500;
      const errorCode = response && typeof response["code"] === "number" ? Number(response["code"]) : undefined;
      console.error("[UTMify] Rejeição de pedido:", {
        orderId: p.orderId,
        status: p.status,
        httpStatus: res.status,
        errorCode,
        attempt,
      });
      if (temporary && attempt === 1) {
        await new Promise(resolve => setTimeout(resolve, 450));
        continue;
      }
      return "erro: utmify_http_" + res.status + (errorCode ? "_code_" + errorCode : "");
    } catch (error) {
      console.error("[UTMify] Falha de comunicação:", {
        orderId: p.orderId,
        status: p.status,
        reason: error instanceof Error ? error.name : "desconhecido",
        attempt,
      });
      if (attempt === 1) {
        await new Promise(resolve => setTimeout(resolve, 450));
        continue;
      }
      return "erro: utmify_rede";
    }
  }
  return "erro: utmify_tentativas_esgotadas";
}

export { utmifyDate };
