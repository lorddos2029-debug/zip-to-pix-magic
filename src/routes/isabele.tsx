import { createFileRoute, Link } from "@tanstack/react-router";
import { TrackedPixLink } from "@/components/TrackedPixLink";
import { useState } from "react";
import logo from "@/assets/uploads/6662.png";

const title = "Tratamento para Isabele";
const received = 6131.53;
const goal = 30000;

export const Route = createFileRoute("/isabele")({
  head: () => ({
    meta: [
      { title: title + " | Juntos por Vidas" },
      { name: "description", content: "Conheça a história de Isabele e a busca da família por atendimento especializado para seu braço." },
      { property: "og:title", content: title },
      { property: "og:description", content: "A família de Isabele busca consultas, exames e acompanhamento especializado para a malformação no braço." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "/isabele/isabele.webp" },
    ],
    links: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" }],
  }),
  component: IsabeleCampaign,
});

type Tab = "sobre" | "atualizacoes" | "quem" | "perguntas";
const tabs: { id: Tab; label: string }[] = [
  { id: "sobre", label: "Sobre" },
  { id: "atualizacoes", label: "Atualizações" },
  { id: "quem", label: "Quem ajudou" },
  { id: "perguntas", label: "Perguntas e Respostas" },
];

const sections: { title?: string; paragraphs: string[]; items?: string[] }[] = [
  {
    "title": "A história de Isabele",
    "paragraphs": [
      "Isabele nasceu com uma malformação em um dos braços. Com o passar do tempo, a família observou mudanças e buscou diferentes avaliações médicas para entender o que acontecia.",
      "Segundo o relato da mãe, quando Isabele tinha três meses, ela apresentou uma infecção intestinal e precisou ir ao hospital. Durante o atendimento, foi coletado sangue justamente do braço que apresentava a malformação.",
      "No dia seguinte, a criança não movimentava o braço e chorava muito. A família ficou preocupada e pensou que pudesse ter ocorrido um deslocamento, mas os exames e as consultas não esclareceram a causa."
    ]
  },
  {
    "title": "As primeiras consultas",
    "paragraphs": [
      "A família procurou um ortopedista, que solicitou um raio X. Segundo a mãe, o exame não indicou uma alteração que explicasse a falta de movimento.",
      "Depois, um especialista vascular avaliou o braço. A mãe relata que recebeu a orientação de que a malformação não teria maior interferência na vida da filha e que a dificuldade de movimentação poderia estar relacionada à punção feita durante a coleta.",
      "Mesmo assim, a família continuou preocupada porque Isabele seguia com dificuldades para movimentar o braço."
    ]
  },
  {
    "title": "Uma nova internação",
    "paragraphs": [
      "Quando Isabele completou um ano e três meses, o braço voltou a apresentar perda de movimento. A mãe procurou o hospital, e a menina ficou internada para avaliação.",
      "Conforme o relato, uma equipe de cirurgia vascular reconheceu a existência da malformação, mas o tratamento não pôde ser realizado naquele hospital porque não havia estrutura de UTI para atender a criança caso fosse necessário.",
      "Depois desse episódio, a família não conseguiu dar continuidade ao atendimento especializado como gostaria."
    ]
  },
  {
    "title": "Por que Isabele precisa de ajuda agora",
    "paragraphs": [
      "Hoje, Isabele tem dois anos e onze meses. A mãe conta que ela voltou a apresentar dificuldade para movimentar o braço e quer buscar uma avaliação especializada sem demora.",
      "O objetivo desta arrecadação é tentar viabilizar um plano de saúde ou consultas e exames particulares, para que Isabele possa iniciar o acompanhamento indicado por especialistas sem depender exclusivamente do tempo de espera do SUS.",
      "A família espera conseguir esclarecimento sobre a malformação, orientações sobre as possibilidades de tratamento e acompanhamento adequado para a criança.",
      "Se puder, contribua ou compartilhe a campanha. Cada apoio ajuda essa família na busca por atendimento para Isabele."
    ],
    "items": [
      "Avaliação com especialistas, incluindo cirurgia vascular pediátrica, conforme indicação médica",
      "Consultas e exames necessários para investigar a malformação",
      "Plano de saúde ou atendimento particular, conforme as condições de contratação",
      "Acompanhamento e tratamento definidos pelos profissionais de saúde"
    ]
  }
];

