import type { Metadata } from "next";
import { Lora, DM_Sans } from "next/font/google";
import Script from "next/script";
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
  title: "AmaVidas — Planos Funerários em Águas Lindas e DF | A partir de R$ 43/mês",
  description:
    "Proteja sua família agora com um plano funerário completo a partir de R$ 43/mês. Cobertura nacional, atendimento 24h e zero burocracia. 4,9⭐ no Google. Quem Ama, Cuida.",
  keywords: [
    "plano funerário", "plano funeral", "assistência funeral", "Águas Lindas de Goiás",
    "Distrito Federal", "plano funerário barato", "AmaVidas", "proteção familiar",
  ],
  openGraph: {
    title: "AmaVidas — Planos Funerários a partir de R$ 43/mês",
    description:
      "Proteja sua família agora. Cobertura nacional, atendimento 24h, 4,9⭐ no Google e zero reclamações no ReclameAqui. Quem Ama, Cuida.",
    locale: "pt_BR",
    type: "website",
    siteName: "AmaVidas",
  },
  twitter: {
    card: "summary_large_image",
    title: "AmaVidas — Planos Funerários a partir de R$ 43/mês",
    description: "Proteja sua família agora com a AmaVidas. Quem Ama, Cuida.",
  },
};

import { ConfigProvider } from "@/contexts/ConfigContext";

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
      <head>
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1352669203457671');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1352669203457671&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
