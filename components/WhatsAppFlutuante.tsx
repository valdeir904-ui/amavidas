"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { useConfig } from "@/contexts/ConfigContext";

// Variável em escopo do módulo para persistência em memória durante a navegação.
// Diferente do sessionStorage, ela se reseta completamente ao recarregar a página,
// permitindo que o desenvolvedor teste o popup automático facilmente a cada F5/reload.
let hasClosedThisSession = false;

export default function WhatsAppFlutuante() {
  const { configs } = useConfig();
  const num = configs.whatsapp || "5561985825621";
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // 1. Lógica de temporizador de 45 segundos (tempo ideal para leitura inicial antes do convite)
    if (!hasClosedThisSession) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setShowNotification(true);
      }, 45000); // 45 segundos

      return () => clearTimeout(timer);
    }
  }, []);

  const handleTogglePopup = () => {
    if (!isOpen) {
      setIsOpen(true);
      setShowNotification(false);
    } else {
      setIsOpen(false);
    }
  };

  const handleClosePopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    hasClosedThisSession = true;
  };

  const handleStartChat = () => {
    const msg = encodeURIComponent("Olá! Vim pelo site da AmaVidas e gostaria de mais informações sobre os planos.");
    window.open(`https://wa.me/${num}?text=${msg}`, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3.5 max-[980px]:bottom-4 max-[980px]:right-4">
      {/* Popup de Chat (Estilo WhatsApp) */}
      {isOpen && (
        <div 
          className="w-[340px] max-w-[90vw] bg-[#E5DDD5] rounded-3xl shadow-[0_12px_40px_rgba(11,106,86,0.22)] border border-slate-200/50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 relative"
          style={{
            backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
            backgroundSize: "contain",
            backgroundRepeat: "repeat",
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0B6A56] to-[#128C7E] px-4.5 py-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              {/* Avatar da CEO */}
              <div className="relative w-10.5 h-10.5 rounded-full border border-white/20 overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
                <Image
                  src="/Ceo_Livia.png"
                  alt="Lívia Antonieti — CEO AmaVidas"
                  fill
                  sizes="42px"
                  className="object-cover object-center"
                />
                {/* Status Online dot */}
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B6A56] absolute bottom-0 right-0" />
              </div>

              {/* Informações da CEO */}
              <div>
                <p className="text-white text-[13px] font-extrabold leading-tight">Lívia Antonieti</p>
                <p className="text-emerald-100 text-[10px] leading-none mt-0.5 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Online agora
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="text-white/60 hover:text-white hover:bg-white/10 w-7 h-7 rounded-full flex items-center justify-center text-xl font-bold cursor-pointer transition-all p-1"
              aria-label="Fechar convite"
            >
              ×
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 flex flex-col gap-4 bg-slate-500/5 backdrop-blur-[1px] min-h-[160px] justify-between">
            {/* Tag de Data */}
            <div className="mx-auto bg-slate-100/90 backdrop-blur-sm text-slate-500 text-[9px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm border border-slate-200/20">
              Hoje
            </div>

            {/* Balão de Conversa do WhatsApp */}
            <div className="bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm relative border border-slate-200/50 max-w-[90%] self-start transition-all duration-300">
              {/* Setinha (Tail) do Balão */}
              <div className="absolute left-[-6px] top-0 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent" />
              
              <p className="text-slate-800 text-[13px] leading-snug font-semibold pr-3">
                Olá! Sou a Lívia. Pensar no futuro de quem amamos é um ato de cuidado essencial. Quer ajuda para simular o plano ideal para a sua família, sem burocracia?
              </p>
              <span className="text-[9px] text-slate-400 absolute bottom-1 right-2.5 font-medium">Agora</span>
            </div>

            {/* CTA Final de Iniciar Conversa */}
            <button
              onClick={handleStartChat}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-1 hover:shadow-lg hover:shadow-green-500/10"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.05 11.957.05c3.178 0 6.165 1.236 8.411 3.482 2.247 2.246 3.481 5.232 3.48 8.412-.003 6.557-5.341 11.854-11.902 11.854-2.008 0-3.978-.507-5.73-1.472L0 24zm6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654z" />
              </svg>
              Iniciar Conversa
            </button>
          </div>
        </div>
      )}

      {/* Botão Flutuante Redondo do WhatsApp */}
      <button
        onClick={handleTogglePopup}
        aria-label={isOpen ? "Fechar chat" : "Falar no WhatsApp"}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-[0_6px_20px_rgba(37,211,102,0.35)] relative cursor-pointer group"
        style={{
          background: "#25D366",
        }}
      >
        {/* Anel de Radar/Pulse verde constante para interatividade */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />
        )}
        
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.4.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.3 3.1c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.5-.3zM12 .5C5.6.5.5 5.7.5 12c0 2 .5 4 1.6 5.8L.5 23.5l5.9-1.5c1.7.9 3.7 1.5 5.6 1.5 6.4 0 11.5-5.2 11.5-11.5S18.4.5 12 .5zm0 21c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.5.9.9-3.4-.2-.4c-1-1.6-1.5-3.4-1.5-5.3C2.3 6.7 6.7 2.3 12 2.3s9.7 4.4 9.7 9.7c0 5.3-4.4 9.5-9.7 9.5z" />
        </svg>

        {/* Badge vermelho de notificação inteligente */}
        {showNotification && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-md z-10 animate-bounce">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
          </span>
        )}
      </button>
    </div>
  );
}
