/** Contract regressions: all fixtures are local, with no payment API calls. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash, createHmac } from "node:crypto";
import ts from "typescript";
import { cleanPayment, webhookPayment, activationStatus } from "../src/lib/nsq-contract.ts";

const bank = { entity: "24000", reference: "123456789", expiresAt: "2026-11-02T12:00:00Z" };
for (const response of [bank, { mb: bank }, { payment: bank }, { data: { mb: bank } }]) {
  assert.deepEqual(cleanPayment(response), bank);
}
assert.deepEqual(cleanPayment(null), {});
assert.deepEqual(cleanPayment({ entity: "wrong", reference: Infinity, expiresAt: "invalid" }), {});
const orderId = "PT-3fdb7ef2-69b6-488c-ab6a-7aa986140fcd";
const event = { externalOrderId: orderId, id: "txn_28185", amount: 19.99, currency: "EUR" };
assert.deepEqual(webhookPayment(event), { orderId, transactionId: "txn_28185", amountInCents: 1999 });
for (const amount of [1, 10, 19.99, 0.29, 49.90, 5000]) {
  assert.equal(webhookPayment({ ...event, amount }).amountInCents, Math.round(amount * 100));
}
assert.equal(webhookPayment({ ...event, amount: "19.99" }).amountInCents, 1999);
assert.equal(webhookPayment({ orderId, transactionId: "txn_28185", amountInCents: 1999, currency: "EUR" }).amountInCents, 1999);
for (const invalid of [
  { ...event, orderId: "PT-other" }, { ...event, transactionId: "txn_9" },
  { ...event, amountInCents: 2000 }, { ...event, amount: 1.001 },
  { ...event, currency: "USD" }, { ...event, amount: null },
  { ...event, amount: -1 }, { ...event, amount: 0 }, { ...event, amount: 5000.01 },
]) assert.throws(() => webhookPayment(invalid));

assert.equal(activationStatus("multibanco", bank, cleanPayment(bank)), "pending");
assert.equal(activationStatus("multibanco", {}, {}), "uncertain");
assert.equal(activationStatus("multibanco", { success: false }, bank), "uncertain");
assert.equal(activationStatus("mbway", { success: true }, {}), "pending");
assert.equal(activationStatus("mbway", { success: false }, {}), "uncertain");
assert.equal(activationStatus("mbway", { status: "pending" }, {}), "uncertain");
assert.equal(activationStatus("mbway", { success: true, status: "paid" }, {}), "uncertain");

// Exercise the real handler and SDK verifier, replacing only storage with a recorder.
// No real credentials or network transport are used by this process.
globalThis.fetch = async () => { throw new Error("Network is forbidden in contract tests"); };
const secret = "local_webhook_test_secret_only";
Object.assign(process.env, {
  NSQPAY_ENVIRONMENT: "live", NSQPAY_SECRET_KEY: "nsq_sk_live_test_fixture",
  NSQPAY_WEBHOOK_SECRET: secret, NSQPAY_STORE_URL: "https://example.invalid", NSQPAY_INSTALL_ID: "inst_local",
});
const calls = [];
let storageResult = "updated";
globalThis.nsqTestRedis = async (...args) => { calls.push(args); return storageResult; };
const redisModule = "data:text/javascript," + encodeURIComponent("export const redisCommand = (...args) => globalThis.nsqTestRedis(...args)");
let source = await readFile(new URL("../src/lib/nsq-payments.server.ts", import.meta.url), "utf8");
source = source.replace('"./utmify-queue.server"', JSON.stringify(redisModule))
  .replace('"./nsq-contract"', JSON.stringify(new URL("../src/lib/nsq-contract.ts", import.meta.url).href))
  .replace('"../vendor/nsqpay.mjs"', JSON.stringify(new URL("../src/vendor/nsqpay.mjs", import.meta.url).href))
  .replace('"zod"', JSON.stringify(import.meta.resolve("zod")));
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { applyVerifiedWebhook, orderStatus } = await import("data:text/javascript;base64," + Buffer.from(compiled).toString("base64"));
const raw = JSON.stringify({ event: "payment.success", data: event });
const headers = { "X-VorkPay-Signature": "sha256=" + createHmac("sha256", secret).update(raw).digest("hex") };
assert.deepEqual(await applyVerifiedWebhook(raw, new Headers(headers)), { ok: true, duplicate: false });
assert.equal(calls.length, 1);
assert.equal(calls[0][3], "jpv:nsq:v1:order:" + orderId);
assert.deepEqual(calls[0].slice(5, 8), ["txn_28185", 1999, "paid"]);
storageResult = "duplicate";
assert.deepEqual(await applyVerifiedWebhook(raw, new Headers(headers)), { ok: true, duplicate: true });
storageResult = "mismatch";
await assert.rejects(applyVerifiedWebhook(raw, new Headers(headers)), /divergentes/);
const beforeInvalid = calls.length;
await assert.rejects(applyVerifiedWebhook(raw.replace("19.99", "29.99"), new Headers(headers)));
assert.equal(calls.length, beforeInvalid, "Invalid signatures must never reach storage");
const webhookTest = JSON.stringify({ event: "webhook.test", data: {} });
assert.deepEqual(await applyVerifiedWebhook(webhookTest, new Headers({
  "X-VorkPay-Signature": "sha256=" + createHmac("sha256", secret).update(webhookTest).digest("hex"),
})), { ok: true, ignored: true });
assert.equal(calls.length, beforeInvalid, "Connectivity tests must never change orders");

const token = "1".repeat(64);
const storedOrder = { id: orderId, accessHash: createHash("sha256").update(token).digest("hex"),
  status: "uncertain", amountInCents: 1999, currency: "EUR", method: "multibanco", transactionId: "txn_28185" };
let currentOrder = { ...storedOrder };
let remoteReads = 0;
const referenceWrites = [];
globalThis.nsqTestRedis = async (command, ...args) => {
  if (command === "GET") return JSON.stringify(currentOrder);
  if (command === "SET") return "OK";
  if (command === "INCR") return 1;
  if (command === "EXPIRE") return 1;
  if (command === "EVAL") {
    referenceWrites.push(args);
    assert.equal(args[3], "txn_28185");
    assert.deepEqual(JSON.parse(args[4]), bank);
    return "updated";
  }
  throw new Error("Unexpected storage command");
};
globalThis.fetch = async (url, options) => {
  assert.equal(new URL(url).pathname, "/api/v1/payments/status");
  assert.equal(new URL(url).searchParams.get("transactionId"), "txn_28185");
  assert.equal(options.method, "GET", "Recovery must never initiate or activate payment");
  remoteReads++;
  return Response.json({ transactionId: "txn_28185", externalOrderId: orderId, amount: 19.99, currency: "EUR", status: "paid", mb: bank });
};
await orderStatus({ orderId, token });
assert.equal(remoteReads, 0, "Normal checkout polling must stay local");
await assert.rejects(orderStatus({ orderId, token: "2".repeat(64), refreshReference: true }));
assert.equal(remoteReads, 0, "Unauthorized requests must never query provider");
const recovered = await orderStatus({ orderId, token, refreshReference: true });
assert.equal(remoteReads, 1);
assert.equal(referenceWrites.length, 1);
assert.notEqual(recovered.status, "paid", "A provider status lookup cannot confirm payment");
currentOrder = { ...storedOrder, status: "paid" };
await orderStatus({ orderId, token, refreshReference: true });
assert.equal(remoteReads, 1, "Terminal orders must not requery activation data");
currentOrder = { ...storedOrder };
globalThis.nsqTestRedis = async (command) => command === "GET" ? JSON.stringify(currentOrder) : null;
await orderStatus({ orderId, token, refreshReference: true });
assert.equal(remoteReads, 1, "Rate-limited reference checks must not query the provider");
console.log("VorkPay contract regressions passed (reference, webhook identifiers, cents, activation).");
