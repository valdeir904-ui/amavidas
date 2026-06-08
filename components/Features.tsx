"use client";

import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations";

const STEPS = [
  { n: 1, color: "#2B3DA8", title: "Aviso do óbito", desc: "Você liga 24h e nós ativamos toda a operação in 15 minutos." },
  { n: 2, color: "#3D55B8", title: "Documentação", desc: "Damos suporte e orientação com a declaração de óbito, certidão e cartórios." },
  { n: 3, color: "#4F70C8", title: "Remoção", desc: "Equipe especializada faz a remoção com discrição e respeito." },
  { n: 4, color: "#2D8BBA", title: "Velório", desc: "Sala preparada, ornamentação, café e suporte por toda a cerimônia." },
  { n: 5, color: "#19A2C2", title: "Cerimônia", desc: "Cortejo e cerimônia de despedida conduzidos com respeito e dignidade." },
  { n: 6, color: "#00B4C8", title: "Pós-funeral", desc: "Apoio psicológico, regularização e acompanhamento da família." },
];

export default function Features() {
  return (
    <section id="como" style={{ padding: "96px 0", background: "var(--bg)" }} className="max-[980px]:py-14">
      <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6">

        {/* Section head */}
        <motion.div
          style={{ maxWidth: "720px", marginBottom: "56px" }}
          className="max-[980px]:mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <p className="text-[14px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "var(--teal)" }}>
            Do começo ao fim, ao seu lado
          </p>
          <h2>Como funciona o atendimento</h2>
          <p className="mt-4 text-[19px] max-[980px]:text-[17px]" style={{ color: "var(--ink-soft)" }}>
            Uma única ligação resolve tudo. A partir do aviso, a AmaVidas dá suporte em cada detalhe — você só precisa estar com a sua família.
          </p>
        </motion.div>

        {/* Timeline desktop / lista mobile */}
        <motion.div
          className="grid relative mt-6 max-[980px]:flex max-[980px]:flex-col max-[980px]:gap-5"
          style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Linha de fundo (desktop only) */}
          <motion.div
            className="absolute hidden min-[981px]:block"
            style={{
              top: "32px",
              left: "8.33%", right: "8.33%",
              height: "2px",
              background: "linear-gradient(to right, var(--royal) 0%, var(--teal) 100%)",
              zIndex: 0,
              transformOrigin: "left",
            }}
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
          />

          {STEPS.map((step) => (
            <motion.div
              key={step.n}
              variants={fadeUp}
              className="relative z-10 text-center px-3 max-[980px]:grid max-[980px]:text-left max-[980px]:px-0"
              style={{
                gridTemplateColumns: "56px 1fr",
                columnGap: "16px",
                rowGap: "4px",
              } as React.CSSProperties}
            >
              {/* Número */}
              <motion.div
                className="mx-auto mb-[18px] max-[980px]:mx-0 max-[980px]:mb-0 w-16 h-16 text-[24px] max-[980px]:w-12 max-[980px]:h-12 max-[980px]:text-[18px]"
                style={{
                  borderRadius: "50%",
                  background: "#fff",
                  border: `2px solid ${step.color}`,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--serif)",
                  fontWeight: 500,
                  color: step.color,
                  boxShadow: "0 6px 16px rgba(43,61,168,.12)",
                  gridRow: "span 2",
                }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {step.n}
              </motion.div>
              <h4 className="text-[17px] font-semibold mb-1.5 max-[980px]:self-center" style={{ color: "var(--ink)" }}>
                {step.title}
              </h4>
              <p className="text-[14px] leading-relaxed max-[980px]:text-[15px]" style={{ color: "var(--ink-soft)" }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Banner cobertura nacional */}
        <motion.div
          className="mt-16 flex items-center justify-between flex-wrap gap-6 rounded-[20px] text-white max-[980px]:flex-col max-[980px]:items-start max-[980px]:mt-10 max-[980px]:p-6"
          style={{
            padding: "28px 36px",
            background: "linear-gradient(110deg, var(--royal) 0%, #3854C9 70%, var(--teal) 130%)",
            boxShadow: "0 18px 50px rgba(43,61,168,.30)",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleIn}
        >
          <div className="flex items-center gap-5">
            <div
              className="w-14 h-14 rounded-[14px] grid place-items-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,.15)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13z" /><circle cx="12" cy="9" r="3" />
              </svg>
            </div>
            <div>
              <h4 className="text-white text-[20px] font-semibold mb-1">Cobertura nacional</h4>
              <p className="text-[15px] mt-1" style={{ color: "rgba(255,255,255,.85)" }}>
                Atuamos em todas as capitais e mais de 1.700 cidades do Brasil.
              </p>
            </div>
          </div>
          <div className="flex gap-8 max-[980px]:gap-5">
            <div className="text-right max-[980px]:text-left">
              <strong className="block text-[28px] font-medium" style={{ fontFamily: "var(--serif)", lineHeight: 1 }}>1.700+</strong>
              <span className="text-[13px]" style={{ color: "rgba(255,255,255,.75)" }}>cidades atendidas</span>
            </div>
            <div className="text-right max-[980px]:text-left">
              <strong className="block text-[28px] font-medium" style={{ fontFamily: "var(--serif)", lineHeight: 1 }}>15 min</strong>
              <span className="text-[13px]" style={{ color: "rgba(255,255,255,.75)" }}>tempo médio de resposta</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
