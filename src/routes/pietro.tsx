import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MapPin, Menu, Search, Share2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import "@/pietro.css";

const DESCRIPTION = "Conheça a história de Pietro Hamm dos Santos e ajude sua família a custear um tratamento experimental com Cytotron no México.";

export const Route = createFileRoute("/pietro")({
  head: () => ({
    meta: [
      { title: "Salve o Pietro — ajude no tratamento no México" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Salve o Pietro — ajude no tratamento no México" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://zip-to-pix-magic.lovable.app/pietro" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://zip-to-pix-magic.lovable.app/pietro" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" },
    ],
  }),
  component: PietroCampaign,
});

type PietroTab = "entenda" | "atualizacoes" | "quem" | "perguntas";

const TABS: Array<{ id: PietroTab; label: string }> = [
  { id: "entenda", label: "Entenda" },
  { id: "atualizacoes", label: "Atualizações" },
  { id: "quem", label: "Quem ajudou" },
  { id: "perguntas", label: "Perguntas e Respostas" },
];

const SUPPORTERS = [
  { name: "Ana", detail: "Doou R$ 10,00", time: "há 1 dia" },
  { name: "Maria", detail: "Apoiou a campanha", time: "recentemente" },
  { name: "Juliana", detail: "Apoiou a campanha", time: "recentemente" },
  { name: "Fernanda", detail: "Apoiou a campanha", time: "recentemente" },
  { name: "Amanda", detail: "Apoiou a campanha", time: "recentemente" },
  { name: "Carolina", detail: "Apoiou a campanha", time: "recentemente" },
];

const FAQS = [
  { question: "Qual é o objetivo da campanha?", answer: "Arrecadar os recursos necessários para levar o Pietro ao México, onde existe a possibilidade de realizar um tratamento experimental com Cytotron." },
  { question: "O que é o tratamento com Cytotron?", answer: "É uma possibilidade experimental apresentada à família. A campanha não promete cura nem garante resultados, mas busca oferecer ao Pietro uma nova oportunidade e mais qualidade de vida." },
  { question: "Para onde vão as doações?", answer: "Os recursos são destinados ao tratamento, deslocamento, hospedagem, alimentação, cuidados médicos e demais necessidades da viagem ao México." },
  { question: "Qual é o valor mínimo para ajudar?", answer: "A página oficial informa que R$ 20 já ajudam. Você também pode contribuir com outro valor no checkout." },
  { question: "Como posso ajudar sem doar?", answer: "Compartilhe a história do Pietro com amigos, familiares e grupos. Cada compartilhamento amplia o alcance da campanha." },
];

function CampaignHeader({ onShare }: { onShare: () => void }) {
  return (
    <header className="pietro-header">
      <div className="mx-auto flex h-14 max-w-[38rem] items-center justify-between px-4">
        <Link to="/pietro" aria-label="Campanha do Pietro" className="flex items-center">
          <img src="/pietro/vakinha-logo.png" alt="Vakinha" width={300} height={80} className="h-8 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Pesquisar"><Search className="size-5" /></Button>
          <Button variant="ghost" size="icon" aria-label="Compartilhar campanha" onClick={onShare}><Share2 className="size-5" /></Button>
          <Button variant="ghost" size="icon" aria-label="Abrir menu"><Menu className="size-5" /></Button>
        </div>
      </div>
    </header>
  );
}

function CampaignStats() {
  return (
    <section className="mt-5 rounded-lg bg-[var(--pietro-surface)] p-4" aria-label="Arrecadação">
      <div className="h-1 overflow-hidden rounded-full bg-[var(--pietro-border)]"><div className="pietro-progress h-full rounded-full bg-[var(--pietro-primary)]" /></div>
      <p className="mt-3 text-2xl font-black text-[var(--pietro-primary-strong)]">R$ 110.000,00 <span className="text-base font-normal text-[var(--pietro-muted)]">de R$ 500.000,00</span></p>
      <p className="mt-1 text-sm text-[var(--pietro-muted)]">22% da meta — faltam R$ 390.000,00</p>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-[var(--pietro-primary-soft)] p-4">
        <div><p className="text-sm text-[var(--pietro-muted)]">Pessoas que ajudaram</p><strong className="mt-1 block">2.905</strong></div>
        <div><p className="flex items-center gap-1 text-sm text-[var(--pietro-muted)]">Corrente do bem <Heart className="size-4 fill-current text-[var(--pietro-primary-strong)]" /></p><strong className="mt-1 block">R$ 20 já ajudam</strong></div>
      </div>
    </section>
  );
}

function AboutPietro() {
  return (
    <div className="pietro-tab-panel space-y-4 text-[15px] leading-7">
      <h2 className="text-xl font-black">Entenda</h2>
      <h3 className="text-lg font-bold">A história do Pietro</h3>
      <p>Pietro Hamm dos Santos foi um bebê muito sonhado e nasceu saudável. Com apenas 1 mês e 3 dias de vida, um engasgo com leite materno causou uma lesão cerebral, mudando completamente a rotina da família.</p>
      <figure className="overflow-hidden rounded-lg border border-[var(--pietro-border)]">
        <img src="/pietro/pietro-story.jpg" alt="Pietro com sua família" width={960} height={1280} loading="lazy" className="max-h-[34rem] w-full object-cover object-top" />
        <figcaption className="px-4 py-3 text-sm text-[var(--pietro-muted)]">O amor da família acompanha o Pietro em cada etapa dessa jornada.</figcaption>
      </figure>
      <p>Ainda no hospital, Pietro precisou passar por uma traqueostomia. Ao todo, já enfrentou quatro cirurgias. Depois veio o diagnóstico de paralisia cerebral com quadriplegia espástica grau 5 e epilepsia.</p>
      <p>Hoje, ele não engole, não tosse, não pisca e depende de cuidados constantes para viver. Recebe acompanhamento pelo Home Care do SUS e continua lutando todos os dias ao lado da família.</p>
      <figure className="overflow-hidden rounded-lg border border-[var(--pietro-border)]">
        <img src="/pietro/pietro-care.jpg" alt="Pietro durante seus cuidados diários" width={719} height={1600} loading="lazy" className="max-h-[34rem] w-full object-cover object-top" />
        <figcaption className="px-4 py-3 text-sm text-[var(--pietro-muted)]">Cuidado, terapias e esperança fazem parte da rotina do Pietro.</figcaption>
      </figure>
      <h3 className="text-lg font-black">O tratamento no México</h3>
      <p>A família luta para levá-lo ao México, onde existe a possibilidade de um tratamento experimental com Cytotron. O objetivo é buscar mais conforto, qualidade de vida e novas possibilidades para o Pietro.</p>
      <h3 className="text-lg font-black">Para onde vão as doações</h3>
      <ul className="space-y-3">
        <li><strong>Tratamento:</strong> custos relacionados ao procedimento experimental com Cytotron.</li>
        <li><strong>Viagem:</strong> deslocamento, hospedagem e alimentação da família no México.</li>
        <li><strong>Cuidados:</strong> acompanhamento médico e demais necessidades durante a jornada.</li>
      </ul>
      <p className="rounded-lg bg-[var(--pietro-primary-soft)] p-4 font-bold">O Cytotron é um tratamento experimental. Os resultados variam conforme cada caso e não existe promessa ou garantia de cura.</p>
      <p><strong>Com amor, fé e esperança, a família segue lutando pelo Pietro. Cada contribuição aproxima essa viagem.</strong></p>
      <p className="border-t border-[var(--pietro-border)] pt-5 text-xs leading-5 text-[var(--pietro-muted)]">AVISO LEGAL: O texto e as imagens desta página reproduzem informações públicas divulgadas pela campanha oficial da família. O tratamento citado é experimental e não possui garantia de resultado.</p>
    </div>
  );
}

function UpdatesPanel() {
  return (
    <div className="pietro-tab-panel py-2">
      <article className="flex gap-4 border-b border-[var(--pietro-border)] py-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[var(--pietro-primary-soft)] text-center text-[var(--pietro-primary-strong)]"><Heart className="size-6 fill-current" /></div>
        <div><h2 className="font-bold">Campanha em andamento</h2><p className="mt-1 text-sm leading-6 text-[var(--pietro-muted)]">A família segue arrecadando para o tratamento experimental, a viagem e os cuidados necessários no México.</p></div>
      </article>
      <article className="flex gap-4 border-b border-[var(--pietro-border)] py-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[var(--pietro-primary-soft)] text-center font-black text-[var(--pietro-primary-strong)]">22%</div>
        <div><h2 className="font-bold">R$ 110 mil arrecadados</h2><p className="mt-1 text-sm leading-6 text-[var(--pietro-muted)]">A corrente já reuniu 2.905 pessoas e alcançou 22% da meta divulgada pela campanha.</p></div>
      </article>
    </div>
  );
}

function SupportersPanel() {
  return (
    <div className="pietro-tab-panel divide-y divide-[var(--pietro-border)]">
      {SUPPORTERS.map((supporter) => (
        <article key={supporter.name} className="flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--pietro-primary-soft)] font-black text-[var(--pietro-primary-strong)]">{supporter.name.charAt(0)}</span><div className="min-w-0"><h2 className="truncate font-bold">{supporter.name}</h2><p className="text-xs text-[var(--pietro-muted)]">{supporter.time}</p></div></div>
          <strong className="shrink-0 text-sm text-[var(--pietro-primary-strong)]">{supporter.detail}</strong>
        </article>
      ))}
    </div>
  );
}

function QuestionsPanel() {
  return (
    <div className="pietro-tab-panel divide-y divide-[var(--pietro-border)]">
      {FAQS.map((item) => <details key={item.question} className="py-4"><summary className="cursor-pointer list-none pr-6 font-bold marker:hidden">{item.question}</summary><p className="mt-3 text-sm leading-6 text-[var(--pietro-muted)]">{item.answer}</p></details>)}
    </div>
  );
}

function CampaignTabs({ active, onChange }: { active: PietroTab; onChange: (tab: PietroTab) => void }) {
  return (
    <>
      <div role="tablist" aria-label="Informações da campanha" className="mt-6 grid min-w-0 grid-cols-2 border-b border-[var(--pietro-border)] sm:flex sm:gap-5">
        {TABS.map((item) => <Button key={item.id} type="button" role="tab" aria-controls="pietro-tab-content" aria-selected={active === item.id} variant="ghost" onClick={() => onChange(item.id)} className="pietro-tab pointer-events-auto h-12 min-w-0 touch-manipulation rounded-none border-b-2 border-transparent px-2 text-sm text-[var(--pietro-muted)] hover:bg-transparent sm:shrink-0 sm:px-1">{item.label}</Button>)}
      </div>
      <div id="pietro-tab-content" role="tabpanel" className="pt-5">
        {active === "entenda" && <AboutPietro />}
        {active === "atualizacoes" && <UpdatesPanel />}
        {active === "quem" && <SupportersPanel />}
        {active === "perguntas" && <QuestionsPanel />}
      </div>
    </>
  );
}

function DonationBar({ onShare }: { onShare: () => void }) {
  return (
    <div className="pietro-bottom fixed inset-x-0 bottom-0 z-50 bg-[var(--pietro-surface)]">
      <div className="flex items-center justify-center gap-2 bg-[var(--pietro-primary-soft)] py-2 text-xs font-black uppercase text-[var(--pietro-primary-strong)]"><ShieldCheck className="size-5" /> Doação Protegida</div>
      <div className="mx-auto flex max-w-[38rem] gap-3 p-3">
        <Button asChild className="h-12 flex-1 bg-[var(--pietro-primary)] text-base font-bold text-primary-foreground hover:bg-[var(--pietro-primary-strong)]"><Link to="/pix">Quero Ajudar</Link></Button>
        <Button variant="outline" className="h-12 flex-1 text-base font-bold" onClick={onShare}>Compartilhar</Button>
      </div>
    </div>
  );
}

function PietroCampaign() {
  const [activeTab, setActiveTab] = useState<PietroTab>("entenda");
  const [liked, setLiked] = useState(false);
  const share = () => {
    const data = { title: "Salve o Pietro", text: "Ajude o Pietro em sua jornada pelo tratamento no México.", url: window.location.href };
    if (navigator.share) void navigator.share(data).catch(() => undefined);
    else void navigator.clipboard?.writeText(data.url).catch(() => undefined);
  };

  return (
    <div className="pietro-page">
      <CampaignHeader onShare={share} />
      <main className="mx-auto min-w-0 max-w-[38rem] px-4 py-4">
        <div className="relative overflow-hidden rounded-lg bg-[var(--pietro-primary-soft)]">
          <img src="/pietro/pietro-hero.jpg" alt="Pietro Hamm dos Santos com sua família" width={960} height={1280} fetchPriority="high" className="max-h-[38rem] w-full object-cover object-top" />
          <Button variant="secondary" size="icon" aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={liked} onClick={() => setLiked((value) => !value)} className="absolute right-3 top-3 rounded-full"><Heart className={liked ? "fill-[var(--pietro-primary)] text-[var(--pietro-primary)]" : "text-[var(--pietro-muted)]"} /></Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase text-[var(--pietro-muted)]"><span className="rounded bg-[var(--pietro-border)] px-2 py-1">Campanha oficial da família</span><span className="flex items-center gap-1"><MapPin className="size-4" /> Destino: México</span></div>
        <h1 className="mt-3 text-2xl font-black leading-tight">Salve o Pietro: ajude no tratamento com Cytotron no México</h1>
        <CampaignStats />
        <p className="mt-5 text-[15px] leading-6 text-[var(--pietro-muted)]">Com 1 mês e 3 dias de vida, um engasgo com leite materno causou uma lesão cerebral no Pietro. Hoje ele vive com paralisia cerebral grave e depende de cuidados constantes. A família busca uma possibilidade de tratamento experimental no México.</p>
        <CampaignTabs active={activeTab} onChange={setActiveTab} />
      </main>
      <DonationBar onShare={share} />
    </div>
  );
}