"use client";

import { useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";
import Simulador from "@/components/Simulador";

export default function ModalSimulador() {
  const { modal, closeSimulador } = useModal();
  const open = modal.simulador.open;

  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSimulador();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, closeSimulador]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-300 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(20,25,55,.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onClick={closeSimulador}
        aria-hidden="true"
      />

      {/* Card do modal */}
      <div
        className={`relative z-10 bg-white w-full max-w-[580px] rounded-[24px] flex flex-col transition-all duration-300 ${
          open ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
        }`}
        style={{
          maxHeight: "92dvh",
          boxShadow: "var(--shadow-lg)",
        }}
        aria-modal="true"
        role="dialog"
        aria-label="Simular plano"
      >
        {/* Header fixo */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon-icon.png" alt="AmaVidas" className="w-full h-full object-cover" />
            </div>
            <div>
              <p
                className="text-[16px] font-semibold leading-tight"
                style={{ color: "var(--ink)" }}
              >
                Simular Plano
              </p>
              <p className="text-[13px] leading-tight" style={{ color: "var(--ink-mute)" }}>
                Descubra o ideal para sua família
              </p>
            </div>
          </div>

          <button
            onClick={closeSimulador}
            className="w-10 h-10 rounded-[10px] border grid place-items-center hover:bg-[var(--bg-alt)] transition-colors flex-shrink-0"
            style={{ borderColor: "var(--line)" }}
            aria-label="Fechar"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          {open && <Simulador onClose={closeSimulador} />}
        </div>
      </div>
    </div>
  );
}
