import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { formatEUR } from "@/lib/pix";
import { getCampaignAttribution } from "@/lib/campaign-attribution";

/** Checkout dedicado a Portugal. O SDK VorkPay é executado exclusivamente no servidor. */
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
type Payment = { entity?: string; reference?: string; expiresAt?: string } | null;
type CurrentOrder = { orderId: string; token: string; amountInCents: number; currency: "EUR";
  method: Metodo; status: string; payment?: Payment; message?: string };
type PaymentConfig = { enabled: boolean; environment: "live" | "test"; publicKey: string };
type CaptureResult = { originToken?: string | null; trackingParameters?: Record<string, string> };
type NSQWindow = Window & { NSQConnect?: { capture: (args: { publicKey: string; orderId: string; amountInCents: number; currency: "EUR" }) => Promise<CaptureResult> } };
async function apiCall(action: string, data: unknown): Promise<Record<string, unknown>> {
  const response = await fetch("/api/nsq-payments", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }), credentials: "same-origin",
  });
  const result = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Pagamento temporariamente indisponível.");
  return result;
}
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
  const [busy, setBusy] = useState(false);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [current, setCurrent] = useState<CurrentOrder | null>(null);
  useEffect(() => {
    let active = true;
    void fetch("/api/nsq-payments", { cache: "no-store" }).then(async (res) => {
      if (!res.ok) throw new Error("Integração indisponível");
      return res.json() as Promise<PaymentConfig>;
    }).then((value) => { if (active) setConfig(value); })
      .catch(() => { if (active) setConfig({ enabled: false, environment: "test", publicKey: "" }); });
    if (!document.querySelector('script[data-nsq-connect="1"]')) {
      const script = document.createElement("script");
      script.src = "https://www.nsqpay.com/sdk/nsq-connect.js";
      script.async = true;
      script.dataset.nsqConnect = "1";
      document.head.appendChild(script);
    }
    return () => { active = false; };
  }, []);
  // Consulta apenas o estado da nossa própria encomenda autenticada em Redis.
  // Não faz polling à API do processador nem pode aprovar pagamentos no navegador.
  useEffect(() => {
    if (!current || ["paid", "refunded", "failed", "cancelled", "uncertain"].includes(current.status)) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      if (++attempts > 30) { window.clearInterval(timer); return; }
      void apiCall("status", { orderId: current.orderId, token: current.token })
        .then((value) => setCurrent((last) => last?.orderId === current.orderId
          ? { ...last, status: String(value.status || last.status), payment: (value.payment as Payment) || last.payment }
          : last)).catch(() => undefined);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [current?.orderId, current?.status]);

  const amount = Number(valor);
  const validAmount = Number.isFinite(amount) && amount >= 1 && amount <= 5000 && Math.abs(Math.round(amount * 100) - amount * 100) < 0.00001;
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
    if (!validAmount || totalCents > 500000) return "Introduza um valor total válido entre 1 € e 5 000 €.";
    if (nome.trim().length < 3) return "Indique o seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Introduza um email válido.";
    if (metodo === "mbway" && !/^9\d{8}$/.test(telefone.replace(/\D/g, ""))) {
      return "Indique um número de telemóvel português com 9 dígitos, sem indicativo.";
    }
    return "";
  };

  const handleAttempt = async () => {
    if (busy) return;
    const invalid = validate();
    if (invalid) { setErro(invalid); return; }
    if (!config?.enabled || !config.publicKey) {
      setErro("O processamento de pagamentos está temporariamente indisponível.");
      return;
    }
    setBusy(true);
    setErro("");
    let prepared: { orderId: string; token: string; amountInCents: number; currency: "EUR" } | null = null;
    try {
      prepared = await apiCall("prepare", {
        donationCents: valorCents, extras, method: metodo,
        name: nome.trim(), email: email.trim(),
        ...(metodo === "mbway" ? { phoneNumber: telefone.replace(/\\D/g, "") } : {}),
      }) as typeof prepared;
      if (!prepared) throw new Error("Não foi possível preparar o donativo.");
      // O componente não recolhe dados privados. Se falhar, o token será null.
      let capture: CaptureResult = { originToken: null, trackingParameters: {} };
      try {
        capture = (await (window as NSQWindow).NSQConnect?.capture({
          publicKey: config.publicKey, orderId: prepared.orderId,
          amountInCents: prepared.amountInCents, currency: "EUR",
        })) || capture;
      } catch { /* falhas de atribuição não bloqueiam um pagamento legítimo */ }
      const tracking = { ...getCampaignAttribution(), ...(capture.trackingParameters || {}) };
      const started = await apiCall("pay", {
        orderId: prepared.orderId, token: prepared.token,
        originToken: capture.originToken || null, trackingParameters: tracking,
      });
      setCurrent({ orderId: prepared.orderId, token: prepared.token,
        amountInCents: prepared.amountInCents, currency: "EUR", method: metodo,
        status: String(started.status || "uncertain"), payment: (started.payment as Payment) || null,
        message: typeof started.message === "string" ? started.message : undefined });
    } catch (error) {
      if (prepared) {
        setCurrent({ ...prepared, method: metodo, status: "uncertain",
          message: "O estado desta encomenda não foi confirmado. Não tente gerar outro pagamento até obter confirmação." });
      } else setErro(error instanceof Error ? error.message : "Falha de ligação ao servidor.");
    } finally { setBusy(false); }
  };

  if (current) return (
    <main className="min-h-screen bg-[#f7f7f7] px-3 py-6 font-[Montserrat,Arial,sans-serif]">
      <section className="mx-auto w-full max-w-[510px] rounded-2xl bg-white px-6 py-7 text-center shadow">
        <a href="/" className="mx-auto block w-fit"><img src="/branding/juntos-por-vidas.webp" alt="Juntos por Vidas" className="mx-auto h-28 w-28 object-contain" /></a>
        <h1 className="mt-3 text-2xl font-bold">{current.status === "paid" ? "Donativo confirmado!" : current.status === "refunded" ? "Donativo reembolsado" : "Pagamento do seu donativo"}</h1>
        <p className="mt-3 text-lg font-bold text-[#178947]">{formatEUR(current.amountInCents / 100)}</p>
        <p className="mt-2 text-sm text-[#555]">Método: {current.method === "mbway" ? "MB WAY" : "Multibanco"}</p>
        {current.status === "paid" ? (
          <p className="mt-5 text-sm text-[#16723a]">Pagamento confirmado pelo processador através do webhook seguro. Obrigado por ajudar!</p>
        ) : current.status === "uncertain" ? (
          <p role="alert" className="mt-5 rounded-xl bg-orange-50 p-4 text-sm text-orange-900">{current.message || "Estado do pagamento incerto. Não faça um segundo pagamento até confirmar o estado."}</p>
        ) : current.status === "failed" || current.status === "cancelled" ? (
          <p className="mt-5 text-sm text-red-700">Este pedido não foi concluído. Consulte o suporte antes de repetir o pagamento.</p>
        ) : (
          <p className="mt-5 text-sm text-[#666]">Aguardamos a confirmação segura do processador. Ainda não está marcado como pago.</p>
        )}
        {current.method === "mbway" && current.status === "pending" && <p className="mt-3 text-sm">Confirme o pedido de pagamento na aplicação MB WAY do seu telemóvel.</p>}
        {current.method === "multibanco" && current.payment && (
          <div className="mt-5 rounded-xl bg-[#e8f9e9] p-4 text-left text-sm">
            {current.payment.entity && <p>Entidade: <strong>{current.payment.entity}</strong></p>}
            {current.payment.reference && <p className="mt-2">Referência: <strong>{current.payment.reference}</strong></p>}
            {current.payment.expiresAt && <p className="mt-2">Validade: <strong>{current.payment.expiresAt}</strong></p>}
            <p className="mt-3">No Multibanco, use a entidade, referência e montante acima.</p>
          </div>
        )}
        <p className="mt-6 break-all text-xs text-slate-500">Encomenda: {current.orderId}</p>
        <a href="/" className="mt-6 inline-block rounded-xl border px-4 py-2 text-sm">Voltar ao início</a>
      </section>
    </main>
  );

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
          <input id="donation-amount" type="number" inputMode="decimal" min="1" max="5000" step="0.01"
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
        <button type="button" onClick={() => void handleAttempt()}
          disabled={busy || !config?.enabled}
          className="mt-5 w-full rounded-xl bg-[#27ae60] px-5 py-4 text-base font-bold text-white hover:bg-[#219852] disabled:cursor-not-allowed disabled:bg-gray-400">
          {busy ? "A processar…" : !config?.enabled ? "Pagamentos temporariamente indisponíveis"
            : `Prosseguir com ${metodo === "mbway" ? "MB WAY" : "Multibanco"} — ${total}`}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-[#64748b]">
          O pagamento só é confirmado após webhook validado. As chaves privadas nunca são enviadas ao navegador.
          {!config?.enabled && " A emissão de cobranças encontra-se desativada até à validação da integração."}
        </p>
      </section>
    </main>
  );
}
