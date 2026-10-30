import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";

const input = new URL("../src/vendor/nsqpay.mjs.gz.b64", import.meta.url);
const output = new URL("../src/vendor/nsqpay.mjs", import.meta.url);
const content = (await readFile(input, "utf8")).trim();
const bytes = gunzipSync(Buffer.from(content, "base64"));
const digest = createHash("sha256").update(bytes).digest("hex");
if (digest !== "253c5892b4260c6a5349132713bd1038469376c62ab7a58d51459ed779d0b8b0") throw new Error("O SDK VorkPay fornecido não passou na verificação de integridade.");
await mkdir(new URL("../src/vendor/", import.meta.url), { recursive: true });
await writeFile(output, bytes);
console.log("SDK VorkPay Connect verificado e preparado (1.0.0).");
