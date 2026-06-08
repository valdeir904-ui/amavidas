"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import AnimatedCounter from "@/components/AnimatedCounter";
import { useModal } from "@/contexts/ModalContext";

export default function ImpactoFinanceiro() {
  const { openForm } = useModal();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Mobile carousel state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  function handleScroll() {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    setActiveSlide(scrollLeft > offsetWidth / 2 ? 1 : 0);
  }

  function goToSlide(i: number) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: "smooth" });
  }

  const custoFuneral = 8000;
  const custoMensal = 43;
  const custoAnual = custoMensal * 12; // 516
  const economia = custoFuneral - custoAnual; // 7484
  const percentual = Math.round((economia / custoFuneral) * 100); // ~94

  const negatives = [
    "Família corre atrás dos documentos",
    "Sem cobertura para remoção",
    "Velório improvisado",
    "Sem suporte emocional",
  ];
  const positives = [
    "Suporte em toda a documentação",
    "Remoção em qualquer cidade",
    "Velório completo e digno",
    "Apoio psicológico incluso",
  ];

  return (
    <section
      id="impacto"
      ref={sectionRef}
      style={{
        padding: "clamp(64px, 8vw, 120px) 0",
        background: "linear-gradient(170deg, #0C1332 0%, #121A4A 35%, #1B2766 65%, #0F1740 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative elements */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(0, 180, 200, 0.06), transparent)",
          top: "-200px",
          right: "-200px",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(196, 51, 106, 0.05), transparent)",
          bottom: "-150px",
          left: "-150px",
        }}
        aria-hidden="true"
      />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1300px] mx-auto px-5 min-[640px]:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-14 max-[980px]:mb-10"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <p
            className="text-[12px] font-bold tracking-[0.22em] uppercase mb-4 inline-flex items-center gap-2"
            style={{ color: "var(--magenta)" }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--magenta)",
                display: "inline-block",
              }}
            />
            A verdade que ninguém te conta
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--magenta)",
                display: "inline-block",
              }}
            />
          </p>
          <h2
            className="text-[32px] min-[768px]:text-[42px] min-[1100px]:text-[48px] font-medium leading-[1.1] tracking-tight mx-auto"
            style={{
              fontFamily: "var(--serif)",
              color: "#ffffff",
              maxWidth: "780px",
            }}
          >
            Você sabe quanto custa{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--magenta) 0%, #E85D8A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              um funeral hoje?
            </span>
          </h2>
          <p
            className="mt-4 text-[16px] min-[768px]:text-[18px] leading-relaxed mx-auto"
            style={{ color: "rgba(255,255,255,0.55)", maxWidth: "600px" }}
          >
            No Brasil, o custo médio de um sepultamento ultrapassa{" "}
            <strong style={{ color: "rgba(255,255,255,0.85)" }}>R$ 8.000</strong> — um valor que
            chega no pior momento possível.
          </p>
        </motion.div>

        {/* ─── SAVINGS FLOW: 3-column visual ─── */}
        <motion.div
          className="grid max-[980px]:hidden"
          style={{
            gridTemplateColumns: "1fr auto 1fr auto 1fr",
            gap: "0",
            alignItems: "stretch",
          }}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* Card 1: Sem Plano — vermelho premium escuro */}
          <motion.div
            variants={fadeUp}
            className="rounded-[20px] p-7 flex flex-col relative"
            style={{
              background: "linear-gradient(145deg, rgba(232, 104, 93, 0.07) 0%, rgba(13, 20, 45, 0.75) 100%)",
              border: "1.5px solid rgba(232, 104, 93, 0.28)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 0 50px rgba(232, 104, 93, 0.07), 0 12px 32px rgba(10, 15, 40, 0.4)",
            }}
          >
            {/* Background overflow container for glows and shine line */}
            <div
              className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              {/* Warm glow top-left */}
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: "radial-gradient(closest-side, rgba(240, 100, 100, 0.18), transparent)",
                  top: "-60px",
                  left: "-40px",
                  position: "absolute",
                }}
              />
              {/* Subtle shine line */}
              <div
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(255,180,180,0.18), transparent)",
                  position: "absolute",
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Header with warning icon */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                    style={{ background: "rgba(220, 80, 80, 0.15)", border: "1px solid rgba(220, 80, 80, 0.15)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8685D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </span>
                  <span
                    className="text-[11px] font-bold tracking-[0.15em] uppercase"
                    style={{ color: "#E8685D" }}
                  >
                    Gasto inesperado
                  </span>
                </div>
                <span
                  className="text-[9px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(220, 80, 80, 0.12)", color: "#E8685D", border: "1px solid rgba(220, 80, 80, 0.1)" }}
                >
                  Alto risco
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    R$
                  </span>
                  <span
                    className="text-[52px] min-[1100px]:text-[60px] font-medium leading-none"
                    style={{
                      fontFamily: "var(--serif)",
                      color: "#E8685D",
                      letterSpacing: "-0.02em",
                      textShadow: "0 0 30px rgba(232, 104, 93, 0.25)",
                    }}
                  >
                    8.000
                  </span>
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    /à vista
                  </span>
                </div>
                <p
                  className="text-[13px] mt-1.5 font-medium"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  pago de uma vez só · sem parcelamento
                </p>
              </div>

              {/* Separator */}
              <div className="h-[1px] mb-4" style={{ background: "linear-gradient(90deg, rgba(220,80,80,0.15), rgba(220,80,80,0.05))" }} />

              {/* Negative items */}
              <ul className="flex flex-col gap-3 mt-auto">
                {negatives.map((item) => (
                  <li
                    key={item}
                    className="text-[13.5px] flex items-start gap-2.5"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    <span
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(220, 80, 80, 0.12)" }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#E8685D"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Arrow 1 → 2 */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center px-3"
          >
            <div className="flex flex-col items-center gap-2">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                className="opacity-30"
              >
                <path
                  d="M12 8l8 8-8 8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "rgba(255,255,255,0.2)", writingMode: "vertical-lr" }}
              >
                VS
              </span>
            </div>
          </motion.div>

          {/* Card 2: Com AmaVidas */}
          <motion.div
            variants={fadeUp}
            className="rounded-[20px] p-7 flex flex-col relative"
            style={{
              background: "linear-gradient(145deg, rgba(0, 180, 200, 0.1) 0%, rgba(13, 20, 45, 0.75) 100%)",
              border: "2px solid rgba(0, 180, 200, 0.42)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 0 60px rgba(0, 180, 200, 0.14), 0 16px 40px rgba(10, 15, 40, 0.45)",
            }}
          >
            {/* Background overflow container for glows and shine line */}
            <div
              className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              {/* Cyan glow decorations */}
              <div
                style={{
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  background: "radial-gradient(closest-side, rgba(0, 180, 200, 0.15), transparent)",
                  top: "-80px",
                  right: "-60px",
                  position: "absolute",
                }}
              />
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "radial-gradient(closest-side, rgba(0, 180, 200, 0.08), transparent)",
                  bottom: "-30px",
                  left: "-20px",
                  position: "absolute",
                }}
              />
              {/* Shine line */}
              <div
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, rgba(0,180,200,0.35), transparent)",
                  position: "absolute",
                }}
              />
            </div>

            {/* Recommended badge */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full whitespace-nowrap z-20"
              style={{
                background: "linear-gradient(90deg, var(--teal) 0%, #0099A8 100%)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 16px rgba(0, 180, 200, 0.4), 0 0 20px rgba(0, 180, 200, 0.2)",
              }}
            >
              ✓ Recomendado
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2.5 mb-5">
                <span
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                  style={{
                    background: "rgba(0, 180, 200, 0.15)",
                    border: "1px solid rgba(0, 180, 200, 0.2)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--teal)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 11l2 2 4-4" />
                  </svg>
                </span>
                <span
                  className="text-[11px] font-bold tracking-[0.15em] uppercase"
                  style={{ color: "var(--teal)" }}
                >
                  Com AmaVidas
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    R$
                  </span>
                  <span
                    className="text-[52px] min-[1100px]:text-[60px] font-medium leading-none"
                    style={{
                      fontFamily: "var(--serif)",
                      color: "var(--teal)",
                      letterSpacing: "-0.02em",
                      textShadow: "0 0 30px rgba(0, 180, 200, 0.25)",
                    }}
                  >
                    {custoMensal}
                  </span>
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    /mês
                  </span>
                </div>
                <p
                  className="text-[13px] mt-1.5 font-medium"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  equivale a R$ {custoAnual}/ano · cobertura completa
                </p>
              </div>

              {/* Separator */}
              <div
                className="h-[1px] mb-4"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0, 180, 200, 0.2), rgba(0, 180, 200, 0.05))",
                }}
              />

              {/* Positive items */}
              <ul className="flex flex-col gap-3 mt-auto">
                {positives.map((item) => (
                  <li
                    key={item}
                    className="text-[13.5px] flex items-start gap-2.5"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    <span
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(0, 180, 200, 0.12)" }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--teal)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Arrow 2 → Result */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center px-3"
          >
            <div className="flex flex-col items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="opacity-30">
                <path d="M12 8l8 8-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "rgba(255,255,255,0.2)", writingMode: "vertical-lr" }}
              >
                =
              </span>
            </div>
          </motion.div>

          {/* Card 3: Resultado — Economia (destaque verde) */}
          <motion.div
            variants={fadeUp}
            className="rounded-[20px] p-7 flex flex-col relative"
            style={{
              background: "linear-gradient(145deg, rgba(34, 197, 94, 0.08) 0%, rgba(13, 20, 45, 0.75) 100%)",
              border: "1.5px solid rgba(34, 197, 94, 0.28)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 0 50px rgba(34, 197, 94, 0.07), 0 12px 32px rgba(10, 15, 40, 0.4)",
            }}
          >
            {/* Background overflow container for glows and shine line */}
            <div
              className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              {/* Green glow decorations */}
              <div
                style={{
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  background: "radial-gradient(closest-side, rgba(34, 197, 94, 0.15), transparent)",
                  top: "-80px",
                  right: "-60px",
                  position: "absolute",
                }}
              />
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "radial-gradient(closest-side, rgba(16, 185, 129, 0.08), transparent)",
                  bottom: "-30px",
                  left: "-20px",
                  position: "absolute",
                }}
              />
              {/* Shine line */}
              <div
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.25), transparent)",
                  position: "absolute",
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                    style={{ background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.15)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  </span>
                  <span
                    className="text-[11px] font-bold tracking-[0.15em] uppercase"
                    style={{ color: "#22C55E" }}
                  >
                    Sua economia
                  </span>
                </div>
                <span
                  className="text-[9px] font-extrabold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22C55E", border: "1px solid rgba(34, 197, 94, 0.12)", boxShadow: "0 0 12px rgba(34, 197, 94, 0.15)" }}
                >
                  -{percentual}%
                </span>
              </div>

              {/* Big savings number */}
              <div className="mb-2">
                <span
                  className="text-[50px] min-[1100px]:text-[58px] font-medium leading-none"
                  style={{
                    fontFamily: "var(--serif)",
                    letterSpacing: "-0.02em",
                    color: "#22C55E",
                    textShadow: "0 0 30px rgba(34, 197, 94, 0.25)",
                  }}
                >
                  R$ <AnimatedCounter target={economia} />
                </span>
              </div>
              <p className="text-[13px] font-semibold mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
                economizados no primeiro ano
              </p>

              {/* Separator */}
              <div className="h-[1px] mb-4" style={{ background: "linear-gradient(90deg, rgba(34,197,94,0.18), rgba(34,197,94,0.04))" }} />

              {/* Visual bar comparison */}
              <div className="flex flex-col gap-3 mb-5">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Funeral sem plano</span>
                    <span style={{ color: "#E8685D" }}>R$ 8.000</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #E8685D, rgba(232,104,93,0.6))" }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "100%" } : { width: 0 }}
                      transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>AmaVidas / ano</span>
                    <span style={{ color: "#22C55E" }}>R$ {custoAnual}</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #22C55E, rgba(34,197,94,0.7))", boxShadow: "0 0 10px rgba(34,197,94,0.3)" }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${(custoAnual / custoFuneral) * 100}%` } : { width: 0 }}
                      transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              <p
                className="text-[13.5px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Em vez de R$ 8.000 de uma vez, você paga{" "}
                <strong style={{ color: "#22C55E" }}>R$ {custoAnual} no ano inteiro</strong>{" "}
                e tem cobertura completa para a família.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ─── MOBILE LAYOUT ─── */}
        <motion.div
          className="min-[981px]:hidden flex flex-col gap-5"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {/* Mobile Card: Sem plano — vermelho premium escuro */}
          <motion.div
            variants={fadeUp}
            className="rounded-[18px] p-5 relative"
            style={{
              background: "linear-gradient(145deg, rgba(232, 104, 93, 0.05) 0%, rgba(13, 20, 45, 0.75) 100%)",
              border: "1.5px solid rgba(232, 104, 93, 0.23)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 0 35px rgba(232, 104, 93, 0.05), 0 8px 20px rgba(10, 15, 40, 0.35)",
            }}
          >
            {/* Background overflow container for glows and shine line */}
            <div
              className="absolute inset-0 rounded-[18px] overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  background: "radial-gradient(closest-side, rgba(240,100,100,0.15), transparent)",
                  top: "-40px",
                  left: "-30px",
                  position: "absolute",
                }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-[8px] flex items-center justify-center"
                    style={{ background: "rgba(220, 80, 80, 0.15)", border: "1px solid rgba(220, 80, 80, 0.12)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8685D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#E8685D" }}>
                    Gasto inesperado
                  </span>
                </div>
                <span
                  className="text-[8px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(220, 80, 80, 0.1)", color: "#E8685D", border: "1px solid rgba(220,80,80,0.08)" }}
                >
                  Alto risco
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>R$</span>
                <span
                  className="text-[40px] font-medium leading-none"
                  style={{
                    fontFamily: "var(--serif)",
                    color: "#E8685D",
                    letterSpacing: "-0.02em",
                    textShadow: "0 0 20px rgba(232, 104, 93, 0.2)",
                  }}
                >
                  8.000
                </span>
                <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>/à vista</span>
              </div>
              <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                pago de uma vez só · sem parcelamento
              </p>
              
              <div
                className="h-[1px] my-3"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(220, 80, 80, 0.15), rgba(220, 80, 80, 0.04))",
                }}
              />

              <ul className="flex flex-col gap-2">
                {negatives.slice(0, 2).map((item) => (
                  <li key={item} className="text-[12.5px] flex items-start gap-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                    <span
                      className="w-[16px] h-[16px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(220, 80, 80, 0.1)" }}
                    >
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#E8685D"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Arrow down */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>VS</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-25">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>

          {/* Mobile Card: Com AmaVidas */}
          <motion.div
            variants={fadeUp}
            className="rounded-[18px] p-5 relative"
            style={{
              background: "linear-gradient(145deg, rgba(0, 180, 200, 0.08) 0%, rgba(13, 20, 45, 0.75) 100%)",
              border: "1.5px solid rgba(0, 180, 200, 0.32)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 0 35px rgba(0, 180, 200, 0.1), 0 8px 20px rgba(10, 15, 40, 0.35)",
            }}
          >
            {/* Background overflow container for glows and shine line */}
            <div
              className="absolute inset-0 rounded-[18px] overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              {/* Cyan glow decoration */}
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  background: "radial-gradient(closest-side, rgba(0,180,200,0.12), transparent)",
                  top: "-40px",
                  left: "-30px",
                  position: "absolute",
                }}
              />
              {/* Shine line */}
              <div
                style={{
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1.5px",
                  background: "linear-gradient(90deg, transparent, rgba(0,180,200,0.3), transparent)",
                  position: "absolute",
                }}
              />
            </div>

            {/* Recommended badge */}
            <div
              className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-black tracking-[0.18em] uppercase px-3.5 py-1 rounded-full whitespace-nowrap z-20"
              style={{
                background: "linear-gradient(90deg, var(--teal) 0%, #0099A8 100%)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 3px 12px rgba(0, 180, 200, 0.35)",
              }}
            >
              ✓ Recomendado
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center"
                  style={{
                    background: "rgba(0, 180, 200, 0.15)",
                    border: "1px solid rgba(0, 180, 200, 0.2)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--teal)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 11l2 2 4-4" />
                  </svg>
                </span>
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "var(--teal)" }}>
                  Com AmaVidas
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>R$</span>
                <span
                  className="text-[40px] font-medium leading-none"
                  style={{
                    fontFamily: "var(--serif)",
                    color: "var(--teal)",
                    letterSpacing: "-0.02em",
                    textShadow: "0 0 20px rgba(0, 180, 200, 0.2)",
                  }}
                >
                  {custoMensal}
                </span>
                <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>/mês</span>
              </div>
              <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                R$ {custoAnual}/ano · cobertura completa
              </p>
              
              <div
                className="h-[1px] my-3"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0, 180, 200, 0.15), rgba(0, 180, 200, 0.04))",
                }}
              />

              <ul className="flex flex-col gap-2 mt-3">
                {positives.slice(0, 2).map((item) => (
                  <li key={item} className="text-[12.5px] flex items-start gap-2" style={{ color: "rgba(255,255,255,0.65)" }}>
                    <span
                      className="w-[16px] h-[16px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(0, 180, 200, 0.1)" }}
                    >
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--teal)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Arrow down */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="flex flex-col items-center gap-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-25">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.div>

          {/* Mobile Card: Resultado — economia verde */}
          <motion.div
            variants={fadeUp}
            className="rounded-[18px] p-5 relative text-center"
            style={{
              background: "linear-gradient(145deg, rgba(34, 197, 94, 0.06) 0%, rgba(13, 20, 45, 0.75) 100%)",
              border: "1.5px solid rgba(34, 197, 94, 0.22)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 0 35px rgba(34, 197, 94, 0.06), 0 8px 20px rgba(10, 15, 40, 0.35)",
            }}
          >
            {/* Background overflow container for glows and shine line */}
            <div
              className="absolute inset-0 rounded-[18px] overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  background: "radial-gradient(closest-side, rgba(34,197,94,0.1), transparent)",
                  top: "-50px",
                  right: "-40px",
                  position: "absolute",
                }}
              />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span
                  className="w-7 h-7 rounded-[8px] flex items-center justify-center"
                  style={{ background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.12)" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </span>
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: "#22C55E" }}>
                  Sua economia
                </span>
              </div>
              <div className="flex items-baseline justify-center">
                <span
                  className="text-[42px] font-medium leading-none"
                  style={{
                    fontFamily: "var(--serif)",
                    letterSpacing: "-0.02em",
                    color: "#22C55E",
                    textShadow: "0 0 25px rgba(34, 197, 94, 0.2)",
                  }}
                >
                  R$ <AnimatedCounter target={economia} />
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span
                  className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22C55E", boxShadow: "0 0 10px rgba(34,197,94,0.12)" }}
                >
                  -{percentual}%
                </span>
                <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
                  no 1º ano
                </span>
              </div>

              <div className="h-[1px] my-3" style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent)" }} />

              {/* Mobile visual bars */}
              <div className="flex flex-col gap-2.5">
                <div>
                  <div className="flex justify-between text-[10px] font-semibold mb-1">
                    <span style={{ color: "rgba(255,255,255,0.35)" }}>Funeral sem plano</span>
                    <span style={{ color: "#E8685D" }}>R$ 8.000</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #E8685D, rgba(232,104,93,0.6))" }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "100%" } : { width: 0 }}
                      transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-semibold mb-1">
                    <span style={{ color: "rgba(255,255,255,0.45)" }}>AmaVidas / ano</span>
                    <span style={{ color: "#22C55E" }}>R$ {custoAnual}</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #22C55E, rgba(34,197,94,0.7))", boxShadow: "0 0 8px rgba(34,197,94,0.25)" }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${(custoAnual / custoFuneral) * 100}%` } : { width: 0 }}
                      transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom alert + CTA */}
        <motion.div
          className="mt-10 max-[980px]:mt-8 flex flex-col min-[768px]:flex-row items-center gap-5 justify-between rounded-[16px] p-5 min-[768px]:p-6"
          style={{
            background: "rgba(196, 51, 106, 0.06)",
            border: "1px solid rgba(196, 51, 106, 0.12)",
          }}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div className="flex items-start gap-3 max-[768px]:text-center max-[768px]:flex-col max-[768px]:items-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--magenta)"
              strokeWidth="2"
              className="flex-shrink-0 mt-0.5 max-[768px]:mx-auto"
            >
              <path d="M12 9v4M12 17h0" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            <p
              className="text-[13.5px] min-[768px]:text-[14.5px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              <strong style={{ color: "var(--magenta)" }}>Atenção:</strong> 9 em cada 10 famílias brasileiras não têm reserva financeira para um funeral.{" "}
              <strong style={{ color: "rgba(255,255,255,0.85)" }}>Proteja quem você ama.</strong>
            </p>
          </div>
          <button
            onClick={() => openForm("Amar Plus")}
            className="h-[48px] px-7 rounded-xl font-semibold text-[14px] whitespace-nowrap transition-all flex-shrink-0 cursor-pointer"
            style={{
              background: "var(--magenta)",
              color: "#fff",
              border: "none",
              boxShadow: "0 4px 16px rgba(196, 51, 106, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#AE2A5C";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--magenta)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Proteger minha família →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
