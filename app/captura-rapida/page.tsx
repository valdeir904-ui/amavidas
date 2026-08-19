"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useConfig } from "@/contexts/ConfigContext";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Heart,
  Star,
  Users,
  User,
  Dog,
  Lock,
  PhoneCall,
  Clock,
} from "lucide-react";

function mascaraTelefone(v: string): string {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length === 0) return "";
  if (n.length <= 2) return `(${n}`;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

export default function CapturaRapidaPage() {
  const { configs } = useConfig();
  const whatsappNumber = configs.whatsapp || "5561985825621";

  // Form states
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [paraQuem, setParaQuem] = useState("Família");
  const [consentimento, setConsentimento] = useState(true);
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const nomeTrim = nome.trim();
    const telDigitos = telefone.replace(/\D/g, "");

    if (nomeTrim.length < 3) {
      setErro("Por favor, digite seu nome completo (mínimo 3 letras).");
      return;
    }

    if (telDigitos.length < 10) {
      setErro("Por favor, digite um WhatsApp válido com DDD.");
      return;
    }

    if (!consentimento) {
      setErro("É necessário concordar em receber a cotação para prosseguir.");
      return;
    }

    setLoading(true);

    try {
      let origemParams: any = {};
      if (typeof window !== "undefined") {
        const origemSalva = sessionStorage.getItem("amavidas_origem");
        if (origemSalva) {
          try {
            origemParams = JSON.parse(origemSalva);
          } catch (err) {}
        }
      }

      await fetch("/api/simulacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeTrim,
          telefone: telefone.trim(),
          paraQuem,
          planoRecomendado: `Plano ${paraQuem} (Captura Rápida)`,
          comoContatar: "whatsapp",
          intencao: "contratar_agora",
          consentimento: true,
          origem: "captura_rapida",
          ...origemParams,
        }),
      });

      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead");
      }

      setEnviado(true);

      // Prepara mensagem no WhatsApp
      const msg = `Olá! Gostaria de receber a cotação do *Plano ${paraQuem}* da AmaVidas. Meu nome é *${nomeTrim}*.`;
      const wppUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;

      // Redireciona para o WhatsApp após breve feedback
      setTimeout(() => {
        window.location.href = wppUrl;
      }, 1200);
    } catch (err) {
      console.error("Erro ao enviar captura:", err);
      setErro("Ocorreu um erro ao processar seu pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 relative">
      {/* Elementos visuais sutis de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-50/60 to-transparent pointer-events-none -z-10" />

      {/* Header enxuto sem distrações (PUI Interaction Cost Reduction) */}
      <header className="py-4 px-4 sm:px-8 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="relative w-32 h-9 sm:w-40 sm:h-11">
            <Image
              src="/logo-amavidas-transparent.png"
              alt="AmaVidas Assistência Familiar"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Site 100% Seguro</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-14 z-10">
        <div className="max-w-5xl mx-auto w-full grid md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 items-center">
          {/* Coluna Esquerda: Oferta & Prova Social */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-5 text-left"
          >
            {/* Tag / Badge de Confiança */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full w-fit text-xs sm:text-sm font-bold border border-emerald-200/60">
              <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Proteção e Cuidado Familiar 24h</span>
            </div>

            {/* Título Principal (H1) com hierarquia clara */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Tranquilidade para sua família{" "}
              <span className="text-emerald-700 underline decoration-emerald-300 decoration-4 underline-offset-4">
                a partir de R$ 43/mês
              </span>
            </h1>

            {/* Texto de Apoio (Corpo 18px) */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Cotação gratuita em 30 segundos. Proteja quem você ama com cobertura funeral completa, sem limitação de idade e assistência emergencial imediata.
            </p>

            {/* Lista de Vantagens (Checklist com contraste garantido) */}
            <ul className="flex flex-col gap-3 my-2">
              {[
                { title: "Cobertura funeral completa 24h em todo o Brasil", sub: "Urna, translado, ornamentação e rituais inclusos" },
                { title: "Sem carência para imprevistos e acidentes", sub: "Tranquilidade imediata para você e seus dependentes" },
                { title: "Inclusão de filhos, pais e pets", sub: "Proteção abrangente em um único plano mensal" },
                { title: "Clube de benefícios exclusivo", sub: "Descontos em farmácias, consultas médicas e exames" },
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                      {item.title}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500">
                      {item.sub}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Prova Social */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
              <div className="flex -space-x-2 overflow-hidden">
                {["#047857", "#2563eb", "#d97706", "#7c3aed"].map((bg, i) => (
                  <div
                    key={i}
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white flex items-center justify-center font-bold text-white text-xs"
                    style={{ backgroundColor: bg }}
                  >
                    {["M", "R", "C", "A"][i]}
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-900 ml-1">5.0</span>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  Mais de 1.000 famílias protegidas no DF e Entorno
                </span>
              </div>
            </div>
          </motion.div>

          {/* Coluna Direita: Form de Captura Rápida (PUI Design System Rule) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 relative overflow-hidden"
          >
            {/* Faixa superior do Card */}
            <div className="bg-slate-900 text-white -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-4 sm:p-5 mb-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm sm:text-base tracking-tight">
                  Cotação Expressa no WhatsApp
                </span>
              </div>
              <span className="text-xs text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full font-medium border border-emerald-800/80">
                Resposta Imediata
              </span>
            </div>

            {enviado ? (
              /* Estado de Sucesso Instantâneo */
              <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Solicitação Recebida com Sucesso!
                </h3>
                <p className="text-sm text-slate-600 max-w-sm">
                  Estamos abrindo seu WhatsApp para enviar as opções do <strong>Plano {paraQuem}</strong>. Se a página não abrir automaticamente, clique no botão abaixo:
                </p>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Olá! Gostaria de receber a cotação do Plano ${paraQuem} da AmaVidas. Meu nome é ${nome.trim()}.`
                  )}`}
                  className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  Abrir WhatsApp Agora
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            ) : (
              /* Formulário em Coluna Única (PUI Rule: Labels acima dos inputs) */
              <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
                {erro && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold rounded-xl">
                    {erro}
                  </div>
                )}

                {/* Opções de Plano / Quem Proteger (Radio Tiles de 48pt mín) */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-800">
                    1. Quem você deseja proteger no plano?
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Família", label: "Família", icon: Users },
                      { id: "Individual", label: "Individual", icon: User },
                      { id: "Pet", label: "Com Pet", icon: Dog },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = paraQuem === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setParaQuem(item.id)}
                          className={`h-14 rounded-xl px-2 flex flex-col items-center justify-center gap-1 font-semibold text-xs sm:text-sm border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/20"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-700" : "text-slate-500"}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Campo 1: Nome Completo */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="input-nome" className="text-sm font-bold text-slate-800">
                    2. Seu nome completo <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    id="input-nome"
                    type="text"
                    required
                    placeholder="Digite seu nome"
                    autoComplete="name"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="h-12 w-full px-4 rounded-xl border border-slate-300 bg-white text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                  />
                </div>

                {/* Campo 2: WhatsApp */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="input-telefone" className="text-sm font-bold text-slate-800">
                    3. Seu WhatsApp com DDD <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    id="input-telefone"
                    type="tel"
                    required
                    placeholder="(61) 99999-9999"
                    autoComplete="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                    className="h-12 w-full px-4 rounded-xl border border-slate-300 bg-white text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all font-mono"
                  />
                </div>

                {/* Consentimento Transparente */}
                <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={consentimento}
                    onChange={(e) => setConsentimento(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    Concordo em receber a cotação personalizada sem compromisso via WhatsApp.
                  </span>
                </label>

                {/* Botão de Submissão Principal (PUI Primary Weight: min 48pt height, contrast ≥4.5:1) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-75 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Gerando Cotação...</span>
                    </>
                  ) : (
                    <>
                      <span>Receber Cotação no WhatsApp</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Seus dados estão 100% seguros e protegidos</span>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="py-6 px-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} AmaVidas Assistência Familiar. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-slate-600">
            <Link href="/" className="hover:underline">
              Página Inicial
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              Atendimento 24h
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
