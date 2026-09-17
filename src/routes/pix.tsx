import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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

function PixPage() {
  const [valor, setValor] = useState<number>(20);
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [bumps, setBumps] = useState<number[]>([]);

  const totalBumps = bumps.reduce((s, id) => s + (BUMPS.find((b) => b.id === id)?.preco || 0), 0);

  const toggleBump = (id: number) =>
    setBumps((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const pickValor = (v: number) => {
    setSelecionado(v);
    setValor(v);
  };

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
            min={20.0}
            step={0.01}
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            className="js-doar-value"
          />
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
            Valor mínimo: R$ 20,00
          </p>
          <button type="button" className="btn-gerar">CONTRIBUIR</button>
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
`;
