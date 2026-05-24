"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

const CARDS = [
  {
    title: "Qualidade comprovada",
    desc: "+5.000 famílias atendidas, nota 4,9 no Google e zero reclamações no ReclameAqui.",
    iconBg: "var(--royal-soft)", iconColor: "var(--royal)",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5" /><path d="M5 22a7 7 0 0 1 14 0" /></svg>,
  },
  {
    title: "Cuidado humano",
    desc: "Pessoas reais, atendimento empático e suporte que vai muito além do contrato.",
    iconBg: "var(--magenta-soft)", iconColor: "var(--magenta)",
    icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-7.5-10.2C4.5 7.6 6.9 5 10 5c1.5 0 2.8.7 3.7 1.7C14.6 5.7 15.9 5 17.4 5c3.1 0 5.6 2.6 5.6 5.8C23 16.4 12 21 12 21z" /></svg>,
  },
  {
    title: "24h por dia, 7 dias",
    desc: "Estamos sempre disponíveis — madrugada, feriado, fim de semana. Nunca sozinhos.",
    iconBg: "var(--teal-soft)", iconColor: "var(--teal)",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  },
  {
    title: "Cobertura nacional",
    desc: "Mais de 1.700 cidades em todo o Brasil — onde sua família estiver, estaremos.",
    iconBg: "var(--royal-soft)", iconColor: "var(--royal)",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>,
  },
  {
    title: "Cuidamos de tudo",
    desc: "Da papelada à cerimônia. Você não precisa correr atrás de nada — nós resolvemos.",
    iconBg: "var(--magenta-soft)", iconColor: "var(--magenta)",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3 7-7" /><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" /></svg>,
  },
  {
    title: "Preço acessível",
    desc: "A partir de R$ 35/mês. O cuidado que sua família merece, sem comprometer o orçamento.",
    iconBg: "var(--teal-soft)", iconColor: "var(--teal)",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>,
  },
];

export default function Diferenciais() {
  return (
    <section id="diferenciais" style={{ padding: "96px 0", background: "var(--bg-alt)" }} className="max-[980px]:py-14">
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
          <p className="text-[14px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "var(--magenta)" }}>
            Por que escolher a AmaVidas
          </p>
          <h2>Seis razões para confiar em quem cuida</h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid max-[980px]:flex max-[980px]:flex-col max-[980px]:gap-3.5"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {CARDS.map((card, idx) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              className="bg-white max-md:bg-white/70 max-md:backdrop-blur-xl max-md:shadow-[0_-10px_40px_rgba(255,255,255,0.8)] border border-[var(--line)] rounded-[20px] p-8 max-[980px]:p-6 cursor-default transition-colors duration-200 md:static max-md:sticky"
              style={{ top: `calc(100px + ${idx * 16}px)`, zIndex: 10 + idx }}
              whileHover={{
                borderColor: "var(--royal)",
                y: -6,
                boxShadow: "var(--shadow-md)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div
                className="w-14 h-14 rounded-[14px] grid place-items-center mb-5"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                <span className="w-7 h-7 block">{card.icon}</span>
              </div>
              <h3 className="mb-2 text-[20px] font-semibold max-[980px]:text-[18px]">{card.title}</h3>
              <p className="text-[16px] leading-relaxed max-[980px]:text-[15px]" style={{ color: "var(--ink-soft)" }}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

