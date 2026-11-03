import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/uploads/6662.png";

const familyUrl = "https://www.instagram.com/fabilakemi14/";
const title = "Davi, que foi torturado e espancado pela madrasta, precisa realizar um tratamento neurológico nos EUA";
const received = 225083.79;
const goal = 230000;

export const Route = createFileRoute("/davi")({
  head: () => ({
    meta: [
      { title: "A história do Davi | Juntos por Vidas" },
      { name: "description", content: "Conheça a história de Davi e os desafios do tratamento e da reabilitação." },
      { property: "og:title", content: title },
      { property: "og:description", content: "Acompanhe a história de Davi e consulte os canais oficiais da família." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" }],
  }),
  component: DaviCampaign,
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
    paragraphs: [
      "Davi foi brutalmente agredido pela madrasta e sobreviveu a uma parada cardíaca. Já passou por cirurgias, ficou na UTI e enfrentou regressões no tratamento.",
      "Em 2023, uma primeira vaquinha garantiu o início de tratamentos. Em 2024, uma nova campanha foi aberta para custear uma etapa de reabilitação que poderia ajudar Davi a voltar a andar.",
      "Segundo o relato da família, em 2025, Davi teve uma complicação grave e voltou à UTI. Foi aberta uma terceira vaquinha para os custos, mas algumas dívidas permaneceram. Agora a família busca recursos para uma nova cirurgia, a quitação de despesas hospitalares e a avaliação de tratamento neurológico nos Estados Unidos.",
    ],
  },
  {
    title: "Entenda",
    paragraphs: [
      "Até os 4 anos, Davi era uma criança como qualquer outra. Corria, brincava, sorria o tempo inteiro. Era descrito como carinhoso, leve e cheio de vida. Tudo mudou em um fim de semana.",
      "Davi vivia entre a casa da mãe, Fábila, e a do pai biológico, com guarda compartilhada. Quando o pai começou um novo relacionamento, os filhos passaram a relatar que a então companheira dele os maltratava. Fábila desconfiou, fez boletim de ocorrência e passou a restringir as visitas.",
      "Um mês depois, o pai insistiu para passar um fim de semana com os filhos na casa da avó paterna. Prometeu que no domingo devolveria Davi, mas pediu para estender a visita até quinta-feira. Disse que iriam ao cinema e que Davi estava feliz. Na quinta-feira à noite, Fábila recebeu uma ligação: Davi estava no hospital, em coma.",
      "Quando ela chegou, encontrou o filho cheio de hematomas e ferimentos graves, inclusive na região genital. O menino já havia sido levado a um pronto-socorro dias antes sem que ela fosse avisada. As agressões provocaram uma parada cardíaca, e a falta de oxigenação deixou graves sequelas cerebrais.",
      "Davi ficou dois meses internado, sendo 20 dias na UTI. O menino que corria passou a não andar, não falar, utilizar sonda para se alimentar e viver com traqueostomia.",
      "A madrasta foi condenada a 62 anos de prisão. O pai recebeu pena de 14 anos por omissão. O julgamento aconteceu em Manaus, em dezembro de 2024. O irmão de Davi, também afetado pela violência, foi uma das testemunhas.",
      "Mas, para Davi, sobreviver foi só o começo.",
    ],
  },
  {
    title: "As fases anteriores da luta",
    paragraphs: [
      "Antes de a história ganhar visibilidade, Fábila fazia rifas de fone de ouvido e relógio para pagar fisioterapia e fonoaudiologia.",
      "Em agosto de 2023, a história viralizou e a primeira vaquinha atingiu rapidamente a meta. O valor permitiu cirurgias neurológicas e ortopédicas importantes. De 2024 para 2025, uma nova campanha buscou financiar tratamento para melhorar a mobilidade de Davi.",
      "Mais tarde, Davi teve uma complicação grave e voltou à UTI. O dinheiro guardado para uma viagem internacional foi usado para honorários médicos e diárias hospitalares. Uma nova vaquinha foi aberta, mas, segundo o relato da família, algumas dívidas permaneceram.",
      "Se a dívida hospitalar não for quitada, Fábila teme negativação, cobrança judicial, juros e multas, o que poderia dificultar parcelamentos e financiamentos futuros enquanto cuida do filho.",
      "Quitar a dívida seria importante para a continuidade dos cuidados e da reabilitação de Davi.",
    ],
  },
  {
    title: "A estagnação do tratamento no Brasil",
    paragraphs: [
      "Fábila está hoje em Londrina, mas a família é de Manaus. Ela relata que cuida praticamente sozinha de Davi, Moisés e Sophia, de 16 anos. Sua mãe viaja quando há cirurgias mais difíceis, mas no dia a dia a responsabilidade fica principalmente com Fábila.",
      "Segundo Fábila, o tratamento atual no Brasil estagnou, com regressões em comparação à evolução que Davi tinha em Manaus.",
      "A família relata negativa da Unimed para cobrir centro cirúrgico, necessidade de liminar e despesas particulares.",
      "Davi já realizou tratamento com células-tronco no Paraguai. A família também avaliou o México, mas os custos relatados eram de aproximadamente R$ 200 mil por ciclo, envolvendo três períodos de 28 dias.",
    ],
  },
  {
    title: "A esperança nos Estados Unidos",
    paragraphs: [
      "Um dos objetivos relatados para uma nova campanha é levar Davi ao Arizona e a Nova Orleans, nos Estados Unidos, para avaliar novas opções de reabilitação.",
      "A família menciona oxigenoterapia hiperbárica, com custo estimado em US$ 11.500, e tratamento com células-tronco mesenquimais. As diferenças alegadas entre esses métodos e sua eficácia para as sequelas de Davi não foram verificadas nesta página; qualquer intervenção deve ser avaliada com médicos especializados.",
      "A família afirma já possuir passaportes, mas ainda precisaria de vistos, hospedagem por cerca de 40 dias, passagens e estrutura de cuidados durante a viagem.",
      "Segundo o relato enviado, o objetivo da nova campanha é custear:",
    ],
    items: [
      "Reabilitação intensiva para o menino",
      "Quitação da dívida hospitalar",
      "Avaliação de tratamento neurológico nos EUA",
      "Logística de viagem e estadia",
    ],
  },
  {
    paragraphs: [
      "Davi já passou por situações inimagináveis, mas segue lutando. A família pede apoio para continuar buscando tratamentos e melhorar sua qualidade de vida.",
    ],
  },
];

function Brand() {
  return <Link to="/" className="brand" aria-label="Página inicial"><img src={logo} className="brand-logo" alt="Juntos por Vidas" /></Link>;
}

function DaviCampaign() {
  const [tab, setTab] = useState<Tab>("sobre");
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title, text: "Conheça a história de Davi.", url: window.location.href });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(window.location.href); setCopied(true); }
    } catch { /* compartilhamento cancelado */ }
  };
  return <div className="campaign-page">
    <style>{styles}</style>
    <header className="topbar"><div className="topbar-inner">
      <Brand />
      <div className="top-actions">
        <button type="button" onClick={() => void share()} className="icon-button" aria-label="Compartilhar campanha">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.2" /><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="19" r="2.2" /><path d="m8 11 7.8-4.5M8 13l7.8 4.5" /></svg>
        </button>
        <span className="menu-icon" aria-hidden="true"><i /><i /><i /></span>
      </div>
    </div></header>

    <main className="content">
      <section className="hero-card">
        <img src="/davi/davi.webp" width={450} height={226} fetchPriority="high" alt="Fotos de Davi sorrindo com a camisa do Brasil e durante uma internação, com a imagem enviada para esta página" />
        <button type="button" className={liked ? "heart-button liked" : "heart-button"} aria-pressed={liked} aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"} onClick={() => setLiked(!liked)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6 4.9 14C1.3 10.7 3.6 5 8.3 5c1.5 0 2.9.7 3.7 1.8C12.8 5.7 14.2 5 15.7 5c4.7 0 7 5.7 3.4 9L12 20.6Z" /></svg>
        </button>
      </section>

      <div className="meta-row"><span>SAÚDE / TRATAMENTOS</span><span className="country">BRASIL</span></div>
      <h1>{title}</h1><p className="campaign-id">Campanha: Davi Lucas</p>

      <section className="stats" aria-label="Informações da campanha">
        <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={received} aria-label="Progresso da arrecadação">
          <div className="progress-value" style={{ width: "97.86%" }} />
        </div>
        <div className="raised">R$ 225.083,79 <span>de R$ 230.000,00</span></div>
        <div className="stats-box">
          <div><span>Corações Recebidos</span><strong>72.615</strong></div>
          <div><span>Apoiadores</span><strong>14.221</strong></div>
        </div>
      </section>

      <nav className="tabs" aria-label="Informações da campanha">
        {tabs.map(t => <button type="button" key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </nav>
      {tab === "sobre" ? <article className="story">
        {sections.map((section, index) => <section key={index}>
          {section.title && <h2>{section.title}</h2>}
          {section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
          {section.items && <ul className="davi-goals">{section.items.map(item => <li key={item}>{item}</li>)}</ul>}
        </section>)}
        <p className="legal">Página informativa independente, não oficial da família. O relato e a arrecadação foram fornecidos para publicação e podem não refletir o estado atual da campanha. Esta página não processa doações. Confirme o destinatário diretamente com a família antes de contribuir.</p>
      </article> : <section className="reference-tabs-panel" role="tabpanel" aria-label={tabs.find(t => t.id === tab)?.label}>
        {tab === "atualizacoes" && <div className="reference-updates">
          <h2 className="reference-panel-title">Atualizações sobre o Davi</h2>
          <p className="reference-panel-intro">Confira os principais acontecimentos relatados na história de Davi.</p>
          {[
            { year: "2023", title: "Primeira campanha de apoio", description: "A primeira vaquinha ajudou a financiar o início dos tratamentos e cirurgias importantes para Davi." },
            { year: "2024", title: "Novas etapas de reabilitação", description: "A família organizou outra campanha para buscar um tratamento voltado à mobilidade de Davi." },
            { year: "2025", title: "Internação e despesas médicas", description: "Segundo o relato, Davi voltou à UTI devido a uma complicação. Recursos previstos para uma viagem de tratamento precisaram ser usados em despesas hospitalares." },
            { year: "2026", title: "Continuidade da luta", description: "A família relata que busca quitar despesas e avaliar possibilidades de tratamento neurológico nos Estados Unidos." },
          ].map(item => <div className="reference-update" key={item.year}>
            <div className="reference-date"><strong>{item.year}</strong></div>
            <div><strong>{item.title}</strong><p>{item.description}</p></div>
          </div>)}
          <p className="reference-legal">Os marcos acima foram adaptados do relato fornecido para esta página; não são notícias ou atualizações verificadas em tempo real. Para informações recentes, consulte <a href={familyUrl} target="_blank" rel="noopener noreferrer">os canais da família</a>.</p>
        </div>}

        {tab === "quem" && <div className="reference-supporters">
          <h2 className="reference-panel-title">Quem ajudou</h2>
          <div className="reference-supporter">
            <span className="reference-avatar" aria-hidden="true">♥</span>
            <div className="reference-supporter-info">
              <strong className="reference-supporter-name">Apoiadores do Davi</strong>
              <span className="reference-supporter-subtitle">Total informado da campanha</span>
            </div>
            <div className="reference-supporter-amount"><strong>14.221</strong><span>apoiadores</span></div>
          </div>
          <p className="reference-legal">Ainda não há nomes, valores individuais ou horários de doações confirmados para publicar nesta seção. Para conferir os apoiadores reais, consulte a campanha oficial com a família.</p>
        </div>}

        {tab === "perguntas" && <div className="reference-questions">
          {[
            { question: "Qual é o objetivo da campanha do Davi?", answer: "Segundo o relato, apoiar a reabilitação, quitar despesas hospitalares e custear avaliações de tratamento neurológico nos Estados Unidos, além de viagem e estadia." },
            { question: "Por que Davi precisa de acompanhamento neurológico?", answer: "As agressões sofridas provocaram graves sequelas cerebrais, e ele necessita de cuidados e reabilitação contínuos." },
            { question: "Por que a família considera tratamento nos Estados Unidos?", answer: "A família afirma que a evolução no tratamento atual estagnou e busca avaliar outras opções. Qualquer tratamento deve ser indicado por profissionais de saúde habilitados." },
            { question: "Qual é a meta da arrecadação?", answer: "A meta informada para esta página é de R$ 230.000,00. Os valores exibidos nesta página não são atualizados automaticamente." },
            { question: "Como posso ajudar o Davi?", answer: "Pelo botão Quero Ajudar, você pode consultar o canal divulgado da família e confirmar por lá os meios oficiais de contribuição. Também pode compartilhar a história." },
            { question: "Como acompanhar atualizações e os apoiadores?", answer: "Consulte os canais oficiais da família. Esta página apresenta um resumo do relato e não recebe dados individuais de contribuições em tempo real." },
            { question: "Não posso doar agora. Como ajudo?", answer: "Compartilhe a história do Davi para que mais pessoas possam conhecer a situação e verificar como ajudar pelos canais oficiais." },
          ].map(({question,answer}) => <div className="reference-question" key={question}><strong>{question}</strong><p>{answer}</p></div>)}
        </div>}
      </section>}
      <footer className="footer"><Brand /><p>Conheça a história de Davi. Antes de qualquer contribuição, confirme os dados e a destinação nos canais da família.</p></footer>
    </main>
    <div className="bottom-bar">
      <div className="safe-line">♡ CONHEÇA E COMPARTILHE ESTA HISTÓRIA</div>
      <div className="bottom-actions">
        <a href={familyUrl} className="donate-button" target="_blank" rel="noopener noreferrer" aria-label="Quero ajudar: consultar os canais da família">Quero Ajudar</a>
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
`;