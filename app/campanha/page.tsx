"use client";

import { useState, useRef, useEffect } from "react";
import { ModalProvider, useModal } from "@/contexts/ModalContext";
import ModalSimulador from "@/components/ModalSimulador";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/contexts/ConfigContext";
import { ShieldCheck, Calculator, MessageCircle, Heart, Star, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

function mascaraTelefone(v: string): string {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length === 0) return "";
  if (n.length <= 2) return `(${n}`;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

function CampanhaContent() {
  const { openSimulador } = useModal();
  const { configs } = useConfig();
  const whatsappNumber = configs.whatsapp || "5561985825621";
  
  const [showWppForm, setShowWppForm] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loadingWpp, setLoadingWpp] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showWppForm) {
      const timer = setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showWppForm]);

  const handleInputFocus = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Vim pelo anúncio e gostaria de saber mais sobre os planos da AmaVidas."
  )}`;

  const handleWppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowWppForm(true);
  };

  const submitWpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || telefone.replace(/\D/g, "").length < 10) {
      alert("Por favor, preencha seu nome e um telefone válido.");
      return;
    }
    setLoadingWpp(true);
    try {
      await fetch("/api/simulacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          comoContatar: "whatsapp",
          planoRecomendado: "Veio da Landing Page",
          email: "",
          paraQuem: "",
          quantidadePessoas: "",
          prioridade: "",
          orcamento: "",
          cidade: "",
        }),
      });
    } catch (err) {}
    
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead");
    }

    window.open(whatsappUrl, "_blank");
    setLoadingWpp(false);
    setShowWppForm(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-alt)] flex flex-col font-sans relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--royal-soft)] rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--teal-soft)] rounded-full blur-[120px] opacity-60 pointer-events-none" />

      {/* Header Simplificado */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 py-6 px-6 flex items-center justify-between max-w-5xl mx-auto w-full"
      >
        <Link href="/" className="relative w-32 h-10 md:w-40 md:h-12">
          <Image src="/logo-amavidas-transparent.png" alt="AmaVidas" fill className="object-contain object-left" priority />
        </Link>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--ink-soft)] bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-sm border border-[var(--line)]">
          <ShieldCheck className="w-4 h-4 text-[var(--teal)]" />
          <span className="hidden md:inline">Site 100% Seguro</span>
          <span className="md:hidden">Seguro</span>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 md:py-16 relative z-10">
        <div className="max-w-5xl mx-auto w-full grid md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-16 items-center">
          
          {/* Coluna de Texto (Esquerda) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 bg-[var(--royal-soft)] text-[var(--royal-deep)] px-4 py-2 rounded-full w-fit font-semibold text-sm border border-[var(--royal)]/10">
              <Heart className="w-4 h-4 fill-[var(--magenta)] text-[var(--magenta)]" />
              <span>Quem Ama, Cuida.</span>
            </div>
            
            <h1 className="text-[32px] sm:text-[36px] md:text-[46px] lg:text-[56px] font-bold text-[var(--ink)] text-serif leading-[1.1] md:leading-[1.15] tracking-tight">
              Tranquilidade não tem preço, <span className="brand-gradient-text">mas cabe no seu bolso.</span>
            </h1>
            
            <p className="text-[17px] md:text-xl text-[var(--ink-soft)] leading-relaxed">
              Proteja sua família hoje com planos a partir de <strong>R$ 43/mês</strong>. Sem burocracia, com cobertura completa e atendimento humanizado 24h.
            </p>

            <ul className="flex flex-col gap-3 mt-2">
              {["Assistência Funeral Completa 24h", "Cobertura para toda a família", "Sem limite de idade", "Urna, coroa de flores e translado"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[var(--ink)] font-medium text-[16px] md:text-[18px]">
                  <CheckCircle2 className="w-6 h-6 text-[var(--teal)] flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--line)]">
              <div className="flex -space-x-3">
                {['M', 'J', 'C', 'A'].map((letter, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: ['#2B3DA8', '#00B4C8', '#C4336A', '#F59E0B'][i] }}>
                    {letter}
                  </div>
                ))}
              </div>
              <div className="flex flex-col ml-2">
                <div className="flex items-center gap-1 mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />)}
                </div>
                <span className="text-[13px] font-semibold text-[var(--ink-mute)] leading-none">Mais de 1.000 famílias protegidas</span>
              </div>
            </div>
          </motion.div>

          {/* Coluna de Ação (Direita) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-5 sm:p-6 md:p-10 rounded-[24px] sm:rounded-[28px] shadow-xl border border-[var(--line)] relative overflow-hidden group"
          >
            {/* Decoração sutil no card */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--royal-soft)] rounded-bl-full -z-10 transition-transform duration-700 group-hover:scale-110 opacity-50" />
            
            <h3 className="text-[24px] sm:text-[26px] md:text-[28px] font-bold text-[var(--ink)] mb-2 sm:mb-3 text-serif leading-tight">Qual é o seu próximo passo?</h3>
            <p className="text-[var(--ink-soft)] text-[15px] leading-relaxed">
              Escolha a opção que melhor atende à sua necessidade agora. Nossa equipe está pronta para ajudar.
            </p>

            <div className="flex flex-col gap-5 sm:gap-4 mt-8 md:mt-10">
              {/* Botão Simular */}
              <button 
                onClick={openSimulador}
                className="w-full bg-gradient-to-r from-[var(--royal)] to-[var(--royal-deep)] text-white p-4 sm:p-5 rounded-[16px] sm:rounded-[20px] flex items-center justify-between transition-all active:scale-[0.98] shadow-md hover:shadow-lg group/btn border border-[var(--royal)]/20 cursor-pointer"
              >
                <div className="flex items-center gap-3 sm:gap-4 text-left">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-[12px] sm:rounded-[14px] flex items-center justify-center backdrop-blur-sm group-hover/btn:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[16px] sm:text-[17px] md:text-[19px] leading-tight">Fazer Simulação Rápida</span>
                    <span className="text-white/80 text-[12px] sm:text-[13px] md:text-[14px] leading-tight mt-0.5">Descubra o plano ideal sozinho</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:translate-x-1.5 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-[var(--line-strong)]"></div>
                <span className="flex-shrink-0 mx-4 text-[var(--ink-mute)] text-[13px] font-bold tracking-widest uppercase">Ou</span>
                <div className="flex-grow border-t border-[var(--line-strong)]"></div>
              </div>

              {/* Botão WhatsApp */}
              <AnimatePresence mode="wait">
                {!showWppForm ? (
                  <motion.button 
                    key="btn"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={handleWppClick}
                    className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white p-4 sm:p-5 rounded-[16px] sm:rounded-[20px] flex items-center justify-between transition-all active:scale-[0.98] shadow-md hover:shadow-lg group/wpp cursor-pointer border-none"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 text-left">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-[12px] sm:rounded-[14px] flex items-center justify-center group-hover/wpp:scale-110 transition-transform duration-300 flex-shrink-0 backdrop-blur-sm">
                        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[16px] sm:text-[17px] md:text-[19px] leading-tight">Falar com Especialista</span>
                        <span className="text-white/90 text-[12px] sm:text-[13px] md:text-[14px] leading-tight mt-0.5">Tire dúvidas no WhatsApp</span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover/wpp:translate-x-1.5 transition-transform duration-300">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.button>
                ) : (
                  <motion.form 
                    ref={formRef}
                    key="form"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    onSubmit={submitWpp}
                    className="flex flex-col gap-3 bg-[var(--bg-alt)] border border-[var(--line)] p-4 sm:p-5 rounded-[16px] sm:rounded-[20px] overflow-hidden"
                  >
                    <p className="text-[13px] sm:text-[14px] font-semibold text-[var(--ink)] mb-1">
                      Como podemos te chamar?
                    </p>
                    <input
                      ref={nameInputRef}
                      type="text"
                      placeholder="Seu nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      onFocus={handleInputFocus}
                      required
                      className="w-full h-12 px-4 rounded-[12px] border border-[var(--line-strong)] focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 outline-none text-[15px]"
                    />
                    <input
                      type="tel"
                      placeholder="Seu WhatsApp"
                      value={telefone}
                      onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                      onFocus={handleInputFocus}
                      required
                      className="w-full h-12 px-4 rounded-[12px] border border-[var(--line-strong)] focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 outline-none text-[15px]"
                    />
                    <div className="flex gap-2 mt-1">
                      <button 
                        type="button"
                        onClick={() => setShowWppForm(false)}
                        className="flex-1 h-12 rounded-[12px] font-bold text-[var(--ink-soft)] bg-white border border-[var(--line-strong)] hover:bg-[var(--line)] transition-colors cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button 
                        type="submit"
                        disabled={loadingWpp}
                        className="flex-[2] h-12 rounded-[12px] font-bold text-white bg-[#25D366] hover:bg-[#20BD5A] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                      >
                        {loadingWpp ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                            Iniciar Conversa
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="py-8 px-4 text-center relative z-10 border-t border-[var(--line)] bg-white/40 backdrop-blur-md mt-auto">
         <p className="text-[14px] font-semibold text-[var(--ink-soft)]">
           © {new Date().getFullYear()} AmaVidas. Todos os direitos reservados.
         </p>
         <p className="text-[12px] text-[var(--ink-mute)] mt-1.5 max-w-2xl mx-auto">
           A AmaVidas garante a segurança dos seus dados. Não compartilhamos suas informações com terceiros.
         </p>
      </footer>
    </div>
  );
}

export default function CampanhaPage() {
  return (
    <ModalProvider>
      <CampanhaContent />
      <ModalSimulador />
    </ModalProvider>
  );
}
