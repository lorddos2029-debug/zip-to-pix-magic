/**
 * Mantém a atribuição original da visita entre a campanha e /pix.
 * Não inventa parâmetros, não salva dados pessoais e expira após 30 minutos.
 */
export const UTM_FIELDS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content",
  "utm_term", "src", "sck",
] as const;

const STORAGE_KEY = "juntosporvidas:attribution:v1";
const SESSION_MS = 30 * 60 * 1000;
const FACEBOOK_CLICK_KEY = "juntosporvidas:facebook-click:v1";
const FACEBOOK_CLICK_MS = 24 * 60 * 60 * 1000;

/**
 * Preserva apenas o fbclid real recebido na landing page.
 * O link para /pix não leva query string, então sem isto a CAPI pode
 * perder o identificador do clique ao navegar dentro da SPA.
 */
function captureFacebookClick(): void {
  if (typeof window === "undefined") return;
  const fbclid = new URLSearchParams(window.location.search).get("fbclid")?.trim();
  if (!fbclid || fbclid.length > 200 || !/^[A-Za-z0-9_-]+$/.test(fbclid)) return;
  try {
    window.sessionStorage.setItem(FACEBOOK_CLICK_KEY, JSON.stringify({ fbclid, timestamp: Date.now() }));
  } catch {
    // Storage pode estar bloqueado.
  }
}

export function getSavedFacebookFbc(): string {
  if (typeof window === "undefined") return "";
  captureFacebookClick();
  try {
    const raw = window.sessionStorage.getItem(FACEBOOK_CLICK_KEY);
    if (!raw) return "";
    const saved = JSON.parse(raw) as { fbclid?: unknown; timestamp?: unknown };
    const id = saved.fbclid;
    const ts = saved.timestamp;
    if (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,200}$/.test(id) ||
        typeof ts !== "number" || ts > Date.now() || Date.now() - ts > FACEBOOK_CLICK_MS) {
      window.sessionStorage.removeItem(FACEBOOK_CLICK_KEY);
      return "";
    }
    return `fb.1.${ts}.${id}`;
  } catch {
    return "";
  }
}

type AttributionData = Record<string, string>;

// Origem da página de entrada; não equivale ao nome da campanha Meta Ads.
const LANDING_ROUTES = new Set([
  "/", "/ana", "/davi", "/gabriel", "/joana", "/kaue",
  "/maria", "/melissa", "/miguel", "/pedro", "/pedro2", "/pietro",
  "/livia", "/fabinho",
]);
function landingOrigin(): string {
  if (typeof window === "undefined") return "";
  const pathname = window.location.pathname;
  const path = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1) : pathname;
  if (!LANDING_ROUTES.has(path)) return "";
  return path === "/" ? "pagina_willian" : "pagina_" + path.slice(1);
}

/** URL do checkout com a atribuição real recebida na landing page. */
export function getTrackedPixHref(): string {
  if (typeof window === "undefined") return "/pix";
  const tracked = getCampaignAttribution();
  const query = new URLSearchParams();
  for (const key of UTM_FIELDS) {
    if (tracked[key]) query.set(key, tracked[key]);
  }
  const suffix = query.toString();
  return suffix ? "/pix?" + suffix : "/pix";
}


export function getCampaignAttribution(): AttributionData {
  if (typeof window === "undefined") return {};
  captureFacebookClick();

  const search = new URLSearchParams(window.location.search);
  const incoming: AttributionData = {};
  for (const key of UTM_FIELDS) {
    const raw = search.get(key)?.trim();
    if (raw) incoming[key] = raw.slice(0, 200);
  }
  // Informa o caminho da página de entrada se nenhuma tag src foi recebida.
  // Não cria nomes fictícios de anúncios ou campanhas.
  if (!incoming["src"] && landingOrigin()) incoming["src"] = landingOrigin();

  // Nova visita marcada substitui todos os parâmetros anteriores para não
  // misturar campanhas distintas na mesma aba.
  if (Object.keys(incoming).length > 0) {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ timestamp: Date.now(), values: incoming }),
      );
    } catch {
      // O checkout segue funcionando quando storage estiver bloqueado.
    }
    return incoming;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const stored = JSON.parse(raw) as { timestamp?: number; values?: AttributionData };
    if (
      typeof stored.timestamp !== "number" ||
      Date.now() - stored.timestamp > SESSION_MS ||
      stored.timestamp > Date.now() ||
      !stored.values
    ) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return {};
    }
    const result: AttributionData = {};
    for (const key of UTM_FIELDS) {
      const value = stored.values[key];
      if (typeof value === "string" && value.trim()) result[key] = value.slice(0, 200);
    }
    return result;
  } catch {
    return {};
  }
}
