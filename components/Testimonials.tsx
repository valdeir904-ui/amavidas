"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useModal } from "@/contexts/ModalContext";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface Depoimento {
  id: string;
  nome: string;
  cidade: string;
  relacao: string | null;
  texto: string | null;
  tipo: string; // "video" | "imagem" | "audio" | "texto"
  mediaUrl: string | null;
  fotoUrl: string | null;
  ativo: boolean;
  ordem: number;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

// Subcomponente de Player de Áudio independente
function AudioPlayer({ src, onPlayChange }: { src: string; onPlayChange: (playing: boolean) => void }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      onPlayChange(false);
    } else {
      audio.play()
        .then(() => {
          setPlaying(true);
          onPlayChange(true);
        })
        .catch((e) => {
          console.warn("Falha ao tocar áudio real, simulando playback:", e);
          setPlaying(true);
          onPlayChange(true);
        });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
      onPlayChange(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src, onPlayChange]);

  // Simulação fallback caso áudio físico não seja carregado
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (playing && (!audioRef.current || audioRef.current.paused)) {
      timer = setInterval(() => {
        setCurrentTime((t) => {
          const maxDur = duration || 102;
          if (t >= maxDur) {
            setPlaying(false);
            onPlayChange(false);
            return 0;
          }
          return t + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [playing, duration, onPlayChange]);

  const progress = duration || 102 ? (currentTime / (duration || 102)) * 100 : 0;

  return (
    <div className="mt-6 rounded-xl flex items-center gap-3.5 px-4 py-3.5 bg-slate-50 border border-slate-200">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
        <AnimatePresence>
          {!playing && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: "2px solid var(--magenta)" }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: [1, 1.4, 1.8], opacity: [0.8, 0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        
        {playing && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none bg-[var(--magenta)]/10"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
          />
        )}

        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-full bg-[var(--magenta)] text-white flex items-center justify-center relative z-10 transition-colors"
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
        </button>
      </div>

      <div className="flex-1 h-1.5 rounded-sm relative overflow-hidden bg-slate-200">
        <div
          className="absolute left-0 top-0 h-full rounded-sm bg-[var(--magenta)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-[13px] text-slate-500 font-mono">
        {fmt(currentTime)} / {fmt(duration || 102)}
      </span>
    </div>
  );
}

export default function Testimonials() {
  const { openTestimonials } = useModal();
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 para esquerda, 1 para direita
  const [isPlayingMedia, setIsPlayingMedia] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Carrega os depoimentos da API pública
  useEffect(() => {
    fetch("/api/depoimentos")
      .then((r) => r.json())
      .then((data) => {
        if (data.depoimentos) {
          setDepoimentos(data.depoimentos);
        }
      })
      .catch((err) => console.error("Erro ao buscar depoimentos:", err));
  }, []);

  // Autoplay do carrossel (para se alguma mídia estiver rodando)
  useEffect(() => {
    if (depoimentos.length <= 1 || isPlayingMedia) return;

    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % depoimentos.length);
    }, 9000);

    return () => clearInterval(timer);
  }, [depoimentos, isPlayingMedia]);

  if (depoimentos.length === 0) return null;

  const activeDepo = depoimentos[index];

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % depoimentos.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + depoimentos.length) % depoimentos.length);
  };

  const renderVideo = (url: string) => {
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
    if (isYoutube) {
      let videoId = "";
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
      } else if (url.includes("v=")) {
        videoId = url.split("v=")[1]?.split(/[&?#]/)[0];
      } else if (url.includes("embed/")) {
        videoId = url.split("embed/")[1]?.split(/[?#]/)[0];
      }
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full aspect-video rounded-xl shadow-md border-0 bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onPlay={() => setIsPlayingMedia(true)}
        />
      );
    }

    return (
      <video
        src={url}
        controls
        preload="metadata"
        className="w-full aspect-video rounded-xl shadow-md bg-slate-900 object-contain"
        onPlay={() => setIsPlayingMedia(true)}
        onPause={() => setIsPlayingMedia(false)}
      />
    );
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
    }),
  };

  const initials = activeDepo.nome
    ? activeDepo.nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "RM";

  return (
    <section id="depoimento" style={{ padding: "96px 0", background: "var(--bg)" }} className="max-[980px]:py-14 overflow-hidden relative">
      
      {/* Lightbox para os prints do WhatsApp */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button className="absolute top-4 right-4 text-white hover:text-slate-300 text-4xl leading-none font-bold">&times;</button>
            <img src={lightboxUrl} alt="WhatsApp print ampliado" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none" />
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Lado Esquerdo - Foto CEO Lívia + Copywriting + CTA */}
          <motion.div variants={fadeUp} className="flex flex-col gap-6 max-w-[550px] max-[980px]:mx-auto">
            <p className="text-[14px] font-semibold tracking-[0.14em] uppercase mb-1" style={{ color: "var(--teal)" }}>
              Histórias reais
            </p>
            <h2 className="mb-4 text-[32px] sm:text-[40px] font-medium leading-tight text-slate-900" style={{ fontFamily: "var(--serif)" }}>
              Quem conhece, confia.
            </h2>
            
            {/* Bloco de Copywriting com foto da CEO Lívia */}
            <div className="flex items-start gap-5 bg-white rounded-2xl border border-[var(--line)] p-6 max-[640px]:flex-col" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--teal-soft)] shadow-md max-[640px]:mx-auto">
                <Image
                  src="/Ceo_Livia.png"
                  alt="Lívia Antonieti - CEO AmaVidas"
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <blockquote className="m-0 text-slate-700 italic text-[15px] sm:text-[16px] leading-relaxed">
                  "Não somos nós que falamos sobre o cuidado e a dedicação da AmaVidas, mas sim os depoimentos reais dos nossos clientes que contam, por si sós, a qualidade e o prestígio que colocamos em cada atendimento."
                </blockquote>
                <div className="mt-3">
                  <span className="text-xs font-bold text-[var(--teal)] uppercase tracking-wider block">Lívia Antonieti</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">CEO da AmaVidas</span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              Cada depoimento cadastrado é uma promessa de apoio, dignidade e respeito cumprida nos mínimos detalhes. Conheça as histórias de famílias reais que encontraram conforto.
            </p>

            <div className="pt-2">
              <motion.button
                onClick={openTestimonials}
                className="h-16 px-8 inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold text-[17px] sm:text-[18px] transition-all max-[980px]:w-full"
                style={{ background: "transparent", color: "var(--royal)", border: "1.5px solid var(--royal)" }}
                whileHover={{ scale: 1.03, backgroundColor: "var(--royal-soft)" }}
                whileTap={{ scale: 0.98 }}
              >
                Ver todos os depoimentos
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Lado Direito - Carrossel de Depoimentos */}
          <div className="relative flex flex-col gap-6 w-full max-w-[620px] max-[980px]:mx-auto">
            <div className="h-[480px] max-[640px]:h-[450px] relative overflow-hidden w-full flex items-center">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={index}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 350, damping: 32 },
                    opacity: { duration: 0.2 },
                  }}
                  className="w-full h-full"
                >
                  <div
                    className="relative bg-gradient-to-br from-white to-slate-50/60 rounded-[20px] border border-[var(--line)] p-10 max-[640px]:p-6 cursor-default w-full select-none flex flex-col justify-between h-full overflow-hidden"
                    style={{ boxShadow: "var(--shadow-md)" }}
                  >
                    {/* Glows decorativos de fundo */}
                    <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0" />
                    <div className="absolute -top-12 -left-12 w-44 h-44 bg-teal-500/5 rounded-full blur-3xl pointer-events-none z-0" />

                    {/* Vídeo */}
                    {activeDepo.tipo === "video" && activeDepo.mediaUrl && (
                      <div className="w-full h-full flex flex-col justify-between relative z-10">
                        <div className="w-full h-[300px] max-[640px]:h-[260px] rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                          {renderVideo(activeDepo.mediaUrl)}
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-900">{activeDepo.nome}</div>
                            <div className="text-[11px] text-slate-400">{activeDepo.cidade}{activeDepo.relacao ? ` · ${activeDepo.relacao}` : ""}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Print / Imagem */}
                    {activeDepo.tipo === "imagem" && activeDepo.mediaUrl && (
                      <div className="w-full h-full flex flex-col justify-between relative z-10">
                        <div
                          className="w-full h-[300px] max-[640px]:h-[260px] rounded-xl overflow-hidden relative border border-slate-100 cursor-zoom-in bg-slate-50 group"
                          onClick={() => setLightboxUrl(activeDepo.mediaUrl)}
                        >
                          <img
                            src={activeDepo.mediaUrl}
                            alt={`Conversa com ${activeDepo.nome}`}
                            className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-103"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                            <span className="bg-black/60 text-white rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-900">{activeDepo.nome}</div>
                            <div className="text-[11px] text-slate-400">{activeDepo.cidade}{activeDepo.relacao ? ` · ${activeDepo.relacao}` : ""}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Texto simples ou Áudio com texto */}
                    {(activeDepo.tipo === "texto" || activeDepo.tipo === "audio") && (
                      <div className="w-full h-full flex flex-col justify-between relative z-10">
                        <div className="relative flex-1 flex flex-col justify-center">
                          <div
                            className="absolute -top-4 right-2 pointer-events-none select-none leading-none font-medium text-[90px] text-slate-100"
                            style={{ fontFamily: "var(--serif)", lineHeight: 1 }}
                            aria-hidden="true"
                          >
                            &ldquo;
                          </div>

                          <div 
                            className="relative z-10 m-0 text-[17px] sm:text-[19px] leading-relaxed text-slate-800 overflow-y-auto max-h-[190px] pr-2 scrollbar-thin flex items-center"
                            style={{ fontFamily: "var(--serif)" }}
                          >
                            <span className="w-full block text-left">{activeDepo.texto}</span>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 flex-shrink-0">
                          <div className="flex items-center gap-4">
                            {activeDepo.fotoUrl ? (
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 flex-shrink-0 flex items-center justify-center">
                                <img
                                  src={activeDepo.fotoUrl}
                                  alt={activeDepo.nome}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full grid place-items-center font-medium flex-shrink-0 text-base bg-gradient-to-br from-[#e3d4d8] to-[#c9b5bd] text-[#6f4a55] font-serif">
                                {initials}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-sm text-slate-900">{activeDepo.nome}</div>
                              <div className="text-xs text-slate-400">
                                {activeDepo.cidade}{activeDepo.relacao ? ` · ${activeDepo.relacao}` : ""}
                              </div>
                            </div>
                          </div>

                          {activeDepo.tipo === "audio" && activeDepo.mediaUrl && (
                            <AudioPlayer
                              src={activeDepo.mediaUrl}
                              onPlayChange={(playing) => setIsPlayingMedia(playing)}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controles de Navegação do Carrossel */}
            {depoimentos.length > 1 && (
              <div className="flex items-center justify-between px-2">
                {/* Indicadores de bolinhas */}
                <div className="flex gap-1.5">
                  {depoimentos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDirection(i > index ? 1 : -1);
                        setIndex(i);
                      }}
                      className={`h-2 rounded-full transition-all ${index === i ? "w-6 bg-[var(--royal)]" : "w-2 bg-slate-200 hover:bg-slate-300"}`}
                      aria-label={`Ir para slide ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Sestas de navegação */}
                <div className="flex gap-2.5">
                  <button
                    onClick={handlePrev}
                    className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all shadow-sm"
                    aria-label="Depoimento anterior"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all shadow-sm"
                    aria-label="Próximo depoimento"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
