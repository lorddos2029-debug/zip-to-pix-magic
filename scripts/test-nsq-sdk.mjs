/**
 * Isolated NSQ Connect tests. Does not call VorkPay or create real charges.
 * Run: npm run test:nsq
 */
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { createNSQPay } from "../src/vendor/nsqpay.mjs";

const secretKey = "nsq_sk_test_v2_" + "a".repeat(32) + "_" + "b".repeat(64);
const webhookSecret = "test_only_webhook_secret_do_not_use_live";
const results = [];
const client = (transport) => createNSQPay({
  secretKey, webhookSecret, storeUrl: "https://example.org",
  environment: "test", fetch: transport, timeoutMs: 1000,
});
for (const method of ["mbway", "multibanco"]) {
  const calls = [];
  const nsq = client(async (url) => {
    calls.push(new URL(url).pathname);
    const payload = url.endsWith("/payments/init")
      ? { transactionId: "test_txn_" + randomUUID(), amount: 12, currency: "EUR", environment: "test" }
      : { status: "pending", entity: "12345", reference: "999999999" };
    return new Response(JSON.stringify(payload), { status: 200 });
  });
  const outcome = await nsq.payments.create({
    orderId: "PT-" + randomUUID(), amountInCents: 1200, currency: "EUR", method,
    ...(method === "mbway" ? { phoneNumber: "912345678" } : {}),
    customer: { name: "Pessoa de teste", email: "teste@example.invalid", country: "PT" },
    items: [{ id: "donativo", name: "Donativo", quantity: 1, priceInCents: 1200 }],
  });
  assert.equal(outcome.status, "pending");
  assert.equal(calls.length, 2);
  assert.match(calls[1], new RegExp(method + "$"));
  results.push(method);
}
const nsq = client(async () => { throw new Error("não é suposto chamar a API"); });
for (const event of ["payment.success", "payment.refunded", "payment.failed", "payment.cancelled"]) {
  const eventId = "test_evt_" + randomUUID();
  const timestamp = Math.floor(Date.now() / 1000);
  const raw = JSON.stringify({ event, environment: "test",
    data: { orderId: "PT-test", transactionId: "test_txn_" + randomUUID(), amountInCents: 1200, currency: "EUR" } });
  const signature = "v1=" + createHmac("sha256", webhookSecret).update(timestamp + "." + eventId + "." + raw).digest("hex");
  const headers = { "X-NSQPAY-Timestamp": String(timestamp), "X-NSQPAY-Event-Id": eventId,
    "X-NSQPAY-Signature": signature, "X-NSQPAY-Environment": "test" };
  const verified = await nsq.webhooks.verify(raw, headers);
  assert.equal(verified.deduplicationKey, eventId);
  await assert.rejects(nsq.webhooks.verify(raw.replace("1200", "1300"), headers));
  results.push(event + " signature");
}
const failure = client(async () => { throw new Error("sem rede"); });
await assert.rejects(failure.payments.create({
  orderId: "PT-" + randomUUID(), amountInCents: 1200, method: "multibanco", currency: "EUR",
  customer: { name: "Pessoa teste", email: "teste@example.invalid" },
  items: [{ id: "donativo", name: "Donativo", quantity: 1, priceInCents: 1200 }],
}), (error) => error.code === "NETWORK_ERROR");
results.push("network failure");
console.log("NSQ Connect tests passed: " + results.join(", "));
