import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

// Fotografias publicadas na página original da campanha de Melissa.
// O script scripts/install-melissa-assets.sh faz a cópia para /public/melissa.
const melissaHero = "/melissa/melissa-hero.jpeg";
const melissaBanner = "/melissa/melissa-banner.png";
const originalCampaignUrl = "https://melissadelua.com.br/";

export const Route = createFileRoute("/melissa")({
  head: () => ({
    meta: [
      { title: "Ajude a Melissa | Juntos por Vidas" },
      {
        name: "description",
        content:
          "Conheça a história da Melissa, de 7 anos, e sua campanha para retomar fisioterapia e outros cuidados.",
      },
      { property: "og:title", content: "Ajude a Melissa" },
      {
        property: "og:description",
        content:
          "Melissa tem paralisia cerebral. Sua família busca apoio para terapias e preparação para uma cirurgia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: MelissaCampaign,
});

type Tab = "sobre" | "atualizacoes" | "quem" | "perguntas";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "sobre", label: "Sobre" },
  { id: "atualizacoes", label: "Atualizações" },
  { id: "quem", label: "Quem ajudou" },
  { id: "perguntas", label: "Perguntas e Respostas" },
];

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Juntos por Vidas">
      <img src="/pix/logo-juntos.png" alt="Juntos por Vidas" className="brand-logo" />
    </Link>
  );
}

