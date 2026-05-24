import type { Metadata } from "next";
import { Lora, DM_Sans } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AmaVidas — Planos Funerários em Águas Lindas e DF | A partir de R$ 35/mês",
  description:
    "Proteja sua família agora com um plano funerário completo a partir de R$ 35/mês. Cobertura nacional, atendimento 24h e zero burocracia. 4,9⭐ no Google. Quem Ama, Cuida.",
  keywords: [
    "plano funerário", "plano funeral", "assistência funeral", "Águas Lindas de Goiás",
    "Distrito Federal", "plano funerário barato", "AmaVidas", "proteção familiar",
  ],
  openGraph: {
    title: "AmaVidas — Planos Funerários a partir de R$ 35/mês",
    description:
      "Proteja sua família agora. Cobertura nacional, atendimento 24h, 4,9⭐ no Google e zero reclamações no ReclameAqui. Quem Ama, Cuida.",
    locale: "pt_BR",
    type: "website",
    siteName: "AmaVidas",
  },
  twitter: {
    card: "summary_large_image",
    title: "AmaVidas — Planos Funerários a partir de R$ 35/mês",
    description: "Proteja sua família agora com a AmaVidas. Quem Ama, Cuida.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${lora.variable} ${dmSans.variable} h-full antialiased`}
      style={
        {
          "--font-serif": `var(--font-lora), Georgia, serif`,
          "--font-sans": `var(--font-dm-sans), system-ui, -apple-system, sans-serif`,
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