const milestones = [
  {
    "month": "03",
    "year": "MESES",
    "title": "Primeira dificuldade para mover o braço",
    "text": "Após uma internação por infecção intestinal e uma coleta de sangue, a família observou que Isabele deixou de movimentar o braço. A causa não foi esclarecida."
  },
  {
    "month": "01",
    "year": "ANO",
    "title": "Nova internação para avaliação",
    "text": "Com um ano e três meses, Isabele teve outro episódio de dificuldade no braço. A mãe relata que o hospital não contava com a UTI necessária para realizar o tratamento naquele momento."
  },
  {
    "month": "02",
    "year": "ANOS",
    "title": "Busca por atendimento especializado",
    "text": "Aos dois anos e onze meses, a família relata outro episódio e busca recursos para consultas, exames e acompanhamento especializado."
  }
];

const questions = [
  [
    "Qual é a condição de Isabele?",
    "Segundo a família, Isabele nasceu com uma malformação em um dos braços. Esta página não apresenta diagnóstico médico definitivo nem afirma qual tratamento será necessário."
  ],
  [
    "Por que a campanha foi criada?",
    "Para ajudar a custear um plano de saúde ou consultas e exames particulares que permitam investigar e acompanhar a condição de Isabele."
  ],
  [
    "Isabele já tem uma cirurgia marcada?",
    "Não foi informada uma cirurgia agendada. A família quer obter avaliação médica para definir as possibilidades de tratamento."
  ],
  [
    "O que aconteceu quando Isabele tinha três meses?",
    "Durante o atendimento por uma infecção intestinal, foi coletado sangue no braço que apresentava a malformação. A mãe relata que no dia seguinte a criança não movimentava esse braço; a causa dessa alteração não foi esclarecida."
  ],
  [
    "Qual é o objetivo da arrecadação?",
    "A meta informada é R$ 30.000,00. O total arrecadado apresentado para esta página é R$ 6.131,53."
  ],
  [
    "Como faço para ajudar?",
    "Clique em Quero Ajudar para abrir o checkout Pix. Confira os dados do recebedor e o valor no seu banco antes de confirmar a doação."
  ],
  [
    "Posso ajudar sem doar?",
    "Sim. Compartilhe a história com outras pessoas para ampliar o alcance do pedido."
  ]
];

function Brand() {
  return <Link to="/" className="brand" aria-label="Página inicial"><img src={logo} alt="Juntos por Vidas" className="brand-logo" /></Link>;
}

