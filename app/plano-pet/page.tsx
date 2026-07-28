"use client";

import Image from "next/image";
import { useState } from "react";
import { ModalProvider, useModal } from "@/contexts/ModalContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFlutuante from "@/components/WhatsAppFlutuante";
import ModalFormulario from "@/components/ModalFormulario";
import ModalSimulador from "@/components/ModalSimulador";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useConfig } from "@/contexts/ConfigContext";
import { trackWhatsAppClick } from "@/lib/analytics";

function WalkingPaws() {
  const paws = [
    { top: "12%", left: "3%", delay: 0, rotate: -15 },
    { top: "20%", left: "6%", delay: 0.6, rotate: 10 },
    { top: "28%", left: "4%", delay: 1.2, rotate: -10 },
    { top: "36%", left: "7%", delay: 1.8, rotate: 15 },
    { top: "44%", left: "5%", delay: 2.4, rotate: -5 },
    { top: "52%", left: "8%", delay: 3.0, rotate: 12 },

    { top: "16%", right: "7%", delay: 0.3, rotate: 15 },
    { top: "24%", right: "4%", delay: 0.9, rotate: -10 },
    { top: "32%", right: "8%", delay: 1.5, rotate: 20 },
    { top: "40%", right: "5%", delay: 2.1, rotate: -15 },
    { top: "48%", right: "9%", delay: 2.7, rotate: 10 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {paws.map((paw, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 0.22, 0.22, 0],
            scale: [0.75, 1, 1, 0.85],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: paw.delay,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: paw.top,
            left: paw.left,
            right: paw.right,
            transform: `rotate(${paw.rotate}deg)`,
          }}
          className="text-3xl text-purple-900/30 select-none"
        >
          🐾
        </motion.div>
      ))}
    </div>
  );
}

