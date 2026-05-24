/**
 * Utilitário para abrir WhatsApp com rastreamento de evento.
 * Usa o número configurado no banco (fallback para o número padrão).
 */
export function abrirWhatsApp(numero: string, mensagem: string): void {
  // Rastrear evento
  try {
    fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "whatsapp_clicado", meta: { mensagem } }),
    }).catch(() => {/* silencioso */});
  } catch {/* silencioso */}

  const encoded = encodeURIComponent(mensagem);
  const url = `https://wa.me/${numero}?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function mensagemWhatsApp(plano?: string): string {
  if (plano) {
    return `Olá! Tenho interesse no ${plano} da AmaVidas. Pode me ajudar?`;
  }
  return "Olá! Tenho interesse em um plano funerário da AmaVidas. Pode me ajudar?";
}
