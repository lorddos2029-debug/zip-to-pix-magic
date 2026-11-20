import { CampaignFooter } from "./CampaignFooter";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronDown, Copy, Heart, LockKeyhole, Menu, Share2, Star, UserRound, X } from "lucide-react";
import { getTrackedPixHref } from "@/lib/campaign-attribution";
const gabiHero = "/gabi/gabi-destaque.png";
import "@/styles/willian.css";

const logo = "/willian/juntos-por-vidas-logo.png";
const campaignUrl = "https://www.juntos-por-vidas.online/gabi";
const contributions = [
  { name: "Noah C.", amount: 75, time: "há 32 minutos" },
  { name: "Emma W.", amount: 50, time: "há 2 horas" },
  { name: "Anónimo", amount: 100, time: "há 2 horas" },
  { name: "Ava M.", amount: 25, time: "há 2 horas" },
  { name: "Anónimo", amount: 50, time: "há 3 horas" },
  { name: "Mia H.", amount: 150, time: "há 3 horas" },
  { name: "Ethan P.", amount: 40, time: "há 4 horas" },
  { name: "Anónimo", amount: 200, time: "há 6 horas" },
];
const messages = [
  { name: "Charlotte D.", date: "28/10/2026", text: "Gabi, és uma guerreira. Estamos a rezar por ti e pela tua família todos os dias. Força e muito carinho!" },
  { name: "Benjamin R.", date: "28/10/2026", text: "Conheço o teu sorriso pelas fotos e ele já conquistou o meu coração. Há muitas pessoas a torcer por ti e pela tua família. Que este apoio vos traga mais tranquilidade." },
  { name: "Grace T.", date: "27/10/2026", text: "Rezei por ti hoje, Gabi. Que cada dia te traga mais força e mais conforto. A tua família não está sozinha nesta luta." },
  { name: "Lucas F.", date: "27/10/2026", text: "Fiz o meu donativo com muito carinho. Se cada pessoa der um pouquinho, podemos ajudar com os cuidados e as necessidades do dia a dia. Um abraço bem forte para ti e para a tua família." },
  { name: "Emma W.", date: "26/10/2026", text: "Gabi, nem te conheço pessoalmente e já te levo no coração. Muita gente está contigo e com a tua família, hoje e amanhã. Que nunca vos falte apoio." },
  { name: "Sophie K.", date: "25/10/2026", text: "Que Deus te proteja, Gabi. À tua família: coragem, um dia de cada vez. Que os dias melhores cheguem com mais cuidado e tranquilidade. Com todo o carinho." },
];

function ProgressRing() {
  return <div className="w-ring" role="img" aria-label="7% do objetivo angariado">
    <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="25" /><circle className="w-ring-value" cx="30" cy="30" r="25" pathLength="100" strokeDasharray="6.92 100" /></svg>
    <strong>7%</strong>
  </div>;
}

function Avatar({ name }: { name: string }) {
  return <span className="w-avatar" aria-hidden="true">{name === "Anónimo" ? <UserRound size={17} /> : name.slice(0, 1)}</span>;
}

