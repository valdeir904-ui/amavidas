"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useModal } from "@/contexts/ModalContext";

interface Parceiro {
  id: string;
  nome: string;
  tipo: string;
  desconto: string;
  contato: string | null;
  logoUrl: string | null;
  ativo: boolean;
  ordem: number;
}

export default function ClubeDescontos() {
  const { openForm } = useModal();
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parceiros")
      .then((r) => r.json())
      .then((data) => {
        if (data.parceiros?.length) {
          setParceiros(data.parceiros);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (tipo: string) => {
    const t = tipo.toLowerCase();
    if (t.includes("farm") || t.includes("remed")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      );
    }
    if (t.includes("exam") || t.includes("lab") || t.includes("clin") || t.includes("saud") || t.includes("odont")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    }
    if (t.includes("educ") || t.includes("curs") || t.includes("faculd") || t.includes("idiom")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      );
    }
    // Default Comércio / Lazer
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );
  };

  const getColors = (tipo: string) => {
    const t = tipo.toLowerCase();
    if (t.includes("farm") || t.includes("remed")) {
      return { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", badge: "bg-emerald-100 text-emerald-800" };
    }
    if (t.includes("exam") || t.includes("lab") || t.includes("clin") || t.includes("saud") || t.includes("odont")) {
      return { bg: "bg-blue-50 text-blue-600 border-blue-100", badge: "bg-blue-100 text-blue-800" };
    }
    if (t.includes("educ") || t.includes("curs") || t.includes("faculd") || t.includes("idiom")) {
      return { bg: "bg-indigo-50 text-indigo-600 border-indigo-100", badge: "bg-indigo-100 text-indigo-800" };
    }
    return { bg: "bg-rose-50 text-rose-600 border-rose-100", badge: "bg-rose-100 text-rose-800" };
  };

  if (loading) {
    return (
      <section id="beneficios" style={{ background: "rgba(43, 61, 168, 0.04)" }} className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section id="beneficios" style={{ background: "rgba(43, 61, 168, 0.04)" }} className="py-24 overflow-hidden relative">
      {/* Decorative Blur BG elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-5 min-h-[300px]">
        {/* Section Head */}
        <motion.div
          className="text-center mx-auto mb-16"
          style={{ maxWidth: "720px" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <p className="text-[13px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--royal)" }}>
            Economize no dia a dia
          </p>
          <h2 className="text-[34px] min-[768px]:text-[44px] font-medium leading-tight tracking-tight text-slate-900" style={{ fontFamily: "var(--serif)" }}>
            A proteção da sua família com <br className="hidden md:inline" />
            <span style={{ color: "var(--royal)" }}>clube de benefícios para usar em vida</span>
          </h2>
          <p className="mt-5 text-[18px] max-[768px]:text-[16px] leading-relaxed text-slate-500">
            A AmaVidas vai além do amparo no luto. Com nossa ampla rede de parceiros conveniados, você garante descontos especiais para cuidar da saúde, educação e lazer hoje mesmo.
          </p>
        </motion.div>

        {/* Partners Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {parceiros.map((parceiro) => {
            const colors = getColors(parceiro.tipo);
            return (
              <motion.div
                key={parceiro.id}
                variants={fadeUp}
                className="bg-white rounded-[24px] border border-slate-200 p-6 flex flex-col justify-between shadow-sm h-[260px] cursor-default transition-all"
                whileHover={{
                  y: -6,
                  borderColor: "var(--royal-soft)",
                  boxShadow: "0 15px 35px -10px rgba(43,61,168,.12)",
                }}
              >
                <div className="flex items-start justify-between">
                  {/* Logo or Icon */}
                  {parceiro.logoUrl ? (
                    <div className="relative w-14 h-14 rounded-xl border border-slate-100 overflow-hidden bg-white">
                      <Image src={parceiro.logoUrl} alt={parceiro.nome} fill className="object-contain p-1" />
                    </div>
                  ) : (
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${colors.bg}`}>
                      {getIcon(parceiro.tipo)}
                    </div>
                  )}

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${colors.badge}`}>
                    {parceiro.tipo}
                  </span>
                </div>

                <div className="my-auto pt-3">
                  <h4 className="text-[19px] font-bold text-slate-900 leading-snug">{parceiro.nome}</h4>
                  <p className="text-[22px] font-black mt-1 leading-none font-serif text-blue-600">
                    {parceiro.desconto}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate max-w-[85%]">{parceiro.contato || "Disponível para clientes"}</span>
                  <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="text-center mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <button
            onClick={() => openForm("Clube de Benefícios")}
            className="h-16 px-8 rounded-xl font-semibold text-[17px] text-white inline-flex items-center gap-2.5 transition-all hover:-translate-y-0.5 cursor-pointer"
            style={{ background: "var(--royal)", boxShadow: "0 8px 22px rgba(43,61,168,.28)" }}
          >
            Quero garantir meu plano com benefícios
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
