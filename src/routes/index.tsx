import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "O Pedro precisa de oxigênio para viver | Juntos Pela Vida" },
      { name: "description", content: "O pequeno Pedro contraiu uma infecção grave e precisa de oxigênio em casa para continuar vivendo. Ajude com o que puder." },
      { property: "og:title", content: "O Pedro precisa de oxigênio para viver" },
      { property: "og:description", content: "Pulmões comprometidos, oxigênio em casa. Cada real vai direto para o tratamento do Pedro." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" },
    ],
  }),
  component: Campaign,
});

type TabId = "sobre" | "atualizacoes" | "quem" | "premiada" | "selos" | "perguntas";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "sobre", label: "Sobre" },
  { id: "atualizacoes", label: "Atualizações" },
  { id: "quem", label: "Quem ajudou" },
  { id: "premiada", label: "Vakinha Premiada" },
  { id: "selos", label: "Selos recebidos" },
  { id: "perguntas", label: "Perguntas e Respostas" },
];

const TAB_EMPTY: Record<Exclude<TabId, "sobre">, string> = {
  atualizacoes: "Nenhuma atualização disponível.",
  quem: "Nenhum apoiador para exibir.",
  premiada: "Vakinha Premiada não disponível.",
  selos: "Nenhum selo recebido.",
  perguntas: "Nenhuma pergunta disponível.",
};

