"use client";

import { useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";

const TESTIMONIALS = [
  { name: "Rosângela Martins", city: "Águas Lindas, GO", date: "março de 2026", initials: "RM", stars: 5, text: "Em 15 minutos a AmaVidas estava na minha casa. Cuidaram da minha mãe com tanto carinho que parecia família. Não tive que me preocupar com nada — só pude chorar e abraçar quem ficou." },
  { name: "Carlos Eduardo Lima", city: "Goiânia, GO", date: "janeiro de 2026", initials: "CL", stars: 5, text: "Contratei o plano há 4 anos pra meu pai. Quando chegou a hora, não precisei fazer absolutamente nada — eles cuidaram da papelada, do velório, do sepultamento. Vale cada centavo." },
  { name: "Maria Aparecida Silva", city: "Brasília, DF", date: "novembro de 2025", initials: "MS", stars: 5, text: "Atendimento humano de verdade. A consultora ligou três vezes nos dias seguintes só pra saber como eu estava. Fui surpreendida pelo carinho." },
  { name: "João Pedro Santos", city: "Anápolis, GO", date: "setembro de 2025", initials: "JS", stars: 5, text: "Tinha medo de que fosse propaganda enganosa, como costuma acontecer. Mas é tudo verdade. Equipe pontual, respeitosa, e o velório ficou lindo. Recomendo de olhos fechados." },
  { name: "Lúcia Fernandes", city: "Águas Lindas, GO", date: "julho de 2025", initials: "LF", stars: 5, text: "Pago R$ 43 por mês há 6 anos e nunca precisei usar. Mesmo assim, todo ano recebo uma ligação de aniversário, mensagem no Natal. Eles tratam a gente como gente." },
  { name: "Antônio Carvalho", city: "Luziânia, GO", date: "maio de 2025", initials: "AC", stars: 5, text: "Perdi minha esposa no meio da madrugada. Liguei e em 20 minutos eles estavam aqui. Em meio à dor, foi um alívio ter alguém competente cuidando de tudo." },
];

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

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeTestimonials(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, closeTestimonials]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-5 overflow-y-auto"
      style={{ background: "rgba(20,25,55,.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) closeTestimonials(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="testiModalTitle"
    >
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
          Famílias atendidas pela AmaVidas em 2024 e 2025. Avaliações reais publicadas no Google e ReclameAqui.
        </p>

        <div className="grid gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="rounded-[14px] p-6 border border-[var(--line)]"
              style={{ background: "var(--bg-alt)" }}
            >
              <div className="text-yellow-400 text-base mb-3 tracking-[-1px]">{"★".repeat(t.stars)}</div>
              <blockquote className="text-[18px] leading-relaxed mb-4 text-[var(--ink)] m-0" style={{ fontFamily: "var(--serif)" }}>
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} grid place-items-center font-medium flex-shrink-0`}
                  style={{ fontFamily: "var(--serif)", fontSize: "17px" }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-[15px] text-[var(--ink)]">{t.name}</div>
                  <div className="text-[13px] text-[var(--ink-mute)]">{t.city} · {t.date}</div>
                </div>
              </div>
            </div>
          ))}
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
