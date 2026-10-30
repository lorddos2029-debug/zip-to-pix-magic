export type PaymentInput = {
  orderId: string; amountInCents: number; currency?: "EUR"; method: "mbway" | "multibanco"; phoneNumber?: string;
  customer: { name: string; email: string; phone?: string; address?: string; city?: string; postalCode?: string; country?: string };
  items: { id: string; name: string; quantity: number; priceInCents: number }[];
  originToken?: string | null; trackingParameters?: Record<string, string>;
};
export class NSQError extends Error { status: number; code: string; phase: string; transactionId: string | null; }
export function createNSQPay(options: {
  secretKey: string; webhookSecret?: string; storeUrl: string; installId?: string;
  environment?: "test" | "live"; timeoutMs?: number; fetch?: typeof fetch;
}): {
  version: string; environment: "test" | "live";
  payments: {
    create(input: PaymentInput): Promise<{
      transactionId: string; environment: "test" | "live"; method: "mbway" | "multibanco";
      amountInCents: number; currency: "EUR"; status: string; payment: Record<string, unknown>;
    }>;
    get(transactionId: string): Promise<Record<string, unknown>>;
  };
  webhooks: { verify(rawBody: string, headers: HeadersInit, options?: { requireTimestamp?: boolean; now?: number }):
    Promise<{ payload: Record<string, unknown>; eventId: string | null; signatureVersion: string; deduplicationKey: string }>; };
};
