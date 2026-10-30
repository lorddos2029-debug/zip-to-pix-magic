type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : null;

/** Accept the activation response and the documented GET /payments/status mb envelope. */
export function cleanPayment(value: unknown) {
  const root = record(value) || {};
  const data = record(root["data"]);
  const candidates = [root, record(root["mb"]), record(root["payment"]), data, record(root["details"]),
    record(data?.["mb"]), record(data?.["payment"])].filter((item): item is RecordValue => item !== null);
  const payment: { entity?: string; reference?: string; expiresAt?: string } = {};
  for (const name of ["entity", "reference"] as const) {
    const pattern = name === "entity" ? /^\d{5}$/ : /^\d{9}$/;
    for (const candidate of candidates) {
      const raw = candidate[name];
      const text = typeof raw === "string" ? raw.trim() : typeof raw === "number" && Number.isSafeInteger(raw) ? String(raw) : "";
      if (pattern.test(text)) { payment[name] = text; break; }
    }
  }
  for (const candidate of candidates) {
    if (typeof candidate["expiresAt"] === "string" && Number.isFinite(Date.parse(candidate["expiresAt"]))) {
      payment.expiresAt = candidate["expiresAt"];
      break;
    }
  }
  return payment;
}

function identifier(data: RecordValue, names: string[]): string | undefined {
  const values = names.filter((name) => data[name] !== undefined).map((name) => data[name]);
  if (!values.length || values.some((value) => typeof value !== "string" || !value || value !== values[0])) return undefined;
  return values[0] as string;
}

// Parse decimal euros without treating binary floating point noise as a missing cent.
function euroCents(value: unknown): number {
  if (typeof value !== "string" && typeof value !== "number") return NaN;
  const match = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(String(value));
  if (!match) return NaN;
  return Number(match[1]) * 100 + Number((match[2] || "").padEnd(2, "0"));
}

export function webhookPayment(data: RecordValue) {
  const orderId = identifier(data, ["externalOrderId", "orderId", "order_id"]);
  const transactionId = identifier(data, ["transactionId", "id"]);
  const euros = data["amount"] === undefined ? undefined : euroCents(data["amount"]);
  const cents = data["amountInCents"] === undefined ? euros : data["amountInCents"];
  if (!orderId || !/^PT-[a-f0-9-]{36}$/.test(orderId) || !transactionId ||
      !/^(?:txn_[1-9]\d*|test_txn_[a-f0-9-]{36})$/.test(transactionId) ||
      typeof cents !== "number" || !Number.isSafeInteger(cents) || cents < 1 || cents > 500000 ||
      (euros !== undefined && euros !== cents) || data["currency"] !== "EUR") {
    throw new Error("Webhook assinado sem dados suficientes para conciliação.");
  }
  return { orderId, transactionId, amountInCents: cents };
}

/** An accepted HTTP response alone does not prove that the payment method was activated. */
export function activationStatus(method: "mbway" | "multibanco", response: unknown, payment: ReturnType<typeof cleanPayment>): "pending" | "uncertain" {
  const body = record(response);
  if (!body || body["success"] === false || body["error"] ||
      (body["status"] !== undefined && !["pending", "processing"].includes(String(body["status"])))) return "uncertain";
  return method === "multibanco"
    ? payment.entity && payment.reference ? "pending" : "uncertain"
    : body["success"] === true ? "pending" : "uncertain";
}
