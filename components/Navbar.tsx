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

interface NavbarProps {
  variant?: "default" | "purple" | "pet";
}

export default function Navbar({ variant = "default" }: NavbarProps) {
  const { configs } = useConfig();
  const { openForm, openSimulador } = useModal();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isPurple = variant === "purple" || variant === "pet";

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b transition-colors duration-300"
        style={
          isPurple
            ? {
                background: "rgba(46, 16, 101, 0.45)",
                backdropFilter: "saturate(140%) blur(12px)",
                WebkitBackdropFilter: "saturate(140%) blur(12px)",
                borderColor: "rgba(168, 85, 247, 0.18)",
              }
            : {
                background: "rgba(226, 247, 250, 0.85)",
                backdropFilter: "saturate(140%) blur(12px)",
                WebkitBackdropFilter: "saturate(140%) blur(12px)",
                borderColor: "rgba(0, 180, 200, 0.15)",
              }
        }
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
                className={`object-contain object-left ${isPurple ? "brightness-0 invert" : ""}`}
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
                style={{ color: isPurple ? "#E9D5FF" : "var(--ink-soft)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = isPurple ? "#F59E0B" : "var(--royal)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = isPurple ? "#E9D5FF" : "var(--ink-soft)")}
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
              className="flex items-center gap-2 h-[44px] px-4 rounded-xl font-bold text-[13px] border whitespace-nowrap transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
              style={{
                color: "#FFFFFF",
                background: "#09090B",
                borderColor: "rgba(255, 255, 255, 0.18)",
              }}
              title="Ligar para plantão 24h"
            >
              {/* Laço de Luto */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-amber-400">
                <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 2.2 1.3 4.1 3.2 5l-4.2 8.5c-.3.6.1 1.3.8 1.3h2.4c.4 0 .7-.2.9-.5L12 17.8l1.4 3c.2.3.5.5.9.5h2.4c.7 0 1.1-.7.8-1.3l-4.2-8.5c1.9-.9 3.2-2.8 3.2-5C16.5 4 14.5 2 12 2zm0 3c.8 0 1.5.7 1.5 1.5S12.8 8 12 8s-1.5-.7-1.5-1.5S11.2 5 12 5z"/>
              </svg>
              Informar Óbito
            </a>

            {/* Simular plano */}
            <motion.button
              onClick={openSimulador}
              className="flex items-center gap-2 h-[44px] px-5 rounded-xl font-semibold text-[14px] border whitespace-nowrap cursor-pointer"
              style={
                isPurple
                  ? {
                      color: "#FFFFFF",
                      background: "linear-gradient(135deg, #7E22CE 0%, #A855F7 100%)",
                      borderColor: "rgba(216, 180, 254, 0.35)",
                      boxShadow: "0 4px 14px rgba(126, 34, 206, 0.25)",
                    }
                  : {
                      color: "var(--magenta)",
                      background: "linear-gradient(135deg, var(--magenta-soft) 0%, rgba(251, 233, 240, 0.6) 100%)",
                      borderColor: "rgba(196, 51, 106, 0.15)",
                      boxShadow: "0 2px 6px rgba(196, 51, 106, 0.02)",
                    }
              }
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              variants={{
                initial: { scale: 1 },
                hover: {
                  scale: 1.04,
                  borderColor: isPurple ? "rgba(216, 180, 254, 0.6)" : "rgba(196, 51, 106, 0.35)",
                  boxShadow: isPurple ? "0 6px 20px rgba(168, 85, 247, 0.35)" : "0 6px 20px rgba(196, 51, 106, 0.12)",
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
              onClick={() => openForm(isPurple ? "Plano Pet" : undefined)}
              className="h-[44px] px-5 rounded-xl font-bold text-[14px] flex items-center gap-2 transition-all hover:-translate-y-0.5 whitespace-nowrap cursor-pointer"
              style={
                isPurple
                  ? {
                      background: "#F59E0B",
                      color: "#0F172A",
                      boxShadow: "0 8px 22px rgba(245, 158, 11, 0.35)",
                    }
                  : {
                      background: "var(--royal)",
                      color: "#FFFFFF",
                      boxShadow: "0 8px 22px rgba(43,61,168,.28)",
                    }
              }
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3 7-7" /><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />
              </svg>
              {isPurple ? "Quero Plano Pet" : "Quero um plano"}
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
              className="flex items-center gap-1.5 h-[40px] px-3 rounded-[10px] font-bold text-[13px] border transition-all text-white bg-[#09090B] border-slate-800 shadow-sm"
              title="Informar Óbito"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-amber-400">
                <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 2.2 1.3 4.1 3.2 5l-4.2 8.5c-.3.6.1 1.3.8 1.3h2.4c.4 0 .7-.2.9-.5L12 17.8l1.4 3c.2.3.5.5.9.5h2.4c.7 0 1.1-.7.8-1.3l-4.2-8.5c1.9-.9 3.2-2.8 3.2-5C16.5 4 14.5 2 12 2zm0 3c.8 0 1.5.7 1.5 1.5S12.8 8 12 8s-1.5-.7-1.5-1.5S11.2 5 12 5z"/>
              </svg>
              Óbito
            </a>
            
            <button
              className={`w-10 h-10 rounded-[10px] border flex items-center justify-center cursor-pointer transition-colors ${
                isPurple
                  ? "border-purple-500/40 text-purple-200 hover:bg-purple-900/60"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
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
