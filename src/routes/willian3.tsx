import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, type CSSProperties } from 'react';
import { getTrackedPixHref } from '@/lib/campaign-attribution';
import '@/styles/willian3.css';
const logo='/willian/juntos-por-vidas-logo.png', photo='/willian/willian-destaque.png';
export const Route=createFileRoute('/willian3')({head:()=>({meta:[{title:'Ajude o Willian | Juntos por Vidas'},{name:'description',content:'Conheça a história do Willian e do seu pai. Ajude com as necessidades do dia a dia.'},{property:'og:image',content:'https://www.juntos-por-vidas.online'+photo}],links:[{rel:'stylesheet',href:'https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap'}]}),component:Willian3});
function Willian3(){const [href,setHref]=useState('/pix?src=pagina_willian3');const [sticky,setSticky]=useState(false);useEffect(()=>{setHref(getTrackedPixHref());const update=()=>setSticky(window.scrollY>600);update();window.addEventListener('scroll',update,{passive:true});return ()=>window.removeEventListener('scroll',update);},[]);
return <div className="willian3-page"><header className="header"><div className="header-inner"><a href="#inicio" className="header-brand" aria-label="Juntos por Vidas — início"><img src={logo} alt="Juntos por Vidas" className="header-logo" width={72} height={72}/></a><a href={href} className="btn-header">FAZER DOAÇÃO</a></div></header><main>
<section className="hero-autoral" id="inicio"><div className="wrap hero-content"><div className="hero-intro"><h1 className="hero-title-autoral">Ajude o Willian<span>Seu apoio pode trazer mais dignidade e tranquilidade</span></h1></div><div className="hero-card-wrapper"><img src={photo} alt="Willian no colo do seu pai" className="hero-img-clean" width={1142} height={1377} fetchPriority="high"/></div><div className="funding-strip"><div className="funding-strip-inner"><div className="funding-main-row"><div className="funding-progress-circle" style={{'--progress':10.98} as CSSProperties} role="img" aria-label="11% da meta arrecadada"><div className="funding-progress-circle-inner"><span>11%</span></div></div><div className="funding-content"><div className="funding-topline"><div className="funding-amount">R$ 1.427,92</div><div className="funding-goal">arrecadados de<strong>R$ 13.000</strong></div></div><div className="funding-social-proof"><strong>421 pessoas</strong> já estão ajudando o Willian</div></div></div></div></div><div className="hero-cta-row"><a className="funding-cta-standalone" href={href}><span className="funding-cta-text">♡ QUERO AJUDAR AGORA ♡</span></a></div></div></section>
<section className="sec white-section"><div className="wrap"><span className="eyebrow">A HISTÓRIA</span><h2>O Willian e seu pai precisam de apoio</h2><div className="prose">
            <p>
              Willian é uma pessoa com deficiência e usa cadeira de rodas. Ao lado dele está seu pai,
              que enfrenta dificuldades financeiras e precisa de ajuda para atender às necessidades dos
              dois. Esta campanha nasce de um pedido simples: que eles não precisem atravessar esse momento
              sem apoio.
            </p>

            <img
              className="story-image"
              src={photo}
              alt="Willian ao lado de seu pai"
              width={400}
              height={481}
              loading="lazy"
            />

            <p className="created"><strong>Campanha criada em:</strong> 20/09/2026</p>

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
          </div></div></section>
<section className="pix-sec"><div className="wrap"><div className="pix-card"><h2 className="pix-card-title">Ajude o Willian pelo Pix</h2><p className="pix-card-sub">Escolha o valor da sua contribuição e gere um Pix no checkout da campanha.</p><a href={href} className="btn-copiar">DOAR COM PIX →</a><div className="pix-passos">{['Escolha o valor','Preencha os dados','Gere seu Pix','Confirme no banco'].map((text,i)=><div className="passo" key={text}><div className="passo-n">{i+1}</div><span>{text}</span></div>)}</div></div></div></section>
<section className="sec"><div className="wrap"><span className="eyebrow">SOLIDARIEDADE NA PRÁTICA</span><h2>Para onde vai a sua ajuda</h2><p className="prose">A campanha busca reunir R$ 13.000 para apoiar as necessidades básicas do Willian e do seu pai.</p><div className="impact-grid">{[['Prioridade','Necessidades básicas','Apoio às despesas essenciais da família'],['Cuidado','Rotina do Willian','Mais conforto e dignidade no dia a dia'],['Família','Apoio ao pai','Aliviar o peso deste período de dificuldade'],['Solidariedade','Uma rede de apoio','Somar contribuições para ajudar a família']].map(([label,title,desc],i)=><div key={title} className={'impact-btn'+(i===0?' destaque':'')}><span className="val">{label}</span><span className="title">{title}</span><span className="desc">{desc}</span></div>)}</div><div className="hero-cta-row"><a href={href} className="funding-cta-standalone"><span className="funding-cta-text">♡ QUERO AJUDAR O WILLIAN ♡</span></a></div></div></section>
<section className="sec white-section"><div className="wrap"><span className="eyebrow">DÚVIDAS</span><h2>Perguntas frequentes</h2><div className="faq-wrap">{[['Para onde vai o dinheiro?','As contribuições apoiam as necessidades básicas do Willian e do seu pai neste período de dificuldade financeira.'],['Como faço uma doação?','Clique em um botão de doação, escolha o valor e preencha os dados no checkout. Depois, pague usando o QR Code ou o código Pix copia e cola.'],['Qual é o valor mínimo?','O checkout aceita doações a partir de R$ 20.'],['Posso doar anonimamente?','Sim. Escolha a opção de doação anônima no checkout e preencha os dados obrigatórios para processar o pagamento.'],['Não posso doar agora. Como ajudo?','Compartilhe o endereço desta campanha com familiares e amigos. Sua divulgação pode alcançar alguém que consiga contribuir.']].map(([q,a])=><details className="faq-item" key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
</main><footer className="footer"><div className="wrap"><img src={logo} alt="Juntos por Vidas" width={100} height={100}/><p>Unindo corações e levando apoio a quem precisa.</p><div className="footer-copy">© 2026 Juntos por Vidas · Todos os direitos reservados</div></div></footer>{sticky && <aside className="sticky-dock" aria-label="Doar para o Willian"><div className="sticky-dock-inner"><a href={href} className="btn-sticky-cta">♡ QUERO AJUDAR O WILLIAN ♡</a></div></aside>}</div>;
}