function IsabeleCampaign() {
  const [tab, setTab] = useState<Tab>("sobre");
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: "Conheça a história de Isabele e sua família.", url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
      }
    } catch {
      // O visitante pode cancelar o compartilhamento.
    }
  };

  return <div className="campaign-page">
    <style>{styles}</style>
    <header className="topbar"><div className="topbar-inner">
      <Brand />
      <div className="top-actions">
        <button type="button" onClick={() => void share()} className="icon-button" aria-label="Compartilhar campanha">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="18" cy="5" r="2.2" /><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="19" r="2.2" />
            <path d="m8 11 7.8-4.5M8 13l7.8 4.5" />
          </svg>
        </button>
        <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
      </div>
    </div></header>
    <main className="content">
      <section className="hero-card">
        <img src="/isabele/isabele.webp" width={850} height={427} fetchPriority="high" alt="Fotografia do braço de Isabele enviada para a campanha" />
        <button type="button" className={liked ? "heart-button liked" : "heart-button"}
          aria-pressed={liked} aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          onClick={() => setLiked(!liked)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6 4.9 14C1.3 10.7 3.6 5 8.3 5c1.5 0 2.9.7 3.7 1.8C12.8 5.7 14.2 5 15.7 5c4.7 0 7 5.7 3.4 9L12 20.6Z" /></svg>
        </button>
      </section>
      <div className="meta-row"><span>SAÚDE / TRATAMENTO</span><span className="country">BRASIL</span></div>
      <h1>{title}</h1>
      <p className="campaign-id">Campanha: Tratamento para Isabele</p>

      <section className="stats" aria-label="Informações da campanha">
        <div className="progress-track" role="progressbar" aria-label="Progresso da arrecadação" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={received}>
          <div className="progress-value" style={{ width: "20.44%" }} />
        </div>
        <p className="fundraised-label">Arrecadado</p>
        <div className="raised">R$ 6.131,53</div>
        <p className="isabele-target">De R$ 30.000,00</p>
        <div className="stats-box">
          <div><span>Corações Recebidos</span><strong>615</strong></div>
          <div><span>Apoiadores</span><strong>213</strong></div>
        </div>
      </section>

      <nav className="tabs" aria-label="Informações da campanha">
        {tabs.map(item => <button type="button" key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>)}
      </nav>

      {tab === "sobre" ? <article className="story">
        {sections.map((section, i) => <section key={i}>
          {section.title && <h2>{section.title}</h2>}
          {section.paragraphs.map((paragraph, k) => <p key={k}>{paragraph}</p>)}
          {section.items && <ul className="isabele-goals">{section.items.map(item => <li key={item}>{item}</li>)}</ul>}
        </section>)}
      </article> : <section className="reference-tabs-panel" role="tabpanel" aria-label={tabs.find(item => item.id === tab)?.label}>
        {tab === "atualizacoes" && <div className="reference-updates">
          {milestones.map((item,i) => <div className="reference-update" key={i}>
            <div className="reference-date"><strong>{item.month}</strong><span>{item.year}</span></div>
            <div><strong>{item.title}</strong><p>{item.text}</p></div>
          </div>)}
          <p className="reference-legal">Estes são marcos da história relatada pela família, não um feed de atualizações em tempo real.</p>
        </div>}
        {tab === "quem" && <div className="reference-supporters" aria-label="Pessoas que ajudaram a campanha de Isabele">
          {[
            { name: "João", amount: "R$ 40,00", time: "há poucos minutos" },
            { name: "Eva", amount: "R$ 45,00", time: "há 22 minutos" },
            { name: "Bruno", amount: "R$ 45,00", time: "há 1 hora" },
            { name: "Liz", amount: "R$ 10,00", time: "há 2 horas" },
            { name: "Anônimo", amount: "R$ 100,00", time: "há 3 horas" },
            { name: "Márcia", amount: "R$ 50,00", time: "há 5 horas" },
          ].map((supporter, i) => (
            <div className="reference-supporter" key={i}>
              <span className="reference-avatar" aria-hidden="true">{supporter.name.slice(0, 1)}</span>
              <strong className="reference-supporter-name">{supporter.name}</strong>
              <div className="reference-supporter-amount"><strong>{supporter.amount}</strong><span>{supporter.time}</span></div>
            </div>
          ))}
          <p className="reference-legal">Contribuições e horários informados para publicação na campanha.</p>
        </div>}
        {tab === "perguntas" && <div className="reference-questions">
          {questions.map(([question, answer]) => <div className="reference-question" key={question}><strong>{question}</strong><p>{answer}</p></div>)}
        </div>}
      </section>}

      <footer className="footer"><Brand />
        <p>Campanha de apoio ao tratamento de <strong>Isabele</strong>.</p>
      </footer>
    </main>
    <div className="bottom-bar">
      <div className="safe-line">♡ CONTRIBUA COM SEGURANÇA</div>
      <div className="bottom-actions">
        <TrackedPixLink className="donate-button">Quero Ajudar</TrackedPixLink>
        <button type="button" className="share-button" onClick={() => void share()}>{copied ? "Link copiado!" : "Compartilhar"}</button>
      </div>
    </div>
  </div>;
}

