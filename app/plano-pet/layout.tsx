import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://amavidas.com.br"),
  title: "Plano Pet AmaVidas — Proteção para seu Cão ou Gato por R$ 25/mês | Águas Lindas & DF",
  description:
    "Quem ama cuida até do seu amigo de 4 patas. Atendimento 24h, remoção, velório, sepultamento e lápide por apenas R$ 25/mês em Águas Lindas de Goiás e DF. Sem limite de porte ou peso.",
  keywords: [
    "plano pet", "plano funerario pet", "assistencia funeral pet", "crematorio pet",
    "sepultamento pet", "Águas Lindas de Goiás", "Distrito Federal", "Brasília", "AmaVidas Pet"
  ],
  openGraph: {
    title: "Plano Pet AmaVidas — Proteção para seu Cão ou Gato por R$ 25/mês",
    description:
      "Atendimento 24h, velório, sepultamento e lápide personalizada para Águas Lindas de Goiás e DF. Quem ama cuida até do seu amigo de 4 patas.",
    url: "https://amavidas.com.br/plano-pet",
    siteName: "AmaVidas",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/hero_pet_plan.png",
        width: 1200,
        height: 1200,
        alt: "Plano Pet AmaVidas - Proteção para Cães e Gatos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plano Pet AmaVidas — Proteção por R$ 25/mês",
    description: "Atendimento 24h, velório e sepultamento pet em Águas Lindas e DF. Quem ama cuida.",
    images: ["/hero_pet_plan.png"],
  },
};

export default function PetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
