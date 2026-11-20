import { createFileRoute } from "@tanstack/react-router";
import { WillianCampaign } from "@/components/WillianCampaign";
const willianHero = "/willian/willian-destaque.png";

export const Route = createFileRoute("/willian")({
  head: () => ({
    meta: [
      { title: "Ajude o Willian | Juntos por Vidas" },
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
        href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: WillianPage,
});

function WillianPage() {
  return <WillianCampaign story={<>

            <p>
              Willian é uma pessoa com deficiência e usa cadeira de rodas. Ao lado dele está seu
              pai, que enfrenta dificuldades financeiras e precisa de ajuda para atender às
              necessidades dos dois. Esta campanha nasce de um pedido simples: que eles não precisem
              atravessar esse momento sem apoio.
            </p>

            <img
              className="story-image"
              src={willianHero}
              alt="Willian ao lado de seu pai"
              width={400}
              height={481}
              loading="lazy"
            />

            <p className="created">
              <strong>Campanha criada em:</strong> 20/09/2026
            </p>

            <h2>Entenda</h2>

            <p>
              Quando o dinheiro não é suficiente para o básico, o dia a dia fica mais difícil. Para
              o pai do Willian, a preocupação com as necessidades da casa se soma ao desejo de
              oferecer ao filho cuidado, segurança e dignidade.
            </p>

            <p>
              Willian é muito mais do que sua deficiência. É alguém que merece respeito, acolhimento
              e a oportunidade de viver com suas necessidades atendidas. A cadeira de rodas faz
              parte da sua vida, mas não define quem ele é.
            </p>

            <p>
              <strong>
                O amor de um pai é imenso, mas ninguém deveria enfrentar a necessidade sozinho.
              </strong>{" "}
              Há momentos em que o apoio de outras pessoas faz a diferença entre continuar com
              preocupação e encontrar um pouco de tranquilidade para seguir.
            </p>

            <p>
              A proposta desta vaquinha é reunir ajuda para as necessidades básicas de Willian e seu
              pai, oferecendo apoio neste período de dificuldade. Cada contribuição pode aliviar o
              peso financeiro e ajudar os dois a cuidar do presente com mais segurança.
            </p>

            <p>
              Não é preciso resolver tudo sozinho para fazer parte dessa mudança. Uma doação, somada
              a tantas outras, pode se transformar em um apoio importante para essa família.
            </p>

            <p>
              Se você não puder contribuir agora, compartilhe a campanha. Sua mensagem pode chegar a
              alguém que tenha condições de ajudar. Willian e seu pai merecem saber que existem
              pessoas dispostas a caminhar ao lado deles.
            </p>

            <p>
              <strong>
                Ajude o Willian. Sua solidariedade pode trazer mais dignidade e tranquilidade para
                ele e seu pai.
              </strong>
            </p>
          
  </>} />;
}