import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type FormEvent } from "react";
import QRCode from "react-qr-code";
import { formatBRL } from "@/lib/pix";
import { getCampaignAttribution } from "@/lib/campaign-attribution";
import { trackMetaInitiateCheckout } from "@/lib/meta-pixel";
import { trackDonation, trackPixPageOpen } from "@/lib/tracking.functions";
import { createUrusCharge, checkUrusStatus, type UrusChargeResult } from "@/lib/urus.functions";

export const Route = createFileRoute("/livia")({
  head: () => ({
    meta: [
      { title: "Ajude a pequena Lívia | Juntos por Vidas" },
      { name: "description", content: "Conheça a história de Lívia e as necessidades relatadas pela família. Escolha um valor e contribua com Pix." },
      { property: "og:title", content: "Ajude a pequena Lívia" },
      { property: "og:description", content: "Campanha de arrecadação para apoiar o tratamento da pequena Lívia." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" }],
  }),
  component: LiviaPage,
});

const PRESETS = [30, 50, 70, 100, 150, 200, 500, 700, 1000] as const;
const MINIMUM = 20;
const TARGET = 50000;
const REPORTED_RAISED = 14279.23;
const COSTS = [
  ["Cirurgião", 8000],
  ["Médico auxiliar", 2400],
  ["Anestesista", 3200],
  ["Previsão de OPME (materiais)", 2400],
  ["Previsão de despesas hospitalares", 14000],
  ["Caução hospitalar", 10000],
  ["Viagem e medicamentos em São Paulo", 10000],
] as const;

function cookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1] || "") : "";
}
function fbc() {
  const saved = cookie("_fbc");
  if (saved) return saved;
  const clickId = new URLSearchParams(window.location.search).get("fbclid");
  return clickId ? "fb.1." + Date.now() + "." + clickId : "";
}
function eventId() {
  return "livia_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
}
function technicalIdentity() {
  const bytes = new Uint8Array(12);
  window.crypto.getRandomValues(bytes);
  const id = Array.from(bytes, (v) => v.toString(16).padStart(2, "0")).join("");
  return { name: "Doador Anônimo " + id.slice(0, 6).toUpperCase(), email: "anonimo-" + id + "@example.com" };
}
function validCpf(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const digit = (part: string, initial: number) => {
    const sum = Array.from(part).reduce((v, n, i) => v + Number(n) * (initial - i), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return digit(digits.slice(0, 9), 10) === Number(digits[9]) && digit(digits.slice(0, 10), 11) === Number(digits[10]);
}

function LiviaPage() {
  const [opened, setOpened] = useState(false);
  const [chosen, setChosen] = useState<number>(30);
  const [custom, setCustom] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [charge, setCharge] = useState<UrusChargeResult | null>(null);
  const [stage, setStage] = useState<"identity" | "pix" | "paid">("identity");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const checkoutEventRef = useRef("");
  const chargeEventRef = useRef("");
  const trackedPaymentRef = useRef(false);
  const orderInfoRef = useRef<Record<string, unknown> | null>(null);

  const makeCharge = useServerFn(createUrusCharge);
  const checkCharge = useServerFn(checkUrusStatus);
  const track = useServerFn(trackDonation);
  const trackOpen = useServerFn(trackPixPageOpen);

  const selectedAmount = custom.trim() ? Number(custom.replace(",", ".")) : chosen;

  function openDonation(amount?: number) {
    if (amount !== undefined) {
      setChosen(amount);
      setCustom("");
    }
    setError("");
    setCopied(false);
    setCharge(null);
    setStage("identity");
    trackedPaymentRef.current = false;
    setOpened(true);

    // Marcar IC quando a pessoa inicia uma doação, não em uma simples visita.
    if (!checkoutEventRef.current) {
      const id = eventId() + "_ic";
      checkoutEventRef.current = id;
      trackMetaInitiateCheckout(id);
      void trackOpen({
        data: {
          event_id: id,
          fbp: cookie("_fbp") || undefined,
          fbc: fbc() || undefined,
          source_url: window.location.href,
        },
      }).catch((e) => console.warn("[Livia] Falha no rastreamento de IC", e));
    }
  }

  useEffect(() => {
    if (!opened || stage !== "pix" || !charge) return;
    let stopped = false;
    const timer = window.setInterval(async () => {
      try {
        const response = await checkCharge({ data: { venda_id: charge.venda_id } });
        if (stopped || !response.pago || trackedPaymentRef.current) return;
        trackedPaymentRef.current = true;
        window.clearInterval(timer);
        window.fbq?.("track", "Purchase", { value: charge.valor, currency: "BRL" }, { eventID: chargeEventRef.current });
        if (orderInfoRef.current) {
          void track({
            data: { ...orderInfoRef.current, stage: "paid", evento_id: chargeEventRef.current },
          } as Parameters<typeof track>[0]).catch(() => undefined);
        }
        setStage("paid");
      } catch {
        // A consulta será repetida; nunca considerar pago sem confirmação da API.
      }
    }, 5000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [opened, stage, charge, checkCharge, track]);

  useEffect(() => {
    if (!opened) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !busy) setOpened(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [opened, busy]);

  async function generatePix(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!Number.isFinite(selectedAmount) || selectedAmount < MINIMUM || selectedAmount > 1_000_000) {
      setError("Informe um valor entre R$ 20,00 e R$ 1.000.000,00.");
      return;
    }
    if (!anonymous && name.trim().length < 3) {
      setError("Informe seu nome completo ou selecione doação anônima.");
      return;
    }
    if (!validCpf(cpf)) {
      setError("Informe um CPF válido.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Informe um telefone com DDD.");
      return;
    }
    setBusy(true);
    setError("");
    const identity = technicalIdentity();
    const donorName = anonymous ? identity.name : name.trim();
    const amount = Number(selectedAmount.toFixed(2));
    const id = eventId();
    chargeEventRef.current = id;
    trackedPaymentRef.current = false;
    const items = [{ id: "doacao-livia", nome: "Doação - campanha Lívia", quantidade: 1, preco_unitario: amount }];
    try {
      const result = await makeCharge({
        data: {
          valor: amount,
          nome: donorName,
          email: identity.email,
          cpf: cpf.replace(/\D/g, ""),
          telefone: phone.replace(/\D/g, ""),
          descricao: "Doação - campanha Lívia",
          itens: items,
          ...getCampaignAttribution(),
          fbp: cookie("_fbp"),
          fbc: fbc(),
          evento_id: id,
          user_agent: navigator.userAgent,
        },
      });
      if (!result.pix_code) throw new Error("A API não retornou um código Pix.");
      setCharge(result);
      setStage("pix");
      orderInfoRef.current = {
        order_id: String(result.venda_id),
        valor: Number(result.valor || amount),
        nome: donorName,
        email: identity.email,
        cpf: cpf.replace(/\D/g, ""),
        telefone: phone.replace(/\D/g, ""),
        fbp: cookie("_fbp") || undefined,
        fbc: fbc() || undefined,
        user_agent: navigator.userAgent,
        source_url: window.location.href,
        created_at: result.created_at || new Date().toISOString().slice(0, 19).replace("T", " "),
        itens: items,
        utm: getCampaignAttribution(),
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível gerar o Pix. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    if (!charge) return;
    try {
      await navigator.clipboard.writeText(charge.pix_code);
      setCopied(true);
    } catch {
      setError("Não foi possível copiar automaticamente. Selecione o código abaixo.");
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24 font-[Inter,sans-serif] text-[#293439]">
      <div className="bg-gradient-to-r from-[#0f766e] to-[#115e59] px-4 py-10 text-center text-white sm:py-14">
        <span className="inline-block rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold sm:text-sm">
          💚 Campanha solidária da Lívia
        </span>
        <h1 className="mx-auto mt-5 max-w-[780px] text-3xl font-extrabold leading-tight sm:text-5xl">
          Ajude a pequena Lívia a realizar sua cirurgia e seu tratamento
        </h1>
        <p className="mx-auto mt-4 max-w-[650px] text-base text-teal-50">
          Conheça a história compartilhada pela família e saiba como contribuir.
        </p>
      </div>

      <main className="mx-auto max-w-[820px] space-y-7 px-4 py-7">
        <section className="rounded-2xl border border-[#cde9df] bg-[#f0fdfa] p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-extrabold text-[#115e59]">A história da pequena Lívia</h2>
          <p className="mt-3 leading-7">
            Segundo o relato apresentado pela família, Lívia tem 4 anos e enfrenta dificuldades
            relacionadas a um hemangioma no rosto, que estaria comprometendo sua visão.
            Sua mãe, Ianca, busca atendimento especializado em São Paulo e apoio para
            despesas médicas, medicamentos, exames, transporte e hospedagem.
          </p>
          <p className="mt-3 leading-7">
            A família relata a necessidade de um tratamento especializado e pede apoio
            para reunir os recursos necessários. Se você deseja conhecer e apoiar a campanha,
            confira os dados de pagamento e escolha um valor abaixo.
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white p-5 shadow-[0_4px_22px_rgba(0,0,0,0.06)] sm:p-7">
          <h2 className="mb-4 text-center text-xl font-extrabold">Assista à história</h2>
          <video controls playsInline preload="metadata" className="mx-auto aspect-[9/16] max-h-[560px] w-full max-w-[330px] rounded-xl bg-[#152827]">
            <source src="https://doeajudelivia.netlify.app/vsl_0.mp4" type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
          <p className="mt-3 text-center text-xs text-slate-500">
            Vídeo hospedado na página de origem. Sua disponibilidade depende do site original.
          </p>
        </section>

        <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-center text-sm font-bold uppercase tracking-wider text-slate-500">Progresso da campanha</h2>
          <p className="mt-3 text-center text-3xl font-extrabold text-[#0f766e]">
            {formatBRL(REPORTED_RAISED)}
          </p>
          <p className="mt-1 text-center text-sm text-slate-600">informados como arrecadados de {formatBRL(TARGET)}</p>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#e7f3ef]" role="progressbar" aria-valuenow={28.56} aria-valuemin={0} aria-valuemax={100} aria-label="Arrecadação informada">
            <div className="h-full rounded-full bg-[#0f766e]" style={{ width: "28.56%" }} />
          </div>
          <div className="mt-2 flex justify-between text-sm font-bold text-[#115e59]"><span>28,56%</span><span>Faltam {formatBRL(TARGET - REPORTED_RAISED)}</span></div>
          <p className="mt-3 text-xs text-slate-500">Valores apresentados no material original; não representam um saldo atualizado automaticamente.</p>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="mb-3 font-bold">Distribuição de custos informada ({formatBRL(TARGET)})</h3>
            {COSTS.map(([label, amount]) => (
              <div key={label} className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 text-sm">
                <span>{label}</span><strong className="whitespace-nowrap">{formatBRL(amount)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section id="doar" className="scroll-mt-6 rounded-2xl border-2 border-[#a5d7cd] bg-white p-5 shadow-[0_5px_30px_rgba(15,118,110,0.09)] sm:p-8">
          <h2 className="text-center text-2xl font-extrabold text-[#115e59]">Doe via PIX agora</h2>
          <p className="mt-2 text-center text-slate-600">Escolha um valor para gerar seu Pix com segurança.</p>
          <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
            {PRESETS.map((amount) => (
              <button key={amount} type="button" onClick={() => openDonation(amount)}
                className="min-h-14 rounded-xl border-2 border-[#0f766e] bg-[#f0fdfa] px-1 text-sm font-extrabold text-[#115e59] transition hover:bg-[#d9f6ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#115e59] sm:text-base">
                {formatBRL(amount)}
              </button>
            ))}
          </div>
          <label htmlFor="livia-custom" className="mt-5 block text-center text-sm font-semibold">
            Ou escolha outro valor (mínimo {formatBRL(MINIMUM)})
          </label>
          <div className="mt-2 flex gap-2">
            <input id="livia-custom" type="number" min={MINIMUM} step="0.01" value={custom}
              onChange={(e) => setCustom(e.target.value)} placeholder="Ex.: 25,00"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-[#0f766e]" />
            <button type="button" onClick={() => openDonation()}
              className="rounded-xl bg-[#0f766e] px-5 font-bold text-white hover:bg-[#115e59]">Doar</button>
          </div>
          <div className="mt-5 rounded-xl bg-[#f8fafc] p-4 text-xs leading-5 text-slate-700">
            <strong>Informação sobre o recebedor:</strong> os Pix desta página são processados
            pela UrusPay, usando a conta configurada pela plataforma Juntos por Vidas.
            O recebedor exibido pelo banco pode ser diferente da mãe citada na história.
            Confira o nome do favorecido no aplicativo do seu banco antes de confirmar o pagamento.
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#115e59]">Como contribuir</h2>
          <ol className="mt-3 list-inside list-decimal space-y-2 leading-7">
            <li>Escolha um dos valores da página ou informe outro valor.</li>
            <li>Informe os dados solicitados para gerar uma cobrança Pix individual.</li>
            <li>Escaneie o QR Code ou copie o código Pix e confirme o recebedor em seu banco.</li>
          </ol>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#d4eae2] bg-white/95 p-3 shadow-[0_-6px_25px_rgba(0,0,0,.10)] backdrop-blur">
        <button type="button" onClick={() => document.getElementById("doar")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="mx-auto block w-full max-w-[800px] rounded-xl bg-[#0f766e] px-5 py-3.5 text-center text-base font-extrabold text-white hover:bg-[#115e59]">
          💚 QUERO AJUDAR AGORA
        </button>
      </div>

      {opened && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) setOpened(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="livia-dialog-title"
            className="max-h-[94dvh] w-full max-w-[450px] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="livia-dialog-title" className="text-xl font-extrabold text-[#115e59]">
                  {stage === "identity" ? "Concluir sua doação" : stage === "pix" ? "Pague com PIX" : "Pagamento confirmado!"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">Campanha da Lívia • {formatBRL(charge?.valor || selectedAmount || chosen)}</p>
              </div>
              <button type="button" disabled={busy} onClick={() => setOpened(false)} aria-label="Fechar janela"
                className="rounded-full bg-slate-100 px-3 py-1 text-xl font-bold text-slate-500 hover:bg-slate-200">×</button>
            </div>
            {stage === "identity" && (
              <form onSubmit={(event) => void generatePix(event)} className="mt-6 space-y-3">
                <p className="text-sm leading-6 text-slate-600">
                  Os dados abaixo são necessários para gerar o Pix pela mesma API utilizada em /pix.
                </p>
                <label className="flex items-center gap-2 rounded-lg bg-[#f0fdfa] p-3 text-sm font-semibold">
                  <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
                  Quero doar anonimamente
                </label>
                {!anonymous && (
                  <label className="block text-sm font-semibold">Nome completo
                    <input autoComplete="name" maxLength={200} required value={name} onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-300 p-3 font-normal" placeholder="Seu nome completo" />
                  </label>
                )}
                <label className="block text-sm font-semibold">CPF
                  <input inputMode="numeric" maxLength={14} required value={cpf} onChange={(e) => setCpf(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-300 p-3 font-normal" placeholder="000.000.000-00" />
                </label>
                <label className="block text-sm font-semibold">Telefone com DDD
                  <input inputMode="tel" autoComplete="tel" maxLength={20} required value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-300 p-3 font-normal" placeholder="(21) 99999-9999" />
                </label>
                {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
                <div className="rounded-xl bg-[#f8fafc] p-3 text-xs leading-5 text-slate-700">
                  A cobrança será emitida para a conta configurada na UrusPay. Confira o nome
                  do favorecido no aplicativo do banco antes de confirmar; não presuma que
                  a mãe mencionada na campanha seja a titular da conta.
                </div>
                <button type="submit" disabled={busy}
                  className="w-full rounded-xl bg-[#0f766e] py-3.5 text-base font-extrabold text-white disabled:opacity-50">
                  {busy ? "Gerando Pix..." : "Gerar Pix de " + formatBRL(selectedAmount)}
                </button>
              </form>
            )}
            {stage === "pix" && charge && (
              <div className="mt-5 space-y-4 text-center">
                <div className="mx-auto flex w-fit items-center justify-center rounded-xl border border-slate-200 bg-white p-3">
                  {charge.qr_code_url ? (
                    <img src={charge.qr_code_url} width={216} height={216} alt="QR Code Pix gerado pela UrusPay" />
                  ) : (
                    <QRCode value={charge.pix_code} size={216} />
                  )}
                </div>
                <p className="text-sm leading-6 text-slate-600">Escaneie o QR Code ou copie o código e pague pelo aplicativo do seu banco.</p>
                <label className="block text-left text-sm font-semibold">Código PIX copia e cola
                  <textarea readOnly aria-label="Código Pix copia e cola" rows={3} value={charge.pix_code}
                    onFocus={(e) => e.currentTarget.select()} className="mt-1 block w-full resize-none break-all rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-normal" />
                </label>
                <button type="button" onClick={() => void copyCode()}
                  className="w-full rounded-xl bg-[#0f766e] py-3.5 font-extrabold text-white">
                  {copied ? "✓ Código copiado!" : "Copiar código PIX"}
                </button>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                <p className="rounded-lg bg-amber-50 p-3 text-left text-xs leading-5 text-amber-950">
                  Confirme o favorecido mostrado pelo seu banco. O PIX é processado pela conta
                  cadastrada na UrusPay para Juntos por Vidas, não necessariamente pela mãe da Lívia.
                </p>
                <p aria-live="polite" className="text-sm font-semibold text-[#0f766e]">⌛ Aguardando confirmação do pagamento...</p>
              </div>
            )}
            {stage === "paid" && (
              <div className="mt-7 space-y-3 text-center">
                <div className="text-5xl">✅</div>
                <h3 className="text-xl font-extrabold">Recebemos a confirmação do pagamento!</h3>
                <p className="text-slate-600">A UrusPay confirmou o Pix de {formatBRL(charge?.valor || 0)}. Obrigado por contribuir.</p>
                <button type="button" onClick={() => setOpened(false)}
                  className="w-full rounded-xl bg-[#0f766e] py-3 text-white">Fechar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