function Campaign() {
  const [liked, setLiked] = useState(false);
  const [tab, setTab] = useState<TabId>("sobre");
  const [expanded, setExpanded] = useState(false);


  return (
    <>
      <style>{campaignCss}</style>
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="150" height="40" fill="none" viewBox="0 0 123 32">
              <path fill="#24CA68" fillRule="evenodd" d="M5.11 0h24.923a5.18 5.18 0 0 1 3.609 1.471 4.97 4.97 0 0 1 1.5 3.537v18.16q.001.119-.004.232V32l-6.636-3.82H5.11a5.18 5.18 0 0 1-3.609-1.472A4.97 4.97 0 0 1 0 23.171V5.011a4.97 4.97 0 0 1 1.501-3.538A5.18 5.18 0 0 1 5.111.002zm12.655 17.262q-.285 0-.566.037l-4.695-7.981a3.12 3.12 0 0 0-.402-3.833 3.26 3.26 0 0 0-1.83-.956c-.702-.114-1.421.002-2.048.33A3.2 3.2 0 0 0 6.8 6.338a3.1 3.1 0 0 0-.213 2.023 3.16 3.16 0 0 0 1.084 1.734 3.27 3.27 0 0 0 1.935.733l4.78 8.117a4.022 4.022 0 0 0-.34 4.25c.348.671.877 1.235 1.53 1.63a4.237 4.237 0 0 0 4.35.02 4.1 4.1 0 0 0 1.546-1.617 4.02 4.02 0 0 0-.301-4.253l4.797-8.142c.71-.03 1.39-.288 1.935-.734a3.16 3.16 0 0 0 1.082-1.734 3.1 3.1 0 0 0-.214-2.022 3.2 3.2 0 0 0-1.423-1.48 3.3 3.3 0 0 0-2.047-.328c-.7.113-1.343.45-1.83.956a3.12 3.12 0 0 0-.4 3.831l-4.703 7.981q-.299-.045-.602-.045z" clipRule="evenodd" />
              <path fill="#24CA68" d="M42.39 12.184a3.8 3.8 0 0 1-.212-.874 1.67 1.67 0 0 1 .437-1.27 1.65 1.65 0 0 1 1.23-.526c.408-.002.805.141 1.119.405s.524.631.594 1.037l2.302 7.797h.046l2.301-7.797c.07-.406.28-.774.594-1.038a1.72 1.72 0 0 1 1.12-.404 1.64 1.64 0 0 1 1.229.526 1.66 1.66 0 0 1 .438 1.27q-.051.451-.212.874l-3.241 9.075c-.329.921-.545 1.228-2.254 1.228s-1.924-.307-2.253-1.228zM65.535 18.841c.045.781.166 1.557.359 2.315a1.43 1.43 0 0 1-.509.985 1.46 1.46 0 0 1-1.062.338 1.9 1.9 0 0 1-1.495-.53 1.86 1.86 0 0 1-.551-1.478 6 6 0 0 1-2.149 1.54 6 6 0 0 1-2.608.468 3.74 3.74 0 0 1-2.704-.945 3.7 3.7 0 0 1-1.222-2.573c0-2.858 2.189-3.66 4.854-3.967l2.116-.237c.827-.089 1.5-.283 1.5-1.278 0-.994-1.025-1.416-2.19-1.416-2.576 0-2.642 1.89-4.022 1.89a1.4 1.4 0 0 1-1.019-.352 1.37 1.37 0 0 1-.453-.971c0-1.369 1.951-3.116 5.519-3.116 3.332 0 5.64 1.063 5.64 3.542zm-3.474-2.48c-.444.308-.961.495-1.5.544l-1.261.188c-1.452.213-2.237.662-2.237 1.7 0 .78.735 1.417 1.93 1.417 1.905 0 3.071-1.228 3.071-2.502zM67.65 6.882c0-.45.173-.88.48-1.197a1.6 1.6 0 0 1 1.158-.496c.434 0 .85.179 1.157.496s.48.748.48 1.197v7.694l3.637-4.173c.154-.192.346-.349.562-.46a1.7 1.7 0 0 1 .694-.19c.396.009.775.17 1.062.454s.46.668.486 1.077c.009.213-.031.424-.117.618a1.34 1.34 0 0 1-.376.495l-2.427 2.623 3.409 4.729c.221.317.34.699.338 1.09.001.428-.16.84-.45 1.148-.288.308-.683.487-1.097.498a1.63 1.63 0 0 1-.841-.19 1.7 1.7 0 0 1-.64-.597l-3.094-4.521-1.144 1.043v2.574c0 .449-.173.88-.48 1.197a1.6 1.6 0 0 1-1.158.495 1.6 1.6 0 0 1-1.157-.495 1.72 1.72 0 0 1-.48-1.197zM80.83 5.19a1.76 1.76 0 0 1 1.723 1.41 1.75 1.75 0 0 1-1.051 1.96 1.76 1.76 0 0 1-2.134-.645 1.75 1.75 0 0 1 .22-2.213 1.76 1.76 0 0 1 1.242-.513m-1.689 6.318a1.68 1.68 0 0 1 1.043-1.555 1.69 1.69 0 0 1 2.205.911c.085.204.129.423.129.644v9.295a1.69 1.69 0 0 1-3.377 0zM84.344 11.243c0-1.039.461-1.725 1.522-1.725s1.523.686 1.523 1.725v.446h.047a4.87 4.87 0 0 1 1.772-1.618 4.73 4.73 0 0 1 2.312-.557c2.03 0 4.245 1.04 4.245 4.538v6.71c0 .457-.177.896-.493 1.22a1.67 1.67 0 0 1-1.191.505c-.447 0-.875-.182-1.191-.505a1.75 1.75 0 0 1-.493-1.22v-6.027c0-1.394-.67-2.387-2.124-2.387-.69.015-1.347.31-1.827.818a2.71 2.71 0 0 0-.734 1.9v5.693c0 .458-.177.896-.493 1.22a1.67 1.67 0 0 1-1.191.505c-.447 0-.875-.182-1.19-.505a1.75 1.75 0 0 1-.494-1.22zM98.4 6.882c0-.449.178-.88.494-1.197a1.68 1.68 0 0 1 2.382 0c.316.318.493.748.493 1.197v4.66h.047a4.51 4.51 0 0 1 3.761-1.786c2.03 0 4.246 1.02 4.246 4.452v6.586c0 .449-.178.88-.494 1.197a1.68 1.68 0 0 1-2.382 0 1.7 1.7 0 0 1-.493-1.197v-5.916c0-1.369-.669-2.343-2.122-2.343a2.6 2.6 0 0 0-1.828.803 2.64 2.64 0 0 0-.733 1.864v5.588c0 .45-.177.88-.493 1.197a1.682 1.682 0 0 1-2.876-1.197zM122.642 18.841c.046.781.166 1.557.359 2.315a1.43 1.43 0 0 1-.509.985 1.46 1.46 0 0 1-1.496-.53 1.86 1.86 0 0 1-.55-1.478 6 6 0 0 1-2.149 1.54 6 6 0 0 1-2.608.468 3.74 3.74 0 0 1-2.704-.945 3.663 3.663 0 0 1-1.222-2.573c0-2.858 2.189-3.66 4.855-3.967l2.115-.237c.834-.089 1.5-.283 1.5-1.278 0-.994-1.023-1.416-2.189-1.416-2.575 0-2.641 1.89-4.022 1.89a1.39 1.39 0 0 1-1.345-.792 1.4 1.4 0 0 1-.127-.531c0-1.369 1.951-3.116 5.518-3.116 3.332 0 5.641 1.063 5.641 3.542zm-3.475-2.48c-.443.307-.96.494-1.498.544l-1.261.188c-1.452.213-2.237.662-2.237 1.7 0 .78.735 1.417 1.931 1.417 1.903 0 3.069-1.228 3.069-2.502z" />
            </svg>
          </a>
          <div className="nav-mobile">
            <svg viewBox="0 0 24 24" fill="#24ca68"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14" /></svg>
            <svg viewBox="0 0 24 24"><path d="M3 18h12v-2H3zM3 6v2h18V6zm0 7h18v-2H3z" /></svg>
          </div>
        </div>
      </nav>
      <div className="spacer" />
      <div className="container">
        <div className="campaign-image">
          <img src="/campaign/pedro.webp" alt="Pedro no colo da mãe, com cateter de oxigênio no rosto" />
          <button className="heart-btn" onClick={() => setLiked((v) => !v)} aria-label="Curtir">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="20" fill="#fff" />
              <path d="M10.789,2.572A6.652,6.652,0,0,0,3.739.285C.819,1.21-.387,4.422.109,7.262c.785,4.507,5.706,9,9.964,10.666a1.976,1.976,0,0,0,.7.142h.037a1.923,1.923,0,0,0,.695-.142c4.3-1.7,9.179-6.159,9.965-10.666a7.373,7.373,0,0,0,.108-1.192V5.946A5.729,5.729,0,0,0,17.839.285,6.029,6.029,0,0,0,16.014,0a6.9,6.9,0,0,0-5.225,2.572" transform="translate(9 11)" fill={liked ? "#24ca68" : "#dadada"} />
            </svg>
          </button>
        </div>

        <div className="tags-row">
          <span>SOLIDARIEDADE / TRATAMENTOS</span>
          <span className="location">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S13.38 11.5 12 11.5" /></svg>
            BARCARENA / PA
          </span>
        </div>

        <h1 className="campaign-title">O Pedro precisa de oxigênio para viver💚</h1>
        <p className="campaign-id">ID: 53057933</p>

        <div className="mobile-stats-panel">
          <div className="progress-bar"><div className="progress-fill" /></div>
          <div className="collected-value">R$ 15.300,00 <span className="collected-goal">de R$ 45.000,00</span></div>
          <div className="stats-box">
            <div className="stat-row">
              <span className="stat-label">
                Corações Recebidos
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18.319 15.34">
                  <path d="M16.485,1.524a4.425,4.425,0,0,0-6.326,0L9.159,2.525,8.16,1.524a4.425,4.425,0,0,0-6.326,0,4.8,4.8,0,0,0,0,6.726l7.325,7.086,7.326-7.086A4.8,4.8,0,0,0,16.485,1.524Z" fill="#007a47" />
                </svg>
              </span>
              <span className="stat-value">1755</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Apoiadores</span>
              <span className="stat-value">187</span>
            </div>
          </div>
        </div>

        <div className="short-desc">
          💚 "Meu filho está lutando para respirar. A gente já não tem mais como bancar o tratamento sozinho." O pequeno Pedro contraiu uma infecção grave e hoje está com os pulmões comprometidos. Ele precisa de oxigênio em casa para continuar vivendo.
          {!expanded && <span onClick={() => setExpanded(true)}>ver tudo</span>}
        </div>
        {expanded && (
          <div className="full-desc">
            Pedro no colo da mãe, com o cateter de oxigênio no rosto. É assim, dia e noite — com a família ao lado o tempo inteiro. 🫁 Pulmões comprometidos. Oxigênio em casa. Cada dia é uma luta. Qualquer valor ajuda a manter o oxigênio ligado e os remédios em dia. 💚
          </div>
        )}

        <div className="tabs-wrap">
          {TABS.map((t) => (
            <div
              key={t.id}
              className={`tab${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </div>
          ))}
        </div>

        {tab === "sobre" ? (
          <div>
            <div className="pix-row">Você pode ajudar via Pix usando a chave:</div>
            <div className="pix-key" onClick={copyPix}>
              <span>{copied ? "Copiado!" : "doacao@solidarizaesperanca.org"}</span>
              <svg viewBox="350 0 766 758"><path d="M806.32,188.44H597.7a34.87,34.87,0,0,0-34.84,34.73V466.71H597.7V223.17H806.32Z" /><path d="M858.56,258v0H667.25a35,35,0,0,0-34.84,34.83V536.28a35,35,0,0,0,34.84,34.83H858.56a34.9,34.9,0,0,0,34.72-34.83V292.8A34.9,34.9,0,0,0,858.56,258Zm0,278.29H667.25V292.8H858.56Z" /></svg>
            </div>

            <div className="divider" />
            <p className="created-date"><strong>Vaquinha criada em:</strong> 17/08/2026</p>

            <div className="description">
              <p><strong>💚 Ajude o Robson a cuidar da pequena Ester durante o tratamento contra a leucemia</strong></p>
              <p>Olá, meu nome é Robson e sou pai da pequena Ester.</p>
              <p>É com o coração apertado e muita esperança que venho pedir a ajuda de vocês. Minha filha Ester está enfrentando uma batalha muito difícil: ela está passando por um tratamento contra a leucemia.</p>
              <p>Ester é uma menina meiga, doce e cheia de vida. Como pai, tudo o que mais desejo neste momento é poder estar ao lado dela, dando todo o amor, apoio e força que ela precisa para enfrentar essa fase tão delicada.</p>
              <p>Nós moramos em Barcarena, no Pará, e diariamente preciso me deslocar até Belém para acompanhar minha filha durante o tratamento. São viagens, alimentação, transporte e outras despesas que acabam pesando muito no orçamento da nossa família.</p>
              <p>Infelizmente, essa não é a primeira vez que o câncer entra na nossa família. Minha esposa, mãe da Ester, também enfrentou essa doença e, infelizmente, acabou falecendo por causa dela. Desde então, tenho seguido em frente tentando ser forte pela minha filha e fazer tudo o que estiver ao meu alcance para protegê-la.</p>
              <p>Hoje, estou aqui deixando de lado qualquer orgulho e pedindo ajuda. Não estou fazendo isso por mim, mas pela minha pequena Ester. Quero poder continuar acompanhando seu tratamento e proporcionar a ela tudo o que estiver ao meu alcance durante essa caminhada.</p>
              <p>Qualquer contribuição, independentemente do valor, será muito importante para nós. E se você não puder contribuir financeiramente, compartilhar esta vakinha com outras pessoas já será uma enorme ajuda.</p>
              <p>Peço, de coração, que você inclua a Ester em suas orações e torça pela recuperação dela. Espero que minhas palavras possam tocar o seu coração e que você possa nos ajudar a enfrentar essa jornada.</p>
              <p>Por favor, nos ajude a dar à pequena Ester a chance de continuar lutando e, um dia, poder voltar a viver sua infância com toda a alegria que ela merece.</p>
              <p>Que Deus abençoe cada pessoa que puder nos ajudar, seja com uma contribuição, uma oração ou simplesmente compartilhando nossa história.</p>
              <p><strong>O que sua ajuda pode proporcionar:</strong></p>
              <p>💊 Fisioterapia e acompanhamento</p>
              <p>🧪 Exames e consultas</p>
              <p>🚗 Transporte para atendimentos</p>
              <p>🏠 Adaptações necessárias para os cuidados da Ester</p>
              <p>Ester tem apenas 6 anos. Se você puder ajudar, sua contribuição pode fazer parte dessa rede de apoio. E, se não puder doar, compartilhar a história também ajuda.</p>
            </div>

            <p className="aviso">AVISO LEGAL: O texto e as imagens incluídos nessa página são de única e exclusiva responsabilidade do criador da vaquinha e não representam a opinião ou endosso da plataforma Vakinha.</p>
          </div>
        ) : (
          <div className="tab-empty">{TAB_EMPTY[tab]}</div>
        )}
      </div>

      <div className="mobile-bottom">
        <div className="mb-protected">
          <div className="mb-protected-badge">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="12" r="12" fill="#1a6e2e" />
              <path d="M12 4L6 6.5v4.5c0 4 2.5 7.5 6 9 3.5-1.5 6-5 6-9V6.5L12 4z" fill="#fff" />
              <path d="M10 12l1.5 1.5 3-3" stroke="#1a6e2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Doação Protegida</span>
          </div>
        </div>
        <div className="mb-btns">
          <Link to="/pix" className="btn-donate">Quero Ajudar</Link>
          <button
            className="btn-share"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "O Pedro precisa de oxigênio para viver", url: window.location.href }).catch(() => undefined);
              } else {
                navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
              }
            }}
          >
            Compartilhar
          </button>
        </div>
      </div>
    </>
  );
}

const campaignCss = `
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Lato', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
body { background: #f9f9f9; color: #282828; padding-bottom: 180px; }
a { text-decoration: none; color: inherit; }
.nav { position: fixed; top: 0; left: 0; right: 0; height: 60px; background: #fff; z-index: 200; border-bottom: 2px solid #f1f0f0; display: flex; align-items: center; }
.nav-inner { width: 100%; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; }
.nav-logo svg { width: 110px; height: auto; display: block; }
.nav-mobile { display: flex; align-items: center; gap: 16px; }
.nav-mobile svg { width: 24px; height: 24px; fill: #282828; }
.spacer { height: 60px; }
.container { padding: 16px; }
.campaign-image { position: relative; border-radius: 12px; overflow: hidden; margin-bottom: 16px; background: #e8f5e9; }
.campaign-image img { width: 100%; height: auto; display: block; object-fit: cover; }
.heart-btn { position: absolute; top: 12px; right: 12px; width: 40px; height: 40px; background: transparent; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3)); }
.heart-btn svg { width: 40px; height: 40px; }
.tags-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px; gap: 12px; flex-wrap: wrap; }
.tags-row > span:first-child { background-color: #f1f3f5; padding: 4px 8px; border-radius: 4px; font-weight: 600; color: #495057; font-size: 12px; }
.location { display: flex; align-items: center; gap: 4px; color: #868e96; font-size: 12px; font-weight: 600; }
.location svg { width: 16px; height: 16px; fill: currentColor; }
h1.campaign-title { font-size: 24px; font-weight: 900; line-height: 1.2; color: #212529; margin-bottom: 4px; }
.campaign-id { font-size: 12px; color: #adb5bd; margin-bottom: 20px; }
.mobile-stats-panel { background-color: #ffffff; padding: 16px; border-radius: 12px; margin-bottom: 24px; }
.progress-bar { width: 100%; height: 4px; background: #f1f0f0; border-radius: 2px; overflow: hidden; margin-bottom: 12px; }
.progress-fill { height: 100%; width: 10%; background: #24ca68; border-radius: 2px; }
.collected-value { font-size: 24px; font-weight: 900; color: #24ca68; margin-bottom: 16px; display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
.collected-goal { font-size: 16px; font-weight: 400; color: #8a8a8a; }
.stats-box { background: #eeffe6; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.stat-row { display: flex; justify-content: space-between; align-items: center; }
.stat-label { font-size: 14px; color: #4a4a4a; display: flex; align-items: center; gap: 6px; }
.stat-value { font-size: 14px; font-weight: 700; color: #282828; }
.short-desc { font-size: 15px; line-height: 1.5; color: #495057; margin-bottom: 20px; }
.short-desc span { color: #0a8f51; font-weight: 700; cursor: pointer; text-decoration: underline; display: inline-block; padding: 2px 4px; }
.full-desc { font-size: 15px; color: #343a40; line-height: 1.6; margin-bottom: 20px; }
.tabs-wrap { display: flex; overflow-x: auto; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; touch-action: pan-x; border-bottom: 1px solid #e9ecef; margin-bottom: 20px; gap: 16px; padding-bottom: 4px; white-space: nowrap; scrollbar-width: none; -ms-overflow-style: none; }
.tabs-wrap::-webkit-scrollbar { display: none; }
.tab { flex-shrink: 0; font-size: 15px; color: #6c757d; white-space: nowrap; padding: 10px 4px; cursor: pointer; border-bottom: 3px solid transparent; font-weight: 500; transition: all 0.2s ease; }
.tab.active { color: #24ca68; border-bottom-color: #24ca68; font-weight: 700; }
.tab:hover { color: #282828; }
.tab-empty { padding: 20px 0; color: #8a8a8a; font-size: 14px; }
.pix-row { font-size: 14px; color: #495057; margin-bottom: 8px; }
.pix-key { display: flex; align-items: center; justify-content: space-between; background-color: #e8f5e9; color: #0a8f51; padding: 14px 16px; border-radius: 8px; font-size: 16px; cursor: pointer; width: 100%; font-weight: 700; margin-bottom: 20px; }
.pix-key svg { fill: #0a8f51; width: 20px; height: 20px; flex-shrink: 0; }
.divider { height: 1px; background-color: #dee2e6; margin: 20px 0; }
.created-date { font-size: 13px; color: #6c757d; margin-bottom: 20px; }
.description h3 { font-size: 18px; line-height: 1.3; color: #212529; margin-top: 0; margin-bottom: 12px; }
.description p { font-size: 15px; line-height: 1.6; color: #343a40; margin-bottom: 16px; }
.aviso { font-size: 12px; color: #868e96; line-height: 1.5; margin: 0; }
.mobile-bottom { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; z-index: 200; box-shadow: 0 -4px 12px rgba(0,0,0,0.08); }
.mb-protected { background: #d5fac3; display: flex; align-items: center; justify-content: center; padding: 8px 16px; }
.mb-protected-badge { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #1a6e2e; border-radius: 30px; padding: 4px 12px 4px 6px; background: #fff; }
.mb-protected-badge span { font-size: 11px; font-weight: 900; color: #1a6e2e; letter-spacing: .05em; text-transform: uppercase; }
.mb-btns { padding: 12px 16px 16px; display: flex; flex-direction: column; gap: 10px; background: #fff; }
.mb-btns .btn-donate { width: 100%; padding: 16px; background: #24ca68; color: #fff; font-size: 18px; font-weight: 700; border: none; border-radius: 8px; text-align: center; display: block; cursor: pointer; }
.mb-btns .btn-share { width: 100%; padding: 16px; background: #fff; color: #282828; font-size: 18px; font-weight: 700; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; }
`;
