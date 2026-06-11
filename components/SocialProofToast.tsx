"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Activity {
  name: string;
  action: string;
  time: string;
}

const ACTIVITIES: Activity[] = [
  { name: "Maria S.", action: "acabou de contratar o Plano Amar Plus para sua família", time: "agora mesmo" },
  { name: "João P.", action: "de Águas Lindas/GO acabou de fazer uma simulação", time: "há 2 min" },
  { name: "Ana C.", action: "acabou de garantir a proteção do Plano Vida Plus", time: "há 5 min" },
  { name: "Ricardo M.", action: "de Brasília/DF contratou um plano para seus pais", time: "há 12 min" },
  { name: "Fernanda R.", action: "contratou o Plano Amar Plus", time: "há 3 min" },
  { name: "Carlos D.", action: "de Águas Lindas/GO contratou o plano de assistência", time: "há 1 min" },
  { name: "Juliana F.", action: "acabou de fazer uma simulação personalizada", time: "há 4 min" },
  { name: "Marcos T.", action: "contratou o Plano Vida Plus para sua família", time: "há 8 min" },
  { name: "Gabriela L.", action: "de Brasília/DF acabou de simular um plano", time: "há 10 min" },
  { name: "Lucas A.", action: "contratou o Plano Amar Plus", time: "há 6 min" },
  { name: "Patricia V.", action: "de Águas Lindas/GO contratou o plano de proteção", time: "há 14 min" },
  { name: "Roberto K.", action: "acabou de contratar o Plano Vida Plus", time: "há 15 min" }
];

export default function SocialProofToast() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Inicializa o primeiro toast depois de 5 segundos
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 5000);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;

    // Fica visível por 6 segundos, depois some
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 6000);

    return () => clearTimeout(hideTimer);
  }, [visible]);

  useEffect(() => {
    if (visible) return;

    // Fica invisível por 12 segundos, seleciona o próximo e mostra
    const showTimer = setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % ACTIVITIES.length);
      setVisible(true);
    }, 12000);

    return () => clearTimeout(showTimer);
  }, [visible]);

  const item = ACTIVITIES[currentIdx];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.25 } }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-3.5 bg-white border border-slate-200/80 rounded-[20px] shadow-[0_12px_36px_rgba(20,25,55,0.08)] max-w-sm p-4 cursor-pointer select-none"
        >
          {/* Ícone de sino com ponto verde pulsante */}
          <div className="relative w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[var(--teal)] flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Atividade Recente</span>
              <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
            </div>
            <p className="text-[13.5px] leading-snug mt-1 text-slate-700">
              <strong className="text-slate-900 font-semibold">{item.name}</strong> {item.action}.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
