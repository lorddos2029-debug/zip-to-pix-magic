import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatEUR } from "@/lib/pix";

/**
 * Checkout para Portugal. A criação real fica bloqueada até validar
 * o cliente VorkPay Connect, a persistência de encomendas e os webhooks.
 * Não usar Pix nem solicitar CPF nesta rota.
 */
export const Route = createFileRoute("/doar")({
  head: () => ({
    meta: [
      { title: "Fazer um donativo | Juntos por Vidas" },
      { name: "description", content: "Escolha o montante em euros e o método de pagamento: MB WAY ou Multibanco." },
      { property: "og:title", content: "Fazer um donativo | Juntos por Vidas" },
    ],
  }),
  component: DoarPortugalPage,
});

type Metodo = "mbway" | "multibanco";
const SUGESTOES = [10, 20, 30, 50, 70, 100, 150, 200, 500];
const EXTRAS = [
  { id: "cabaz", nome: "Cabaz alimentar", cents: 2500, image: "/pix/cesta.png" },
  { id: "energia", nome: "Apoio energético", cents: 2990, image: "/pix/gas.png" },
  { id: "saude", nome: "Medicamentos", cents: 2790, image: "/pix/med.jpeg" },
] as const;

function DoarPortugalPage() {
  const [metodo, setMetodo] = useState<Metodo>("mbway");
  const [valor, setValor] = useState("20");
  const [extras, setExtras] = useState<string[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");

  const amount = Number(valor);
  const validAmount = Number.isFinite(amount) && amount >= 1 && amount <= 10000 && Math.round(amount * 100) === amount * 100;
  const valorCents = validAmount ? Math.round(amount * 100) : 0;
  const extrasCents = useMemo(
    () => EXTRAS.filter((extra) => extras.includes(extra.id)).reduce((sum, extra) => sum + extra.cents, 0),
    [extras],
  );
  const totalCents = valorCents + extrasCents;
  const total = formatEUR(totalCents / 100);
  const toggle = (id: string) =>
    setExtras((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  const validate = () => {
    if (!validAmount) return "Introduza um valor válido entre 1 € e 10 000 €.";
    if (nome.trim().length < 3) return "Indique o seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Introduza um email válido.";
    if (metodo === "mbway" && !/^9\d{8}$/.test(telefone.replace(/\D/g, ""))) {
      return "Indique um número de telemóvel português com 9 dígitos, sem indicativo.";
    }
    return "";
  };

  const handleAttempt = () => {
    const invalid = validate();
    setErro(invalid || "A integração VorkPay Connect ainda não está validada neste servidor. Não foi gerada nenhuma cobrança. Por favor, tente novamente após a ativação oficial.");
  };

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-3 py-6 font-[Montserrat,Arial,sans-serif] text-[#333]">
      <section className="mx-auto w-full max-w-[510px] rounded-2xl bg-white px-5 py-6 text-center shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
        <a href="/" aria-label="Juntos por Vidas — página inicial" className="mx-auto mb-4 block w-fit">
          <img src="/branding/juntos-por-vidas.webp" width="112" height="112" className="mx-auto h-28 w-28 object-contain" alt="Juntos por Vidas" />
        </a>
        <h1 className="text-[23px] font-bold leading-tight">A sua ajuda faz a diferença</h1>
        <p className="mt-2 text-sm text-[#666]">Escolha o montante do donativo em euros (€)</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {SUGESTOES.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => { setValor(String(suggestion)); setErro(""); }}
              className={`min-h-12 rounded-full border px-1 text-sm font-bold transition ${amount === suggestion ? "border-[#27ae60] bg-[#e8f9e9] text-[#218149]" : "border-[#ddd] bg-white text-[#333] hover:border-[#27ae60]"}`}>
              {formatEUR(suggestion)}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-[#d4edda] bg-[#e8f9e9] px-4 py-4 text-left">
          <p className="mb-3 text-sm font-bold text-[#16723a]">Acrescente apoio ao seu donativo</p>
          <div className="grid grid-cols-3 gap-2">
            {EXTRAS.map((extra) => (
              <button key={extra.id} type="button" aria-pressed={extras.includes(extra.id)} onClick={() => toggle(extra.id)}
                className={`flex min-h-32 flex-col items-center rounded-xl border-2 bg-white px-1.5 py-3 text-center ${extras.includes(extra.id) ? "border-[#27ae60]" : "border-transparent"}`}>
                <img src={extra.image} alt="" className="mb-2 h-9 w-9 rounded-full object-cover" />
                <span className="flex-1 text-[11px] font-semibold leading-tight">{extra.nome}</span>
                <span className="mt-2 text-xs font-bold text-[#179d50]">{formatEUR(extra.cents / 100)}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-right text-xs font-semibold">Apoios adicionais: {formatEUR(extrasCents / 100)}</p>
        </div>

        <div className="mt-5 rounded-2xl border border-[#eee] px-4 py-5">
          <label htmlFor="donation-amount" className="block text-sm font-semibold">O seu donativo (€)</label>
          <input id="donation-amount" type="number" inputMode="decimal" min="1" max="10000" step="0.01"
            value={valor} onChange={(event) => { setValor(event.target.value); setErro(""); }}
            className="mx-auto mt-3 block w-full rounded-xl border border-[#ddd] px-4 py-3 text-center text-xl font-bold focus:border-[#27ae60] focus:outline-none" />
          <p className="mt-3 text-xl font-extrabold text-[#168342]">Total: {total}</p>
        </div>

        <fieldset className="mt-5 text-left">
          <legend className="mb-3 text-sm font-bold">Método de pagamento</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["mbway", "multibanco"] as const).map((value) => (
              <button key={value} type="button" aria-pressed={metodo === value} onClick={() => { setMetodo(value); setErro(""); }}
                className={`rounded-xl border-2 px-3 py-3 text-sm font-bold ${metodo === value ? "border-[#27ae60] bg-[#e8f9e9]" : "border-[#ddd] bg-white"}`}>
                {value === "mbway" ? "MB WAY" : "Multibanco"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#64748b]">
            {metodo === "mbway" ? "Receberá um pedido de pagamento na aplicação MB WAY." : "Receberá uma entidade e uma referência para pagar no Multibanco."}
          </p>
        </fieldset>

        <div className="mt-5 space-y-3 text-left">
          <label className="block text-sm font-semibold">Nome completo
            <input type="text" autoComplete="name" maxLength={160} value={nome}
              onChange={(event) => { setNome(event.target.value); setErro(""); }}
              placeholder="Nome completo" className="mt-1 block w-full rounded-xl border border-[#ddd] px-4 py-3 font-normal" />
          </label>
          <label className="block text-sm font-semibold">Email
            <input type="email" autoComplete="email" maxLength={200} value={email}
              onChange={(event) => { setEmail(event.target.value); setErro(""); }}
              placeholder="email@exemplo.pt" className="mt-1 block w-full rounded-xl border border-[#ddd] px-4 py-3 font-normal" />
          </label>
          {metodo === "mbway" && (
            <label className="block text-sm font-semibold">Telemóvel MB WAY
              <input type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={9} value={telefone}
                onChange={(event) => { setTelefone(event.target.value.replace(/\D/g, "").slice(0, 9)); setErro(""); }}
                placeholder="9 dígitos, sem +351" className="mt-1 block w-full rounded-xl border border-[#ddd] px-4 py-3 font-normal" />
            </label>
          )}
        </div>

        {erro && <p role="alert" className="mt-4 rounded-lg bg-[#fff3ec] px-3 py-3 text-left text-sm text-[#9c3c18]">{erro}</p>}
        <button type="button" onClick={handleAttempt} className="mt-5 w-full rounded-xl bg-[#27ae60] px-5 py-4 text-base font-bold text-white hover:bg-[#219852]">
          Prosseguir com {metodo === "mbway" ? "MB WAY" : "Multibanco"} — {total}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-[#64748b]">
          Integração em preparação. Nenhum pagamento é solicitado nesta versão.
          A confirmação de pagamento dependerá exclusivamente do webhook validado no servidor.
        </p>
      </section>
    </main>
  );
}
