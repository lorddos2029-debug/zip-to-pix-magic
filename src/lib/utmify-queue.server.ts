import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export interface QueuedUtmifyOrder {
  order_id: number;
  created_at: string; // UTC (YYYY-MM-DD HH:MM:SS)
  valor: number;
  nome: string;
  email: string;
  cpf?: string | undefined;
  telefone?: string | undefined;
  ip?: string | undefined;
  itens?: { id: string; nome: string; quantidade: number; preco_unitario: number }[] | undefined;
  utm?: Record<string, string> | undefined;
}

export async function queueUtmifyOrder(order: QueuedUtmifyOrder): Promise<void> {
  if (!Number.isSafeInteger(order.order_id) || order.order_id <= 0) {
    throw new Error("ID de pedido inválido para a fila da UTMify.");
  }
  const folder = process.env["UTMIFY_QUEUE_DIR"]?.trim() || resolve(process.cwd(), ".utmify-queue");
  await mkdir(folder, { recursive: true, mode: 0o700 });
  const filename = join(folder, `${order.order_id}.json`);
  try {
    await writeFile(filename, JSON.stringify({ ...order, synced_paid: false }), {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
  } catch (error) {
    // Não sobrescreva os dados da compra se o registro já existir.
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
}
