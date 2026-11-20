import { createFileRoute } from '@tanstack/react-router';
import { GabiCampaign } from '@/components/GabiCampaign';
export const Route=createFileRoute('/gabi')({head:()=>({meta:[{title:'Ajude a Gabi | Juntos por Vidas'},{name:'description',content:'Ajude a Gabi com o tratamento, as terapias e os medicamentos.'},{property:'og:image',content:'https://www.juntos-por-vidas.online/gabi/gabi-destaque.png'}],links:[{rel:'stylesheet',href:'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap'}]}),component:()=> <GabiCampaign story={<article className="story"><img className="story-image" src="/gabi/gabi-destaque.png" alt="Gabi na sua cadeira de rodas" width={1448} height={1086} loading="lazy" />
            <p>A Gabi enfrenta uma condição neurológica grave: a Síndrome de West. Essa realidade exige cuidados constantes e uma rotina que envolve tratamento, terapias e medicamentos. Enquanto tantas crianças podem simplesmente aproveitar cada descoberta da infância, a Gabi e sua família precisam lidar diariamente com desafios que não podem esperar.</p>
            <p className="created"><strong>Campanha criada em:</strong> 20/09/2026</p>
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
          </article>}/>});