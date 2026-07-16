"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useModal } from "@/contexts/ModalContext";
import DrawerMobile from "@/components/DrawerMobile";
import { motion } from "framer-motion";
import { abrirWhatsApp } from "@/lib/whatsapp";

const NAV_LINKS = [
  { label: "Planos", href: "#planos" },
  { label: "Clube de Benefícios", href: "#beneficios" },
  { label: "Como funciona", href: "#como" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Sobre", href: "#sobre" },
  { label: "Dúvidas", href: "#faq" },
];

import { useConfig } from "@/contexts/ConfigContext";

export default function Navbar() {
  const { configs } = useConfig();
  const { openForm, openSimulador } = useModal();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(226, 247, 250, 0.85)", // azul bem clarinho transparente (tom da logo)
          backdropFilter: "saturate(140%) blur(12px)",
          WebkitBackdropFilter: "saturate(140%) blur(12px)",
          borderColor: "rgba(0, 180, 200, 0.15)", // borda no tom azul claro da logo com leve transparência
        }}
      >
        <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6 h-[66px] max-[980px]:h-[56px] flex items-center justify-between">
          {/* Logo */}
          <a href="#top" aria-label="AmaVidas — Quem Ama, Cuida.">
            <div className="relative h-[42px] max-[980px]:h-[35px] w-[130px] max-[980px]:w-[110px]">
              <Image
                src="/logo-amavidas-transparent.png"
                alt="AmaVidas"
                fill
                sizes="(max-width: 980px) 110px, 130px"
                className="object-contain object-left"
                priority
              />
            </div>
          </a>

          {/* Links desktop — aparecem a partir de 1100px */}
          <nav className="hidden min-[1100px]:flex items-center gap-5">
            {NAV_LINKS.filter(item => item.href !== "#beneficios" || configs.secao_beneficios_ativa !== "false").map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[14px] font-medium transition-colors whitespace-nowrap"
                style={{ color: "var(--ink-soft)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--royal)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-soft)")}
              >
                {item.label}
              </a>
            ))}
          </nav>
          {/* Right actions: Simular plano + Quero um plano */}
          <div className="hidden min-[1100px]:flex items-center gap-3">
            {/* Informar Óbito (Emergência) */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                abrirWhatsApp(configs.whatsapp || "5561985825621", "Olá, preciso informar um óbito e solicitar atendimento de plantão imediato.", "obito-header");
              }}
              className="flex items-center gap-2 h-[44px] px-4 rounded-xl font-bold text-[13px] border whitespace-nowrap transition-all"
              style={{
                color: "#1E293B",
                background: "#F1F5F9",
                borderColor: "#E2E8F0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#FEE2E2";
                e.currentTarget.style.color = "#991B1B";
                e.currentTarget.style.borderColor = "#FECACA";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#F1F5F9";
                e.currentTarget.style.color = "#1E293B";
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
              title="Ligar para plantão 24h"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Informar Óbito
            </a>

            {/* Simular plano */}
            <motion.button
              onClick={openSimulador}
              className="flex items-center gap-2 h-[44px] px-5 rounded-xl font-semibold text-[14px] border whitespace-nowrap cursor-pointer"
              style={{
                color: "var(--magenta)",
                background: "linear-gradient(135deg, var(--magenta-soft) 0%, rgba(251, 233, 240, 0.6) 100%)",
                borderColor: "rgba(196, 51, 106, 0.15)",
                boxShadow: "0 2px 6px rgba(196, 51, 106, 0.02)",
              }}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              variants={{
                initial: { scale: 1 },
                hover: {
                  scale: 1.04,
                  borderColor: "rgba(196, 51, 106, 0.35)",
                  boxShadow: "0 6px 20px rgba(196, 51, 106, 0.12), 0 2px 4px rgba(196, 51, 106, 0.06)",
                  background: "linear-gradient(135deg, #FAD6E5 0%, rgba(251, 233, 240, 0.95) 100%)",
                },
                tap: { scale: 0.97 }
              }}
            >
              <motion.svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={{
                  hover: { rotate: 10, scale: 1.15 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
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
              </motion.svg>
              <motion.span
                variants={{
                  hover: { x: 1.5 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                Simular plano
              </motion.span>
            </motion.button>

            {/* Quero um plano */}
            <button
              onClick={() => openForm()}
              className="h-[44px] px-5 rounded-xl font-semibold text-[14px] text-white flex items-center gap-2 transition-all hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
              style={{ background: "var(--royal)", boxShadow: "0 8px 22px rgba(43,61,168,.28)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3 7-7" /><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />
              </svg>
              Quero um plano
            </button>
          </div>

          {/* Mobile actions — aparece abaixo de 1100px */}
          <div className="flex items-center gap-2.5 min-[1100px]:hidden">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                abrirWhatsApp(configs.whatsapp || "5561985825621", "Olá, preciso informar um óbito e solicitar atendimento de plantão imediato.", "obito-header-mobile");
              }}
              className="flex items-center gap-1.5 h-[40px] px-3 rounded-[10px] font-bold text-[13px] border transition-all"
              style={{
                color: "#991B1B",
                background: "#FEF2F2",
                borderColor: "#FECACA",
              }}
              title="Informar Óbito"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Óbito
            </a>
            
            <button
              className="w-10 h-10 rounded-[10px] border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
              aria-label="Abrir menu"
              onClick={() => setDrawerOpen(true)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <DrawerMobile open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
