"use client";

import { useModal } from "@/contexts/ModalContext";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import AnimatedCounter from "@/components/AnimatedCounter";

export default function Hero() {
  const { openForm, openSimulador } = useModal();

  return (
    <section className="relative overflow-hidden pt-12 pb-12 max-[980px]:pt-6 max-[980px]:pb-6" id="top" style={{ background: "var(--bg)" }}>
      <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6">
        {/* Grid 2 colunas */}
        <div
          className="grid max-[980px]:flex max-[980px]:flex-col max-[980px]:gap-9 max-[980px]:items-stretch"
          style={{ gridTemplateColumns: "1fr 1.2fr", gap: "48px", alignItems: "center" }}
        >
          {/* Copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-[980px]:order-2"
          >
            {/* Tag */}
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2.5 rounded-full text-[14px] font-semibold mb-4 max-[980px]:hidden"
              style={{ background: "var(--magenta-soft)", color: "var(--magenta)", padding: "8px 14px" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--magenta)" aria-hidden="true">
                <path d="M12 21s-7.5-4.6-7.5-10.2C4.5 7.6 6.9 5 10 5c1.5 0 2.8.7 3.7 1.7C14.6 5.7 15.9 5 17.4 5c3.1 0 5.6 2.6 5.6 5.8C23 16.4 12 21 12 21z" />
              </svg>
              Atendimento humano em 1.700+ cidades · Águas Lindas, GO
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={fadeUp}
              className="text-[28px] lg:text-[32px] xl:text-[36px]"
              style={{
                fontFamily: "var(--sans)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Quando chegar a hora,{" "}
              <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--magenta)" }}>sua família</em>{" "}
              <span style={{ color: "var(--royal)" }}>não vai estar sozinha.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeUp}
              className="text-sm md:text-base xl:text-lg"
              style={{ marginTop: "12px", lineHeight: "1.5", color: "var(--ink-soft)", maxWidth: "540px" }}
            >
              A AmaVidas resolve papelada, remoção e velório com{" "}
              <span style={{ color: "var(--magenta)", fontWeight: 600 }}>gente de verdade no telefone</span> — não central terceirizada. Vocês cuidam uns dos outros. A partir de R$ 43/mês.
            </motion.p>

            {/* CTAs com hierarquia clara */}
            <motion.div variants={fadeUp} className="flex items-center gap-5 flex-wrap mt-6 max-[980px]:flex-col max-[980px]:items-stretch max-[980px]:gap-3.5">
              {/* PRIMARY */}
              <a
                href="#planos"
                className="h-16 px-8 inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold text-[19px] text-white transition-all hover:-translate-y-0.5 max-[980px]:w-full hover:shadow-[0_12px_28px_rgba(43,61,168,.4)]"
                style={{ background: "var(--royal)", boxShadow: "0 8px 22px rgba(43,61,168,.28)" }}
              >
                Conheça os planos
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>

              {/* SECONDARY */}
              <motion.button
                onClick={() => openSimulador()}
                className="h-[52px] px-6 inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-[16px] border whitespace-nowrap cursor-pointer max-[980px]:w-full max-[980px]:h-14"
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
                    scale: 1.03,
                    borderColor: "rgba(196, 51, 106, 0.35)",
                    boxShadow: "0 6px 20px rgba(196, 51, 106, 0.12), 0 2px 4px rgba(196, 51, 106, 0.06)",
                    background: "linear-gradient(135deg, #FAD6E5 0%, rgba(251, 233, 240, 0.95) 100%)",
                  },
                  tap: { scale: 0.97 }
                }}
              >
                <motion.svg
                  width="18"
                  height="18"
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

              {/* TERTIARY (link) */}
              <button
                onClick={() => openForm()}
                className="inline-flex items-center gap-1.5 font-semibold text-[15px] transition-colors max-[980px]:justify-center max-[980px]:h-12 hover:underline"
                style={{ color: "var(--magenta)", background: "transparent", border: "none", padding: "0 4px" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#AE2A5C")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--magenta)")}
              >
                Quero ser contatado
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </motion.div>

            {/* Credenciais */}
            <motion.div
              variants={staggerContainer}
              className="grid [grid-template-columns:repeat(4,1fr)] max-[980px]:grid-cols-2"
              style={{
                marginTop: "28px",
                paddingTop: "20px",
                borderTop: "1px solid var(--line)",
                gap: "8px",
              }}
            >
              {[
                {
                  val: <><AnimatedCounter target={4.9} isDecimal /> <span style={{ color: "#F5B400", fontSize: "16px", letterSpacing: "-1px" }}>★★★★★</span></>,
                  lbl: "Nota no Google",
                  mark: <span style={{ background: "#fff", border: "1px solid #e1e4ed", color: "#4285F4", fontFamily: "var(--sans)", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.04em", display: "inline-flex", alignItems: "center", width: 18, height: 18, borderRadius: 4, flexShrink: 0, justifyContent: "center" }}>G</span>,
                },
                {
                  val: <AnimatedCounter target={0} prefix="Zero" noCount />,
                  lbl: "no ReclameAqui",
                  mark: <span style={{ background: "linear-gradient(135deg, #00B14F, #00853E)", color: "#fff", fontSize: "8.5px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 4, flexShrink: 0 }}>RA</span>,
                },
                { val: <><AnimatedCounter target={5000} prefix="+" /></>, lbl: "Famílias atendidas" },
                { val: <><AnimatedCounter target={24} suffix="h" /></>, lbl: "Atendimento de emergência" },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex flex-col gap-1.5 pr-3.5 border-l border-l-transparent min-[981px]:border-l-[var(--line)] min-[981px]:pl-3.5 min-[981px]:first:border-l-transparent min-[981px]:first:pl-0 max-[980px]:even:border-l-[var(--line)] max-[980px]:even:pl-3.5 max-[980px]:odd:pl-0"
                >
                  <div
                    className="flex items-center gap-1.5 whitespace-nowrap text-[18px] md:text-[20px] xl:text-[22px]"
                    style={{ fontFamily: "var(--sans)", fontWeight: 700, color: "var(--royal)", lineHeight: 1 }}
                  >
                    {c.val}
                  </div>
                  <div className="flex items-start gap-1.5 text-[13px]" style={{ color: "var(--ink-soft)" }}>
                    {c.mark}
                    <span style={{ lineHeight: "1.35" }}>{c.lbl}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            className="relative aspect-[4/3] max-[980px]:aspect-[3/2] max-[980px]:w-full max-h-[480px] xl:max-h-[540px] max-[980px]:order-1"
            style={{
              borderRadius: "24px",
              overflow: "visible",
              boxShadow: "var(--shadow-lg)",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div
              className="absolute inset-0 rounded-[24px] overflow-hidden"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, rgba(232,235,251,.4) 0%, transparent 55%),
                  radial-gradient(circle at 70% 80%, rgba(226,247,250,.4) 0%, transparent 55%),
                  linear-gradient(160deg, #f4f6fc 0%, #fafafa 100%)
                `,
              }}
            >
              <Image
                src="/hero-family.png"
                alt="Família feliz e protegida com a AmaVidas"
                fill
                sizes="(max-width: 980px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
              />
            </div>

            {/* Badge topo-direita */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="absolute flex items-center gap-3 bg-white rounded-2xl hover:scale-105 transition-transform top-7 -right-4 max-[980px]:hidden origin-right"
              style={{ padding: "16px 18px", boxShadow: "var(--shadow-md)", zIndex: 2 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div
                className="w-11 h-11 rounded-xl grid place-items-center flex-shrink-0"
                style={{ background: "var(--magenta-soft)", color: "var(--magenta)" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21s-7.5-4.6-7.5-10.2C4.5 7.6 6.9 5 10 5c1.5 0 2.8.7 3.7 1.7C14.6 5.7 15.9 5 17.4 5c3.1 0 5.6 2.6 5.6 5.8C23 16.4 12 21 12 21z" />
                </svg>
              </div>
              <div>
                <div className="text-[14px] font-semibold leading-tight" style={{ color: "var(--ink)" }}>Atendimento humano</div>
                <div className="text-[12px] leading-tight" style={{ color: "var(--ink-mute)" }}>Pessoas reais, 24h por dia</div>
              </div>
            </motion.div>

            {/* Badge inferior-esquerda */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="absolute flex items-center gap-3 bg-white rounded-2xl hover:scale-105 transition-transform bottom-8 -left-4 max-[980px]:hidden origin-left"
              style={{ padding: "16px 18px", boxShadow: "var(--shadow-md)", zIndex: 2 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <div
                className="w-11 h-11 rounded-xl grid place-items-center flex-shrink-0"
                style={{ background: "var(--teal-soft)", color: "var(--teal)" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                </svg>
              </div>
              <div>
                <div className="text-[14px] font-semibold leading-tight" style={{ color: "var(--ink)" }}>Sempre ao seu lado</div>
                <div className="text-[12px] leading-tight" style={{ color: "var(--ink-mute)" }}>Suporte 24h em todo o país</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

