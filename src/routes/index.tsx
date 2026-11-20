import { styles } from "@/lib/campaign-styles";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TrackedPixLink } from "@/components/TrackedPixLink";
import { useState } from "react";
import logo from "@/assets/uploads/6662.png";
const willianHero = "/willian/willian-destaque.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ajude o Willian | Juntos pela Vida" },
      {
        name: "description",
        content:
          "Ajude o Willian e seu pai neste período de dificuldade. Cada contribuição pode fazer diferença.",
      },
      { property: "og:title", content: "Ajude o Willian" },
      {
        property: "og:description",
        content:
          "Willian usa cadeira de rodas e, ao lado do pai, enfrenta dificuldades financeiras. Conheça a campanha e ajude como puder.",
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
  component: WillianCampaign,
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
      <img src={logo} alt="Logo Juntos por Vidas" className="brand-logo" width={46} height={46} />
    </Link>
  );
}

function WillianCampaign() {
  const [tab, setTab] = useState<Tab>("sobre");
  const [liked, setLiked] = useState(false);

  const share = () => {
    const data = {
      title: "Ajude o Willian",
      text: "Conheça a campanha do Willian e de seu pai.",
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
            src={willianHero}
            alt="Willian no colo do pai"
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

        <h1>Ajude o Willian</h1>
        <p className="campaign-id">ID: WILLIAN2026</p>

        <section className="stats">
          <div className="progress-track" aria-label="Progresso da arrecadação">
            <div className="progress-value" />
          </div>
          <div className="raised">
            R$ 1.427,92 <span>de R$ 13.000,00</span>
          </div>

          <div className="stats-box">
            <div>
              <span>Corações Recebidos</span>
              <strong>1.755</strong>
            </div>
            <div>
              <span>Apoiadores</span>
              <strong>421</strong>
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
              Willian é uma pessoa com deficiência e usa cadeira de rodas. Ao lado dele está seu pai,
              que enfrenta dificuldades financeiras e precisa de ajuda para atender às necessidades dos
              dois. Esta campanha nasce de um pedido simples: que eles não precisem atravessar esse momento
              sem apoio.
            </p>

            <img
              className="story-image"
              src={willianHero}
              alt="Willian ao lado de seu pai"
              width={400}
              height={481}
              loading="lazy"
            />

            <p className="created"><strong>Vaquinha criada em:</strong> 20/09/2026</p>

            <h2>Entenda</h2>

            <p>
              Quando o dinheiro não é suficiente para o básico, o dia a dia fica mais difícil. Para o pai
              do Willian, a preocupação com as necessidades da casa se soma ao desejo de oferecer ao filho
              cuidado, segurança e dignidade.
            </p>

            <p>
              Willian é muito mais do que sua deficiência. É alguém que merece respeito, acolhimento e a
              oportunidade de viver com suas necessidades atendidas. A cadeira de rodas faz parte da sua
              vida, mas não define quem ele é.
            </p>

            <p>
              <strong>O amor de um pai é imenso, mas ninguém deveria enfrentar a necessidade sozinho.</strong>{" "}
              Há momentos em que o apoio de outras pessoas faz a diferença entre continuar com preocupação
              e encontrar um pouco de tranquilidade para seguir.
            </p>

            <p>
              A proposta desta vaquinha é reunir ajuda para as necessidades básicas de Willian e seu pai,
              oferecendo apoio neste período de dificuldade. Cada contribuição pode aliviar o peso financeiro
              e ajudar os dois a cuidar do presente com mais segurança.
            </p>

            <p>
              Não é preciso resolver tudo sozinho para fazer parte dessa mudança. Uma doação, somada a tantas
              outras, pode se transformar em um apoio importante para essa família.
            </p>

            <p>
              Se você não puder contribuir agora, compartilhe a campanha. Sua mensagem pode chegar a alguém
              que tenha condições de ajudar. Willian e seu pai merecem saber que existem pessoas dispostas a
              caminhar ao lado deles.
            </p>

            <p>
              <strong>
                Ajude o Willian. Sua solidariedade pode trazer mais dignidade e tranquilidade para ele e seu pai.
              </strong>
            </p>

            <p className="legal">
              AVISO LEGAL: O texto e as imagens incluídos nessa página são de única e exclusiva responsabilidade
              do criador da vaquinha e não representam a opinião ou endosso da plataforma.
            </p>
          </article>
        ) : (
          <section className="reference-tabs-panel" role="tabpanel" aria-label={TABS.find((item) => item.id === tab)?.label}>
            {tab === "atualizacoes" && (
              <>
                <div className="reference-update">
                  <div className="reference-date"><strong>13</strong><span>SET</span></div>
                  <div><strong>Vaquinha criada</strong><p>Esta arrecadação é para apoiar Willian e seu pai nas necessidades do dia a dia.</p></div>
                </div>
                <p className="reference-legal">AVISO LEGAL: O texto e as imagens incluídos nessa página são de única e exclusiva responsabilidade do criador da vaquinha e não representam a opinião ou endosso da plataforma.</p>
              </>
            )}
            {tab === "quem" && (
              <div className="reference-supporters">
                {[
                  { name: "João", amount: "R$ 40,00", time: "há poucos minutos" },
                  { name: "Eva", amount: "R$ 45,00", time: "há 22 minutos" },
                  { name: "Bruno", amount: "R$ 45,00", time: "há 1 hora" },
                  { name: "Liz", amount: "R$ 10,00", time: "há 2 horas" },
                  { name: "Anônimo", amount: "R$ 100,00", time: "há 3 horas" },
                  { name: "Márcia", amount: "R$ 50,00", time: "há 5 horas" },
                ].map((supporter, index) => (
                  <div className="reference-supporter" key={index}>
                    <span className="reference-avatar" aria-hidden="true">{supporter.name.slice(0, 1)}</span>
                    <strong className="reference-supporter-name">{supporter.name}</strong>
                    <div className="reference-supporter-amount"><strong>{supporter.amount}</strong><span>{supporter.time}</span></div>
                  </div>
                ))}
              </div>
            )}
            {tab === "perguntas" && (
              <div className="reference-questions">
                {[
                  { question: "Para onde vai o dinheiro das doações?", answer: "As contribuições serão destinadas ao apoio das necessidades básicas de Willian e seu pai neste período de dificuldade financeira." },
                  { question: "Qual é o valor mínimo para doar?", answer: "A partir de R$ 20,00. Qualquer valor ajuda e é somado ao total arrecadado." },
                  { question: "Como eu doo?", answer: "Pelo botão “Quero Ajudar”: você escolhe o valor, preenche os dados e recebe um Pix com QR Code e código copia e cola na hora." },
                  { question: "Recebo confirmação da doação?", answer: "Sim. Assim que o pagamento é confirmado pelo banco, você é levado para uma página de agradecimento com os dados da sua doação." },
                  { question: "Não posso doar agora. Como ajudo?", answer: "Compartilhe a campanha de Willian com sua família e amigos. Sua divulgação pode alcançar alguém que possa contribuir." },
                ].map(({ question, answer }) => (
                  <div className="reference-question" key={question}><strong>{question}</strong><p>{answer}</p></div>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          <Brand />
          <p>
            Campanha criada pela <strong>Família do Willian</strong> para apoiar Willian e seu pai.
          </p>
        </footer>
      </main>

      <div className="bottom-bar">
        <div className="safe-line">♡ CONTRIBUA COM SEGURANÇA</div>
        <div className="bottom-actions">
          <TrackedPixLink className="donate-button">Quero Ajudar</TrackedPixLink>
          <button type="button" className="share-button" onClick={share}>Compartilhar</button>
        </div>
      </div>
    </div>
  );
}
