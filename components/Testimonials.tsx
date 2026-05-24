"use client";

import { useState, useRef, useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer, scaleIn } from "@/lib/animations";

const TOTAL_SECONDS = 102; // 1:42

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

export default function Testimonials() {
  const { openTestimonials } = useModal();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(TOTAL_SECONDS);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const progress = (currentTime / duration) * 100;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => {
        setPlaying(true);
      }).catch((e) => {
        console.warn("Áudio físico não encontrado ou falha ao carregar. Usando fallback de simulação:", e);
        setPlaying(true);
      });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Simulação fallback caso o arquivo de áudio físico não seja encontrado/carregado
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    // Se o player está tocando mas o áudio HTML real não está avançando (pausado ou não carregado)
    if (playing && (!audioRef.current || audioRef.current.paused)) {
      timer = setInterval(() => {
        setCurrentTime((t) => {
          if (t >= duration) {
            setPlaying(false);
            return 0;
          }
          return t + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [playing, duration]);

  return (
    <section id="depoimento" style={{ padding: "96px 0", background: "var(--bg)" }} className="max-[980px]:py-14 overflow-hidden">
      {/* Elemento HTML de Áudio real */}
      <audio ref={audioRef} src="/audio/depoimento.mp3" preload="metadata" />

      <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6">
        <motion.div
          className="grid max-[980px]:flex max-[980px]:flex-col max-[980px]:gap-8"
          style={{ gridTemplateColumns: "1.2fr 1fr", gap: "48px", alignItems: "start" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Card depoimento */}
          <motion.div
            variants={scaleIn}
            className="relative bg-white rounded-[20px] border border-[var(--line)] p-12 max-[980px]:p-7 cursor-default"
            style={{ boxShadow: "var(--shadow-md)" }}
            whileHover={{
              y: -5,
              boxShadow: "var(--shadow-lg)",
              borderColor: "var(--teal-soft)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            {/* Aspas decorativas */}
            <div
              className="absolute top-8 right-10 pointer-events-none select-none leading-none font-medium max-[980px]:top-3 max-[980px]:right-5 max-[980px]:text-[72px]"
              style={{ fontFamily: "var(--serif)", fontSize: "120px", color: "var(--teal-soft)", lineHeight: 1 }}
              aria-hidden="true"
            >
              &ldquo;
            </div>
 
            <blockquote
              className="relative z-10 m-0 mb-8 max-[980px]:text-[19px]"
              style={{ fontFamily: "var(--serif)", fontSize: "26px", lineHeight: 1.4, fontWeight: 400, color: "var(--ink)" }}
            >
              Em 15 minutos a AmaVidas estava na minha casa. Cuidaram da minha mãe com tanto carinho que{" "}
              <em style={{ color: "var(--magenta)", fontStyle: "italic" }}>parecia família.</em>{" "}
              Não tive que me preocupar com nada — só pude chorar e abraçar quem ficou.
            </blockquote>
 
            {/* Avatar + nome */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full grid place-items-center font-medium flex-shrink-0 text-[24px]"
                style={{
                  fontFamily: "var(--serif)",
                  background: "linear-gradient(135deg, #e3d4d8, #c9b5bd)",
                  color: "#6f4a55",
                }}
              >
                RM
              </div>
              <div>
                <div className="font-semibold text-[17px]" style={{ color: "var(--ink)" }}>Rosângela Martins</div>
                <div className="text-[14px]" style={{ color: "var(--ink-mute)" }}>Águas Lindas, GO · março de 2026</div>
              </div>
            </div>
 
            {/* Audio player */}
            <div
              className="mt-7 rounded-xl flex items-center gap-3.5 px-4 py-3.5"
              style={{ background: "var(--bg-alt)" }}
            >
              <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
                {/* Anel de pulsação chamando atenção */}
                <AnimatePresence>
                  {!playing && (
                    <motion.div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ border: "2px solid var(--magenta)" }}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: [1, 1.4, 1.8], opacity: [0.8, 0.4, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.8,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </AnimatePresence>
                
                {playing && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none bg-[var(--magenta)]/10"
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "easeInOut",
                    }}
                  />
                )}
 
                <motion.button
                  onClick={togglePlay}
                  aria-label={playing ? "Pausar áudio do depoimento" : "Reproduzir áudio do depoimento"}
                  className="w-11 h-11 rounded-full grid place-items-center relative z-10 transition-colors"
                  style={{ background: "var(--magenta)", color: "#fff" }}
                  whileHover={{ scale: 1.08, backgroundColor: "#AE2A5C" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {playing ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </motion.button>
              </div>
 
              {/* Progress bar */}
              <div className="flex-1 h-1.5 rounded-sm relative overflow-hidden" style={{ background: "#e1ddd2" }}>
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-sm"
                  style={{ width: `${progress}%`, background: "var(--magenta)" }}
                />
              </div>
 
              <span
                className="text-[13px] flex-shrink-0 tabular-nums"
                style={{ color: "var(--ink-mute)" }}
              >
                {fmt(currentTime)} / {fmt(duration)}
              </span>
            </div>
          </motion.div>

          {/* Lado direito */}
          <motion.div variants={fadeUp} style={{ paddingTop: "6px" }}>
            <p className="text-[14px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "var(--teal)" }}>
              Histórias reais
            </p>
            <h2 className="mb-5">Mais de 5.000 famílias confiam na AmaVidas.</h2>
            <p className="text-[18px]" style={{ color: "var(--ink-soft)", marginBottom: "40px", lineHeight: "1.65" }}>
              Cada plano contratado é uma promessa de apoio, dignidade e respeito cumprida nos mínimos detalhes. Conheça as histórias e depoimentos de famílias reais que encontraram, na hora mais difícil de suas vidas, o acolhimento, a agilidade e o conforto emocional necessários para atravessar o luto sem burocracias e com a certeza de que nunca estiveram sozinhas.
            </p>
            <motion.button
              onClick={openTestimonials}
              className="h-16 px-8 inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold text-[19px] transition-all max-[980px]:w-full max-[980px]:text-[17px]"
              style={{ background: "transparent", color: "var(--royal)", border: "1.5px solid var(--royal)" }}
              whileHover={{ scale: 1.03, backgroundColor: "var(--royal-soft)" }}
              whileTap={{ scale: 0.98 }}
            >
              Ver mais depoimentos
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
