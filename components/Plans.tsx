"use client";

import { useState, useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface DynamicPlan {
  slug: string;
  name: string;
  sub: string;
  price: number;
  meta: string;
  features: string[];
  ausentes: string[];
  featured: boolean;
  badge: string | null;
}

const FALLBACK_PLANS: DynamicPlan[] = [
  {
    slug: "cuidar-plus",
    name: "Cuidar Plus",
    sub: "O essencial — sua família não corre atrás de nada.",
    price: 35,
    meta: "Protege você e mais 4 da família",
    features: [
      "Remoção em qualquer cidade do Brasil",
      "Velório completo, do início ao fim",
      "Atendimento humano 24h, todos os dias",
      "Toda a documentação por nossa conta",
      "Clube de descontos e benefícios",
    ],
    ausentes: ["Translado nacional", "Cônjuge e filhos", "Suporte psicológico"],
    featured: false,
    badge: null,
  },
  {
    slug: "amar-plus",
    name: "Amar Plus",
    sub: "Escolhido por 7 em cada 10 famílias.",
    price: 43,
    meta: "Protege você e mais 6 da família",
    features: [
      "Tudo do Cuidar Plus",
      "Velório em sala diferenciada",
      "Ornamentação especial (flores e decoração)",
      "Apoio psicológico com profissionais parceiros",
    ],
    ausentes: ["Translado internacional", "Família ampliada"],
    featured: true,
    badge: "Mais escolhido",
  },
  {
    slug: "vida-plus",
    name: "Vida Plus",
    sub: "Para não deixar nada para trás.",
    price: 90,
    meta: "Protege você e mais 8 da família",
    features: [
      "Tudo do Amar Plus",
      "Flores e arranjos de luxo",
      "Urna em padrão superior",
    ],
    ausentes: [],
    featured: false,
    badge: null,
  },
];

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="20" height="20" style={{ flexShrink: 0, marginTop: 2 }}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export default function Plans() {
  const { openForm } = useModal();
  const [isMobile, setIsMobile] = useState(false);
  const [plans, setPlans] = useState<DynamicPlan[]>(FALLBACK_PLANS);

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
            let meta = `Protege você e mais ${p.slug === "cuidar-plus" ? 4 : p.slug === "amar-plus" ? 6 : 8} da família`;
            if (p.cobertura > 0) {
              meta = `${meta} · Cobertura de R$ ${p.cobertura.toLocaleString("pt-BR")}`;
            }

            return {
              slug: p.slug,
              name: p.nome,
              sub: p.tagline,
              price: p.preco,
              meta,
              features: p.beneficios,
              ausentes: p.ausentes,
              featured: p.destaque,
              badge: p.badge,
            };
          });
          setPlans(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="planos" style={{ padding: "96px 0", background: "var(--bg-alt)" }} className="max-[980px]:py-14 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6">

        {/* Section head — centered */}
        <motion.div 
          className="text-center mb-14 mx-auto max-[980px]:mb-10" 
          style={{ maxWidth: "720px" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <p className="text-[14px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "var(--royal)" }}>
            Três planos · Sem letras miúdas
          </p>
          <h2 className="mt-3">O cuidado certo para cada família</h2>
          <p className="mt-4 text-[19px] max-[980px]:text-[17px]" style={{ color: "var(--ink-soft)" }}>
            90 dias de carência. Atendimento humano 24h em todo o Brasil. Sem multa para cancelar.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid max-[980px]:flex max-[980px]:flex-col max-[980px]:gap-6"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", alignItems: "stretch" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {plans.map((plan) => {
            const isFeatured = plan.featured;

            return (
              <motion.div
                key={plan.slug}
                variants={fadeUp}
                className={`relative rounded-[20px] flex flex-col cursor-default ${isFeatured ? "plan-featured" : ""}`}
                style={
                  isFeatured
                    ? {
                        background: "linear-gradient(180deg, #232E89 0%, var(--royal) 100%)",
                        color: "#fff",
                        border: "none",
                        boxShadow: "0 24px 60px rgba(43,61,168,.32)",
                        padding: "44px 32px 36px 32px",
                      }
                    : {
                        background: "#fff",
                        border: "1px solid var(--line)",
                        boxShadow: "var(--shadow-sm)",
                        padding: "36px 32px",
                      }
                }
                animate={{ y: 0, scale: 1 }}
                whileHover={
                  isMobile
                    ? { y: -4, scale: 1.01 }
                    : isFeatured
                    ? {
                        y: -12,
                        scale: 1.025,
                        boxShadow: "0 32px 70px rgba(43,61,168,.45)",
                      }
                    : {
                        y: -6,
                        scale: 1.01,
                        borderColor: "var(--royal-soft)",
                        boxShadow: "var(--shadow-md)",
                      }
                }
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Badge */}
                {plan.badge && (
                  <motion.div
                    className="absolute flex items-center gap-1.5 px-4 rounded-full text-[13px] font-bold tracking-[0.05em] uppercase whitespace-nowrap"
                    style={{
                      top: "-14px", left: 0, right: 0, margin: "0 auto", width: "max-content",
                      background: "var(--magenta)", color: "#fff",
                      padding: "6px 16px",
                      boxShadow: "0 6px 14px rgba(196,51,106,.32)",
                    }}
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12" style={{ flexShrink: 0 }}>
                      <path d="M12 21s-7.5-4.6-7.5-10.2C4.5 7.6 6.9 5 10 5c1.5 0 2.8.7 3.7 1.7C14.6 5.7 15.9 5 17.4 5c3.1 0 5.6 2.6 5.6 5.8C23 16.4 12 21 12 21z" />
                    </svg>
                    {plan.badge}
                  </motion.div>
                )}

                {/* Plan name */}
                <div
                  className="mb-1"
                  style={{ fontFamily: "var(--serif)", fontSize: "28px", fontWeight: 500, lineHeight: 1.2 }}
                >
                  {plan.name}
                </div>

                {/* Sub */}
                <p
                  className="text-[15px] mb-7"
                  style={{ color: isFeatured ? "rgba(255,255,255,.7)" : "var(--ink-soft)" }}
                >
                  {plan.sub}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 mb-1.5">
                  <span className="text-[18px]" style={{ color: isFeatured ? "rgba(255,255,255,.75)" : "var(--ink-soft)" }}>R$</span>
                  <span
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "56px",
                      fontWeight: 500,
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                      color: isFeatured ? "#fff" : "var(--royal)",
                    }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[17px]" style={{ color: isFeatured ? "rgba(255,255,255,.75)" : "var(--ink-soft)" }}>/mês</span>
                </div>

                {/* Meta */}
                <p
                  className="text-[14px] mb-7 pb-7"
                  style={{
                    color: isFeatured ? "rgba(255,255,255,.7)" : "var(--ink-mute)",
                    borderBottom: isFeatured ? "1px solid rgba(255,255,255,.18)" : "1px solid var(--line)",
                  }}
                >
                  {plan.meta}
                </p>

                {/* Features */}
                <ul className="flex flex-col gap-3.5 flex-1 mb-8 p-0 m-0" style={{ listStyle: "none" }}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[16px] leading-relaxed max-[980px]:text-[15px]">
                      <span style={{ color: isFeatured ? "#6BE5F0" : "var(--teal)" }}>
                        {CHECK_ICON}
                      </span>
                      <span style={{ color: isFeatured ? "rgba(255,255,255,.88)" : "var(--ink)" }}>{f}</span>
                    </li>
                  ))}
                  {plan.ausentes && plan.ausentes.map((a) => (
                    <li key={a} className="flex items-start gap-3 text-[16px] leading-relaxed max-[980px]:text-[15px] opacity-40">
                      <span style={{ color: isFeatured ? "rgba(255,255,255,0.4)" : "var(--ink-mute)", marginTop: 4 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="16" height="16">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </span>
                      <span style={{ textDecoration: "line-through", color: isFeatured ? "rgba(255,255,255,.6)" : "var(--ink-soft)" }}>{a}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.button
                  onClick={() => openForm(plan.name)}
                  className="w-full h-[56px] rounded-xl font-semibold text-[17px] relative overflow-hidden"
                  style={
                    isFeatured
                      ? { background: "var(--magenta)", color: "#fff" }
                      : { background: "var(--royal)", color: "#fff" }
                  }
                  whileHover={{ scale: 1.025, backgroundColor: isFeatured ? "#AE2A5C" : "#25358F" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  Quero o {plan.name}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
