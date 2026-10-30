// Shared formatting helpers.

export function formatEUR(amount: number): string {
  return amount.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

export function formatBRL(amount: number): string {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
