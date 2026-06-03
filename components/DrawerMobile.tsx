"use client";

import { useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";

const NAV_LINKS = [
  { label: "Planos", href: "#planos" },
  { label: "Como funciona", href: "#como" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Sobre", href: "#sobre" },
  { label: "Dúvidas", href: "#faq" },
];

import { useConfig } from "@/contexts/ConfigContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DrawerMobile({ open, onClose }: Props) {
  const { configs } = useConfig();
  const { openForm, openSimulador } = useModal();

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[99] transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(20,25,55,.4)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-[100] h-screen w-[84%] max-w-[360px] bg-white flex flex-col gap-5 p-6 transition-transform duration-300 ease-in-out`}
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          boxShadow: "-20px 0 60px rgba(0,0,0,.18)",
        }}
        aria-label="Menu de navegação"
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Fechar menu"
          className="self-end w-11 h-11 rounded-[10px] border border-[var(--line)] grid place-items-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* Links */}
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="py-3.5 text-[19px] font-medium text-[var(--ink)] border-b border-[var(--line)] hover:text-[var(--royal)] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="mt-auto flex flex-col gap-3">
          {/* Informar Óbito (Emergência) */}
          <a
            href={`https://wa.me/${configs.whatsapp || "5561985458010"}?text=Ol%C3%A1%2C%20preciso%20informar%20um%20%C3%B3bito%20e%20solicitar%20atendimento%20de%20plant%C3%A3o%20imediato.`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-14 flex items-center justify-center gap-2.5 rounded-xl font-bold text-[17px] border transition-all duration-200 active:scale-[0.98]"
            style={{
              color: "#991B1B",
              background: "#FEF2F2",
              borderColor: "#FECACA",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Informar Óbito
          </a>

          <button
            onClick={() => { onClose(); openSimulador(); }}
            className="h-14 flex items-center justify-center gap-2.5 rounded-xl font-semibold text-[17px] border transition-all duration-200 active:scale-[0.98] cursor-pointer"
            style={{
              color: "var(--magenta)",
              borderColor: "rgba(196, 51, 106, 0.15)",
              background: "linear-gradient(135deg, var(--magenta-soft) 0%, rgba(251, 233, 240, 0.8) 100%)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="16" y1="14" x2="16" y2="18" />
              <line x1="16" y1="10" x2="16" y2="10" />
              <line x1="12" y1="10" x2="12" y2="10" />
              <line x1="8" y1="10" x2="8" y2="10" />
              <line x1="12" y1="14" x2="12" y2="14" />
              <line x1="8" y1="14" x2="8" y2="14" />
              <line x1="12" y1="18" x2="12" y2="18" />
              <line x1="8" y1="18" x2="8" y2="18" />
            </svg>
            Simular plano
          </button>
          <button
          onClick={() => { onClose(); openForm(); }}
          className="h-16 flex items-center justify-center gap-2.5 rounded-xl font-semibold text-[18px] text-white"
          style={{ background: "var(--royal)", boxShadow: "0 8px 22px rgba(43,61,168,.28)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.4.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.3 3.1c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.5-.3z"/>
          </svg>
          Falar no WhatsApp
        </button>
        </div>
      </aside>
    </>
  );
}
