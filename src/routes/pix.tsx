import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { DonationIdentityDialog } from "@/components/DonationIdentityDialog";
import { Button } from "@/components/ui/button";

import { formatBRL } from "@/lib/pix";
import { checkUrusStatus, createUrusCharge, type UrusChargeResult } from "@/lib/urus.functions";
import { trackDonation } from "@/lib/tracking.functions";

export const Route = createFileRoute("/pix")({
  head: () => ({
    meta: [
      { title: "Ajuda por uma vida.. | UrusPay" },
      { name: "description", content: "Escolha um valor e faça sua doação via Pix." },
      { property: "og:title", content: "Ajuda por uma vida.. | UrusPay" },
      { property: "og:description", content: "Escolha um valor e faça sua doação via Pix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  component: PixPage,
});

const VALORES = [
  { label: "R$ 30", valor: 30 },
  { label: "R$ 50", valor: 50 },
  { label: "R$ 70", valor: 70 },
  { label: "R$ 100", valor: 100 },
  { label: "R$ 150", valor: 150 },
  { label: "R$ 200", valor: 200 },
  { label: "R$ 500", valor: 500 },
  { label: "R$ 700", valor: 700 },
  { label: "R$ 1000", valor: 1000 },
];
const BUMPS = [
  { id: 60, nome: "Cesta Básica", preco: 25.0, img: "/pix/cesta.png" },
  { id: 61, nome: "Auxílio Gás", preco: 29.9, img: "/pix/gas.png" },
  { id: 62, nome: "Medicamentos", preco: 27.9, img: "/pix/med.jpeg" },
];
const MIN_VALOR = 20;

// ---------- helpers de rastreamento ----------

function getQueryParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck"]) {
    const v = params.get(key);
    if (v) out[key] = v;
  }
  return out;
}

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1] ?? "") : "";
}

function getFbc(): string {
  const cookie = getCookie("_fbc");
  if (cookie) return cookie;
  if (typeof window === "undefined") return "";
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (!fbclid) return "";
  return `fb.1.${Date.now()}.${fbclid}`;
}

