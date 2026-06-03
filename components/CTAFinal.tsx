"use client";

import { useState, useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { abrirWhatsApp } from "@/lib/whatsapp";

import { useConfig } from "@/contexts/ConfigContext";

export default function CTAFinal() {
  const { openForm } = useModal();
  const { configs } = useConfig();
  const num = configs.whatsapp || "5561985825621";

  return (
    <section
      id="contato"
      className="text-center max-[980px]:py-16 overflow-hidden"
      style={{
        padding: "96px 0",
        background: "linear-gradient(160deg, #fff 0%, var(--royal-soft) 100%)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6" style={{ textAlign: "center" }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* Eyebrow */}
          <motion.p 
            variants={fadeUp}
            className="text-[14px] font-semibold tracking-[0.14em] uppercase mb-5" 
            style={{ color: "var(--magenta)", textAlign: "center" }}
          >
            Quem ama, cuida.
          </motion.p>

          {/* Headline */}
          <motion.h2
            variants={fadeUp}
            className="mx-auto mb-6"
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 500,
              lineHeight: 1.15,
              maxWidth: 760,
              textAlign: "center",
            }}
          >
            Hoje você cuida deles.{" "}
            <em style={{ fontStyle: "italic", color: "var(--magenta)", fontWeight: 400 }}>
              Amanhã, cuidam de você.
            </em>
          </motion.h2>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            className="mx-auto text-[19px] max-[980px]:text-[17px]"
            style={{ maxWidth: 540, color: "var(--ink-soft)", textAlign: "center", marginTop: "24px" }}
          >
            Por menos de R$ 1,20 por dia, sua família tem a tranquilidade de que tudo estará resolvido — com dignidade, carinho e respeito.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            variants={fadeUp}
            className="flex gap-4 justify-center flex-wrap max-[980px]:flex-col max-[980px]:items-stretch w-full max-w-[800px]"
            style={{ marginTop: "64px" }}
          >
            <motion.a
              href="#planos"
              className="h-16 px-8 rounded-xl font-semibold text-[18px] inline-flex items-center justify-center transition-colors max-[980px]:h-14 max-[980px]:text-[16px] max-[980px]:px-6"
              style={{ background: "var(--royal)", color: "#fff", boxShadow: "0 12px 30px rgba(43,61,168,.28)" }}
              whileHover={{ scale: 1.03, backgroundColor: "#25358F", boxShadow: "0 16px 36px rgba(43,61,168,.35)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
            >
              Ver planos a partir de R$ 43/mês
            </motion.a>

            <motion.button
              onClick={() => abrirWhatsApp(num, "Olá! Vim pelo site da AmaVidas e gostaria de tirar algumas dúvidas.")}
              className="h-16 px-8 rounded-xl font-semibold text-[18px] inline-flex items-center justify-center gap-2 transition-colors max-[980px]:h-14 max-[980px]:text-[16px] max-[980px]:px-6"
              style={{ background: "var(--magenta)", color: "#fff" }}
              whileHover={{ scale: 1.03, backgroundColor: "#AE2A5C" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.4.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.3 3.1c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.2-.3-.2-.5-.3z" />
              </svg>
              Falar agora no WhatsApp
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
