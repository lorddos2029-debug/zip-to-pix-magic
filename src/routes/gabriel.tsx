import { createFileRoute, Link } from "@tanstack/react-router";
import { TrackedPixLink } from "@/components/TrackedPixLink";
import { useState } from "react";
import logo from "@/assets/uploads/6662.png";

const title = "Vaquinha para bebê com deformação na cabeça e síndrome sem diagnóstico";
const received = 16038.46;
const goal = 40000;

export const Route = createFileRoute("/gabriel")({
  head: () => ({
    meta: [
      { title: title + " | Juntos por Vidas" },
      { name: "description", content: "Conheça a história de Gabriel, a busca pelo diagnóstico e a necessidade de acompanhamento especializado." },
      { property: "og:title", content: title },
      { property: "og:description", content: "A família de Gabriel busca especialistas, exames e apoio para deslocamento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "/gabriel/gabriel.webp" },
    ],
    links: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" }],
  }),
  component: GabrielCampaign,
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
    "paragraphs": [
      "Durante a gestação, Cássia ouviu de vários médicos que Gabriel não sobreviveria ao parto, ou viveria apenas poucos dias. Ele nasceu chorando, sem precisar de oxigênio, e hoje tem 1 ano e 4 meses. Mas, até agora, segundo a família, ninguém conseguiu dizer exatamente qual síndrome ele tem nem como tratar suas alterações."
    ]
  },
  {
    "title": "Entenda",
    "paragraphs": [
      "Os médicos disseram que Gabriel morreria ao nascer. Ele fez 1 ano e ainda dorme com os olhos abertos.",
      "Na incubadora, Cássia olhava para o filho e não sabia se ele estava dormindo ou acordado. Os olhos de Gabriel permaneciam abertos, fixos. Eram os médicos que precisavam avisar: “Mãe, ele está dormindo.”",
      "Um ano e quatro meses depois, nada mudou nesse detalhe. Segundo Cássia, a pele do rosto de Gabriel é esticada a ponto de ele não conseguir fechar completamente as pálpebras. Ele mal pisca e dorme de olhos abertos. A mãe utiliza colírio e uma pomada indicada por uma médica, na esperança de evitar complicações.",
      "Esse não é o único ponto sem resposta. É apenas o mais visível."
    ]
  },
  {
    "title": "Uma gestação em que ninguém falava de vida",
    "paragraphs": [
      "Cássia descobriu no quinto mês. Foi fazer o ultrassom morfológico para saber o sexo do bebê e ouviu do médico: “Mãe, você sabia que seu filho tem um probleminha, né?” Ela não sabia. Havia feito três ultrassons antes e ninguém tinha dito nada.",
      "Foi realizado um exame genético com coleta de líquido amniótico. Segundo o laudo relatado pela mãe, o cariótipo indicou uma translocação entre os cromossomos 1 e 7. A partir dali, ela diz que ouviu dos profissionais previsões muito difíceis.",
      "“Gabriel tinha um diagnóstico de morte. Os médicos não me diziam nada de vida, a não ser à base de aparelho. Era morte, morte todo tempo.”",
      "Segundo Cássia, um médico disse que o bebê morreria assim que cortassem o cordão umbilical. Outro estimou dois dias de vida, e outro, uma semana. Os exames pré-natais apontavam múltiplas malformações, incluindo alterações nos dedos, ombro e orelha.",
      "Cássia passou 12 dias internada aguardando uma vaga de UTI neonatal. Ela conta que, nesse período, foi colocada em um quarto com duas mulheres que haviam perdido seus bebês e ouviu comentários dolorosos de uma médica sobre a possibilidade de Gabriel não sobreviver.",
      "“Eu vi meu esposo chorando do lado e eu não tinha reação. Eu ficava em choque.”"
    ]
  },
  {
    "title": "Ele nasceu chorando",
    "paragraphs": [
      "Gabriel nasceu de cesárea, com 37 semanas e 51 centímetros. Chorou e não precisou de oxigênio. Segundo a mãe, muitas das malformações previstas nos exames não estavam presentes.",
      "“Quando ele nasceu, ele foi uma surpresa tanto pra mim e pro meu esposo, que tava do lado, como pros médicos. Eles ficaram apavorados sem saber o que fazer, porque Gabriel reagiu super bem.”",
      "A alteração no formato do crânio permaneceu. O diagnóstico definitivo, os tratamentos possíveis e as necessidades futuras ainda estão em investigação, segundo a família.",
      "Gabriel é atendido em um centro de doenças raras em João Pessoa e faz fisioterapia. Quando perguntam a Cássia qual é a síndrome do filho, ela responde que não sabe: “A gente não tem uma direção, uma pessoa pra nos dar a luz.”",
      "A mãe relata preocupação especial com os olhos, pois Gabriel não consegue fechar bem as pálpebras. Ela busca atendimento oftalmológico para avaliar a superfície ocular e prevenir danos relacionados ao ressecamento.",
      "Ela também conta que o menino apresenta alterações nas mãos e nos pés, com sensibilidade que o faz chorar ao ficar em pé. Uma avaliação ortopédica poderá ajudar a definir se precisa de adaptações ou órteses.",
      "A família deseja consultar neurologista e neurocirurgião para organizar a investigação e compreender o quadro de Gabriel. Uma geneticista mencionou a possibilidade de buscar um centro especializado em São Paulo para avaliação futura de procedimentos cranianos.",
      "Antes de qualquer cirurgia ou intervenção, a família precisa de respostas, acompanhamento e um plano de cuidado."
    ]
  },
  {
    "title": "A conta que não fecha",
    "paragraphs": [
      "A renda da casa hoje depende, principalmente, do Benefício de Prestação Continuada (BPC) de Samuel, o filho mais velho, de 6 anos, que é autista, segundo o relato da mãe.",
      "O pai de Gabriel sofreu um acidente de moto em 2016, fraturou o fêmur e o braço e passou um longo período internado. Depois de uma infecção, passou a conviver com osteomielite crônica e precisa de curativos diários na perna. Ele recebe auxílio-doença sujeito a renovações frequentes.",
      "Miguel, o filho do meio, tem 4 anos. Samuel apresenta seletividade alimentar severa e também precisa de acompanhamento que a família relata ter dificuldade para custear.",
      "Cássia contou que, pouco antes da entrevista, a família precisou pedir dinheiro para comprar leite para um dos filhos."
    ]
  },
  {
    "title": "Por que essa vaquinha existe",
    "paragraphs": [
      "Uma consulta em outro estado exige muito mais do que uma passagem. Cássia tem três crianças e não tem com quem deixá-las. Se a consulta exigir dois ou três dias fora, toda a família pode precisar viajar, com custos de deslocamento, hospedagem e alimentação.",
      "Esta campanha busca custear consultas particulares com neurologista, neurocirurgião, oftalmologista e ortopedista, os exames necessários à investigação e as viagens aos centros especializados.",
      "Não se trata de uma cirurgia já marcada: a família procura os profissionais e os exames necessários para que Gabriel tenha um diagnóstico e um plano de tratamento.",
      "Você pode fazer parte desse apoio. Contribua com o valor que puder ou compartilhe a história para que mais pessoas conheçam a situação."
    ],
    "items": [
      "Consultas com neurologista, neurocirurgião, oftalmologista e ortopedista",
      "Exames genéticos e de investigação clínica indicados por especialistas",
      "Deslocamento para centros especializados",
      "Hospedagem, alimentação e apoio logístico da família durante as consultas"
    ]
  }
];

const milestones = [
  {
    "month": "PRÉ",
    "year": "NATAL",
    "title": "Exames na gestação",
    "text": "No quinto mês, exames apontaram alterações e levaram a família a buscar respostas e atendimento especializado."
  },
  {
    "month": "37",
    "year": "SEM",
    "title": "Nascimento de Gabriel",
    "text": "Gabriel nasceu de cesárea, chorando e sem precisar de oxigênio, contrariando as previsões relatadas por sua mãe."
  },
  {
    "month": "01",
    "year": "ANO",
    "title": "Acompanhamento contínuo",
    "text": "A família relata fisioterapia e acompanhamento em um centro de doenças raras em João Pessoa, ainda sem diagnóstico definitivo."
  },
  {
    "month": "HOJE",
    "year": "",
    "title": "Busca por especialistas",
    "text": "A família procura avaliações oftalmológicas, ortopédicas, neurológicas e genéticas e considera viagens para centros especializados."
  }
];

const questions = [
  [
    "Por que a campanha foi criada?",
    "Para ajudar a família a pagar consultas, exames e deslocamentos necessários à investigação médica de Gabriel, segundo o relato de Cássia."
  ],
  [
    "Gabriel já tem um diagnóstico?",
    "Não há um diagnóstico sindrômico definitivo informado pela família. O cariótipo apontou uma alteração cromossômica, mas os especialistas ainda investigam o quadro clínico."
  ],
  [
    "Qual tratamento Gabriel precisa?",
    "A família busca avaliações com neurologista, neurocirurgião, oftalmologista e ortopedista. Os especialistas deverão definir quais exames e intervenções são indicados."
  ],
  [
    "Gabriel tem uma cirurgia marcada?",
    "Não. A vaquinha busca viabilizar investigação, consultas e acompanhamento especializado, e não uma cirurgia já agendada."
  ],
  [
    "Qual é a meta da arrecadação?",
    "A meta informada é R$ 40.000,00; o total arrecadado apresentado nesta página é R$ 16.038,46 e a campanha informa 247 doadores. Os contadores são valores de referência fornecidos para publicação."
  ],
  [
    "Como posso fazer uma doação?",
    "Toque em Quero Ajudar para acessar o checkout Pix do site. Confira o recebedor, o valor e a finalidade antes de concluir a transferência."
  ],
  [
    "Posso ajudar de outra maneira?",
    "Sim. Compartilhe a história de Gabriel e as informações sobre a campanha com familiares e amigos."
  ]
];


function Brand() {
  return <Link to="/" className="brand" aria-label="Página inicial"><img src={logo} alt="Juntos por Vidas" className="brand-logo" /></Link>;
}

function GabrielCampaign() {
  const [tab, setTab] = useState<Tab>("sobre");
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: "Conheça a história de Gabriel e sua família.", url: window.location.href });
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
        <img src="/gabriel/gabriel.webp" width={850} height={427} fetchPriority="high" alt="Gabriel com seus familiares na fotografia enviada para a campanha" />
        <button type="button" className={liked ? "heart-button liked" : "heart-button"}
          aria-pressed={liked} aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          onClick={() => setLiked(!liked)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6 4.9 14C1.3 10.7 3.6 5 8.3 5c1.5 0 2.9.7 3.7 1.8C12.8 5.7 14.2 5 15.7 5c4.7 0 7 5.7 3.4 9L12 20.6Z" /></svg>
        </button>
      </section>
      <div className="meta-row"><span>SAÚDE / DOENÇAS RARAS</span><span className="country">BRASIL</span></div>
      <h1>{title}</h1>
      <p className="campaign-id">Campanha: Ajude o Gabriel</p>

      <section className="stats" aria-label="Informações da campanha">
        <div className="progress-track" role="progressbar" aria-label="Progresso da arrecadação" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={received}>
          <div className="progress-value" style={{ width: "40.09615%" }} />
        </div>
        <p className="fundraised-label">Arrecadado</p>
        <div className="raised">R$ 16.038,46</div>
        <p className="gabriel-target">De R$ 40.000,00 | 247 doadores</p>
        <div className="stats-box">
          <div><span>Corações Recebidos</span><strong>72.615</strong></div>
          <div><span>Apoiadores</span><strong>7.221</strong></div>
        </div>
      </section>

      <nav className="tabs" aria-label="Informações da campanha">
        {tabs.map(item => <button type="button" key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>)}
      </nav>

      {tab === "sobre" ? <article className="story">
        {sections.map((section, i) => <section key={i}>
          {section.title && <h2>{section.title}</h2>}
          {section.paragraphs.map((paragraph, k) => <p key={k}>{paragraph}</p>)}
          {section.items && <ul className="gabriel-goals">{section.items.map(item => <li key={item}>{item}</li>)}</ul>}
        </section>)}
      </article> : <section className="reference-tabs-panel" role="tabpanel" aria-label={tabs.find(item => item.id === tab)?.label}>
        {tab === "atualizacoes" && <div className="reference-updates">
          {milestones.map((item,i) => <div className="reference-update" key={i}>
            <div className="reference-date"><strong>{item.month}</strong><span>{item.year}</span></div>
            <div><strong>{item.title}</strong><p>{item.text}</p></div>
          </div>)}
          <p className="reference-legal">Estes são marcos da história relatada pela família, não um feed de atualizações em tempo real.</p>
        </div>}
        {tab === "quem" && <div className="reference-supporters" aria-label="Resumo do apoio à campanha">
          {[
            { avatar: "D", label: "Doadores", value: "247", description: "doadores informados" },
            { avatar: "A", label: "Apoiadores", value: "7.221", description: "apoiadores informados" },
            { avatar: "♥", label: "Corações Recebidos", value: "72.615", description: "reações informadas" },
          ].map((supporter) => (
            <div className="reference-supporter" key={supporter.label}>
              <span className="reference-avatar" aria-hidden="true">{supporter.avatar}</span>
              <strong className="reference-supporter-name">{supporter.label}</strong>
              <div className="reference-supporter-amount">
                <strong>{supporter.value}</strong>
                <span>{supporter.description}</span>
              </div>
            </div>
          ))}
        </div>}
        {tab === "perguntas" && <div className="reference-questions">
          {questions.map(([question, answer]) => <div className="reference-question" key={question}><strong>{question}</strong><p>{answer}</p></div>)}
        </div>}
      </section>}

      <footer className="footer"><Brand />
        <p>Campanha de apoio ao <strong>Gabriel e sua família</strong>.</p>
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

.gabriel-target { color:#888; font-size:13px; margin:4px 0 0; }
.gabriel-goals { color:#3b3b3b; font-size:14px; line-height:1.8; padding-left:24px; margin:0 0 22px; }
.gabriel-goals li { margin-bottom:6px; }
.reference-date { min-width:54px; width:54px; height:54px; }
.reference-date strong { font-size:12px; line-height:14px; }
.reference-date span { font-size:10px; }
.reference-supporter { gap:10px; }
.reference-supporter-amount span { max-width:150px; }
.reference-supporter-amount { align-items:end; }
@media(max-width:375px) { .reference-supporter-name {font-size:12px;} .reference-supporter-amount span {font-size:10px;} }

`;