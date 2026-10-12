import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/felipe")({
  head: () => ({
    meta: [
      { title: "Ajude o Felipe | Campanha solidária" },
      { name: "description", content: "Conheça a história de Felipe e sua mãe Priscila e saiba por que ele precisa de um equipamento respiratório." },
      { property: "og:title", content: "Ajude o Felipe" },
      { property: "og:description", content: "Conheça a história do Felipe e compartilhe sua campanha." },
    ],
  }),
  component: FelipePage,
});

function FelipePage() {
  const [error, setError] = useState(false);
  const [shared, setShared] = useState(false);
  async function share() {
    const data = { title: "Ajude o Felipe", text: "Conheça a história de Felipe e sua mãe Priscila.", url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); setShared(true); }
    } catch { /* O compartilhamento pode ser cancelado. */ }
  }
  return (
    <div className="felipe-page">
      <style>{css}</style>
      <header className="felipe-header"><span className="felipe-brand">Juntos por Vidas</span><span>Campanha solidária</span></header>
      <main className="felipe-main">
        <div className="felipe-video">
          {!error ? <video controls playsInline preload="metadata" src="/videos/vsl-felipe.mp4" aria-label="Vídeo sobre a história de Felipe" onError={() => setError(true)} /> :
            <div className="felipe-video-error">O vídeo ainda não está disponível neste servidor.</div>}
        </div>
        <div className="felipe-category">SAÚDE / URGÊNCIA</div>
        <h1>A doença tirou de Felipe até a força para tossir. Sua mãe agora luta para não vê-lo voltar ao hospital.</h1>
        <p className="felipe-lead">Aos 14 anos, Felipe depende de um aparelho alugado para limpar os pulmões. O prazo de devolução está correndo, e sem ele o risco é voltar para a UTI.</p>
        <p className="felipe-highlight">Com apenas R$ 30, você ajuda a garantir que o aparelho que faz o Felipe respirar continue ao lado dele.</p>
        <section className="felipe-story">
          <h2>Conheça a história do Felipe</h2>
          <p><strong>O FELIPE NÃO PODE ESPERAR.</strong> A família relata que precisa arrecadar recursos antes que o aparelho de assistência respiratória alugado tenha que ser devolvido.</p>
          <p>Meu nome é Priscila, sou mãe do Felipe, de 14 anos. Meu filho tem Atrofia Muscular Espinhal (AME) tipo 2 e passou 36 dias internado por causa de uma séria pneumonia.</p>
          <p>A doença enfraqueceu sua musculatura a ponto de Felipe não conseguir tossir sozinho. Sem força para eliminar as secreções, elas se acumulam nos pulmões e podem provocar novas pneumonias e complicações respiratórias gravíssimas.</p>
          <p>Hoje, um equipamento chamado Cough Assist ajuda o Felipe a eliminar essas secreções. Mas existe um problema desesperador: o aparelho é alugado e precisa ser devolvido em breve.</p>
          <blockquote>“Eu vou ter que devolver o aparelho que meu filho precisa e não sei o que vou fazer depois. Não temos condições de comprar um. E esperar pode demorar um tempo que o Felipe não tem.”</blockquote>
          <p>Sem esse aparelho, as secreções podem voltar a se acumular e exigir cuidados hospitalares. Segundo o relato da campanha de origem, a família busca R$ 200.000 para adquirir um equipamento próprio, estimado em cerca de R$ 80 mil, e adaptar a casa para os cuidados diários.</p>
          <blockquote>“Como mãe, meu medo é devolver esse aparelho e ficar sem saber como vou ajudar meu filho se ele não conseguir eliminar as secreções.”</blockquote>
          <p>A história do Felipe e de sua mãe Priscila chegou ao Histórias Únicas. A campanha pede apoio para obter o equipamento e dar continuidade aos cuidados de Felipe junto de sua família.</p>
          <p>O prazo de devolução do aparelho alugado está correndo. Felipe precisa do equipamento definitivo o quanto antes para não retornar ao hospital.</p>
        </section>
        <p className="felipe-disclosure">As informações médicas, financeiras e os depoimentos acima foram reproduzidos do relato publicado na página de referência e não foram verificados de forma independente. Esta é uma página de divulgação, sem vínculo oficial declarado com plataformas de arrecadação de terceiros.</p>
        <button className="felipe-share" type="button" onClick={share}>{shared ? "Link copiado!" : "Compartilhar a história do Felipe"}</button>
      </main>
      <footer className="felipe-footer">Juntos por Vidas · Informações da campanha fornecidas pelo organizador da página de referência</footer>
    </div>
  );
}

const css = `
.felipe-page { min-height:100vh; background:#f5f7f8; color:#1b292d; font-family:Inter,Arial,sans-serif; padding-bottom:28px }
.felipe-page * {box-sizing:border-box}
.felipe-header {background:#fff; border-bottom:1px solid #e8eded; padding:18px max(20px, calc((100vw - 820px)/2)); display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:12px; color:#647679}
.felipe-brand {font-size:19px;font-weight:800;color:#138e70}
.felipe-main {width:min(100% - 28px, 820px);margin:28px auto; padding:24px; background:#fff;border-radius:18px;box-shadow:0 3px 28px #14342b0d}
.felipe-video {width:100%;background:#101617;border-radius:12px;overflow:hidden;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center}
.felipe-video video {display:block;width:100%;height:100%;object-fit:contain}
.felipe-video-error {color:#fff;text-align:center;padding:22px}
.felipe-category {font-size:12px;font-weight:800;letter-spacing:.06em;color:#138e70;margin:24px 0 10px}
.felipe-page h1 {font-size:clamp(24px,4vw,34px);line-height:1.2;letter-spacing:-.025em;margin:0 0 16px;font-weight:800}
.felipe-lead {font-size:18px;line-height:1.6;color:#41555b}
.felipe-highlight {font-size:16px;line-height:1.6;background:#e9f7f0;padding:17px;border-radius:12px;font-weight:700;color:#176d50}
.felipe-story {font-size:16px;line-height:1.8}
.felipe-story h2 {font-size:23px;margin-top:32px;line-height:1.3}
.felipe-story p {margin:16px 0}
.felipe-story blockquote {border-left:4px solid #16a679;margin:20px 0;padding:12px 18px;background:#f4faf7;font-style:italic}
.felipe-disclosure {font-size:12px;color:#657477;line-height:1.6;border-top:1px solid #e7ecec;padding-top:18px;margin:32px 0 18px}
.felipe-share {display:block;width:100%;border:0;background:#16a46f;color:white;font-size:16px;font-weight:700;padding:17px;border-radius:12px;cursor:pointer}
.felipe-share:hover {background:#0f8559}
.felipe-footer {text-align:center;font-size:12px;color:#738082;padding:0 18px}
@media(max-width:560px) {.felipe-main {width:100%;margin:0;padding:14px;border-radius:0;box-shadow:none}.felipe-header{padding:14px}.felipe-page h1{font-size:25px}.felipe-lead{font-size:16px}}
`;
