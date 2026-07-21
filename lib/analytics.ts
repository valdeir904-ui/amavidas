"use client";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface LeadConversionParams {
  plano?: string;
  valor?: number;
  googleAdsId?: string;
  googleAdsConversionLabel?: string;
}

interface WhatsAppClickParams {
  origem?: string;
  googleAdsId?: string;
  googleAdsWaLabel?: string;
}

/**
 * Dispara evento de conversão de Lead para Google Ads e Meta Pixel
 */
export function trackLeadConversion(params?: LeadConversionParams) {
  if (typeof window === "undefined") return;

  const { plano = "Geral", valor = 0, googleAdsId, googleAdsConversionLabel } = params || {};

  // 1. Meta Pixel (Facebook / Instagram Ads)
  if (typeof window.fbq === "function") {
    try {
      window.fbq("track", "Lead", {
        content_name: plano,
        currency: "BRL",
        value: valor,
      });
      console.log(`[Analytics] Meta Pixel 'Lead' disparado: ${plano}`);
    } catch (e) {
      console.error("[Analytics] Erro ao disparar Meta Pixel Lead:", e);
    }
  }

  // 2. Google Ads Conversion Tag
  if (typeof window.gtag === "function") {
    try {
      // Se tiver rótulo de conversão configurado (ex: AW-123456789/AbCdEfGh)
      if (googleAdsId && googleAdsConversionLabel) {
        const sendTo = googleAdsConversionLabel.includes("/")
          ? googleAdsConversionLabel
          : `${googleAdsId}/${googleAdsConversionLabel}`;

        window.gtag("event", "conversion", {
          send_to: sendTo,
          value: valor || 1,
          currency: "BRL",
        });
        console.log(`[Analytics] Google Ads Conversion disparado para: ${sendTo}`);
      } else {
        // Disparo genérico para GA4 / Google Ads se configurado
        window.gtag("event", "generate_lead", {
          currency: "BRL",
          value: valor,
          lead_type: plano,
        });
      }
    } catch (e) {
      console.error("[Analytics] Erro ao disparar Google Ads Conversion:", e);
    }
  }

  // 3. Camada de dados DataLayer (caso use GTM no futuro)
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "lead_conversion",
      plano_recomendado: plano,
      valor: valor,
    });
  }
}

/**
 * Dispara evento de clique no WhatsApp para Google Ads e Meta Pixel
 */
export function trackWhatsAppClick(params?: WhatsAppClickParams) {
  if (typeof window === "undefined") return;

  const { origem = "desconhecido", googleAdsId, googleAdsWaLabel } = params || {};

  // 1. Meta Pixel (Evento de Contato e Customizado)
  if (typeof window.fbq === "function") {
    try {
      window.fbq("track", "Contact", {
        content_name: `WhatsApp - ${origem}`,
      });
      window.fbq("trackCustom", "WhatsAppClick", {
        origem,
      });
      console.log(`[Analytics] Meta Pixel 'Contact' disparado: ${origem}`);
    } catch (e) {
      console.error("[Analytics] Erro ao disparar Meta Pixel Contact:", e);
    }
  }

  // 2. Google Ads Conversion
  if (typeof window.gtag === "function") {
    try {
      if (googleAdsId && googleAdsWaLabel) {
        const sendTo = googleAdsWaLabel.includes("/")
          ? googleAdsWaLabel
          : `${googleAdsId}/${googleAdsWaLabel}`;

        window.gtag("event", "conversion", {
          send_to: sendTo,
        });
        console.log(`[Analytics] Google Ads WhatsApp Conversion disparado: ${sendTo}`);
      }

      window.gtag("event", "clique_whatsapp", {
        event_category: "engajamento",
        event_label: origem,
      });
    } catch (e) {
      console.error("[Analytics] Erro ao disparar Google Ads WhatsApp:", e);
    }
  }

  // 3. DataLayer
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "whatsapp_click",
      origem_clique: origem,
    });
  }
}
