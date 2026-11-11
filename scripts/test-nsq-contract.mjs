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
const emailCalls = [];
globalThis.nsqTestEmail = async (receipt) => { emailCalls.push(receipt); return "sent"; };
globalThis.nsqTestRedis = async (...args) => {
  if (args[0] === "GET") return JSON.stringify({ id: orderId, status: "paid", amountInCents: 1999, currency: "EUR", method: "multibanco", customer: { name: "Teste", email: "test@example.com" }, updatedAt: "2026-11-11T12:00:00Z" });
  calls.push(args); return storageResult;
};
const emailModule = "data:text/javascript," + encodeURIComponent("export const sendDonationConfirmation = (...args) => globalThis.nsqTestEmail(...args)");
const redisModule = "data:text/javascript," + encodeURIComponent("export const redisCommand = (...args) => globalThis.nsqTestRedis(...args)");
let source = await readFile(new URL("../src/lib/nsq-payments.server.ts", import.meta.url), "utf8");
source = source.replace('"./donation-email.server"', JSON.stringify(emailModule)).replace('"./utmify-queue.server"', JSON.stringify(redisModule))
  .replace('"./nsq-contract"', JSON.stringify(new URL("../src/lib/nsq-contract.ts", import.meta.url).href))
  .replace('"../vendor/nsqpay.mjs"', JSON.stringify(new URL("../src/vendor/nsqpay.mjs", import.meta.url).href))
  .replace('"zod"', JSON.stringify(import.meta.resolve("zod")));
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { applyVerifiedWebhook, orderStatus } = await import("data:text/javascript;base64," + Buffer.from(compiled).toString("base64"));
const raw = JSON.stringify({ event: "payment.success", data: event });
const headers = { "X-VorkPay-Signature": "sha256=" + createHmac("sha256", secret).update(raw).digest("hex") };
assert.deepEqual(await applyVerifiedWebhook(raw, new Headers(headers)), { ok: true, duplicate: false });
assert.equal(calls.length, 1);
assert.equal(emailCalls.length, 1);
assert.equal(emailCalls[0].amountInCents, 1999);
assert.equal(calls[0][3], "jpv:nsq:v1:order:" + orderId);
assert.deepEqual(calls[0].slice(5, 8), ["txn_28185", 1999, "paid"]);
storageResult = "duplicate";
assert.deepEqual(await applyVerifiedWebhook(raw, new Headers(headers)), { ok: true, duplicate: true });
assert.equal(emailCalls.length, 2, "Duplicate signed events retry the idempotent email service");
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

const beforePendingEmail = emailCalls.length;
storageResult = "updated";
const pendingRaw = JSON.stringify({ event: "payment.pending", data: event });
await applyVerifiedWebhook(pendingRaw, new Headers({ "X-VorkPay-Signature": "sha256=" + createHmac("sha256", secret).update(pendingRaw).digest("hex") }));
assert.equal(emailCalls.length, beforePendingEmail, "Pending events never send a paid receipt");
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

// Account migration: pending orders keep their original credentials and signatures.
const legacySecret = "legacy_webhook_fixture_only";
const legacyConfig = { secretKey: "nsq_sk_live_legacy_fixture", webhookSecret: legacySecret,
  storeUrl: "https://example.invalid", installId: "inst_previous", environment: "live" };
process.env.NSQPAY_LEGACY_CONFIG = JSON.stringify(legacyConfig);
currentOrder = { ...storedOrder, status: "paid", customer: { name: "Teste", email: "test@example.com" } };
let migrationWrites = 0;
globalThis.nsqTestRedis = async (command, ...args) => {
  if (command === "GET") return JSON.stringify(currentOrder);
  if (command === "EVAL") {
    assert.match(args[0], /o\.providerInstallId or ARGV\[7\]/);
    migrationWrites++;
    // Mirror the account comparison performed atomically with the financial checks.
    return (currentOrder.providerInstallId || args[10]) === args[9] ? "updated" : "mismatch";
  }
  if (command === "SET") return "OK";
  if (command === "INCR" || command === "EXPIRE") return 1;
  throw new Error("Unexpected command");
};
const signed = (body, signingKey) => new Headers({ "X-VorkPay-Signature": "sha256=" + createHmac("sha256", signingKey).update(body).digest("hex") });
await applyVerifiedWebhook(raw, signed(raw, legacySecret));
await assert.rejects(applyVerifiedWebhook(raw, signed(raw, secret)), /divergentes/, "New account cannot confirm an old order");
currentOrder.providerInstallId = "inst_local";
await applyVerifiedWebhook(raw, signed(raw, secret));
await assert.rejects(applyVerifiedWebhook(raw, signed(raw, legacySecret)), /divergentes/, "Old account cannot confirm a new order");
const beforeBadSignature = migrationWrites;
await assert.rejects(applyVerifiedWebhook(raw, signed(raw, "unrelated_secret")));
assert.equal(migrationWrites, beforeBadSignature);
// New-format invalid signatures cannot fall back to a valid old-format HMAC.
const badModern = signed(raw, legacySecret);
badModern.set("X-NSQPAY-Signature", "v1=" + "0".repeat(64));
badModern.set("X-NSQPAY-Timestamp", String(Math.floor(Date.now() / 1000)));
badModern.set("X-NSQPAY-Event-Id", "event_migration");
badModern.set("X-NSQPAY-Environment", "live");
await assert.rejects(applyVerifiedWebhook(raw, badModern));
assert.equal(migrationWrites, beforeBadSignature);

let expectedKey;
const lookupCredentials = [];
globalThis.fetch = async (url, options) => {
  assert.equal(options.method, "GET");
  lookupCredentials.push(new Headers(options.headers).get("authorization"));
  return Response.json({ transactionId: "txn_28185", externalOrderId: orderId, amount: 19.99, currency: "EUR", status: "pending" });
};
currentOrder = { ...storedOrder };
expectedKey = legacyConfig.secretKey;
await orderStatus({ orderId, token, refreshReference: true });
currentOrder.providerInstallId = "inst_local";
expectedKey = process.env.NSQPAY_SECRET_KEY;
await orderStatus({ orderId, token, refreshReference: true });
assert.deepEqual(lookupCredentials, ["Bearer " + legacyConfig.secretKey, "Bearer " + process.env.NSQPAY_SECRET_KEY]);
delete process.env.NSQPAY_LEGACY_CONFIG;
console.log("VorkPay migration passed: account-scoped signatures and original-account lookups.");
