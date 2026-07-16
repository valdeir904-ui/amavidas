/**
 * Utilitário para abrir WhatsApp com rastreamento de evento.
 * Usa o número configurado no banco (fallback para o número padrão).
 */

export function obterLinkWhatsAppComRastreamento(numero: string, mensagemOriginal: string, contexto: string): string {
  if (typeof window === "undefined") {
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagemOriginal)}`;
  }
  const origemSalva = sessionStorage.getItem("amavidas_origem");
  const origem = origemSalva ? JSON.parse(origemSalva) : {};
  const canal = origem.utmSource ? origem.utmSource.slice(0, 3) : "org";
  const ref = `${canal}-${contexto}`;
  const msg = `${mensagemOriginal} [${ref}]`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
}

export function abrirWhatsApp(numero: string, mensagem: string, contexto?: string): void {
  let msgFinal = mensagem;
  let finalOrigem: any = {};

  if (typeof window !== "undefined") {
    const origemSalva = sessionStorage.getItem("amavidas_origem");
    finalOrigem = origemSalva ? JSON.parse(origemSalva) : {};
    
    if (contexto) {
      const canal = finalOrigem.utmSource ? finalOrigem.utmSource.slice(0, 3) : "org";
      const ref = `${canal}-${contexto}`;
      msgFinal = `${mensagem} [${ref}]`;
    }
  }

  // Rastrear evento
  try {
    fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        tipo: "whatsapp_clicado",
        utmSource: finalOrigem.utmSource || null,
        utmMedium: finalOrigem.utmMedium || null,
        utmCampaign: finalOrigem.utmCampaign || null,
        utmTerm: finalOrigem.utmTerm || null,
        utmContent: finalOrigem.utmContent || null,
        gclid: finalOrigem.gclid || null,
        fbclid: finalOrigem.fbclid || null,
        referrer: finalOrigem.referrer || null,
        landingPage: finalOrigem.landingPage || null,
        dispositivo: finalOrigem.dispositivo || null,
      }),
    }).catch(() => {/* silencioso */});
  } catch {/* silencioso */}

  const encoded = encodeURIComponent(msgFinal);
  const url = `https://wa.me/${numero}?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function mensagemWhatsApp(plano?: string): string {
  if (plano) {
    return `Olá! Tenho interesse no ${plano} da AmaVidas. Pode me ajudar?`;
  }
  return "Olá! Tenho interesse em um plano funerário da AmaVidas. Pode me ajudar?";
}