function MelissaCampaign() {
  const [tab, setTab] = useState<Tab>("sobre");
  const [liked, setLiked] = useState(false);

  const share = () => {
    const data = {
      title: "Ajude a Melissa",
      text: "Conheça a história da Melissa e compartilhe.",
      url: window.location.href,
    };

    if (navigator.share) {
      void navigator.share(data).catch(() => undefined);
      return;
    }

    void navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  return (
    <div className="campaign-page">
      <style>{styles}</style>

      <header className="topbar">
        <div className="topbar-inner">
          <Brand />
          <div className="top-actions">
            <button type="button" aria-label="Compartilhar campanha" onClick={share} className="icon-button">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="18" cy="5" r="2.2" />
                <circle cx="6" cy="12" r="2.2" />
                <circle cx="18" cy="19" r="2.2" />
                <path d="m8 11 7.8-4.5M8 13l7.8 4.5" />
              </svg>
            </button>
            <span className="menu-icon" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
      </header>

      <main className="content">
        <section className="hero-card">
          <img
            src={melissaHero}
            alt="Melissa durante uma sessão de reabilitação"
            width={400}
            height={481}
            fetchPriority="high"
          />
          <button
            type="button"
            aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={liked}
            onClick={() => setLiked((value) => !value)}
            className={`heart-button${liked ? " liked" : ""}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20.6 4.9 14C1.3 10.7 3.6 5 8.3 5c1.5 0 2.9.7 3.7 1.8C12.8 5.7 14.2 5 15.7 5c4.7 0 7 5.7 3.4 9L12 20.6Z" />
            </svg>
          </button>
        </section>

        <div className="meta-row">
          <span>SOLIDARIEDADE</span>
          <span className="country">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s6-5.6 6-12a6 6 0 1 0-12 0c0 6.4 6 12 6 12Z" />
              <circle cx="12" cy="9" r="2" />
            </svg>
            BRASIL
          </span>
        </div>

        <h1>Ajude a Melissa</h1>
        <p className="campaign-id">Informações da campanha de Melissa</p>

        <section className="stats">
          <div className="progress-track" aria-label="Progresso da arrecadação">
            <div className="progress-value" />
          </div>
          <div className="raised">
            R$ 21.000,00 <span>de R$ 43.200,00</span>
          </div>

          <div className="stats-box">
            <div>
              <span>Corações Recebidos</span>
              <strong>231</strong>
            </div>
            <div>
              <span>Apoiadores</span>
              <strong>264</strong>
            </div>
          </div>
        </section>

        <nav className="tabs" aria-label="Informações da campanha">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? "active" : ""}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "sobre" ? (
          <article className="story">
            <p>
              Melissa tem 7 anos e sonha em andar com mais independência.
              Segundo a família, ela tem paralisia cerebral e precisa
              retomar o acompanhamento terapêutico, interrompido nos últimos
              meses por falta de recursos.
            </p>

            <img
              className="story-image melissa-photo"
              src={melissaHero}
              alt="Melissa durante uma atividade de fisioterapia"
              width={750}
              height={1000}
              loading="lazy"
            />

            <h2>Conheça a história da Melissa</h2>
            <p>
              A paralisia cerebral é uma condição que afeta os movimentos e a
              postura, e pode exigir acompanhamento contínuo de profissionais de
              saúde. Os desafios e possibilidades variam de pessoa para pessoa.
              Para Melissa, a família relata a necessidade de fisioterapia intensiva
              para a preparação de uma cirurgia relacionada à mobilidade.
            </p>
            <p>
              No relato publicado no site original, a família conta que a
              interrupção dos tratamentos e a demora no atendimento têm sido
              dificuldades importantes. O objetivo é reunir recursos para que
              ela possa voltar às terapias e chegar à cirurgia com o
              acompanhamento indicado por sua equipe de saúde.
            </p>
            <img
              className="story-image melissa-banner"
              src={melissaBanner}
              alt="Imagem da campanha original: Melissa sonha em andar"
              width={1024}
              height={512}
              loading="lazy"
            />
            <p>
              A meta anunciada na campanha original é de R$ 43.200,00,
              destinada a seis meses de fisioterapia e outras terapias,
              consultas médicas, medicamentos e cuidados essenciais.
              O valor de R$ 21.000,00 indicado como arrecadado nesta página
              foi fornecido para esta publicação e não foi confirmado
              diretamente no site original.
            </p>
            <p>
              <strong>
                Conheça a campanha da Melissa e, se puder ajudar, faça sua
                contribuição pelo site original da família.
              </strong>
            </p>
            <p>
              <a href={originalCampaignUrl} target="_blank" rel="noopener noreferrer">
                Acessar a campanha original da Melissa
              </a>
            </p>
            <p className="legal">
              História e fotografias provenientes de melissadelua.com.br.
              Valores de arrecadação, corações e apoiadores apresentados conforme
              as informações fornecidas para esta página, sem verificação
              independente. Esta página é informativa e não é operada
              pela campanha original.
            </p>
          </article>
        ) : (
          <section className="empty-tab">
            {tab === "atualizacoes" && "Nenhuma atualização publicada no momento."}
            {tab === "quem" && "As informações de apoiadores serão exibidas aqui quando estiverem disponíveis."}
            {tab === "perguntas" && "Nenhuma pergunta publicada no momento."}
          </section>
        )}

        <footer className="footer">
          <Brand />
          <p>
            Divulgação da história de <strong>Melissa</strong>. As contribuições são feitas
            diretamente na <a href={originalCampaignUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "underline" }}>campanha original</a>.
          </p>
        </footer>
      </main>

      <div className="bottom-bar">
        <div className="safe-line">♡ CONTRIBUA COM SEGURANÇA</div>
        <div className="bottom-actions">
          <a href={originalCampaignUrl} target="_blank" rel="noopener noreferrer" className="donate-button">Quero Ajudar</a>
          <button type="button" className="share-button" onClick={share}>Compartilhar</button>
        </div>
      </div>
    </div>
  );
}

const styles = `
:root {
  --green: #20c96b;
  --green-dark: #07984b;
  --green-soft: #d5ffc5;
  --ink: #2e2e2e;
  --muted: #8b8b8b;
  --line: #e8e8e8;
}

* { box-sizing: border-box; }
html { background: #f2f2f2; }
body {
  margin: 0;
  background: #f2f2f2;
  color: var(--ink);
  font-family: Inter, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
button, a { font: inherit; }
button { cursor: pointer; }

.campaign-page {
  min-height: 100vh;
  padding-bottom: 158px;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #ededed;
}
.topbar-inner {
  width: 100%;
  max-width: 520px;
  height: 56px;
  margin: 0 auto;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--green);
  font-size: 17px;
  font-weight: 800;
  text-decoration: none;
}
.brand-logo {
  width: 118px;
  height: auto;
  display: block;
}
.top-actions {
  display: flex;
  align-items: center;
  gap: 18px;
}
.icon-button {
  width: 28px;
  height: 28px;
  padding: 2px;
  border: 0;
  background: transparent;
}
.icon-button svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: var(--green);
  stroke-width: 1.8;
}
.menu-icon {
  width: 20px;
  display: grid;
  gap: 4px;
}
.menu-icon i {
  display: block;
  height: 2px;
  border-radius: 3px;
  background: #222;
}

.content {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  background: #fff;
  min-height: calc(100vh - 56px);
  padding: 14px 14px 0;
}

.hero-card {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
  border-radius: 11px;
  background: #f8f8f8;
}
.hero-card > img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
  display: block;
}
.heart-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 42px;
  height: 42px;
  border: 1px solid #e2e2e2;
  border-radius: 50%;
  background: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 2px 7px rgba(0,0,0,.08);
}
.heart-button svg {
  width: 23px;
  height: 23px;
  fill: none;
  stroke: #cfcfcf;
  stroke-width: 1.7;
}
.heart-button.liked svg {
  fill: var(--green);
  stroke: var(--green);
}

.meta-row {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #919191;
  font-size: 11px;
  font-weight: 600;
}
.country {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.country svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
}

h1 {
  margin: 11px 0 4px;
  font-size: 21px;
  line-height: 1.18;
  font-weight: 800;
}
.campaign-id {
  margin: 0 0 18px;
  font-size: 12px;
  color: #5e5e5e;
  font-weight: 600;
}

.stats { margin-bottom: 24px; }
.progress-track {
  width: 100%;
  height: 4px;
  background: #dfdfdf;
  border-radius: 20px;
  overflow: hidden;
}
.progress-value {
  width: 48.61%;
  height: 100%;
  background: var(--green);
  border-radius: inherit;
}
.raised {
  margin-top: 13px;
  color: var(--green);
  font-size: 22px;
  font-weight: 800;
}
.raised span {
  color: #8b8b8b;
  font-size: 13px;
  font-weight: 400;
}
.stats-box {
  margin-top: 18px;
  border: 1px solid #e5f0e8;
  border-radius: 14px;
  padding: 13px 14px;
  display: grid;
  gap: 14px;
}
.stats-box div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #6e6e6e;
  font-size: 13px;
}
.stats-box strong {
  color: #333;
  font-size: 13px;
}

.tabs {
  margin: 0 -1px;
  border-bottom: 1px solid #e9e9e9;
  display: flex;
  gap: 23px;
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }
.tabs button {
  flex: 0 0 auto;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  padding: 11px 0;
  color: #929292;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.tabs button.active {
  color: var(--green);
  border-bottom-color: var(--green);
}

.story {
  padding-top: 17px;
}
.story p {
  margin: 0 0 20px;
  color: #3b3b3b;
  font-size: 14px;
  line-height: 1.78;
}
.story-image {
  width: 100%;
  max-height: 470px;
  object-fit: cover;
  object-position: center top;
  display: block;
  margin: 18px 0 24px;
  border-radius: 14px;
}
.story-image.melissa-photo {
  max-height: none;
  object-fit: contain;
}
.story-image.melissa-banner {
  max-height: none;
  object-fit: contain;
}
.story .created {
  font-size: 12px;
  color: #444;
  margin: 0 0 22px;
}
.story h2 {
  margin: 0 0 17px;
  font-size: 18px;
  font-weight: 700;
}
.story .legal {
  margin-top: 28px;
  color: #929292;
  font-size: 11px;
  line-height: 1.65;
}

.empty-tab {
  min-height: 260px;
  padding: 26px 4px;
  color: #777;
  font-size: 14px;
  line-height: 1.6;
}

.footer {
  margin: 40px -14px 0;
  padding: 28px 14px 30px;
  background: #292929;
  color: #fff;
}
.footer .brand {
  margin-bottom: 20px;
  font-size: 17px;
}
.footer p {
  margin: 0;
  color: #d8d8d8;
  font-size: 12px;
  line-height: 1.55;
}

.bottom-bar {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 50;
  width: 100%;
  max-width: 520px;
  transform: translateX(-50%);
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,.08);
}
.safe-line {
  height: 42px;
  display: grid;
  place-items: center;
  background: var(--green-soft);
  color: #16894b;
  font-size: 11px;
  font-weight: 800;
}
.bottom-actions {
  padding: 12px 14px 14px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 9px;
}
.donate-button,
.share-button {
  min-height: 56px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
  font-weight: 800;
}
.donate-button {
  border: 1px solid var(--green);
  background: var(--green);
  color: #fff;
}
.share-button {
  border: 2px solid #e1e1e1;
  background: #fff;
  color: #353535;
}

@media (min-width: 521px) {
  .content {
    box-shadow: 0 0 0 1px rgba(0,0,0,.03);
  }
  .hero-card { height: 300px; }
}
`;