function PetPageContent() {
  const { openForm } = useModal();
  const { configs } = useConfig();
  const whatsapp = configs.whatsapp || "5561985825621";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleWhatsApp = (origem = "plano_pet_hero") => {
    const msg = encodeURIComponent("Olá! Gostaria de contratar ou tirar dúvidas sobre o Plano Pet de R$ 25/mês da AmaVidas.");
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
    trackWhatsAppClick({
      origem,
      googleAdsId: configs.google_ads_id,
      googleAdsWaLabel: configs.google_ads_wa_label,
    });
  };

  const faqs = [
    {
      pergunta: "Qual a região de cobertura do Plano Pet?",
      resposta: "O Plano Pet é 100% direcionado para tutores em Águas Lindas de Goiás, Brasília (DF) e cidades do Entorno do Distrito Federal, garantindo remoção e atendimento rápido 24 horas."
    },
    {
      pergunta: "Quais animais podem ser incluídos no Plano Pet?",
      resposta: "O plano cobre 1 animal de estimação (cães ou gatos), sem restrição de raça, peso ou porte do animal."
    },
    {
      pergunta: "O que está incluso no atendimento funerário Pet?",
      resposta: "Está incluso o deslocamento/remorção até o memorial, sala de velório exclusiva para despedida da família, embalagem protetora ecológica, lápide memorial personalizada com nome e datas, e sepultamento em jazigo temporário/não perpétuo."
    },
    {
      pergunta: "Como funciona a questão do jazigo não perpétuo?",
      resposta: "O jazigo do Plano Pet é de uso temporário. O pet repousa com toda a dignidade durante o período regulamentado, garantindo o tempo necessário de homenagem da família."
    },
    {
      pergunta: "Como acionar a assistência em caso de emergência?",
      resposta: "Basta entrar em contato com nossa central de atendimento 24 horas por telefone ou WhatsApp. Nossa equipe cuida de toda a logística e remoção em Águas Lindas e DF."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 -mt-[66px] max-[980px]:-mt-[56px] relative">
        
        {/* ── HERO SECTION ── */}
        <section className="pt-[110px] min-[768px]:pt-[130px] pb-16 min-[768px]:pb-24 bg-gradient-to-b from-[#E2F7FA] via-[#EFF6FF] to-[#F8FAFC] relative overflow-hidden">
          
          <WalkingPaws />

          <div className="max-w-[1280px] mx-auto px-5 min-[640px]:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
              
              {/* Left Column Text */}
              <motion.div 
                className="lg:col-span-7 text-left"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/90 border border-purple-200 text-purple-900 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
                  <span>📍</span> Exclusivo Águas Lindas & DF · R$ 25/mês
                </div>

                <h1 
                  className="text-4xl min-[768px]:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.08] mb-10"
                  style={{ fontFamily: "var(--serif)" }}
                >
                  O amor por quem te dá tanto afeto <span className="text-purple-700 underline decoration-amber-400 decoration-wavy decoration-2">não termina.</span>
                </h1>

                <p className="text-slate-600 text-base min-[768px]:text-xl leading-relaxed mb-12 max-w-2xl font-normal">
                  Seu companheiro de quatro patas merece um adeus com toda a dignidade, respeito e carinho. Atendimento 24h com cobertura 100% direcionada para <strong>Águas Lindas de Goiás, Brasília e Entorno do DF</strong>.
                </p>

                {/* Animated Deliverables Checklist */}
                <div className="space-y-4.5 mb-12 min-[768px]:mb-14">
                  {[
                    { icon: "✓", text: <>Cobre 1 cão ou gato (<strong>sem limite de peso ou porte</strong>)</> },
                    { icon: "📍", text: <>Atendimento rápido 24h em <strong>Águas Lindas de Goiás e DF</strong></> },
                    { icon: "✓", text: <>Deslocamento até o memorial + Sala de velório exclusiva</> },
                    { icon: "✓", text: <>Embalagem ecológica + Lápide memorial personalizada</> },
                    { icon: "✓", text: <>Jazigo não perpétuo*</> },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1, type: "spring", stiffness: 350, damping: 22 }}
                      className="flex items-center gap-3.5"
                    >
                      <motion.div 
                        initial={{ scale: 0.4, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1, type: "spring", stiffness: 400, damping: 15 }}
                        className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-purple-200/60"
                      >
                        {item.icon}
                      </motion.div>
                      <span className="text-slate-700 text-sm min-[768px]:text-base font-medium leading-normal">{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 pt-3">
                  <button
                    type="button"
                    onClick={() => openForm("Plano Pet")}
                    className="relative overflow-hidden bg-purple-700 hover:bg-purple-800 text-white font-bold px-8 py-4.5 rounded-2xl text-base transition-all shadow-xl hover:shadow-purple-300/40 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                    <span>Quero Contratar o Plano Pet</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWhatsApp("plano_pet_hero")}
                    className="relative overflow-hidden bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold px-7 py-4.5 rounded-2xl text-base transition-all shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                    <svg className="w-5 h-5 fill-currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    <span>Conversar no WhatsApp</span>
                  </button>
                </div>

              </motion.div>

              {/* Right Column Image */}
              <motion.div 
                className="lg:col-span-5 relative flex justify-center"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <div className="relative w-full aspect-square max-w-[460px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <Image
                    src="/hero_pet_plan.png"
                    alt="Plano Pet AmaVidas Proteção Animal"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md border border-white p-5 rounded-2xl shadow-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-700 font-extrabold uppercase tracking-widest">Valor Mensal</p>
                      <p className="text-3xl font-black text-slate-900 leading-none mt-1">R$ 25<span className="text-sm font-semibold text-slate-500">/mês</span></p>
                    </div>
                    <button
                      onClick={() => openForm("Plano Pet")}
                      className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md"
                    >
                      Assinar Agora
                    </button>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── O QUE ESTÁ INCLUSO ── */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-[1280px] mx-auto px-5 min-[640px]:px-8 text-center">
            
            <motion.div 
              className="max-w-3xl mx-auto mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-purple-700 mb-3">Tudo Pensado para Sua Tranquilidade</p>
              <h2 className="text-3xl min-[768px]:text-4xl font-medium tracking-tight text-slate-900" style={{ fontFamily: "var(--serif)" }}>
                O que o Plano Pet contempla em cada detalhe
              </h2>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {[
                { icone: "🚗", titulo: "Remoção & Translado", desc: "Deslocamento e transporte respeitoso do pet até o memorial credenciado." },
                { icone: "🌹", titulo: "Sala de Velório Exclusiva", desc: "Espaço reservado e sereno para reunir a família e realizar a despedida." },
                { icone: "🌿", titulo: "Embalagem Ecológica", desc: "Proteção biológica sustentável que respeita a natureza e o meio ambiente." },
                { icone: "🪨", titulo: "Lápide Personalizada", desc: "Gravação especial com o nome do pet, data de nascimento e falecimento." },
                { icone: "⚰️", titulo: "Jazigo Reservado*", desc: "Sepultamento em jazigo de uso temporário/não perpétuo com todo o cuidado." },
                { icone: "📞", titulo: "Atendimento 24 Horas", desc: "Central de suporte comercial e emergencial 24h por dia, 7 dias por semana." },
              ].map((card, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeUp}
                  className="bg-slate-50 border border-slate-200/80 p-8 rounded-3xl text-left hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl mb-5 shadow-sm">
                    {card.icone}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{card.titulo}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-12 text-center text-xs text-slate-500 max-w-xl mx-auto">
              <p>* O jazigo do Plano Pet é de uso temporário/não perpétuo (consulte o regulamento do contrato para maiores esclarecimentos).</p>
            </div>

          </div>
        </section>

        {/* ── DESTAQUE EMOCIONAL & FOTO ── */}
        <section className="py-24 lg:py-28 bg-gradient-to-br from-purple-900 to-slate-900 text-white relative overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6 min-[640px]:px-10 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              <div className="lg:col-span-6 relative">
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-400/30">
                  <Image
                    src="/pet_memorial_care.png"
                    alt="Carinho e respeito pet"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 text-left flex flex-col items-start justify-center">
                <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-purple-300 mb-6">
                  Prevenção É Amor
                </p>
                <h2 
                  className="text-3xl min-[768px]:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.28] mb-8" 
                  style={{ fontFamily: "var(--serif)" }}
                >
                  Evite despesas inesperadas de última hora.
                </h2>
                <p className="text-purple-100/90 text-base min-[768px]:text-xl leading-[1.85] mb-12 max-w-xl font-normal">
                  Serviços particulares de funeral e sepultamento pet podem custar mais de R$ 1.500 de surpresa. Com o <strong>Plano Pet AmaVidas</strong>, você se previne pagando apenas <strong>R$ 25/mês</strong> e garante assistência completa sem sustos financeiros.
                </p>
                <button
                  type="button"
                  onClick={() => openForm("Plano Pet")}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-9 py-4.5 rounded-2xl text-base transition-all shadow-xl hover:shadow-amber-400/20 hover:-translate-y-0.5 cursor-pointer mt-2"
                >
                  Garantir Proteção Pet Agora
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* ── FAQ PET ── */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-[800px] mx-auto px-5">
            <div className="text-center mb-12">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-purple-700 mb-2">Transparência</p>
              <h2 className="text-3xl font-medium text-slate-900" style={{ fontFamily: "var(--serif)" }}>
                Perguntas Frequentes sobre o Plano Pet
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left font-bold text-slate-900 text-base flex justify-between items-center gap-4 cursor-pointer"
                    >
                      <span>{faq.pergunta}</span>
                      <span className="text-purple-700 text-xl font-bold">{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                        {faq.resposta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <WhatsAppFlutuante variant="pet" />
      <ModalFormulario />
      <ModalSimulador />
    </div>
  );
}

export default function PetPage() {
  return (
    <ModalProvider>
      <PetPageContent />
    </ModalProvider>
  );
}