function gerarEventoId(): string {
  return `ev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function gerarIdentidadeAnonima(): { nome: string; email: string } {
  const bytes = new Uint8Array(12);
  window.crypto.getRandomValues(bytes);
  const identificador = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return {
    nome: `Doador Anônimo ${identificador.slice(0, 6).toUpperCase()}`,
    email: `anonimo-${identificador}@doacao.invalid`,
  };
}

// ---------- validação ----------

function validarCpf(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (pesoInicial - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(d.slice(0, 9), 10) === Number(d[9]) && digito(d.slice(0, 10), 11) === Number(d[10]);
}

function mascaraCpf(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function PixPage() {
  const [valor, setValor] = useState<number>(20);
  const [valorText, setValorText] = useState<string>("20");
  const [selecionado, setSelecionado] = useState<number | null>(20);
  const [bumps, setBumps] = useState<number[]>([]);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [identificacaoAberta, setIdentificacaoAberta] = useState(false);

  const [etapa, setEtapa] = useState<"form" | "pix" | "pago">("form");
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [cobranca, setCobranca] = useState<UrusChargeResult | null>(null);
  const eventoIdRef = useRef<string>("");

  const createCharge = useServerFn(createUrusCharge);
  const checkStatus = useServerFn(checkUrusStatus);
  const track = useServerFn(trackDonation);
  const trackDataRef = useRef<Record<string, unknown> | null>(null);

  const totalBumps = bumps.reduce((s, id) => s + (BUMPS.find((b) => b.id === id)?.preco || 0), 0);
  const total = (Number.isFinite(valor) ? valor : 0) + totalBumps;

  const toggleBump = (id: number) =>
    setBumps((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const pickValor = (v: number) => {
    setSelecionado(v);
    setValor(v);
    setValorText(String(v));
    setErro(null);
  };

  const changeValor = (text: string) => {
    setValorText(text);
    setValor(text === "" ? Number.NaN : Number(text));
    setSelecionado(null);
    setErro(null);
  };

  // Polling de status a cada 5 segundos
  useEffect(() => {
    if (etapa !== "pix" || !cobranca) return;
    const timer = window.setInterval(async () => {
      try {
        const r = await checkStatus({ data: { venda_id: cobranca.venda_id } });
        if (r.pago) {
          window.clearInterval(timer);
          window.fbq?.("track", "Purchase", {
            value: cobranca.valor,
            currency: "BRL",
            eventID: eventoIdRef.current,
          });
          const base = trackDataRef.current;
          if (base) {
            void track({
              data: { ...base, stage: "paid", evento_id: eventoIdRef.current },
            } as Parameters<typeof track>[0]).catch(() => undefined);
          }
          setEtapa("pago");
        }
      } catch {
        // ignora falhas transitórias de rede; tenta de novo no próximo ciclo
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [etapa, cobranca, checkStatus]);

  const abrirIdentificacao = () => {
    if (!Number.isFinite(valor) || valor < MIN_VALOR) {
      setErro(`O valor mínimo é R$ ${MIN_VALOR},00.`);
      return;
    }
    setErro(null);
    setIdentificacaoAberta(true);
  };

  const contribuir = async () => {
    if (gerando) return;
    if (!Number.isFinite(valor) || valor < MIN_VALOR) {
      setErro(`O valor mínimo é R$ ${MIN_VALOR},00.`);
      return;
    }
    if (!anonimo && nome.trim().length < 3) {
      setErro("Informe seu nome completo.");
      return;
    }
    if (!anonimo && !validarEmail(email)) {
      setErro("Informe um e-mail válido.");
      return;
    }
    if (!validarCpf(cpf)) {
      setErro("Informe um CPF válido.");
      return;
    }

    if (!/^\d{10,11}$/.test(telefone)) {
      setErro("Informe um celular válido com DDD.");
      return;
    }
    setErro(null);
    setGerando(true);

    const eventoId = gerarEventoId();
    eventoIdRef.current = eventoId;
    const identidade = anonimo ? gerarIdentidadeAnonima() : { nome: nome.trim(), email: email.trim() };

    const itens = [
      { id: "doacao", nome: "Doação — Ajuda por uma vida", quantidade: 1, preco_unitario: Number(valor.toFixed(2)) },
      ...bumps.flatMap((id) => {
        const b = BUMPS.find((x) => x.id === id);
        if (!b) return [];
        return [{ id: `bump-${b.id}`, nome: b.nome, quantidade: 1, preco_unitario: b.preco }];
      }),
    ];

    try {
      const r = await createCharge({
        data: {
          valor: Number(total.toFixed(2)),
          nome: identidade.nome,
          email: identidade.email,
          cpf: cpf.replace(/\D/g, ""),
          telefone: telefone || undefined,
          descricao: "Doação — Ajuda por uma vida",
          itens,
          ...getQueryParams(),
          fbp: getCookie("_fbp"),
          fbc: getFbc(),
          evento_id: eventoId,
          user_agent: navigator.userAgent,
        },
      });
      if (!r.pix_code) {
        setErro("Não foi possível gerar o Pix. Tente novamente.");
        return;
      }
      setIdentificacaoAberta(false);
      setCobranca(r);
      setEtapa("pix");

      // Rastreamento: InitiateCheckout (Pixel + CAPI) e pedido pendente na UTMify
      const base = {
        order_id: String(r.venda_id),
        valor: Number(r.valor || total),
        nome: identidade.nome,
        email: identidade.email,
        cpf: cpf.replace(/\D/g, ""),
        telefone: telefone || undefined,
        fbp: getCookie("_fbp") || undefined,
        fbc: getFbc() || undefined,
        user_agent: navigator.userAgent,
        source_url: window.location.href,
        created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
        itens,
        utm: getQueryParams(),
      };
      trackDataRef.current = base;
      window.fbq?.("track", "InitiateCheckout", {
        value: base.valor,
        currency: "BRL",
        eventID: `${eventoId}_ic`,
      });
      void track({
        data: { ...base, stage: "checkout", evento_id: `${eventoId}_ic` },
      } as Parameters<typeof track>[0]).catch(() => undefined);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar o Pix. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  const copiarCodigo = () => {
    if (!cobranca) return;
    navigator.clipboard?.writeText(cobranca.pix_code).catch(() => undefined);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  };

  const voltar = () => {
    setEtapa("form");
    setCobranca(null);
  };

  if (etapa === "pago") {
    return (
      <>
        <style>{pixCss}</style>
        <div className="container">
          <img src="/pix/vakinha-logo.png" className="logo" alt="Vakinha" width={300} height={80} />
          <div className="pago-check" aria-hidden="true">
            <svg viewBox="0 0 52 52" width="72" height="72">
              <circle className="pago-circle" cx="26" cy="26" r="25" fill="none" stroke="#27ae60" strokeWidth="2" />
              <path className="pago-path" fill="none" stroke="#27ae60" strokeWidth="3" d="M14 27l8 8 16-16" />
            </svg>
          </div>
          <h1>Pagamento confirmado! 🎉</h1>
          <p className="pix-sub">
            Muito obrigado pela sua doação de <strong>{formatBRL(cobranca?.valor ?? total)}</strong>. Que Deus abençoe sua generosidade! 🙏💚
          </p>
        </div>
      </>
    );
  }

  if (etapa === "pix" && cobranca) {
    return (
      <>
        <style>{pixCss}</style>
        <div className="container">
          <img src="/pix/vakinha-logo.png" className="logo" alt="Vakinha" width={300} height={80} />
          <h1>Ajuda por uma vida..</h1>
          <p className="pix-sub">Pague com Pix para concluir sua doação 💚</p>

          <div className="pix-total">
            Total: <strong>{formatBRL(cobranca.valor)}</strong>
          </div>

          <div className="qr-box">
            {cobranca.qr_code_url ? (
              <img src={cobranca.qr_code_url} alt="QR Code Pix" width={220} height={220} style={{ borderRadius: 8 }} />
            ) : (
              <p className="pix-hint">Use o código copia e cola abaixo.</p>
            )}
          </div>

          <p className="pix-hint">
            Abra o app do seu banco, escolha <strong>Pix &gt; Pix Copia e Cola</strong> e cole o código abaixo:
          </p>

          <div className="pix-code" onClick={copiarCodigo}>
            <span className="pix-code-text">{cobranca.pix_code}</span>
            <span className="pix-copy-badge">{copiado ? "Copiado!" : "Copiar"}</span>
          </div>

          <p className="pix-aguardando">
            <span className="spinner" aria-hidden="true" /> Aguardando confirmação do pagamento…
          </p>

          <Button type="button" variant="outline" className="btn-gerar btn-voltar h-auto" onClick={voltar}>
            VOLTAR E EDITAR
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{pixCss}</style>
      <div className="container">
        <img src="/pix/vakinha-logo.png" className="logo" alt="Vakinha" width={300} height={80} />
        <h1>Sua Ajuda Faz toda a diferença</h1>
        <p style={{ fontSize: 14, color: "#666", textAlign: "center" }}>Qual valor você deseja doar?</p>

        <div className="grid-valores">
          {VALORES.map((v) => (
            <Button
              key={v.valor}
              type="button"
              variant="outline"
              className={`btn-valor${selecionado === v.valor ? " ativo" : ""}`}
              onClick={() => pickValor(v.valor)}
            >
              {v.label}
            </Button>
          ))}
        </div>

        <div className="turbine-container">
          <div className="turbine-header">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" id="master-bump" style={{ accentColor: "#1abc9c" }} disabled checked={bumps.length > 0} readOnly />
              <span className="turbine-label">TURBINE SUA DOAÇÃO</span>
            </div>
            <span style={{ fontWeight: "bold", color: "#333", fontSize: 14 }}>
              +R$ {totalBumps.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <div className="turbine-grid">
            {BUMPS.map((b) => (
              <Button
                key={b.id}
                type="button"
                variant="outline"
                aria-pressed={bumps.includes(b.id)}
                className={`bump-card${bumps.includes(b.id) ? " ativo" : ""}`}
                onClick={() => toggleBump(b.id)}
              >
                <img src={b.img} alt={b.nome} />
                <h4>{b.nome}</h4>
                <span>R$ {b.preco.toFixed(2).replace(".", ",")}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="box-input-area">
          <p style={{ marginTop: 0, fontSize: 14, textAlign: "center" }}>
            Ajude com o valor que seu coração mandar 💚
          </p>
          <input
            type="number"
            min={MIN_VALOR}
            step={0.01}
            value={valorText}
            onChange={(e) => changeValor(e.target.value)}
            className="js-doar-value"
            aria-label="Valor da doação em reais"
          />

          {erro && !identificacaoAberta ? (
            <p className="valor-erro">{erro}</p>
          ) : (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
              Valor mínimo: R$ 20,00
            </p>
          )}
          {totalBumps > 0 && (
            <p className="total-preview">
              Doação: {formatBRL(valor || 0)} + Turbinadas: {formatBRL(totalBumps)} = <strong>{formatBRL(total)}</strong>
            </p>
          )}
          <Button type="button" className="btn-gerar h-auto" onClick={abrirIdentificacao} disabled={gerando}>
            {`CONTRIBUIR ${formatBRL(total)}`}
          </Button>
        </div>
      </div>
      <DonationIdentityDialog
        open={identificacaoAberta} onOpenChange={(open) => { setIdentificacaoAberta(open); setErro(null); }}
        nome={nome} email={email} cpf={cpf} telefone={telefone}
        anonymous={anonimo}
        onNomeChange={setNome} onEmailChange={setEmail} onCpfChange={(value) => setCpf(mascaraCpf(value))} onTelefoneChange={setTelefone}
        onAnonymousChange={(value) => { setAnonimo(value); setErro(null); }}
        total={total} busy={gerando} error={erro} onSubmit={contribuir}
      />
    </>
  );
}

const pixCss = `
* { box-sizing: border-box; }
body { font-family: "Montserrat", sans-serif; background: #f7f7f7; margin: 0; padding: 10px; }
.container { max-width: 500px; margin: 12px auto 28px; background: #fff; padding: 24px; border-radius: 16px; box-shadow: 0 4px 18px rgba(0,0,0,0.06); text-align: center; }
.logo { width: 150px; max-width: 46%; height: auto; margin: 0 auto 20px; display: block; }
h1 { font-size: 22px; color: #333; margin-bottom: 5px; line-height: 1.2; text-align: center; }
.grid-valores { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 20px 0; }
.btn-valor { height: 46px; background: #fff; border: 1.5px solid #ddd; padding: 10px; border-radius: 999px; font-weight: bold; cursor: pointer; font-size: 15px; transition: 0.2s; font-family: Montserrat, sans-serif; color: #333; }
.btn-valor.ativo { background: #e8f9e9; color: #27ae60; border-color: #27ae60; }
.turbine-container { background: #e8f9e9; border-radius: 15px; padding: 15px; margin: 20px 0; text-align: left; border: 1px solid #d4edda; }
.turbine-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.turbine-label { background: #1abc9c; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; }
.turbine-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.bump-card { height: auto; min-height: 92px; background: white; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; align-items: center; cursor: pointer; border: 2px solid transparent; transition: 0.2s; white-space: normal; color: #333; }
.bump-card.ativo { border-color: #1abc9c; }
.bump-card img { width: 35px; height: 35px; margin-bottom: 6px; border-radius: 50%; object-fit: cover; }
.bump-card h4 { font-size: 10px; margin: 0; color: #333; text-align: center; line-height: 1.2; min-height: 24px; text-transform: uppercase; }
.bump-card span { font-size: 10px; color: #1abc6c; font-weight: bold; margin-top: 5px; }
.box-input-area { background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 20px; margin-top: 15px; }
.js-doar-value { width: 85%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; text-align: center; font-size: 20px; margin-bottom: 15px; font-weight: bold; outline: none; font-family: Montserrat, sans-serif; box-shadow: 0 1px 4px rgba(0,0,0,0.06); background: #fff; }
.dados-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.dados-form input { width: 100%; padding: 12px; border: 1.5px solid #d0d0d0; border-radius: 10px; font-size: 15px; outline: none; font-family: Montserrat, sans-serif; background: #fff; }
.dados-form input:focus { border-color: #27ae60; }
.btn-gerar { background: #27ae60; color: #fff; border: none; width: 100%; padding: 18px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 18px; transition: 0.3s; font-family: Montserrat, sans-serif; }
.btn-gerar:hover { background: #219150; }
.btn-gerar:disabled { opacity: 0.7; cursor: wait; }
input { font-size: 16px; }
.valor-erro { margin: 4px 0 0; font-size: 12px; color: #c0392b; font-weight: 700; text-align: center; }
.total-preview { margin: 10px 0; font-size: 13px; color: #555; text-align: center; }
.pix-sub { font-size: 14px; color: #666; text-align: center; margin: 0 0 10px; }
.pix-total { background: #e8f9e9; border: 1px solid #d4edda; border-radius: 12px; padding: 12px; font-size: 16px; color: #1a6e2e; margin-bottom: 15px; }
.qr-box { display: flex; justify-content: center; padding: 16px; border: 1px solid #eee; border-radius: 15px; background: #fff; margin-bottom: 15px; }
.pix-hint { font-size: 13px; color: #555; margin: 0 0 10px; line-height: 1.4; }
.pix-code { display: flex; align-items: center; gap: 10px; background: #e8f9e9; border: 1px dashed #27ae60; border-radius: 12px; padding: 12px; cursor: pointer; text-align: left; }
.pix-code-text { flex: 1; font-size: 11px; color: #1a6e2e; word-break: break-all; line-height: 1.4; font-family: monospace; }
.pix-copy-badge { flex-shrink: 0; background: #27ae60; color: #fff; font-size: 12px; font-weight: bold; padding: 8px 14px; border-radius: 8px; }
.btn-voltar { background: #fff; color: #333; border: 2px solid #e0e0e0; margin-top: 15px; }
.btn-voltar:hover { background: #f5f5f5; }
.pix-note { font-size: 12px; color: #94a3b8; margin: 15px 0 0; line-height: 1.5; }
.pix-aguardando { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: #1a6e2e; font-weight: 600; margin: 14px 0 0; }
.spinner { width: 14px; height: 14px; border: 2px solid #27ae60; border-top-color: transparent; border-radius: 50%; display: inline-block; animation: girar 0.8s linear infinite; }
@keyframes girar { to { transform: rotate(360deg); } }
.pago-check { display: flex; justify-content: center; margin: 10px 0 20px; }
.pago-circle { stroke-dasharray: 157; stroke-dashoffset: 157; animation: traco 0.6s ease-out forwards; }
.pago-path { stroke-dasharray: 40; stroke-dashoffset: 40; animation: traco 0.4s ease-out 0.5s forwards; }
@keyframes traco { to { stroke-dashoffset: 0; } }
@media (max-width: 420px) {
  body { padding: 0; }
  .container { min-height: 100dvh; margin: 0; padding: 22px 16px 32px; border-radius: 0; box-shadow: none; }
  .grid-valores { gap: 8px; }
  .btn-valor { padding: 8px 4px; font-size: 14px; }
  .turbine-container { padding: 12px; }
  .box-input-area { padding: 16px 12px; }
  .js-doar-value { width: 100%; }
}
`;
