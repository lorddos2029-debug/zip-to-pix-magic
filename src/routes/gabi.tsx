import { createFileRoute, Link } from "@tanstack/react-router";
import { TrackedPixLink } from "@/components/TrackedPixLink";
import { useState } from "react";
import logo from "@/assets/uploads/6662.png";
import { styles } from "@/lib/campaign-styles";

export const Route = createFileRoute("/gabi")({
  head: () => ({
    meta: [
      { title: "Ajude a Gabi | Juntos por Vidas" },
      {
        name: "description",
        content:
          "Ajude a Gabi com os custos do tratamento, das terapias e dos medicamentos. Cada contribuição pode fazer diferença.",
      },
      { property: "og:title", content: "Ajude a Gabi" },
      {
        property: "og:description",
        content:
          "Apoie a família da Gabi nos cuidados com a Síndrome de West.",
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
  component: GabiCampaign,
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

function GabiCampaign() {
  const [tab, setTab] = useState<Tab>("sobre");
  const [liked, setLiked] = useState(false);

  const share = () => {
    const data = {
      title: "Ajude a Gabi",
      text: "Conheça a campanha da Gabi.",
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
        <section className="hero-card" style={{height:"auto"}}>
          <img
            src="/gabi/gabi.png"
            alt="Gabi sentada em sua cadeira de rodas"
            width={489}
            height={366}
            style={{height:"auto"}}
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

        <h1>Ajude a Gabi</h1>
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
            <p>A Gabi enfrenta uma condição neurológica grave: a Síndrome de West. Essa realidade exige cuidados constantes e uma rotina que envolve tratamento, terapias e medicamentos. Enquanto tantas crianças podem simplesmente aproveitar cada descoberta da infância, a Gabi e sua família precisam lidar diariamente com desafios que não podem esperar.</p>
            <h2>Entenda</h2>
            <p>Por trás de cada consulta, cada sessão de terapia e cada medicamento existe uma família que luta para oferecer à Gabi o cuidado de que ela precisa. São muitas preocupações ao mesmo tempo: acompanhar sua saúde, buscar os recursos necessários e encontrar forças para seguir mesmo quando as dificuldades parecem maiores do que as possibilidades.</p>
            <p>A situação fica ainda mais difícil porque a família passa por necessidades financeiras. Os custos do tratamento e dos cuidados se acumulam, e nem sempre há dinheiro suficiente para garantir tudo no momento certo. Para quem já enfrenta tantas preocupações, ter que escolher quais despesas essenciais conseguir pagar torna cada dia ainda mais pesado.</p>
            <p>A família não quer privilégios. Quer apenas condições de continuar buscando o melhor cuidado possível para a Gabi. O tratamento, as terapias e os medicamentos são parte importante dessa caminhada, mas manter tudo isso exige recursos que hoje estão além do que conseguem alcançar sozinhos.</p>
            <p>Foi por isso que esta campanha nasceu: para reunir pessoas dispostas a estender a mão. Cada contribuição será destinada a ajudar com os custos do tratamento, das terapias, dos medicamentos e das necessidades relacionadas ao cuidado da Gabi. Qualquer valor, somado ao de outras pessoas, pode aliviar um pouco esse peso e fazer diferença na rotina da família.</p>
            <p>A Gabi merece cuidado, acolhimento e a chance de continuar avançando com todo o apoio possível. A família não deveria enfrentar essa luta sozinha. Quando muitas pessoas se unem, a solidariedade se transforma em ajuda concreta e renova a esperança de quem precisa.</p>
            <p>Ajude a Gabi a continuar recebendo tratamento, terapias e medicamentos. Se não puder doar, compartilhe esta campanha. Toda ajuda importa.</p>

            <p className="legal">
              AVISO LEGAL: O texto e as imagens incluídos nessa página são de única e exclusiva responsabilidade
              do criador da vaquinha e não representam a opinião ou endosso da plataforma.
            </p>
          </article>
        ) : (
          <section className="reference-tabs-panel" role="tabpanel" aria-label={TABS.find((item) => item.id === tab)?.label}>
            {tab === "atualizacoes" && <p>A família ainda não publicou atualizações nesta página.</p>}
            {tab === "quem" && <p>A lista de apoiadores ainda não está disponível.</p>}
            {tab === "perguntas" && (
              <div className="reference-questions">
                {[
                  { question: "Para onde vai o dinheiro das doações?", answer: "As contribuições serão destinadas ao tratamento, às terapias, aos medicamentos e aos cuidados da Gabi." },
                  { question: "Como eu doo?", answer: "Pelo botão “Quero Ajudar”: você escolhe o valor, preenche os dados e recebe um Pix com QR Code e código copia e cola na hora." },
                  { question: "Recebo confirmação da doação?", answer: "Sim. Assim que o pagamento é confirmado pelo banco, você é levado para uma página de agradecimento com os dados da sua doação." },
                  { question: "Não posso doar agora. Como ajudo?", answer: "Compartilhe a campanha da Gabi com sua família e amigos. Sua divulgação pode alcançar alguém que possa contribuir." },
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
            Ajude a <strong>família da Gabi</strong> a manter os cuidados de que ela precisa.
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
