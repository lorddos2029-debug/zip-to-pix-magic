/**
 * Inicialização de segurança do Pixel Meta.
 * Se o script da tag <head> ainda não estiver disponível quando uma rota
 * SPA montar, cria a fila oficial fbq para não perder o InitiateCheckout.
 */
export const META_PIXEL_ID = "1849843465686098";

type MetaQueue = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

export function ensureMetaPixel(): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function") return;

  // Mesmo comportamento do bootstrap oficial: enfileira eventos enquanto
  // fbevents.js carrega, inclusive em navegacao client-side.
  const fbq = ((...args: unknown[]) => {
    if (typeof fbq.callMethod === "function") {
      fbq.callMethod(...args);
    } else {
      fbq.queue?.push(args);
    }
  }) as MetaQueue;

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;
  window.fbq = fbq;

  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");

  const alreadyLoading = Array.from(document.scripts).some((script) =>
    script.src.includes("connect.facebook.net/en_US/fbevents.js"),
  );

  if (!alreadyLoading) {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
}

export function trackMetaInitiateCheckout(eventId: string): void {
  if (typeof window === "undefined") return;
  ensureMetaPixel();
  window.fbq?.(
    "track",
    "InitiateCheckout",
    { currency: "BRL" },
    { eventID: eventId },
  );
}
