import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import QRCode from "react-qr-code";
import { buildPixPayload, formatBRL } from "@/lib/pix";

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

function PixPage() {
  const [valor, setValor] = useState<number>(20);
  const [valorText, setValorText] = useState<string>("20");
  const [selecionado, setSelecionado] = useState<number | null>(20);
  const [bumps, setBumps] = useState<number[]>([]);
  const [etapa, setEtapa] = useState<"form" | "pix">("form");
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

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

  const contribuir = () => {
    if (!Number.isFinite(valor) || valor < MIN_VALOR) {
      setErro(`O valor mínimo é R$ ${MIN_VALOR},00.`);
      return;
    }
    setErro(null);
    setEtapa("pix");
  };

  const copiarCodigo = () => {
    navigator.clipboard?.writeText(buildPixPayload(total)).catch(() => undefined);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  };

  if (etapa === "pix") {
    const payload = buildPixPayload(total);
    return (
      <>
        <style>{pixCss}</style>
        <div className="container">
          <img src="/pix/logo.jpeg" className="logo" alt="Solidarize para o bem" />
          <h1>Ajuda por uma vida..</h1>
          <p className="pix-sub">Pague com Pix para concluir sua doação 💚</p>

          <div className="pix-total">
            Total: <strong>{formatBRL(total)}</strong>
          </div>

          <div className="qr-box">
            <QRCode value={payload} size={220} bgColor="#ffffff" fgColor="#1a6e2e" />
          </div>

          <p className="pix-hint">
            Abra o app do seu banco, escolha <strong>Pix &gt; Pix Copia e Cola</strong> e cole o código abaixo:
          </p>

          <div className="pix-code" onClick={copiarCodigo}>
            <span className="pix-code-text">{payload}</span>
            <span className="pix-copy-badge">{copiado ? "Copiado!" : "Copiar"}</span>
          </div>

          <button type="button" className="btn-gerar btn-voltar" onClick={() => setEtapa("form")}>
            VOLTAR E EDITAR VALOR
          </button>

          <p className="pix-note">
            Após o pagamento, guarde o comprovante. Sua doação chega direto na conta da campanha. 🙏
          </p>
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
          <button type="button" className="btn-gerar" onClick={contribuir}>
            CONTRIBUIR {totalBumps > 0 ? formatBRL(total) : ""}
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
.btn-gerar { background: #27ae60; color: #fff; border: none; width: 100%; padding: 18px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 18px; transition: 0.3s; font-family: Montserrat, sans-serif; }
.btn-gerar:hover { background: #219150; }
input { font-size: 16px; }
.valor-erro { margin: "4px 0 0"; font-size: 12px; color: #c0392b; font-weight: 700; text-align: center; }
.total-preview { margin: "10px 0"; font-size: 13px; color: #555; text-align: center; }
.pix-sub { font-size: 14px; color: "#666"; text-align: center; margin: 0 0 10px; }
.pix-total { background: #e8f9e9; border: 1px solid #d4edda; border-radius: 12px; padding: 12px; font-size: 16px; color: #1a6e2e; margin-bottom: 15px; }
.qr-box { display: flex; justify-content: center; padding: 16px; border: 1px solid #eee; border-radius: 15px; background: #fff; margin-bottom: 15px; }
.pix-hint { font-size: 13px; color: #555; margin: 0 0 10px; line-height: 1.4; }
.pix-code { display: flex; align-items: center; gap: 10px; background: #e8f9e9; border: 1px dashed #27ae60; border-radius: 12px; padding: 12px; cursor: pointer; text-align: left; }
.pix-code-text { flex: 1; font-size: 11px; color: #1a6e2e; word-break: break-all; line-height: 1.4; font-family: monospace; }
.pix-copy-badge { flex-shrink: 0; background: #27ae60; color: #fff; font-size: 12px; font-weight: bold; padding: 8px 14px; border-radius: 8px; }
.btn-voltar { background: #fff; color: #333; border: 2px solid #e0e0e0; margin-top: 15px; }
.btn-voltar:hover { background: #f5f5f5; }
.pix-note { font-size: 12px; color: #94a3b8; margin: 15px 0 0; line-height: 1.5; }
`;
