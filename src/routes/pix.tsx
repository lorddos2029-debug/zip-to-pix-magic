import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { formatBRL } from "@/lib/pix";
import { checkUrusStatus, createUrusCharge, type UrusChargeResult } from "@/lib/urus.functions";

export const Route = createFileRoute("/pix")({
  head: () => ({
    meta: [
      { title: "Ajuda por uma vida.. | UrusPay" },
      { name: "description", content: "Escolha um valor e faça sua doação via Pix." },
      { property: "og:title", content: "Ajuda por uma vida.. | UrusPay" },
      { property: "og:description", content: "Escolha um valor e faça sua doação via Pix." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  component: PixPage,
});

const VALORES = [30, 50, 70, 100, 150, 200, 500, 700, 1000];
const BUMPS = [
  { id: 60, nome: "Cesta Básica", preco: 65.0, img: "/pix/cesta.png" },
  { id: 61, nome: "Auxílio Gás", preco: 29.9, img: "/pix/gas.png" },
  { id: 62, nome: "Medicamentos", preco: 39.7, img: "/pix/med.jpeg" },
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

  const [etapa, setEtapa] = useState<"form" | "pix" | "pago">("form");
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [cobranca, setCobranca] = useState<UrusChargeResult | null>(null);
  const eventoIdRef = useRef<string>("");

  const createCharge = useServerFn(createUrusCharge);
  const checkStatus = useServerFn(checkUrusStatus);

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
          setEtapa("pago");
        }
      } catch {
        // ignora falhas transitórias de rede; tenta de novo no próximo ciclo
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [etapa, cobranca, checkStatus]);

  const contribuir = async () => {
    if (!Number.isFinite(valor) || valor < MIN_VALOR) {
      setErro(`O valor mínimo é R$ ${MIN_VALOR},00.`);
      return;
    }
    if (nome.trim().length < 3) {
      setErro("Informe seu nome completo.");
      return;
    }
    if (!validarEmail(email)) {
      setErro("Informe um e-mail válido.");
      return;
    }
    if (!validarCpf(cpf)) {
      setErro("Informe um CPF válido.");
      return;
    }

    setErro(null);
    setGerando(true);

    const eventoId = gerarEventoId();
    eventoIdRef.current = eventoId;

    const itens = [
      { id: "doacao", nome: "Doação — Ajuda por uma vida", quantidade: 1, preco_unitario: Number(valor.toFixed(2)) },
      ...bumps.map((id) => {
        const b = BUMPS.find((x) => x.id === id)!;
        return { id: `bump-${b.id}`, nome: b.nome, quantidade: 1, preco_unitario: b.preco };
      }),
    ];

    try {
      const r = await createCharge({
        data: {
          valor: Number(total.toFixed(2)),
          nome: nome.trim(),
          email: email.trim(),
          cpf: cpf.replace(/\D/g, ""),
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
      setCobranca(r);
      setEtapa("pix");
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
          <img src="/pix/logo.jpeg" className="logo" alt="Solidarize para o bem" />
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
          <img src="/pix/logo.jpeg" className="logo" alt="Solidarize para o bem" />
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

          <button type="button" className="btn-gerar btn-voltar" onClick={voltar}>
            VOLTAR E EDITAR
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{pixCss}</style>
      <div className="container">
        <img src="/pix/logo.jpeg" className="logo" alt="Solidarize para o bem" />
        <h1>Ajuda por uma vida..</h1>
        <p style={{ fontSize: 14, color: "#666", textAlign: "center" }}>Qual valor você deseja doar?</p>

        <div className="grid-valores">
          {VALORES.map((v) => (
            <button
              key={v}
              type="button"
              className={`btn-valor${selecionado === v ? " ativo" : ""}`}
              onClick={() => pickValor(v)}
            >
              R$ {v}
            </button>
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
              <div
                key={b.id}
                className={`bump-card${bumps.includes(b.id) ? " ativo" : ""}`}
                onClick={() => toggleBump(b.id)}
              >
                <img src={b.img} alt={b.nome} />
                <h4>{b.nome}</h4>
                <span>R$ {b.preco.toFixed(2).replace(".", ",")}</span>
              </div>
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

          <div className="dados-form">
            <input
              type="text"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              aria-label="Nome completo"
            />
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-label="E-mail"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="CPF (000.000.000-00)"
              value={cpf}
              onChange={(e) => setCpf(mascaraCpf(e.target.value))}
              autoComplete="off"
              aria-label="CPF"
            />
          </div>

          {erro ? (
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
          <button type="button" className="btn-gerar" onClick={contribuir} disabled={gerando}>
            {gerando ? "GERANDO PIX…" : `CONTRIBUIR ${formatBRL(total)}`}
          </button>
        </div>
      </div>
    </>
  );
}

const pixCss = `
* { box-sizing: border-box; }
body { font-family: "Montserrat", sans-serif; background: #f4f4f4; margin: 0; padding: 10px; }
.container { max-width: 500px; margin: 20px auto; background: #fff; padding: 25px; border-radius: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); text-align: center; }
.logo { max-width: 150px; height: auto; margin: 0 auto 15px; display: block; border-radius: 15px; }
h1 { font-size: 22px; color: #333; margin-bottom: 5px; line-height: 1.2; text-align: center; }
.grid-valores { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 20px 0; }
.btn-valor { background: #fff; border: 1.5px solid #ddd; padding: 12px; border-radius: 50px; font-weight: bold; cursor: pointer; font-size: 15px; transition: 0.3s; font-family: Montserrat, sans-serif; }
.btn-valor.ativo { background: #27ae60; color: #fff; border-color: #27ae60; }
.turbine-container { background: #e8f9e9; border-radius: 15px; padding: 15px; margin: 20px 0; text-align: left; border: 1px solid #d4edda; }
.turbine-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.turbine-label { background: #1abc9c; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; }
.turbine-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.bump-card { background: white; border-radius: 12px; padding: 10px; display: flex; flex-direction: column; align-items: center; cursor: pointer; border: 2px solid transparent; transition: 0.2s; }
.bump-card.ativo { border-color: #1abc9c; }
.bump-card img { width: 35px; height: 35px; margin-bottom: 6px; border-radius: 50%; object-fit: cover; }
.bump-card h4 { font-size: 10px; margin: 0; color: #333; text-align: center; line-height: 1.2; min-height: 24px; text-transform: uppercase; }
.bump-card span { font-size: 10px; color: #1abc6c; font-weight: bold; margin-top: 5px; }
.box-input-area { background: #e0e0e0; padding: 20px; border-radius: 20px; margin-top: 15px; }
.js-doar-value { width: 85%; padding: 12px; border: none; border-radius: 10px; text-align: center; font-size: 20px; margin-bottom: 15px; font-weight: bold; outline: none; font-family: Montserrat, sans-serif; }
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
`;
