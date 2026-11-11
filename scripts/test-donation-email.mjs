import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
async function loadTs(path, overrides, extra = {}) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("exports", "require", "process", "fetch", code)(exports, (id) => overrides[id] ?? require(id),
    { env: { RESEND_API_KEY: "test-key", RESEND_FROM_EMAIL: "Juntos por Vidas <doacoes@juntos-por-vidas.online>" } }, extra.fetch ?? globalThis.fetch);
  return exports;
}
const brand = await loadTs("../src/lib/donation-brand.server.ts", {});
const pdf = await loadTs("../src/lib/donation-receipt.server.ts", { "./donation-brand.server": brand });
const values = new Map();
async function redisCommand(command, ...args) {
  if (command === "GET") return values.get(args[0]) ?? null;
  if (command === "SET") {
    if (args.includes("NX") && values.has(args[0])) return null;
    values.set(args[0], args[1]); return "OK";
  }
  if (command === "DEL") return Number(values.delete(args[0]));
  if (command === "EVAL") {
    if (values.get(args[2]) === args[3]) return Number(values.delete(args[2]));
    return 0;
  }
  throw new Error("Unexpected Redis command: " + command);
}
const requests = [];
let fail = false;
let hold;
const module = await loadTs("../src/lib/donation-email.server.ts", {
  "./utmify-queue.server": { redisCommand }, "./donation-receipt.server": pdf, "./donation-brand.server": brand,
}, { fetch: async (url, options) => {
  assert.equal(url, "https://api.resend.com/emails");
  requests.push(options);
  if (hold) await hold;
  if (fail) return Response.json({ message: "Unavailable" }, { status: 503 });
  return Response.json({ id: "test-email-id" });
} });
const receipt = { orderId: "PT-EXEMPLO-NAO-E-UMA-DOACAO", email: "doador@teste.dev", name: "Doador de exemplo",
  amountInCents: 2000, currency: "EUR", method: "mbway", confirmedAt: "2026-11-11T12:00:00Z" };
assert.equal(await module.sendDonationConfirmation(receipt), "sent");
assert.equal(await module.sendDonationConfirmation(receipt), "already_sent");
assert.equal(requests.length, 1, "Duplicate webhook must not send twice");
const payload = JSON.parse(requests[0].body);
assert.equal(payload.attachments.length, 2);
assert.equal(payload.attachments[1].content_id, "juntos-por-vidas-logo");
assert.match(payload.html, /src="cid:juntos-por-vidas-logo"/);
const attachment = Buffer.from(payload.attachments[0].content, "base64");
assert.equal(attachment.subarray(0, 5).toString(), "%PDF-");
const parsed = await require("pdf-lib").PDFDocument.load(attachment);
assert.equal(parsed.getPageCount(), 1);
assert.match(parsed.getTitle(), /sem valor fiscal/);
assert.match(requests[0].headers["Idempotency-Key"], /^donation-confirmed\//);
assert.equal(await module.sendDonationConfirmation({ ...receipt, email: "anonimo@example.com" }), "no_email");
assert.equal(requests.length, 1);
fail = true;
const retry = { ...receipt, orderId: "pix-retry", currency: "BRL", method: "pix", name: "<script>" };
await assert.rejects(module.sendDonationConfirmation(retry), /HTTP 503/);
const failedBody = requests.at(-1).body;
fail = false;
assert.equal(await module.sendDonationConfirmation(retry), "sent");
assert.equal(requests.at(-1).body, failedBody, "Retries must preserve PDF and complete request body");
assert.match(JSON.parse(failedBody).html, /&lt;script&gt;/);
let release;
hold = new Promise((resolve) => { release = resolve; });
const concurrent = { ...receipt, orderId: "PT-concurrent" };
const first = module.sendDonationConfirmation(concurrent);
while (!requests.some((request) => request.body.includes("PT-concurrent"))) await new Promise((resolve) => setTimeout(resolve, 5));
await assert.rejects(module.sendDonationConfirmation(concurrent), /processamento/);
release(); await first; hold = undefined;
assert.equal(await module.sendDonationConfirmation(concurrent), "already_sent");
fail = true;
await assert.rejects(module.sendDonationConfirmation({ ...receipt, orderId: "PT-old" }));
const attemptKey = [...values.keys()].find((key) => key.endsWith(":attempt"));
const attempt = JSON.parse(values.get(attemptKey)); attempt.startedAt -= 24 * 3600000;
values.set(attemptKey, JSON.stringify(attempt));
fail = false;
await assert.rejects(module.sendDonationConfirmation({ ...receipt, orderId: "PT-old" }), /revisão/);
if (process.argv.includes("--sample")) {
  await writeFile(new URL("../../recibo-exemplo.pdf", import.meta.url), attachment);
}
console.log("PASS: PDF attachment, duplicate events, anonymous donor, retry, HTML escaping, concurrency, expired idempotency window.");
