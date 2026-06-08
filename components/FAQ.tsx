"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/animations";

const FAQS = [
  {
    q: "Quanto tempo de carência tem o plano?",
    a: "Todos os planos AmaVidas têm carência de apenas 90 dias para óbitos por causas naturais. Em caso de acidente, a cobertura é imediata, a partir do primeiro dia de contratação.",
  },
  {
    q: "Quem pode ser incluído como dependente?",
    a: "Cônjuge, filhos, pais, sogros, irmãos, netos e avós. Não exigimos vínculo de sangue obrigatório — quem você ama, pode estar protegido.",
  },
  {
    q: "O plano atende em qualquer cidade do Brasil?",
    a: "Atendemos remotamente e damos todo o apoio necessário, prestando o serviço de acordo com o plano contratado, com total transparência.",
  },
  {
    q: "Existe limite de idade para contratar?",
    a: "Não existe idade máxima. Aceitamos titulares e dependentes de qualquer idade, sem exames médicos prévios.",
  },
  {
    q: "Como faço para cancelar o plano?",
    a: "O plano pode ser cancelado a qualquer momento pelo titular do plano, atentando-se aos prazos estipulados em contrato.",
  },
  {
    q: "O plano cobre cremação?",
    a: "A AmaVidas organiza e dá suporte em todo o processo da cerimônia de despedida. As opções disponíveis para cada família dependem do plano contratado e da cidade. Nossos consultores podem orientar você com clareza sobre o que está incluso — é só entrar em contato pelo WhatsApp.",
  },
  {
    q: "Como funciona o clube de descontos?",
    a: "Disponibilizamos uma rede de parceiros conveniados que oferecem descontos exclusivos para nossos clientes em diversos estabelecimentos comerciais e de saúde. O acesso é liberado logo após a contratação.",
  },
  {
    q: "Posso pagar anualmente com desconto?",
    a: "Sim. No pagamento anual à vista, oferecemos 10% de desconto em todos os planos. Também aceitamos PIX, cartão e boleto.",
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <section id="faq" className="py-24 bg-[#F8FAFC] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Title */}
        <motion.div 
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <p className="text-sm font-bold tracking-[0.15em] uppercase mb-3" style={{ color: "var(--teal)" }}>
            Tire suas dúvidas
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Perguntas Frequentes</h2>
        </motion.div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Left Column: Questions List */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            {FAQS.map((faq, idx) => {
              const isActive = openIdx === idx;
              return (
                <div key={idx} className="flex flex-col">
                  <button
                    onClick={() => setOpenIdx(idx)}
                    className={`text-left w-full px-6 py-5 rounded-2xl transition-all duration-300 font-bold text-lg leading-snug border relative z-10 flex justify-between items-center gap-4 ${
                      isActive 
                        ? "bg-white text-slate-900 border-slate-200 shadow-md lg:transform lg:scale-[1.02]" 
                        : "bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    <span>{faq.q}</span>
                    {/* Mobile icon */}
                    <span className="lg:hidden text-xl text-slate-400 font-normal">{isActive ? '−' : '+'}</span>
                  </button>

                  {/* Mobile Accordion Content */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden overflow-hidden"
                      >
                        <div className="p-6 text-slate-600 font-medium leading-relaxed bg-white/60 border border-slate-200 rounded-b-2xl border-t-0 -mt-4 pt-8">
                          {faq.a}
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <a href="#contato" className="text-sm font-bold hover:underline" style={{ color: "var(--royal)" }}>
                              Falar com consultor →
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Answer (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-7 lg:pl-10 lg:border-l border-slate-200 flex-col justify-center min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={openIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100"
              >
                <div className="w-16 h-16 text-white flex items-center justify-center rounded-2xl mb-8 shadow-md" style={{ backgroundColor: "var(--royal)" }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-6 leading-tight">
                  {FAQS[openIdx].q}
                </h3>
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                  {FAQS[openIdx].a}
                </p>
                
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <p className="text-slate-500 font-medium">
                    Ainda tem dúvidas? {" "}
                    <a href="#contato" className="font-bold hover:underline" style={{ color: "var(--royal)" }}>
                      Fale com um consultor no WhatsApp →
                    </a>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
