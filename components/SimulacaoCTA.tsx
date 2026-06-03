"use client";

import { useState } from "react";
import { useModal } from "@/contexts/ModalContext";

const QUESTIONS = [
  {
    q: "Quantas pessoas você quer proteger?",
    opts: ["Só eu", "2 a 4 pessoas", "5 ou mais"],
  },
  {
    q: "Qual cobertura você considera mais importante?",
    opts: ["Essencial", "Equilibrada", "Máxima"],
  },
  {
    q: "Como você prefere pagar?",
    opts: ["Mensal", "Anual com desconto", "Tanto faz"],
  },
];

const PRICES: Record<string, number> = { "Amar Plus": 43, "Vida Plus": 90 };

function getRec(answers: number[]): string {
  const score = answers.reduce((s, a) => s + a, 0);
  if (score >= 4) return "Vida Plus";
  return "Amar Plus";
}

export default function SimulacaoCTA() {
  const { openForm } = useModal();

  const [started, setStarted] = useState(false);
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null); // for highlight flash
  const [done, setDone]       = useState(false);
  const [rec, setRec]         = useState<string | null>(null);

  const handleOpt = (idx: number) => {
    if (selected !== null) return; // debounce during delay
    setSelected(idx);
    setTimeout(() => {
      const next = [...answers, idx];
      setAnswers(next);
      setSelected(null);
      if (step + 1 < QUESTIONS.length) {
        setStep(step + 1);
      } else {
        setRec(getRec(next));
        setDone(true);
      }
    }, 280);
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setDone(false);
    setRec(null);
    setStarted(true); // keep simulator open, restart questions
  };

  const totalDots = QUESTIONS.length + 1; // questions + result dot

  return (
    <section
      id="simulador"
      style={{ padding: "96px 0", background: "var(--bg)" }}
      className="max-[980px]:py-14"
    >
      <div className="max-w-[1400px] mx-auto px-5 min-[640px]:px-8 min-[1400px]:px-6">
        <div
          className="relative overflow-hidden rounded-[24px] text-center py-[72px] px-[56px] max-[980px]:py-12 max-[980px]:px-6"
          style={{
            background: "linear-gradient(135deg, var(--teal-soft) 0%, #fff 60%, var(--magenta-soft) 130%)",
            border: "1px solid var(--line)",
          }}
        >
          {/* CSS blob decorations */}
          <div
            className="absolute pointer-events-none"
            style={{ width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,180,200,.18), transparent)", top: -60, left: -60 }}
            aria-hidden="true"
          />
          <div
            className="absolute pointer-events-none"
            style={{ width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(196,51,106,.14), transparent)", bottom: -80, right: -80 }}
            aria-hidden="true"
          />

          {/* All content sits above blobs */}
          <div className="relative z-10">
            <p className="text-[14px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "var(--magenta)" }}>
              Não sabe qual escolher?
            </p>
            <h2 className="mt-3 mb-4 mx-auto" style={{ maxWidth: 720 }}>
              Descubra em 2 minutos qual plano é ideal para você
            </h2>
            <p className="text-[19px] mb-9 mx-auto max-[980px]:text-[16px]" style={{ maxWidth: 560, color: "var(--ink-soft)" }}>
              Três perguntas simples e nossa recomendação personalizada para o seu perfil familiar.
            </p>

            {!started && (
              <button
                onClick={() => setStarted(true)}
                className="h-[72px] px-10 rounded-[14px] font-semibold text-[21px] inline-flex items-center gap-2.5 transition-all max-[980px]:h-16 max-[980px]:text-[18px] max-[980px]:px-7"
                style={{ background: "var(--magenta)", color: "#fff" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#AE2A5C"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--magenta)"; }}
              >
                Começar simulação
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            )}

            {started && (
              <div
                className="mt-10 text-left rounded-[18px] p-8 max-[980px]:p-5"
                style={{ background: "#fff", boxShadow: "var(--shadow-md)", border: "1px solid var(--line)", maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}
              >
                {/* Progress bar (dots) */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: totalDots }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-sm transition-all duration-300"
                      style={{ background: i <= (done ? QUESTIONS.length : step) ? "var(--royal)" : "var(--line)" }}
                    />
                  ))}
                </div>

                {!done ? (
                  <>
                    <p
                      className="mb-5 max-[980px]:text-[20px]"
                      style={{ fontFamily: "var(--serif)", fontSize: "24px", fontWeight: 500 }}
                    >
                      {QUESTIONS[step].q}
                    </p>
                    <div
                      className="max-[980px]:grid-cols-1"
                      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}
                    >
                      {QUESTIONS[step].opts.map((opt, idx) => (
                        <button
                          key={opt}
                          onClick={() => handleOpt(idx)}
                          className="text-center rounded-xl py-[18px] px-4 font-medium text-[16px] transition-all max-[980px]:py-4"
                          style={{
                            border: "1.5px solid var(--line)",
                            background: selected === idx ? "var(--royal)" : "#fff",
                            color: selected === idx ? "#fff" : "var(--ink)",
                            borderColor: selected === idx ? "var(--royal)" : "var(--line)",
                          }}
                          onMouseEnter={(e) => {
                            if (selected !== idx) {
                              e.currentTarget.style.borderColor = "var(--royal)";
                              e.currentTarget.style.background = "var(--royal-soft)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selected !== idx) {
                              e.currentTarget.style.borderColor = "var(--line)";
                              e.currentTarget.style.background = "#fff";
                            }
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[14px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "var(--magenta)" }}>
                      Seu plano ideal
                    </p>
                    <h3
                      className="mb-2"
                      style={{ fontFamily: "var(--serif)", fontSize: "28px", fontWeight: 500 }}
                    >
                      O plano <span style={{ color: "var(--magenta)" }}>{rec}</span> é o ideal para você.
                    </h3>
                    <p className="mb-5 text-[17px]" style={{ color: "var(--ink-soft)" }}>
                      A partir de <strong style={{ color: "var(--ink)" }}>R$ {PRICES[rec!]}/mês</strong> · cobertura completa para sua família.
                    </p>
                    <div className="flex gap-2.5 justify-center flex-wrap">
                      <button
                        onClick={() => openForm(rec!)}
                        className="h-[56px] px-8 rounded-xl font-semibold text-[17px] transition-all"
                        style={{ background: "var(--magenta)", color: "#fff" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#AE2A5C"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--magenta)"; }}
                      >
                        Ver detalhes do plano
                      </button>
                      <button
                        onClick={reset}
                        className="h-[56px] px-8 rounded-xl font-semibold text-[17px] transition-all"
                        style={{ background: "transparent", color: "var(--ink)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-alt)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        Refazer simulação
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
