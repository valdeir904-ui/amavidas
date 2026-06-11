"use client";

import { useEffect, useState, useRef } from "react";
import { useModal } from "@/contexts/ModalContext";

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

// Subcomponente de Áudio para o Modal
function ModalAudioPlayer({ src }: { src: string }) {
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
    } else {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(true));
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);
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
  }, [src]);

  // Simulação se o áudio não carregar
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (playing && (!audioRef.current || audioRef.current.paused)) {
      timer = setInterval(() => {
        setCurrentTime((t) => {
          const maxDur = duration || 102;
          if (t >= maxDur) {
            setPlaying(false);
            return 0;
          }
          return t + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [playing, duration]);

  const progress = duration || 102 ? (currentTime / (duration || 102)) * 100 : 0;

  return (
    <div className="mt-3 rounded-lg flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-100">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button 
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-[#ae2a5c] text-white flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-95 transition-transform"
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex-1 h-1 bg-slate-200 rounded relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full bg-[#ae2a5c] rounded" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-[10px] text-slate-400 font-mono">
        {fmt(currentTime)} / {fmt(duration || 102)}
      </span>
    </div>
  );
}

const AVATAR_COLORS = [
  "from-[#e3d4d8] to-[#c9b5bd] text-[#6f4a55]",
  "from-[#d4dae3] to-[#b5bec9] text-[#4a566f]",
  "from-[#d4e3d8] to-[#b5c9bb] text-[#4a6f55]",
  "from-[#e3dbd4] to-[#c9bdb5] text-[#6f5a4a]",
  "from-[#dcd4e3] to-[#c2b5c9] text-[#5f4a6f]",
  "from-[#d4e3e3] to-[#b5c9c9] text-[#4a6f6f]",
];

export default function ModalDepoimentos() {
  const { modal, closeTestimonials, openForm } = useModal();
  const { open } = modal.testimonials;
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Carrega depoimentos do sistema se o modal estiver aberto
  useEffect(() => {
    if (!open) return;
    fetch("/api/depoimentos")
      .then((r) => r.json())
      .then((data) => {
        if (data.depoimentos) {
          setDepoimentos(data.depoimentos);
        }
      })
      .catch((err) => console.error("Erro ao buscar depoimentos no modal:", err));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeTestimonials(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, closeTestimonials]);

  if (!open) return null;

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
          className="w-full aspect-video rounded-lg shadow border-0 bg-black max-h-[340px]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <video
        src={url}
        controls
        preload="metadata"
        className="w-full aspect-video rounded-lg shadow bg-slate-900 object-contain max-h-[340px]"
      />
    );
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-5 overflow-y-auto"
      style={{ background: "rgba(20,25,55,.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) closeTestimonials(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="testiModalTitle"
    >
      {/* Lightbox para prints de WhatsApp no modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[125] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button className="absolute top-4 right-4 text-white hover:text-slate-300 text-4xl leading-none font-bold">&times;</button>
            <img src={lightboxUrl} alt="WhatsApp print ampliado" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}

      <div
        className="bg-white w-full max-w-[900px] rounded-[20px] p-10 relative shadow-[var(--shadow-lg)] my-auto"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        {/* Close */}
        <button
          onClick={closeTestimonials}
          aria-label="Fechar"
          className="absolute top-3.5 right-3.5 w-10 h-10 rounded-xl bg-[var(--bg-alt)] text-[var(--ink)] grid place-items-center hover:bg-[var(--line)] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <p className="text-[var(--magenta)] text-[13px] font-semibold tracking-[0.14em] uppercase mb-2.5">
          Histórias reais
        </p>
        <h3
          id="testiModalTitle"
          className="text-[30px] font-medium leading-tight mb-2"
          style={{ fontFamily: "var(--serif)" }}
        >
          Quem confia, conta.
        </h3>
        <p className="text-[var(--ink-soft)] text-base mb-7">
          Famílias atendidas pela AmaVidas. Depoimentos reais dos nossos clientes.
        </p>

        <div className="grid gap-6">
          {depoimentos.map((t, i) => {
            const initials = t.nome
              ? t.nome.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
              : "RM";
            const isGoogle = t.relacao?.toLowerCase().includes("google");

            return (
              <div
                key={t.id}
                className="rounded-[14px] p-6 border border-[var(--line)] bg-gradient-to-br from-white to-slate-50/60 overflow-hidden relative shadow-sm"
              >
                {/* Glows decorativos suaves de fundo */}
                <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none z-0" />
                <div className="absolute -top-10 -left-10 w-36 h-36 bg-teal-500/5 rounded-full blur-3xl pointer-events-none z-0" />

                {/* Marca d'água do Google */}
                {isGoogle && (
                  <div className="absolute -right-6 -bottom-6 opacity-[0.05] pointer-events-none select-none z-0">
                    <svg viewBox="0 0 24 24" className="w-28 h-28" fill="none">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="text-yellow-400 text-base tracking-[-1px]">★★★★★</div>
                    {isGoogle && (
                      <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200/50 px-2.5 py-0.5 rounded-full text-[10px] text-slate-500 font-medium select-none">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        Google
                      </div>
                    )}
                  </div>
                  
                  {/* Vídeo */}
                  {t.tipo === "video" && t.mediaUrl && (
                    <div className="mb-4 max-w-lg">
                      {renderVideo(t.mediaUrl)}
                    </div>
                  )}

                  {/* Print / Imagem */}
                  {t.tipo === "imagem" && t.mediaUrl && (
                    <div className="mb-4 max-w-sm">
                      <div 
                        className="w-full aspect-[4/3] rounded-lg overflow-hidden relative border border-slate-100 cursor-zoom-in bg-slate-50 group"
                        onClick={() => setLightboxUrl(t.mediaUrl)}
                      >
                        <img 
                          src={t.mediaUrl} 
                          alt={`Depoimento de ${t.nome}`} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-103"
                        />
                      </div>
                    </div>
                  )}

                  {/* Texto simples ou Áudio com texto */}
                  {(t.tipo === "texto" || t.tipo === "audio") && (
                    <blockquote className="text-[18px] leading-relaxed mb-4 text-[var(--ink)] m-0" style={{ fontFamily: "var(--serif)" }}>
                      &ldquo;{t.texto}&rdquo;
                    </blockquote>
                  )}

                  <div className="flex items-center gap-3">
                    {t.fotoUrl ? (
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-100 flex-shrink-0 flex items-center justify-center">
                        <img src={t.fotoUrl} alt={t.nome} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className={`w-11 h-11 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} grid place-items-center font-medium flex-shrink-0`}
                        style={{ fontFamily: "var(--serif)", fontSize: "17px" }}
                      >
                        {initials}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-[15px] text-[var(--ink)]">{t.nome}</div>
                      <div className="text-[13px] text-[var(--ink-mute)]">
                        {t.cidade}{t.relacao ? ` · ${t.relacao}` : ""}
                      </div>
                    </div>
                  </div>

                  {t.tipo === "audio" && t.mediaUrl && (
                    <div className="max-w-sm">
                      <ModalAudioPlayer src={t.mediaUrl} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-7 text-center">
          <button
            onClick={() => { closeTestimonials(); openForm(); }}
            className="h-16 px-4 sm:px-8 inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold text-[15px] sm:text-[18px] text-white transition-all hover:-translate-y-0.5 whitespace-nowrap"
            style={{ background: "var(--royal)", boxShadow: "0 8px 22px rgba(43,61,168,.28)" }}
          >
            Garantir Minha Proteção Agora
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
