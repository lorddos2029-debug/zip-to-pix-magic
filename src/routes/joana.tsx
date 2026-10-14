import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/uploads/6662.png";

// Arquivo fornecido para esta campanha; instalar em public/joana/joana-foto.jpg.
const joanaHero = "/joana/joana-foto.jpg";

export const Route = createFileRoute("/joana")({
  head: () => ({
    meta: [
      { title: "Todos pela nossa Cristal Joana | Juntos por Vidas" },
      {
        name: "description",
        content:
          "Conheça Joana Jesus da Rocha, de 8 anos, que nasceu com osteogênese imperfeita tipo 3.",
      },
      { property: "og:title", content: "Todos pela nossa Cristal Joana" },
      {
        property: "og:description",
        content:
          "Joana vive com a doença dos ossos de cristal e precisa de apoio para cirurgias e cuidados contínuos.",
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
  component: JoanaCampaign,
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
    <Link to="/" className="brand" aria-label="Vakinha">
      <img src={logo} alt="Vakinha" className="brand-logo" />
    </Link>
  );
}

function JoanaCampaign() {
  const [tab, setTab] = useState<Tab>("sobre");
  const [liked, setLiked] = useState(false);

  const share = () => {
    const data = {
      title: "Ajude a Joana",
      text: "Conheça a história da Joana e compartilhe.",
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
            src={joanaHero}
            alt="Joana deitada em um leito, na foto enviada para a campanha"
            width={700}
            height={410}
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

        <h1>💙 TODOS PELA NOSSA CRISTAL JOANA 💙</h1>
        <p className="campaign-id">Joana Jesus da Rocha · Balneário Rincão - SC</p>

        <section className="stats">
          <div className="progress-track" aria-label="Progresso da arrecadação">
            <div className="progress-value" />
          </div>
          <div className="raised">
            R$ 1.400,00 <span>de R$ 100.000,00</span>
          </div>

          <div className="stats-box">
            <div>
              <span>Corações Recebidos</span>
              <strong>—</strong>
            </div>
            <div>
              <span>Apoiadores</span>
              <strong>—</strong>
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
          <article className="story" id="historia-joana">
            <p>{"💙 TODOS PELA NOSSA CRISTAL JOANA 💙"}</p>
            <p>{"Olá, eu sou Joana Jesus da Rocha, tenho 8 anos e moro em Balneário Rincão - SC."}</p>
            <p>{"Nasci com uma doença rara chamada Osteogênese Imperfeita Tipo 3, conhecida como a doença dos ossos de cristal. Antes mesmo de nascer, eu já sofria fraturas dentro da barriga da minha mamãe."}</p>
            <p>{"Durante meus 8 anos de vida, enfrentei inúmeras fraturas, cirurgias, internações e muita dor. Eu não preciso cair para me quebrar. Posso sofrer uma fratura ao vestir uma roupa, durante um movimento simples ou até mesmo em um espirro."}</p>
            <img
              className="story-image"
              src={joanaHero}
              alt="Joana na foto enviada pela família para a campanha"
              width={700}
              height={410}
              loading="lazy"
            />
            <p>{"Sou cadeirante e tenho deformidades graves nas pernas por causa das fraturas frequentes. Não consigo sustentar meu corpinho e dependo totalmente dos cuidados da minha mamãe."}</p>
            <p>{"Mas apesar de tudo isso, eu tenho um grande sonho: ✨ ANDAR. ✨"}</p>
            <p>{"Os médicos acreditam que, realizando todas as cirurgias necessárias e os tratamentos adequados, tenho cerca de 80% de chance de realizar esse sonho."}</p>
            <p>{"Já passei por 6 cirurgias, mas ainda faltam 2 cirurgias muito importantes para corrigir as deformidades dos meus ossos e dar sustentação ao meu corpo."}</p>
            <p>{"Cada haste necessária para essas cirurgias custa aproximadamente R$ 55.000,00."}</p>
            <p>{"Após as cirurgias, ainda precisarei de tratamentos contínuos, como:"}</p>
            <p style={{ whiteSpace: "pre-line" }}>{"💙 Hidroterapia\n💙 Fisioterapia\n💙 Consultas médicas especializadas\n💙 Medicamentos"}</p>
            <p>{"Minha doença é grave. O maior período que fiquei sem sofrer uma fratura foi apenas 15 dias. Vivo entre talas, ataduras, gessos, medicamentos, hospitais e viagens para tratamento."}</p>
            <p>{"Minha mamãe, Albani Bagé de Jesus, dedica a vida inteira aos meus cuidados. Somos apenas nós duas nessa luta. Ela não consegue trabalhar porque precisa cuidar de mim 24 horas por dia."}</p>
            <p>{"Também precisamos de ajuda para itens essenciais do meu dia a dia:"}</p>
            <p style={{ whiteSpace: "pre-line" }}>{"🍼 Leite NESLAC Supreme 3+\n🩲 Fraldas XXXG\n🧻 Lenços umedecidos\n💊 Medicamentos"}</p>
            <p>{"Mesmo diante de tantas dificuldades, nunca perdemos a fé. Eu acredito que Deus tem um propósito para minha vida e que meu sonho vai se realizar."}</p>
            <p>{"Por isso, peço a sua ajuda."}</p>
            <p style={{ whiteSpace: "pre-line" }}>{"🙏 Qualquer valor faz diferença.\n🙏 Se não puder doar, compartilhe.\n🙏 Ajude a levar minha história mais longe."}</p>
            <p>{"Sua contribuição pode me ajudar a ter uma vida mais digna, com menos dor e mais esperança."}</p>
            <p>{"Ajude a nossa Cristal Joana a realizar o sonho de andar."}</p>
            <p className="legal">
              Relato, informações médicas e estimativas fornecidos pela família.
              Os valores apresentados foram informados para a campanha
              e não são atualizados automaticamente pelo checkout.
            </p>
          </article></article>
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
            Campanha de apoio à <strong>Joana</strong> e sua mãe, Albani.
          </p>
        </footer>
      </main>

      <div className="bottom-bar">
        <div className="safe-line">♡ CONTRIBUA COM SEGURANÇA</div>
        <div className="bottom-actions">
          <Link to="/pix" className="donate-button">Quero Ajudar</Link>
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
  background: #eee;
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
  width: 1.4%;
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
