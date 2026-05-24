"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

const STEPS = [
  {
    title: "Contratar AmaVidas",
    description: "Simule, escolha o plano ideal para sua família e contrate 100% online.",
    icon: "📱",
  },
  {
    title: "Manter contrato ativo",
    description: "Sua proteção está garantida enquanto o seu plano estiver em dia.",
    icon: "✅",
  },
  {
    title: "Comunicar o óbito",
    description: "Quando ocorrido, ligue para nossa central 24h e assumimos tudo.",
    icon: "📞",
  },
  {
    title: "Se despedir de quem Ama",
    description: "Pois a AmaVidas está cuidando de todo o resto com muito respeito.",
    icon: "🕊️",
  },
];

export default function ComoFunciona() {
  return (
    <section id="como" className="py-24 bg-white relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          className="text-center mx-auto mb-20 max-w-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <p className="text-sm font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "var(--teal)" }}>
            Como Funciona
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Do começo ao fim, ao seu lado</h2>
          <p className="mt-4 text-lg text-slate-500 leading-relaxed">
            Nossa assistência funeral foi desenhada para ser simples e resolver tudo por você no momento em que você mais precisa.
          </p>
        </motion.div>

        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Horizontal dashed line for desktop */}
          <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-px border-t-2 border-dashed border-slate-200 z-0"></div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {STEPS.map((step, idx) => (
              <motion.div 
                key={step.title} 
                className="flex flex-col items-center text-center relative group md:static max-md:sticky"
                style={{ top: `calc(100px + ${idx * 16}px)`, zIndex: 10 + idx }}
                variants={fadeUp}
              >
                <div className="w-full flex flex-col items-center max-md:bg-white/70 max-md:backdrop-blur-xl max-md:p-5 max-md:rounded-[32px] max-md:border max-md:border-white/60 max-md:shadow-[0_-10px_40px_rgba(255,255,255,0.8)]">
                  {/* Node */}
                  <div className="w-20 h-20 bg-white border border-slate-100 rounded-2xl shadow-sm mb-6 flex items-center justify-center text-3xl z-10 relative group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                    <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-slate-900 text-white text-[13px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                      {idx + 1}
                    </div>
                    {step.icon}
                  </div>

                  {/* Content Card */}
                  <div className="bg-slate-50/90 p-6 rounded-3xl border border-slate-100 shadow-sm w-full h-full flex flex-col items-center group-hover:border-slate-200 transition-colors">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight px-2">{step.title}</h3>
                    <p className="text-slate-500 text-[15px] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
