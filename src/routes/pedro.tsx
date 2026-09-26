import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MapPin, Menu, Search, Share2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import "@/pedro.css";

export const Route = createFileRoute("/pedro")({
  head: () => ({
    meta: [
      { title: "Ajude Pedro Leonardo e sua família" },
      { name: "description", content: "Participe da campanha de apoio ao Pedro Leonardo e sua família. Doe via Pix e acompanhe a arrecadação." },
      { property: "og:title", content: "Ajude Pedro Leonardo e sua família" },
      { property: "og:description", content: "Participe da campanha de apoio ao Pedro Leonardo e sua família. Doe via Pix e acompanhe a arrecadação." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" },
    ],
  }),
  component: PedroCampaign,
});

type PedroTab = "sobre" | "atualizacoes" | "quem" | "perguntas";

const TABS: Array<{ id: PedroTab; label: string }> = [
  { id: "sobre", label: "Sobre" },
  { id: "atualizacoes", label: "Atualizações" },
  { id: "quem", label: "Quem ajudou" },
  { id: "perguntas", label: "Perguntas e Respostas" },
];

const SUPPORTERS = [
  { name: "João", amount: "R$ 40,00", time: "há poucos minutos" },
  { name: "Eva", amount: "R$ 45,00", time: "há 22 minutos" },
  { name: "Bruno", amount: "R$ 45,00", time: "há 1 hora" },
  { name: "Liz", amount: "R$ 10,00", time: "há 2 horas" },
  { name: "Anônimo", amount: "R$ 100,00", time: "há 3 horas" },
  { name: "Márcia", amount: "R$ 50,00", time: "há 5 horas" },
];

const FAQS = [
  { question: "Para onde vai o valor arrecadado?", answer: "O valor será destinado à compra de um carro, de uma cadeira de rodas motorizada e à reforma da casa da família para dar mais conforto e autonomia ao Pedro." },
  { question: "Qual é o valor mínimo para doar?", answer: "A contribuição mínima é de R$ 20,00. Qualquer valor acima disso faz diferença para a família." },
  { question: "Como faço uma doação via Pix?", answer: "Toque em “Quero Ajudar”, escolha o valor, informe seus dados e use o QR Code ou o código Pix copia e cola." },
  { question: "Como sei que meu pagamento foi confirmado?", answer: "Após o pagamento, a página acompanha a confirmação do Pix e mostra uma mensagem quando ele for aprovado." },
  { question: "Como posso ajudar sem fazer uma doação?", answer: "Compartilhe esta campanha com amigos, familiares e grupos. Cada novo compartilhamento pode alcançar alguém disposto a ajudar." },
];

function VakinhaMark() {
  return (
    <Link to="/pedro" aria-label="Página inicial da Vakinha" className="flex items-center">
      <img src="/pedro/vakinha-logo.png" alt="Vakinha" width={300} height={80} className="h-8 w-auto object-contain" />
    </Link>
  );
}

function CampaignHeader({ onShare }: { onShare: () => void }) {
  return (
    <header className="pedro-header">
      <div className="mx-auto flex h-14 max-w-[38rem] items-center justify-between px-4">
        <VakinhaMark />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Pesquisar"><Search className="size-5" /></Button>
          <Button variant="ghost" size="icon" aria-label="Compartilhar vaquinha" onClick={onShare}><Share2 className="size-5" /></Button>
          <Button variant="ghost" size="icon" aria-label="Abrir menu"><Menu className="size-5" /></Button>
        </div>
      </div>
    </header>
  );
}

function CampaignStats() {
  return (
    <section className="mt-5 rounded-lg bg-[var(--pedro-surface)] p-4" aria-label="Arrecadação">
      <div className="h-1 overflow-hidden rounded-full bg-[var(--pedro-border)]"><div className="pedro-progress h-full rounded-full bg-[var(--pedro-primary)]" /></div>
      <p className="mt-3 text-2xl font-black text-[var(--pedro-primary-strong)]">R$ 1.521,56 <span className="text-base font-normal text-[var(--pedro-muted)]">de R$ 42.000,00</span></p>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-[var(--pedro-primary-soft)] p-4">
        <div><p className="flex items-center gap-1 text-sm text-[var(--pedro-muted)]">Corações Recebidos <Heart className="size-4 fill-current text-[var(--pedro-primary-strong)]" /></p><strong className="mt-1 block">1.755</strong></div>
        <div><p className="text-sm text-[var(--pedro-muted)]">Apoiadores</p><strong className="mt-1 block">421</strong></div>
      </div>
    </section>
  );
}

function AboutPedro() {
  return (
    <div className="pedro-tab-panel space-y-4 text-[15px] leading-7">
      <p className="border-t border-[var(--pedro-border)] pt-5 text-sm text-[var(--pedro-muted)]"><strong>Vaquinha criada em:</strong> 20/09/2026</p>
      <h2 className="text-xl font-black">Entenda</h2>
      <p>Pedro tem 4 anos. Para chegar ao hospital em Montes Claros, a família sai de moto até um ponto de encontro perto da Ponte Cigano, porque o táxi não consegue entrar na estrada de terra até a casa. Ali, embarcam no carro fretado. Quando o veículo já está cheio e não há espaço para a cadeira de rodas, Pedro faz o trajeto inteiro no colo. “Ele é igual chumbo”, diz o pai, Farley, sobre o peso de carregá-lo por duas horas de viagem.</p>
      <img src="/pedro/pedro-story.jpg" alt="Pedro Leonardo sorrindo" width={1100} height={572} loading="lazy" className="w-full rounded-lg object-cover" />
      <p>Pedro nasceu com uma doença rara e progressiva chamada Hialinose Fibromatose Congênita, que vai afetando cada vez mais os movimentos do corpo, chegando a originar tumores. As articulações das pernas não esticam. Os braços têm alcance limitado. E, desde muito pequeno, ele convive com dores fortes o bastante para precisar de morfina, metadona e gabapentina todos os dias. Não existe cura. Só acompanhamento contínuo, para tentar dar mais qualidade de vida a ele.</p>
      <p>Farley é trabalhador rural, sem emprego fixo, e cria Pedro com a ajuda da avó, revezando os dias de cuidado com os dias de trabalho. Mora com o filho e os avós na zona rural de Coração de Jesus, em Minas Gerais. Hoje ele tem a guarda provisória de Pedro e segue no processo judicial para conseguir a guarda definitiva.</p>
      <p>Apesar de tudo, Farley descreve o filho como uma criança muito inteligente, que acompanha o que acontece ao redor mesmo sem conseguir se mexer como gostaria. Ele acredita que uma cadeira de rodas motorizada, adaptada ao movimento que Pedro ainda tem nos braços, poderia dar ao menino uma independência que hoje ele não tem. É um dos maiores sonhos da família.</p>
      <p>Farley resume assim o que sente: “Hoje eu vivo por ele. As pernas, os braços, é tudo.” E completa: “Ele não pediu para vir ao mundo. Agora a gente tem que dar o melhor para ele.”</p>
      <p>Por isso essa vaquinha existe. Para comprar um carro que tire Pedro do colo e da moto nos dias de consulta. Para dar a ele uma cadeira de rodas motorizada, que devolva parte da autonomia que a doença tirou. E para reformar a casa, com um quarto adaptado, forro e climatização, porque hoje ele ainda não tem o conforto básico que merece.</p>
      <p><strong>Cada valor doado ajuda a construir isso. Doe pelo link e faça parte da vida de Pedro.</strong></p>
      <p className="border-t border-[var(--pedro-border)] pt-5 text-xs leading-5 text-[var(--pedro-muted)]">AVISO LEGAL: O texto e as imagens incluídos nessa página são de única e exclusiva responsabilidade do criador da vaquinha e não representam a opinião ou endosso da plataforma.</p>
      <div className="border-t border-[var(--pedro-border)] py-5"><p className="text-sm text-[var(--pedro-muted)]">Vaquinha criada por</p><p className="font-bold">Família do Pedro Leonardo</p><p className="text-sm text-[var(--pedro-muted)]">para ajudar o Pedro Leonardo e sua família.</p></div>
    </div>
  );
}

function UpdatesPanel() {
  return (
    <div className="pedro-tab-panel py-2">
      <article className="flex gap-4 border-b border-[var(--pedro-border)] py-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[var(--pedro-primary-soft)] text-center text-[var(--pedro-primary-strong)]">
          <span className="text-xl font-black leading-none">13</span><span className="text-xs font-bold uppercase">Set</span>
        </div>
        <div><h2 className="font-bold">Vaquinha criada</h2><p className="mt-1 text-sm leading-6 text-[var(--pedro-muted)]">Abrimos esta arrecadação para ajudar o Pedro Leonardo e sua família.</p></div>
      </article>
    </div>
  );
}

function SupportersPanel() {
  return (
    <div className="pedro-tab-panel divide-y divide-[var(--pedro-border)]">
      {SUPPORTERS.map((supporter) => (
        <article key={`${supporter.name}-${supporter.time}`} className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[var(--pedro-primary-soft)] font-black text-[var(--pedro-primary-strong)]">{supporter.name.charAt(0)}</span><div><h2 className="font-bold">{supporter.name}</h2><p className="text-xs text-[var(--pedro-muted)]">{supporter.time}</p></div></div>
          <strong className="text-sm text-[var(--pedro-primary-strong)]">{supporter.amount}</strong>
        </article>
      ))}
    </div>
  );
}

function QuestionsPanel() {
  return (
    <div className="pedro-tab-panel divide-y divide-[var(--pedro-border)]">
      {FAQS.map((item) => (
        <details key={item.question} className="group py-4">
          <summary className="cursor-pointer list-none pr-6 font-bold marker:hidden">{item.question}</summary>
          <p className="mt-3 text-sm leading-6 text-[var(--pedro-muted)]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

function CampaignTabs({ active, onChange }: { active: PedroTab; onChange: (tab: PedroTab) => void }) {
  return (
    <>
      <div role="tablist" aria-label="Informações da vaquinha" className="pedro-scrollbar mt-6 flex gap-5 overflow-x-auto border-b border-[var(--pedro-border)]">
        {TABS.map((item) => (
          <Button key={item.id} role="tab" aria-selected={active === item.id} variant="ghost" onClick={() => onChange(item.id)} className="pedro-tab h-12 shrink-0 rounded-none border-b-2 border-transparent px-1 text-[var(--pedro-muted)] hover:bg-transparent">{item.label}</Button>
        ))}
      </div>
      <div role="tabpanel" className="pt-5">
        {active === "sobre" && <AboutPedro />}
        {active === "atualizacoes" && <UpdatesPanel />}
        {active === "quem" && <SupportersPanel />}
        {active === "perguntas" && <QuestionsPanel />}
      </div>
    </>
  );
}

function DonationBar({ onShare }: { onShare: () => void }) {
  return (
    <div className="pedro-bottom fixed inset-x-0 bottom-0 z-50 bg-[var(--pedro-surface)]">
      <div className="flex items-center justify-center gap-2 bg-[var(--pedro-primary-soft)] py-2 text-xs font-black uppercase text-[var(--pedro-primary-strong)]"><ShieldCheck className="size-5" /> Doação Protegida</div>
      <div className="mx-auto flex max-w-[38rem] gap-3 p-3">
        <Button asChild className="h-12 flex-1 bg-[var(--pedro-primary)] text-base font-bold text-primary-foreground hover:bg-[var(--pedro-primary-strong)]"><Link to="/pix">Quero Ajudar</Link></Button>
        <Button variant="outline" className="h-12 flex-1 text-base font-bold" onClick={onShare}>Compartilhar</Button>
      </div>
    </div>
  );
}

function PedroCampaign() {
  const [activeTab, setActiveTab] = useState<PedroTab>("sobre");
  const [liked, setLiked] = useState(false);
  const share = () => {
    const data = { title: "Ajude Pedro Leonardo e sua família", url: window.location.href };
    if (navigator.share) void navigator.share(data).catch(() => undefined);
    else void navigator.clipboard?.writeText(data.url).catch(() => undefined);
  };

  return (
    <div className="pedro-page">
      <CampaignHeader onShare={share} />
      <main className="mx-auto max-w-[38rem] px-4 py-4">
        <div className="relative overflow-hidden rounded-lg bg-[var(--pedro-primary-soft)]">
          <img src="/pedro/pedro-hero.jpg" alt="Pedro Leonardo sentado e brincando" width={915} height={515} fetchPriority="high" className="aspect-[915/515] w-full object-cover" />
          <Button variant="secondary" size="icon" aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={liked} onClick={() => setLiked((value) => !value)} className="absolute right-3 top-3 rounded-full"><Heart className={liked ? "fill-[var(--pedro-primary)] text-[var(--pedro-primary)]" : "text-[var(--pedro-muted)]"} /></Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase text-[var(--pedro-muted)]"><span className="rounded bg-[var(--pedro-border)] px-2 py-1">Solidariedade</span><span className="flex items-center gap-1"><MapPin className="size-4" /> Brasil</span></div>
        <h1 className="mt-3 text-2xl font-black leading-tight">Ajude o Pedro Leonardo e sua família</h1>
        <p className="mt-1 text-xs text-[var(--pedro-muted)]">ID: PEDRO2026</p>
        <CampaignStats />
        <p className="mt-5 text-[15px] leading-6 text-[var(--pedro-muted)]">Pedro tem 4 anos e uma doença rara que compromete os movimentos, gerou tumores na cabeça e causa dores intensas desde bebê. Ele vive com o pai, Farley, e os avós, numa comunidade rural sem transporte próprio. Quando precisa ir ao hospital, é carregado no colo por até duas horas. Ajude a família a comprar um carro, uma cadeira de rodas motorizada e reformar a casa para dar mais conforto e autonomia a ele.</p>
        <CampaignTabs active={activeTab} onChange={setActiveTab} />
      </main>
      <DonationBar onShare={share} />
    </div>
  );
}