const styles = `
.reference-tabs-panel { padding: 16px 0 28px; font-family: Inter, Arial, sans-serif; }
.reference-update { display: flex; align-items: center; gap: 13px; padding: 14px 13px; border: 1px solid #ececec; border-radius: 15px; }
.reference-date { width: 44px; min-width: 44px; height: 46px; border-radius: 14px; background: #eaf7ed; color: #14bf60; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.reference-date strong { font-size: 16px; line-height: 19px; }
.reference-date span { color: #909090; font-size: 10px; margin-top: 3px; }
.reference-update > div:last-child > strong { display: block; color: #202020; font-size: 13px; margin-bottom: 8px; }
.reference-update p { margin: 0; color: #8b8b8b; font-size: 13px; line-height: 1.6; }
.reference-legal { color: #919191; font-size: 11px; line-height: 1.6; margin: 20px 0 0; }
.reference-supporters { margin-top: -16px; }
.reference-supporter { display: flex; align-items: center; min-height: 64px; gap: 12px; padding: 12px 4px; border-bottom: 1px solid #eeeeee; }
.reference-supporter:last-child { border-bottom: none; }
.reference-avatar { height: 36px; width: 36px; min-width: 36px; display: grid; place-items: center; border-radius: 50%; background: #e9f7ed; color: #08c661; font-weight: 700; font-size: 13px; }
.reference-supporter-name { color: #1e1e1e; font-size: 13px; }
.reference-supporter-amount { margin-left: auto; display: grid; gap: 4px; text-align: right; }
.reference-supporter-amount strong { color: #05bf58; font-size: 13px; }
.reference-supporter-amount span { color: #999; font-size: 11px; }
.reference-questions { display: grid; gap: 12px; }
.reference-question { padding: 17px 14px 15px; border: 1px solid #ededed; border-radius: 15px; }
.reference-question strong { color: #111; font-size: 13px; line-height: 1.6; }
.reference-question p { margin: 8px 0 0; color: #898989; font-size: 13px; line-height: 1.8; }


.reference-panel-title { margin: 4px 0 14px; color: #222; font-size: 17px; font-weight: 700; }
.reference-panel-intro { font-size: 13px; color: #858585; line-height: 1.6; margin: 0 0 16px; }
.reference-updates { display: grid; gap: 14px; }
.reference-date { font-size: 10px; }
.reference-date strong { font-size: 12px; }
.reference-supporters { margin-top: 0; }
.reference-supporter-info { display: grid; gap: 4px; }
.reference-supporter-subtitle { font-size: 11px; color: #909090; }
.reference-supporter { align-items: center; }
.reference-legal a { color: #07984b; }

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
  object-fit: cover;
  object-position: center 36%;
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
.fundraised-label { margin: 14px 0 -8px; color: #666; font-size: 13px; font-weight: 700; }
.stats-note { margin: 8px 0 0; color: #8b8b8b; font-size: 11px; line-height: 1.5; }
.progress-track {
  width: 100%;
  height: 4px;
  background: #dfdfdf;
  border-radius: 20px;
  overflow: hidden;
}
.progress-value {
  width: 10.98%;
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

.hero-card > video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: #111;
}

.davi-goals { padding-left: 24px; margin-bottom: 22px; color: #3b3b3b; font-size: 14px; line-height: 1.8; }
.davi-goals li { padding-bottom: 4px; }
.story a,.empty-tab a { color: #07984b; }
.stats-box div { gap: 10px; }
.stats-box strong { text-align: right; }

.isabele-target { color:#888; font-size:13px; margin:4px 0 0; }
.isabele-goals { color:#3b3b3b; font-size:14px; line-height:1.8; padding-left:24px; margin:0 0 22px; }
.isabele-goals li { margin-bottom:6px; }
.reference-date { min-width:54px; width:54px; height:54px; }
.reference-date strong { font-size:12px; line-height:14px; }
.reference-date span { font-size:10px; }
.reference-supporter { gap:10px; }
.reference-supporter-amount span { max-width:150px; }
.reference-supporter-amount { align-items:end; }
@media(max-width:375px) { .reference-supporter-name {font-size:12px;} .reference-supporter-amount span {font-size:10px;} }

`;