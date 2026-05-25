"use client";

import { useState, useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface DynamicPlan {
  slug: string;
  name: string;
  sub: string;
  price: number;
  meta: string;
  features: string[]; // Principais (exibidos sempre)
  expandedFeatures: string[]; // Extras (exibidos ao expandir)
  featured: boolean;
  badge: string | null;
}

const FALLBACK_PLANS: DynamicPlan[] = [
  {
    slug: "cuidar-plus",
    name: "Cuidar Plus",
    sub: "O cuidado essencial para proteger sua família.",
    price: 35,
    meta: "Protege você + 4 familiares",
    features: [
      "Higienização e preparação completa",
      "Urna padrão adulto e infantil",
      "Ornamentação com flores naturais",
      "Remoção e cortejo em Águas Lindas de Goiás",
      "Traslado terrestre de até 100km",
    ],
    expandedFeatures: [
      "Véu, terço, velas e itens de homenagem",
      "Cerimônia organizada conforme o credo religioso",
      "Livro de presença e cartões de homenagem",
    ],
    featured: false,
    badge: null,
  },
  {
    slug: "amar-plus",
    name: "Amar Plus",
    sub: "Mais conforto e acolhimento para sua família.",
    price: 43,
    meta: "Protege você + 6 familiares",
    features: [
      "Tudo do Cuidar Plus incluso",
      "Remoção terrestre ampliada até 150km",
      "Traslado terrestre de até 250km",
      "Estrutura de homenagem mais completa",
    ],
    expandedFeatures: [
      "Atendimento pensado para proporcionar mais tranquilidade à família",
    ],
    featured: true,
    badge: "Mais Escolhido",
  },
  {
    slug: "vida-plus",
    name: "Vida Plus",
    sub: "O plano mais completo da AmaVidas.",
    price: 90,
    meta: "Protege você + 8 familiares",
    features: [
      "Tudo do Amar Plus incluso",
      "Urna em padrão superior",
      "Ornamentação especial com flores naturais premium",
      "Traslado terrestre de até 500km",
    ],
    expandedFeatures: [
      "Remoção terrestre ampliada até 200km",
      "Até 10 vasos florais inclusos",
      "Véu e itens especiais de homenagem",
    ],
    featured: false,
    badge: null,
  },
];

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" style={{ flexShrink: 0 }}>
    <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CHEVRON_DOWN = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CHEVRON_UP = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Plans() {
  const { openForm } = useModal();
  const [isMobile, setIsMobile] = useState(false);
  const [plans, setPlans] = useState<DynamicPlan[]>(FALLBACK_PLANS);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 980);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("/api/planos")
      .then((r) => r.json())
      .then((data) => {
        if (data.planos?.length) {
          const mapped = data.planos.map((p: any) => {
            // Dividir benefícios para a funcionalidade de colapso/expansão de forma inteligente
            let mainFeatures: string[] = [];
            let extraFeatures: string[] = [];

            if (p.slug === "cuidar-plus") {
              mainFeatures = [
                "Higienização e preparação completa",
                "Urna padrão adulto e infantil",
                "Ornamentação com flores naturais",
                "Remoção e cortejo em Águas Lindas de Goiás",
                "Traslado terrestre de até 100km",
              ];
              extraFeatures = [
                "Véu, terço, velas e itens de homenagem",
                "Cerimônia organizada conforme o credo religioso",
                "Livro de presença e cartões de homenagem",
              ];
            } else if (p.slug === "amar-plus") {
              mainFeatures = [
                "Tudo do Cuidar Plus incluso",
                "Remoção terrestre ampliada até 150km",
                "Traslado terrestre de até 250km",
                "Estrutura de homenagem mais completa",
              ];
              extraFeatures = [
                "Atendimento pensado para proporcionar mais tranquilidade à família",
              ];
            } else if (p.slug === "vida-plus") {
              mainFeatures = [
                "Tudo do Amar Plus incluso",
                "Urna em padrão superior",
                "Ornamentação especial com flores naturais premium",
                "Traslado terrestre de até 500km",
              ];
              extraFeatures = [
                "Remoção terrestre ampliada até 200km",
                "Até 10 vasos florais inclusos",
                "Véu e itens especiais de homenagem",
              ];
            } else {
              // Caso haja algum plano customizado vindo da API
              const all = p.beneficios || [];
              mainFeatures = all.slice(0, 4);
              extraFeatures = all.slice(4);
            }

            return {
              slug: p.slug,
              name: p.nome,
              sub: p.tagline,
              price: p.preco,
              meta: `Protege você + ${p.slug === "cuidar-plus" ? 4 : p.slug === "amar-plus" ? 6 : 8} familiares`,
              features: mainFeatures,
              expandedFeatures: extraFeatures,
              featured: p.destaque,
              badge: p.badge,
            };
          });
          setPlans(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const toggleExpand = (slug: string) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  return (
    <section id="planos" style={{ padding: "100px 0", background: "linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)" }} className="max-[980px]:py-16 overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-5 min-[640px]:px-8">
        
        {/* Headline Emocional */}
        <motion.div 
          className="text-center mb-16 mx-auto" 
          style={{ maxWidth: "800px" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <p className="text-[13px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--royal)" }}>
            Acolhimento · Segurança · Dignidade
          </p>
          <h2 className="text-[36px] min-[768px]:text-[46px] tracking-tight font-medium leading-[1.15]" style={{ fontFamily: "var(--serif)", color: "#1E293B" }}>
            Cada família vive a despedida de uma forma.<br />
            <span style={{ color: "var(--royal)" }}>Escolha o cuidado que faz sentido para quem você ama.</span>
          </h2>
          <p className="mt-5 text-[18px] max-[768px]:text-[16px] leading-relaxed max-w-[620px] mx-auto" style={{ color: "#475569" }}>
            Proteção, acolhimento e tranquilidade para os momentos mais difíceis.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          className="grid max-[980px]:flex max-[980px]:flex-col max-[980px]:gap-8"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "28px", alignItems: "start" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {plans.map((plan) => {
            const isFeatured = plan.featured;
            const isVidaPlus = plan.slug === "vida-plus";
            const isExpanded = !!expandedPlans[plan.slug];

            // Definições de Estilos Customizados
            let cardBg = "#ffffff";
            let textColor = "#1E293B";
            let subColor = "#475569";
            let priceColor = "var(--royal)";
            let btnBg = "var(--royal)";
            let btnTextColor = "#ffffff";
            let cardBorder = "1px solid rgba(226, 232, 240, 0.8)";
            let shadowStyle = "0 10px 30px -10px rgba(148, 163, 184, 0.12), 0 1px 3px rgba(148, 163, 184, 0.05)";

            if (isFeatured) {
              // Amar Plus - Destaque (Azul AmaVidas Principal)
              cardBg = "linear-gradient(145deg, #1E2E9E 0%, #15227B 100%)";
              textColor = "#ffffff";
              subColor = "rgba(255, 255, 255, 0.75)";
              priceColor = "#ffffff";
              btnBg = "var(--magenta)";
              btnTextColor = "#ffffff";
              cardBorder = "none";
              shadowStyle = "0 20px 45px -15px rgba(30, 46, 158, 0.45)";
            } else if (isVidaPlus) {
              // Vida Plus - Premium/Luxo (Clean, Branco com borda sutil azul royal e tons rosados micro nos detalhes)
              cardBg = "#ffffff";
              cardBorder = "1px solid rgba(147, 197, 253, 0.4)";
              shadowStyle = "0 20px 40px -20px rgba(37, 99, 235, 0.15), inset 0 0 0 1px rgba(37, 99, 235, 0.02)";
              priceColor = "#0F172A";
            }

            return (
              <div key={plan.slug} className="relative group flex flex-col h-full">

                <motion.div
                  variants={fadeUp}
                  className={`relative rounded-[24px] flex flex-col h-full transition-all duration-300 ${isFeatured ? "z-10" : "z-0"}`}
                  style={{
                    background: cardBg,
                    color: textColor,
                    border: cardBorder,
                    boxShadow: shadowStyle,
                    padding: isMobile ? "28px 24px" : isFeatured ? "36px 30px" : "32px 28px",
                    flex: 1
                  }}
                  whileHover={
                    isMobile
                      ? { y: -2 }
                      : isFeatured
                      ? { y: -8, boxShadow: "0 28px 50px -12px rgba(30, 46, 158, 0.55), 0 0 20px rgba(0, 198, 255, 0.3)" }
                      : isVidaPlus
                      ? { y: -6, borderColor: "rgba(147, 197, 253, 0.8)", boxShadow: "0 24px 45px -15px rgba(37, 99, 235, 0.2)" }
                      : { y: -5, borderColor: "rgba(30, 46, 158, 0.2)", boxShadow: "0 20px 35px -12px rgba(148, 163, 184, 0.2)" }
                  }
                >
                {/* Badge Destaque "Mais Escolhido" com leve tom rosado (magenta) */}
                {plan.badge && (
                  <div
                    className="absolute flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-[0.08em] uppercase whitespace-nowrap"
                    style={{
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--magenta)",
                      color: "#fff",
                      boxShadow: "0 8px 20px rgba(196, 51, 106, 0.25)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                      <path d="M12 21s-7.5-4.6-7.5-10.2C4.5 7.6 6.9 5 10 5c1.5 0 2.8.7 3.7 1.7C14.6 5.7 15.9 5 17.4 5c3.1 0 5.6 2.6 5.6 5.8C23 16.4 12 21 12 21z" />
                    </svg>
                    {plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-4">
                  <h3
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "24px",
                      fontWeight: 500,
                      color: isFeatured ? "#ffffff" : isVidaPlus ? "var(--royal)" : "#1E293B",
                      marginBottom: "6px"
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-[14px] leading-relaxed min-h-[40px]" style={{ color: subColor }}>
                    {plan.sub}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[16px] font-medium" style={{ color: subColor }}>R$</span>
                  <span
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "44px",
                      fontWeight: 500,
                      lineHeight: 1,
                      letterSpacing: "-0.01em",
                      color: priceColor,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[14px]" style={{ color: subColor }}>/mês</span>
                </div>

                {/* Meta / Beneficiários */}
                <p
                  className="text-[13px] font-medium mb-5 pb-4"
                  style={{
                    color: isFeatured ? "rgba(255,255,255,0.85)" : "#64748B",
                    borderBottom: isFeatured ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(226, 232, 240, 0.8)",
                  }}
                >
                  {plan.meta}
                </p>

                {/* Features (Sempre visíveis) */}
                <ul className="flex flex-col gap-3 mt-4 mb-4 p-0 m-0" style={{ listStyle: "none" }}>
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[14.5px] leading-snug">
                      <span className="mt-0.5" style={{ color: isFeatured ? "#5CE1E6" : "var(--royal)" }}>
                        {CHECK_ICON}
                      </span>
                      <span style={{ color: isFeatured ? "rgba(255,255,255,0.95)" : "#334155" }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* AnimatePresence para expansão suave */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <ul className="flex flex-col gap-3 pt-1 pb-4 p-0 m-0" style={{ listStyle: "none", borderTop: isFeatured ? "1px dashed rgba(255,255,255,0.1)" : "1px dashed rgba(226, 232, 240, 0.8)", marginTop: "12px" }}>
                        {plan.expandedFeatures.map((ef, idx) => (
                          <li key={`exp-${idx}`} className="flex items-start gap-2.5 text-[14.5px] leading-snug pt-3">
                            <span className="mt-0.5" style={{ color: isFeatured ? "#5CE1E6" : "var(--royal)" }}>
                              {CHECK_ICON}
                            </span>
                            <span style={{ color: isFeatured ? "rgba(255,255,255,0.95)" : "#334155" }}>{ef}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botão de Expansão */}
                {plan.expandedFeatures.length > 0 && (
                  <button
                    onClick={() => toggleExpand(plan.slug)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 mb-5 text-[13px] font-semibold transition-colors duration-200"
                    style={{
                      color: isFeatured ? "#5CE1E6" : "var(--royal)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    {isExpanded ? (
                      <>Ocultar detalhes {CHEVRON_UP}</>
                    ) : (
                      <>Ver todos os detalhes {CHEVRON_DOWN}</>
                    )}
                  </button>
                )}

                {/* CTA */}
                <motion.button
                  onClick={() => openForm(plan.name)}
                  className="w-full h-[48px] rounded-xl font-semibold text-[15px] cursor-pointer mt-auto transition-colors duration-200"
                  style={{
                    background: btnBg,
                    color: btnTextColor,
                    border: "none"
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Quero o {plan.name}
                </motion.button>

                </motion.div>
              </div>
            );
          })}
        </motion.div>
        
        {/* Rodapé / Chamada final com tom acolhedor */}
        <motion.p 
          className="text-center mt-12 text-[14px]"
          style={{ color: "#64748B" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          * Sem taxas adicionais ou taxas de adesão ocultas. Carência padrão de 90 dias conforme contrato.
        </motion.p>

      </div>
    </section>
  );
}
