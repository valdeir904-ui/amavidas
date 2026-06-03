"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import AnimatedCounter from "@/components/AnimatedCounter";

export default function ImpactoFinanceiro() {
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

  const negatives = ["Família corre atrás dos documentos", "Sem cobertura para remoção", "Velório improvisado", "Sem suporte emocional"];
  const positives = ["Cuidamos de toda a documentação", "Remoção em qualquer cidade", "Velório completo e digno", "Apoio psicológico incluso"];

  return (
    <section id="impacto" style={{ padding: "clamp(32px, 4vw, 64px) 0", background: "var(--bg-alt)" }}>
      <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6">

        {/* Section head */}
        <motion.div
          style={{ maxWidth: "720px", marginBottom: "24px" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <p className="text-[13px] font-semibold tracking-[0.14em] uppercase mb-1.5" style={{ color: "var(--magenta)" }}>
            A verdade que ninguém te conta
          </p>
          <h2>Você sabe quanto custa um funeral hoje?</h2>
          <p className="mt-2 text-[15px] xl:text-[17px]" style={{ color: "var(--ink-soft)" }}>
            No Brasil, o custo médio de um sepultamento ultrapassa <strong>R$ 8.000</strong> — um valor que, na maioria das famílias, chega no pior momento possível. Com a AmaVidas, esse peso some.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid max-[1150px]:flex max-[1150px]:flex-col max-[1150px]:gap-7"
          style={{ gridTemplateColumns: "1.1fr 1fr", gap: "clamp(20px, 3.5vw, 48px)", alignItems: "center" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Tabela comparativa */}
          <motion.div
            variants={scaleIn}
            className="w-full"
          >
            {/* ── Desktop: layout de dois cards flutuantes ── */}
            <div className="hidden min-[1151px]:grid grid-cols-2 gap-6 items-stretch">
              {/* Card Sem AmaVidas */}
              <div 
                className="rounded-3xl border transition-all duration-300 flex flex-col p-6 relative bg-slate-50/50"
                style={{
                  borderColor: "var(--line)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.015)"
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] font-bold tracking-wider uppercase px-3 py-1 rounded-full" style={{ background: "rgba(196, 51, 106, 0.08)", color: "var(--magenta)" }}>
                    Sem a AmaVidas
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">Alto Risco</span>
                </div>
                
                <div className="mb-4">
                  <div className="relative inline-block impacto-price text-[32px] md:text-[36px] xl:text-[42px]" style={{ fontFamily: "var(--serif)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink-mute)" }}>
                    R$ 8.000<small className="text-[14px] font-sans font-normal ml-1.5 text-slate-400">à vista</small>
                    <span className="absolute pointer-events-none" style={{ left: "-6%", right: "-6%", top: "50%", height: "2px", background: "var(--magenta)", transform: "rotate(-6deg)" }} aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-[14px] leading-snug text-slate-500">
                    Pago de uma vez, gerando endividamento no pior momento possível.
                  </p>
                </div>
                
                <div className="h-[1px] bg-slate-200/60 my-4" />
                
                <ul className="flex flex-col gap-3.5 mt-2">
                  {negatives.map((item) => (
                    <li key={item} className="text-[14px] flex items-start gap-3 text-slate-600">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-magenta" style={{ color: "var(--magenta)" }} aria-hidden="true">
                        <circle cx="12" cy="12" r="10" fill="var(--magenta-soft)" stroke="currentColor" strokeWidth="2" />
                        <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Com AmaVidas */}
              <div 
                className="rounded-3xl border-2 transition-all duration-300 flex flex-col p-6 relative bg-white"
                style={{
                  borderColor: "var(--teal)",
                  boxShadow: "0 20px 40px rgba(0, 180, 200, 0.08), 0 1px 3px rgba(0, 180, 200, 0.02)",
                  transform: "scale(1.03) translateY(-4px)"
                }}
              >
                {/* Badge de Destaque / Recomendado */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal text-white text-[10px] font-extrabold tracking-widest uppercase px-3.5 py-1 rounded-full shadow-md z-10" style={{ background: "var(--teal)" }}>
                  Recomendado ✓
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-[12px] font-bold tracking-wider uppercase px-3 py-1 rounded-full" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>
                    Com a AmaVidas
                  </span>
                  <span className="text-[11px] font-semibold text-teal-600" style={{ color: "var(--teal)" }}>Proteção Total</span>
                </div>
                
                <div className="mb-4">
                  <div className="impacto-price text-[32px] md:text-[36px] xl:text-[42px]" style={{ fontFamily: "var(--serif)", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--teal)" }}>
                    R$ 43<small className="text-[14px] font-sans font-normal ml-1.5 text-slate-400">/mês</small>
                  </div>
                  <p className="mt-2 text-[14px] leading-snug text-slate-500">
                    A partir de — tranquilidade previsível que cabe no orçamento da família.
                  </p>
                </div>
                
                <div className="h-[1px] bg-slate-100 my-4" />
                
                <ul className="flex flex-col gap-3.5 mt-2">
                  {positives.map((item) => (
                    <li key={item} className="text-[14px] flex items-start gap-3 text-slate-700">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-teal" style={{ color: "var(--teal)" }} aria-hidden="true">
                        <circle cx="12" cy="12" r="10" fill="var(--teal-soft)" stroke="currentColor" strokeWidth="2" />
                        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Mobile: carrossel com scroll snap ── */}
            <div className="min-[1151px]:hidden bg-white rounded-[20px] overflow-hidden border border-[var(--line)]" style={{ boxShadow: "var(--shadow-md)" }}>
              {/* Scroll container */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto"
                style={{
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {/* Slide 1 — Sem plano */}
                <div className="min-w-full" style={{ scrollSnapAlign: "start" }}>
                  <div className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.08em] border-b" style={{ background: "var(--magenta-soft)", color: "var(--magenta)", borderColor: "var(--line)" }}>
                    Sem a AmaVidas
                  </div>
                  <div className="p-5" style={{ background: "rgba(196, 51, 106, 0.03)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md" style={{ background: "var(--magenta-soft)", color: "var(--magenta)" }}>
                        Alto Risco Financeiro
                      </span>
                    </div>
                    <div className="relative inline-block impacto-price" style={{ fontFamily: "var(--serif)", fontSize: "40px", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink-mute)" }}>
                      R$ 8.000<small className="text-[15px] font-medium ml-1" style={{ fontFamily: "var(--sans)", color: "var(--ink-mute)" }}>à vista</small>
                      <span className="absolute pointer-events-none" style={{ left: "-6%", right: "-6%", top: "56%", height: "2px", background: "var(--magenta)", transform: "rotate(-6deg)" }} aria-hidden="true" />
                    </div>
                    <p className="mt-2.5 text-[14px] leading-snug" style={{ color: "var(--ink-soft)" }}>
                      Pago de uma vez, no momento mais difícil — geralmente em dinheiro ou cartão de crédito.
                    </p>
                    <ul className="mt-5 flex flex-col gap-3">
                      {negatives.map((item) => (
                        <li key={item} className="text-[14px] flex items-start gap-2" style={{ color: "var(--ink-soft)" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-[var(--magenta)]" style={{ color: "var(--magenta)" }} aria-hidden="true">
                            <circle cx="12" cy="12" r="10" fill="var(--magenta-soft)" stroke="currentColor" strokeWidth="2" />
                            <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Slide 2 — Com AmaVidas */}
                <div className="min-w-full" style={{ scrollSnapAlign: "start" }}>
                  <div className="px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.08em] border-b" style={{ background: "var(--teal-soft)", color: "var(--teal)", borderColor: "var(--line)" }}>
                    Com a AmaVidas ✓
                  </div>
                  <div className="p-5" style={{ background: "rgba(13, 148, 136, 0.015)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md" style={{ background: "var(--teal-soft)", color: "var(--teal)" }}>
                        Proteção Inteligente
                      </span>
                    </div>
                    <div className="impacto-price" style={{ fontFamily: "var(--serif)", fontSize: "40px", fontWeight: 500, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--teal)" }}>
                      R$ 43<small className="text-[15px] font-medium ml-1" style={{ fontFamily: "var(--sans)", color: "var(--ink-mute)" }}>/mês</small>
                    </div>
                    <p className="mt-2.5 text-[14px] leading-snug" style={{ color: "var(--ink-soft)" }}>
                      A partir de — equivalente a uma pizza por mês. Tranquilidade que cabe no orçamento.
                    </p>
                    <ul className="mt-5 flex flex-col gap-3">
                      {positives.map((item) => (
                        <li key={item} className="text-[14px] flex items-start gap-2" style={{ color: "var(--ink-soft)" }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="flex-shrink-0 mt-0.5 text-[var(--teal)]" style={{ color: "var(--teal)" }} aria-hidden="true">
                            <circle cx="12" cy="12" r="10" fill="var(--teal-soft)" stroke="currentColor" strokeWidth="2" />
                            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Indicadores + hint */}
              <div className="flex flex-col items-center gap-2 py-4 border-t" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToSlide(0)}
                    aria-label="Sem plano"
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: activeSlide === 0 ? "24px" : "8px",
                      height: "8px",
                      background: activeSlide === 0 ? "var(--magenta)" : "var(--line-strong)",
                    }}
                  />
                  <button
                    onClick={() => goToSlide(1)}
                    aria-label="Com AmaVidas"
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: activeSlide === 1 ? "24px" : "8px",
                      height: "8px",
                      background: activeSlide === 1 ? "var(--teal)" : "var(--line-strong)",
                    }}
                  />
                </div>
                <p className="text-[12px]" style={{ color: "var(--ink-mute)" }}>
                  {activeSlide === 0 ? "Deslize para ver com a AmaVidas →" : "← Deslize para comparar"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stat direita */}
          <motion.div 
            variants={fadeUp} 
            className="flex flex-col gap-4.5 rounded-3xl p-6.5 xl:p-8 bg-gradient-to-br from-slate-50 to-white border border-[var(--line)] shadow-sm"
          >
            <div>
              <p className="text-[12px] font-bold tracking-[0.15em] uppercase text-royal" style={{ color: "var(--royal)" }}>
                Economia Real Garantida
              </p>
              <div className="flex items-baseline gap-2.5 mt-2">
                <div
                  className="impacto-stat text-[48px] min-[540px]:text-[64px] min-[1151px]:text-[56px] xl:text-[76px] leading-none font-medium text-royal"
                  style={{ fontFamily: "var(--serif)", fontWeight: 500, color: "var(--royal)", letterSpacing: "-0.03em" }}
                >
                  R$ <AnimatedCounter target={7484} />
                </div>
                <span className="text-[12px] font-bold text-teal-600 bg-teal-soft px-2 py-0.5 rounded-md" style={{ color: "var(--teal)", background: "var(--teal-soft)" }}>
                  -95%
                </span>
              </div>
              <small className="block mt-2.5 text-[15px] xl:text-[17px] font-semibold text-slate-500">
                economizados no primeiro ano
              </small>
            </div>
            
            <p className="text-[14.5px] xl:text-[15.5px] leading-relaxed text-slate-600">
              Em vez de R$ 8.000 de uma vez em um momento de dor, você paga R$ 516 no ano inteiro e ainda tem cobertura completa. <strong className="text-slate-800">Sua família não precisa se preocupar com burocracia ou taxas surpresas.</strong>
            </p>
            
            <div
              className="flex gap-3 items-start rounded-2xl p-4 text-[14px] xl:text-[15px] leading-relaxed border"
              style={{ background: "rgba(196, 51, 106, 0.03)", borderColor: "rgba(196, 51, 106, 0.12)", color: "var(--magenta)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="flex-shrink-0 mt-0.5">
                <path d="M12 9v4M12 17h0" /><circle cx="12" cy="12" r="9" />
              </svg>
              <span><strong>Atenção:</strong> 9 em cada 10 famílias brasileiras não têm reserva financeira para um funeral. Proteja quem você ama.</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