export function GabiCampaign({ story }: { story: ReactNode }) {
  const [donationHref, setDonationHref] = useState("/doar");
  const [expanded, setExpanded] = useState(false);
  const [allContributions, setAllContributions] = useState(false);
  const [allMessages, setAllMessages] = useState(false);
  const [topGifts, setTopGifts] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [sticky, setSticky] = useState(false);
  const fundingRef = useRef<HTMLElement>(null);
  const shareDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setDonationHref(getTrackedPixHref().replace(/^\/pix(?=\?|$)/, "/doar"));
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    if (fundingRef.current) observer.observe(fundingRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shareOpen) shareDialog.current?.showModal();
    else shareDialog.current?.close();
  }, [shareOpen]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl);
      setNotice("Ligação copiada.");
    } catch {
      setNotice("Selecione e copie a ligação abaixo.");
    }
  };
  const sortedContributions = topGifts ? [...contributions].sort((a, b) => b.amount - a.amount) : contributions;

  return <div className="willian-page">
    <a className="w-skip" href="#gabi-main">Saltar para o conteúdo</a>
    <header className="w-header">
      <div className="w-header-inner">
        <a href="#contributions" className="w-icon" aria-label="Ver contribuições"><Heart size={21} /></a>
        <a href="/" className="w-brand"><img src={logo} width={74} height={74} alt="Juntos por Vidas" /></a>
        <button className="w-icon" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="gabi-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && <nav id="gabi-menu" aria-label="Navegação da campanha" onClick={() => setMenuOpen(false)}>
        <a href="#story">A história</a><a href="#contributions">Contribuições</a><a href="#support">Mensagens de apoio</a><a href="#faq">Perguntas frequentes</a>
      </nav>}
    </header>

    <main id="gabi-main" className="w-main">
      <section className="w-hero" aria-labelledby="gabi-title">
        <img src={gabiHero} alt="Gabi na sua cadeira de rodas" width={1448} height={1086} fetchPriority="high" />
        <h1 id="gabi-title">Ajude a Gabi a continuar o tratamento, as terapias e os medicamentos</h1>
      </section>

      <section ref={fundingRef} className="w-funding" aria-label="Progresso da campanha">
        <div className="w-funding-summary"><ProgressRing /><div>
          <p className="w-raised"><strong>1.521,56 €</strong> <span>angariados</span></p>
          <p className="w-goal">de um objetivo de <strong>22.000 €</strong></p>
          <p className="w-meta">421 apoiadores</p>
        </div></div>
        <div className="w-actions"><a className="w-button w-donate" href={donationHref}><Heart size={17} /> Doar</a><button className="w-button w-share" type="button" onClick={() => setShareOpen(true)}><Share2 size={17} /> Partilhar</button></div>
        <p className="w-trust"><LockKeyhole size={13} /> Pagamento seguro por MB WAY ou Multibanco</p>
      </section>

      <section id="story" className="w-section w-story-section">
        <h2>A história</h2>
        <div id="gabi-story" className={`w-story${expanded ? " is-expanded" : ""}`}>{story}</div>
        <button type="button" className="w-read-more" aria-expanded={expanded} aria-controls="gabi-story" onClick={() => setExpanded(!expanded)}>{expanded ? "Mostrar menos" : "Ler a história completa"}<ChevronDown size={16} /></button>
        <div className="w-actions"><a className="w-button w-outline" href={donationHref}>Doar</a><button className="w-button w-outline" type="button" onClick={() => setShareOpen(true)}>Partilhar</button></div>
      </section>

      <section id="contributions" className="w-section">
        <div className="w-section-heading"><h2>Últimas contribuições</h2><button className="w-sort" type="button" aria-pressed={topGifts} onClick={() => setTopGifts(!topGifts)}><Star size={13} />{topGifts ? "Ver recentes" : "Ver principais"}</button></div>
        <p className="w-feed-heading"><ArrowUpRight size={15} /> {topGifts ? "Maiores contributos" : "Contributos recentes"}</p>
        <ul className="w-feed">{sortedContributions.slice(0, allContributions ? contributions.length : 4).map((item, index) => <li key={`${item.name}-${item.amount}-${index}`}>
          <Avatar name={item.name} /><div><strong>{item.name}</strong><p className="w-feed-line"><b>{item.amount} €</b><span>{item.time}</span></p></div>
        </li>)}</ul>
        <button className="w-button w-outline w-full" type="button" aria-expanded={allContributions} onClick={() => setAllContributions(!allContributions)}>{allContributions ? "Mostrar menos" : "Ver todos"}</button>
      </section>

      <section id="sharing" className="w-section">
        <h2>Partilhar ajuda mais do que imagina</h2>
        <p className="w-section-note">Cada partilha da campanha pode fazer chegar a história da Gabi a mais pessoas e trazer apoio à sua família.</p>
        <figure className="w-share-preview">
          <img src={gabiHero} alt="Gabi e a sua família" loading="lazy" width={1448} height={1086} />
          <figcaption><div className="w-preview-stats"><img src={logo} alt="Juntos por Vidas" width={38} height={38} /><span>1.521,56 € angariados</span><ProgressRing /></div>
            <strong>Ajude a Gabi e a sua família</strong><div className="w-preview-bottom"><span>421 pessoas pela Gabi</span><a href={donationHref}>Doar agora <ArrowUpRight size={13} /></a></div>
          </figcaption>
        </figure>
        <button type="button" className="w-button w-outline w-full" onClick={() => setShareOpen(true)}><Share2 size={17} /> Partilhar a campanha</button>
      </section>

      <section id="organizer" className="w-section">
        <h2>Organizador e beneficiário</h2><div className="w-organizer"><img src={logo} width={66} height={66} alt="Logo Juntos por Vidas" /><div><h3>Juntos por Vidas</h3><p className="org-role" data-verified-line=""><span className="chip chip-verified" title="Relatório médico e orçamento do tratamento revistos pela nossa equipa em 14/09/2026"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M12 1.5 14.9 3.9l3.7-.5 1.1 3.6 3.2 1.9-1.4 3.5 1.4 3.5-3.2 1.9-1.1 3.6-3.7-.5L12 22.5l-2.9-2.4-3.7.5-1.1-3.6-3.2-1.9L2.5 11.6 1.1 8.1l3.2-1.9 1.1-3.6 3.7.5z" /><path d="m8.5 12 2.3 2.3 4.7-4.7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg><span>Verificado pela Donors Club</span></span></p><p>Organiza esta campanha em nome da Gabi e da sua família. Cada donativo destina-se a apoiar os cuidados e as necessidades do dia a dia da Gabi, com segurança e dignidade.</p></div></div>
      </section>

      <section id="support" className="w-section">
        <h2>Mensagens de apoio</h2><p className="w-section-note">Só quem faz um donativo pode deixar uma mensagem. As mensagens escritas no checkout são guardadas com o respetivo donativo.</p>
        <ul className="w-feed w-messages">{messages.slice(0, allMessages ? messages.length : 3).map((message) => <li key={message.name}>
          <Avatar name={message.name} /><div><strong>{message.name}</strong><p className="w-message-text">{message.text}</p><div className="w-message-meta"><span>{message.date}</span><a aria-label={`Denunciar mensagem de ${message.name} por email`} href={`mailto:doacoes@juntos-por-vidas.online?subject=${encodeURIComponent("Denúncia de mensagem — campanha da Gabi")}&body=${encodeURIComponent(`Mensagem de ${message.name}, de ${message.date}:\n${message.text}\n\nMotivo da denúncia:\n`)}`}>Denunciar</a></div></div>
        </li>)}</ul>
        <button type="button" className="w-button w-outline w-more" aria-expanded={allMessages} onClick={() => setAllMessages(!allMessages)}>{allMessages ? "Mostrar menos" : "Carregar mais"}</button>
      </section>

      <section id="faq" className="w-section w-faq"><h2>Antes de contribuir</h2>
        <details><summary>Para onde vai o meu donativo?</summary><p>As contribuições destinam-se ao tratamento, às terapias, aos medicamentos e aos cuidados da Gabi.</p></details>
        <details><summary>Como posso ajudar?</summary><p>Escolha “Doar”, indique o montante e os seus dados e selecione MB WAY ou Multibanco. Também pode partilhar a campanha.</p></details>
        <details><summary>Recebo confirmação do donativo?</summary><p>Após a confirmação do pagamento, recebe um email de agradecimento com o recibo de doação em PDF.</p></details>
        <details><summary>Como deixo uma mensagem de apoio?</summary><p>Escreva a sua mensagem no campo opcional do checkout. Ela fica associada ao seu donativo.</p></details>
      </section>
    </main>

    <CampaignFooter />

    {sticky && <aside className="w-sticky" aria-label="Contribuir para a Gabi"><div className="w-sticky-summary"><ProgressRing /><div><strong>1.521,56 € <span>angariados</span></strong><p>de um objetivo de 22.000 €</p></div></div><a href={donationHref} className="w-button w-donate">Doar</a><button type="button" className="w-button w-share" onClick={() => setShareOpen(true)}>Partilhar</button></aside>}

    <dialog ref={shareDialog} className="w-share-dialog" aria-labelledby="gabi-share-title" onCancel={() => setShareOpen(false)} onClose={() => setShareOpen(false)}>
      <div className="w-section-heading"><h2 id="gabi-share-title">Partilhar a campanha</h2><button type="button" className="w-icon" aria-label="Fechar" onClick={() => setShareOpen(false)}><X /></button></div>
      <p>Ajude a levar a história da Gabi a mais pessoas.</p>
      <div className="w-social-links"><a href={`https://wa.me/?text=${encodeURIComponent("Ajude a Gabi e a sua família. " + campaignUrl)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`} target="_blank" rel="noopener noreferrer">Facebook</a></div>
      <label>Ligação da campanha<input readOnly value={campaignUrl} onFocus={(event) => event.target.select()} /></label>
      <button className="w-button w-donate w-full" type="button" onClick={() => void copyLink()}><Copy size={16} /> Copiar ligação</button><p role="status">{notice}</p>
    </dialog>
  </div>;
}
