import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MapPin, Menu, Search, Share2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import miguelCover from "@/assets/miguel-1.jpeg.asset.json";
import miguelStory from "@/assets/miguel-2.jpeg.asset.json";
import { Button } from "@/components/ui/button";
import "@/miguel.css";

const DESCRIPTION = "Miguel tem um tumor no rosto e precisa de cirurgia urgente. Doe por PIX em menos de 1 minuto e ajude a custear o tratamento dele.";

export const Route = createFileRoute("/miguel")({
  head: () => ({
    meta: [
      { title: "Ajude o Miguel — a cirurgia que pode devolver sua vida" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Ajude o Miguel — a cirurgia que pode devolver sua vida" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://zip-to-pix-magic.lovable.app/miguel" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://zip-to-pix-magic.lovable.app/miguel" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" },
    ],
  }),
  component: MiguelCampaign,
});

type MiguelTab = "sobre" | "atualizacoes" | "quem" | "perguntas";

const TABS: Array<{ id: MiguelTab; label: string }> = [
  { id: "sobre", label: "Sobre" },
  { id: "atualizacoes", label: "Atualizações" },
  { id: "quem", label: "Quem ajudou" },
  { id: "perguntas", label: "Perguntas e Respostas" },
];

const SUPPORTERS = [
  { name: "Camila Nogueira", time: "há 11 minutos", hearts: 118, message: "Não consegui conter as lágrimas ao ver as fotos do Miguel. Um menino tão pequeno carregando uma dor tão grande… doei com muita fé e peço que Deus abençoe essa família." },
  { name: "Anderson Prado", time: "há 52 minutos", hearts: 76, message: "Sou pai e imagino o desespero de ver o filho assim, sem poder pagar a cirurgia. Contribuí e já compartilhei com a família toda. Vamos ajudar o Miguel!" },
  { name: "Sônia Vasques", time: "há 2 horas", hearts: 154, message: "Cada um doando um pouquinho o Miguel consegue operar. Compartilhei com toda a minha igreja. Que essa criança volte a sorrir sem dor!" },
];

const FAQS = [
  { question: "Como funciona a doação?", answer: "Escolha um valor, toque no botão e um QR Code PIX é gerado na hora. Abra o app do banco, escaneie ou cole o código e confirme. Leva menos de 1 minuto." },
  { question: "Qual é a situação do Miguel?", answer: "Miguel tem um tumor que cresce no rosto e no pescoço. A massa já deforma a face, dificulta comer, dormir e respirar e provoca dores fortes todos os dias. Segundo a família, os médicos indicaram cirurgia com urgência, além de exames e medicamentos que a mãe dele não tem condições de custear." },
  { question: "Minha doação é segura?", answer: "Sim. A transferência acontece dentro do app do seu próprio banco, pelo sistema PIX do Banco Central. Esta página não coleta cartão, senha nem dados sensíveis." },
  { question: "Não posso doar — como ajudo de outra forma?", answer: "Compartilhe a história do Miguel pelo WhatsApp, Instagram ou Facebook. Um simples compartilhamento pode alcançar a pessoa certa e fazer toda a diferença." },
  { question: "O dinheiro realmente chega para a família?", answer: "Sim. Os recursos são destinados diretamente aos cuidados do Miguel — a cirurgia, exames, medicamentos, consultas e deslocamentos. Já são 398 pessoas e R$ 21.470 arrecadados dos R$ 88.000 necessários." },
];

function CampaignHeader({ onShare }: { onShare: () => void }) {
  return <header className="miguel-header"><div className="mx-auto flex h-14 max-w-[38rem] items-center justify-between px-4"><Link to="/miguel" className="flex items-center gap-2 font-black text-[var(--miguel-primary-strong)]" aria-label="Campanha do Miguel"><span className="grid size-8 place-items-center rounded-md bg-[var(--miguel-primary)] text-lg text-primary-foreground">J</span><span className="text-lg">Juntos por Vidas</span></Link><div className="flex items-center gap-1"><Button variant="ghost" size="icon" aria-label="Pesquisar"><Search className="size-5" /></Button><Button variant="ghost" size="icon" aria-label="Compartilhar campanha" onClick={onShare}><Share2 className="size-5" /></Button><Button variant="ghost" size="icon" aria-label="Abrir menu"><Menu className="size-5" /></Button></div></div></header>;
}

function CampaignStats() {
  return <section className="mt-5 rounded-lg bg-[var(--miguel-surface)] p-4" aria-label="Arrecadação"><div className="h-1 overflow-hidden rounded-full bg-[var(--miguel-border)]"><div className="miguel-progress h-full rounded-full bg-[var(--miguel-primary)]" /></div><p className="mt-3 text-2xl font-black text-[var(--miguel-primary-strong)]">R$ 21.470,00 <span className="text-base font-normal text-[var(--miguel-muted)]">de R$ 88.000,00</span></p><div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-[var(--miguel-primary-soft)] p-4"><div><p className="text-sm text-[var(--miguel-muted)]">Pessoas já ajudaram</p><strong className="mt-1 block">398</strong></div><div><p className="text-sm text-[var(--miguel-muted)]">Dias restantes</p><strong className="mt-1 block">12</strong></div></div></section>;
}

function AboutMiguel() {
  return <div className="miguel-tab-panel space-y-4 text-[15px] leading-7"><h2 className="text-xl font-black">Entenda</h2><h3 className="text-lg font-bold">A história de Miguel: uma corrida contra o tempo</h3><p>Miguel é um menino que deveria estar brincando e sonhando. Em vez disso, ele convive com um tumor que cresce no rosto e no pescoço, deforma a face e torna difícil comer, dormir e até respirar. Segundo a família, os médicos foram claros: <strong>ele precisa da cirurgia com urgência.</strong></p><p>A mãe dele acompanha cada internação, cada exame e cada noite de dor sem ter condições de arcar com o que o tratamento exige. É por isso que essa campanha existe: para que o tempo não decida antes dos médicos.</p><figure className="overflow-hidden rounded-lg border border-[var(--miguel-border)]"><img src={miguelStory.url} alt="Miguel durante um dos dias de tratamento" width={800} height={1000} loading="lazy" className="max-h-[32rem] w-full object-cover object-top" /><figcaption className="px-4 py-3 text-sm text-[var(--miguel-muted)]">O tumor cresceu rápido nos últimos meses e hoje toma boa parte do rosto e do pescoço do Miguel.</figcaption></figure><h3 className="text-lg font-black">Para onde vai cada doação</h3><ul className="space-y-3"><li><strong>Cirurgia urgente:</strong> remoção do tumor no rosto, indicada pelos médicos.</li><li><strong>Medicamentos e exames:</strong> controle da dor, biópsias e acompanhamento contínuo.</li><li><strong>Deslocamento e cuidados:</strong> viagens ao hospital, estadia e o dia a dia da família.</li></ul><p className="rounded-lg bg-[var(--miguel-primary-soft)] p-4 font-bold">Cada dia que passa sem tratamento é um dia a mais de dor. Qualquer valor ajuda a antecipar o procedimento que pode devolver a vida do Miguel.</p><blockquote className="border-l-4 border-[var(--miguel-primary)] pl-4 italic">“Eu só quero voltar a viver sem sentir dor.” 🙏<footer className="mt-1 font-bold not-italic">— Miguel</footer></blockquote></div>;
}

function UpdatesPanel() {
  return <div className="miguel-tab-panel py-2"><article className="flex gap-4 border-b border-[var(--miguel-border)] py-4"><div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[var(--miguel-primary-soft)] text-center text-[var(--miguel-primary-strong)]"><span className="text-xl font-black leading-none">04</span><span className="text-xs font-bold uppercase">Set</span></div><div><h2 className="font-bold">Campanha criada</h2><p className="mt-1 text-sm leading-6 text-[var(--miguel-muted)]">A arrecadação foi aberta para custear a cirurgia, os exames, os medicamentos e os cuidados diários do Miguel.</p></div></article></div>;
}

function SupportersPanel() {
  return <div className="miguel-tab-panel divide-y divide-[var(--miguel-border)]">{SUPPORTERS.map((supporter) => <article key={supporter.name} className="py-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[var(--miguel-primary-soft)] font-black text-[var(--miguel-primary-strong)]">{supporter.name.charAt(0)}</span><div><h2 className="font-bold">{supporter.name}</h2><p className="text-xs text-[var(--miguel-muted)]">{supporter.time}</p></div></div><p className="mt-3 text-sm leading-6">{supporter.message}</p><p className="mt-2 flex items-center gap-1 text-xs text-[var(--miguel-muted)]"><Heart className="size-4 fill-current text-[var(--miguel-primary)]" /> {supporter.hearts}</p></article>)}</div>;
}

function QuestionsPanel() {
  return <div className="miguel-tab-panel divide-y divide-[var(--miguel-border)]">{FAQS.map((item) => <details key={item.question} className="py-4"><summary className="cursor-pointer list-none pr-6 font-bold marker:hidden">{item.question}</summary><p className="mt-3 text-sm leading-6 text-[var(--miguel-muted)]">{item.answer}</p></details>)}</div>;
}

function CampaignTabs({ active, onChange }: { active: MiguelTab; onChange: (tab: MiguelTab) => void }) {
  return <><div role="tablist" aria-label="Informações da campanha" className="miguel-scrollbar mt-6 flex gap-5 overflow-x-auto border-b border-[var(--miguel-border)]">{TABS.map((item) => <Button key={item.id} role="tab" aria-selected={active === item.id} variant="ghost" onClick={() => onChange(item.id)} className="miguel-tab h-12 shrink-0 rounded-none border-b-2 border-transparent px-1 text-[var(--miguel-muted)] hover:bg-transparent">{item.label}</Button>)}</div><div role="tabpanel" className="pt-5">{active === "sobre" && <AboutMiguel />}{active === "atualizacoes" && <UpdatesPanel />}{active === "quem" && <SupportersPanel />}{active === "perguntas" && <QuestionsPanel />}</div></>;
}

function DonationBar({ onShare }: { onShare: () => void }) {
  return <div className="miguel-bottom fixed inset-x-0 bottom-0 z-50 bg-[var(--miguel-surface)]"><div className="flex items-center justify-center gap-2 bg-[var(--miguel-primary-soft)] py-2 text-xs font-black uppercase text-[var(--miguel-primary-strong)]"><ShieldCheck className="size-5" /> Doação Protegida</div><div className="mx-auto flex max-w-[38rem] gap-3 p-3"><Button asChild className="h-12 flex-1 bg-[var(--miguel-primary)] text-base font-bold text-primary-foreground hover:bg-[var(--miguel-primary-strong)]"><Link to="/pix">Quero Ajudar</Link></Button><Button variant="outline" className="h-12 flex-1 text-base font-bold" onClick={onShare}>Compartilhar</Button></div></div>;
}

function MiguelCampaign() {
  const [activeTab, setActiveTab] = useState<MiguelTab>("sobre");
  const [liked, setLiked] = useState(false);
  const share = () => { const data = { title: "Ajude o Miguel", url: window.location.href }; if (navigator.share) void navigator.share(data).catch(() => undefined); else void navigator.clipboard?.writeText(data.url).catch(() => undefined); };
  return <div className="miguel-page"><CampaignHeader onShare={share} /><main className="mx-auto max-w-[38rem] px-4 py-4"><div className="relative overflow-hidden rounded-lg bg-[var(--miguel-primary-soft)]"><img src={miguelCover.url} alt="Miguel, criança que precisa de cirurgia urgente" width={800} height={1000} fetchPriority="high" className="max-h-[38rem] w-full object-cover object-top" /><Button variant="secondary" size="icon" aria-label={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"} aria-pressed={liked} onClick={() => setLiked((value) => !value)} className="absolute right-3 top-3 rounded-full"><Heart className={liked ? "fill-[var(--miguel-primary)] text-[var(--miguel-primary)]" : "text-[var(--miguel-muted)]"} /></Button></div><div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase text-[var(--miguel-muted)]"><span className="rounded bg-[var(--miguel-border)] px-2 py-1">Campanha verificada pela família</span><span className="flex items-center gap-1"><MapPin className="size-4" /> Tratamento urgente · Brasil</span></div><h1 className="mt-3 text-2xl font-black leading-tight">Miguel precisa da cirurgia enquanto ainda há tempo.</h1><CampaignStats /><p className="mt-5 text-[15px] leading-6 text-[var(--miguel-muted)]">Um tumor cresce no rosto e no pescoço de Miguel e já dificulta <strong>comer, dormir e respirar</strong>. Os médicos indicaram cirurgia urgente — e a mãe dele não pode enfrentar isso sozinha.</p><CampaignTabs active={activeTab} onChange={setActiveTab} /></main><DonationBar onShare={share} /></div>;
}