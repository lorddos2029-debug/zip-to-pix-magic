import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export interface QueuedUtmifyOrder {
  order_id: number;
  created_at: string;
  valor: number;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  ip?: string;
  itens?: { id: string; nome: string; quantidade: number; preco_unitario: number }[];
  utm?: Record<string, string>;
  fbp?: string;
  fbc?: string;
  evento_id?: string;
  user_agent?: string;
  source_url?: string;
  synced_pending?: boolean;
  synced_paid?: boolean;
  synced_meta_paid?: boolean;
}

const prefix = "pix-ready:tracking:";
const pendingKey = prefix + "pending";
const directory = () => process.env["UTMIFY_QUEUE_DIR"]?.trim() || resolve(process.cwd(), ".utmify-queue");
const filePath = (id: number) => join(directory(), String(id) + ".json");
const redisUrl = () => process.env["UPSTASH_REDIS_REST_URL"]?.trim();
const redisToken = () => process.env["UPSTASH_REDIS_REST_TOKEN"]?.trim();
const redisEnabled = () => Boolean(redisUrl() && redisToken());

export async function redisCommand(...command: (string | number)[]): Promise<any> {
  if (!redisEnabled()) throw new Error("Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN na Vercel.");
  const response = await fetch(redisUrl()!, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + redisToken()!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(12000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) throw new Error("Upstash indisponível (" + response.status + "): " + String(data.error || "falha de rede"));
  return data.result;
}

function assertStorage() {
  if (redisEnabled()) return;
  if (process.env["VERCEL"]) {
    throw new Error("Fila de Pix requer UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN na Vercel.");
  }
}

function isValidId(id: number) {
  return Number.isSafeInteger(id) && id > 0;
}

export async function queueUtmifyOrder(order: QueuedUtmifyOrder): Promise<void> {
  if (!isValidId(order.order_id)) throw new Error("ID de pedido inválido para rastreamento.");
  assertStorage();
  if (redisEnabled()) {
    await redisCommand("SET", prefix + order.order_id, JSON.stringify({ ...order, synced_paid: false, synced_meta_paid: false }), "EX", 2592000, "NX");
    await redisCommand("ZADD", pendingKey, Date.now(), String(order.order_id));
    return;
  }
  await mkdir(directory(), { recursive: true, mode: 0o700 });
  try {
    await writeFile(filePath(order.order_id), JSON.stringify({ ...order, synced_paid: false, synced_meta_paid: false }), {
      encoding: "utf8", flag: "wx", mode: 0o600,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
}

export async function getQueuedUtmifyOrder(orderId: number): Promise<QueuedUtmifyOrder | null> {
  if (!isValidId(orderId)) return null;
  assertStorage();
  if (redisEnabled()) {
    const result = await redisCommand("GET", prefix + orderId);
    return typeof result === "string" ? JSON.parse(result) as QueuedUtmifyOrder : null;
  }
  try {
    return JSON.parse(await readFile(filePath(orderId), "utf8")) as QueuedUtmifyOrder;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function listQueuedUtmifyOrders(limit = 40): Promise<number[]> {
  assertStorage();
  if (redisEnabled()) {
    const result = await redisCommand("ZRANGE", pendingKey, 0, Math.max(0, Math.min(100, limit) - 1));
    return (Array.isArray(result) ? result : []).map(Number).filter(isValidId);
  }
  await mkdir(directory(), { recursive: true });
  return (await readdir(directory()))
    .filter(name => /^[0-9]+[.]json$/.test(name))
    .map(name => Number(name.replace(/[.]json$/, "")))
    .filter(isValidId)
    .slice(0, limit);
}

export async function markUtmifyOrderFlags(
  orderId: number,
  patch: Pick<QueuedUtmifyOrder, "synced_pending" | "synced_paid" | "synced_meta_paid">,
): Promise<void> {
  const current = await getQueuedUtmifyOrder(orderId);
  if (!current) return;
  const updated = { ...current, ...patch };
  if (redisEnabled()) {
    await redisCommand("SET", prefix + orderId, JSON.stringify(updated), "EX", 2592000);
    if (updated.synced_paid && updated.synced_meta_paid) {
      await redisCommand("ZREM", pendingKey, String(orderId));
    }
    return;
  }
  await writeFile(filePath(orderId), JSON.stringify(updated), { encoding: "utf8", mode: 0o600 });
}

export async function markUtmifyOrderSynced(orderId: string): Promise<void> {
  const id = Number(orderId);
  if (isValidId(id)) await markUtmifyOrderFlags(id, { synced_paid: true });
}

export async function withUtmifyOrderLock<T>(orderId: number, action: () => Promise<T>): Promise<T | null> {
  if (!redisEnabled()) return action();
  const key = prefix + "lock:" + orderId;
  const owner = crypto.randomUUID();
  const locked = await redisCommand("SET", key, owner, "EX", 45, "NX");
  if (locked !== "OK") return null;
  try {
    return await action();
  } finally {
    // Só remove o lock se ainda pertencer a esta execução.
    await redisCommand("EVAL",
      "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
      1, key, owner,
    ).catch(error => console.error("[UTMify] Falha ao liberar lock:", error instanceof Error ? error.message : "erro"));
  }
}
