"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Fase = "quiz" | "calculando" | "lead" | "resultado" | "confirmado";

interface Respostas {
  paraQuem: string;
  quantidadePessoas: string;
  faixaEtaria: string;
  prioridade: string;
  orcamento: string;
}

interface PlanoInfo {
  slug: string;
  nome: string;
  preco: number;
  cobertura: number;
  tagline: string;
  beneficios: string[];
}

// ─── Fallback (caso a API falhe) ──────────────────────────────────────────────
const FALLBACK: Record<string, PlanoInfo> = {
  "cuidar-plus": {
    slug: "cuidar-plus",
    nome: "Cuidar Plus",
    preco: 35,
    cobertura: 2100,
    tagline: "Proteção acessível para você ou um familiar próximo",
    beneficios: [
      "Assistência funeral completa",
      "Urna e ornamentação",
      "Translado local",
      "Atendimento 24 horas",
    ],
  },
  "amar-plus": {
    slug: "amar-plus",
    nome: "Amar Plus",
    preco: 43,
    cobertura: 2500,
    tagline: "O equilíbrio certo entre proteção e valor para toda a família",
    beneficios: [
      "Assistência funeral completa",
      "Translado nacional",
      "Atendimento 24 horas prioritário",
      "Cônjuge e filhos incluídos",
    ],
  },
  "vida-plus": {
    slug: "vida-plus",
    nome: "Vida Plus",
    preco: 90,
    cobertura: 3500,
    tagline: "A cobertura mais completa para famílias maiores",
    beneficios: [
      "Assistência funeral premium",
      "Translado nacional e internacional",
      "Família ampliada (até 6 pessoas)",
      "Atendimento VIP 24 horas",
    ],
  },
};

// ─── Algoritmo de recomendação ────────────────────────────────────────────────
function recomendarSlug(r: Respostas): string {
  if (r.quantidadePessoas === "5+") return "vida-plus";
  if (r.faixaEtaria === "70+") return "vida-plus";
  if (r.prioridade === "melhor_cobertura") return "vida-plus";
  if (r.orcamento === "acima-70") return "vida-plus";

  if (r.orcamento === "ate-40") return "cuidar-plus";
  if (
    (r.quantidadePessoas === "1" || r.quantidadePessoas === "2") &&
    r.prioridade === "menor_preco"
  )
    return "cuidar-plus";

  return "amar-plus";
}

// ─── Perguntas ────────────────────────────────────────────────────────────────
interface Opcao {
  value: string;
  emoji: string;
  label: string;
}

interface Pergunta {
  campo: keyof Respostas;
  texto: string | ((r: Partial<Respostas>) => string);
  opcoes: Opcao[] | ((r: Partial<Respostas>) => Opcao[]);
  mensagemEmpatica: string | ((r: Partial<Respostas>) => string);
}

const PERGUNTAS: Pergunta[] = [
  {
    campo: "paraQuem",
    texto: "Você está buscando proteção para quem?",
    mensagemEmpatica: "Que decisão importante. Vamos encontrar o plano certo para você.",
    opcoes: [
      { value: "so_eu", emoji: "🙋", label: "Só para mim" },
      { value: "conjuge", emoji: "👫", label: "Para mim e meu cônjuge" },
      { value: "familia", emoji: "👨‍👩‍👧‍👦", label: "Para minha família (filhos incluídos)" },
      { value: "pais", emoji: "👴", label: "Para meus pais ou familiares idosos" },
    ],
  },
  {
    campo: "quantidadePessoas",
    texto: "Quantas pessoas você quer proteger no total?",
    mensagemEmpatica: (r) => {
      if (r.paraQuem === "familia") return "Sua família segura é a sua maior tranquilidade. Quantos vocês são?";
      if (r.paraQuem === "pais") return "Cuidar de quem sempre cuidou de você é um ato de amor. Quantos vamos proteger?";
      return "Ótimo. Proteger quem mais importa.";
    },
    opcoes: (r) => {
      const baseOpcoes = [
        { value: "1", emoji: "1️⃣", label: "1 pessoa" },
        { value: "2", emoji: "2️⃣", label: "2 pessoas" },
        { value: "3-4", emoji: "👨‍👩‍👧", label: "3 a 4 pessoas" },
        { value: "5+", emoji: "👪", label: "5 ou mais pessoas" },
      ];
      if (r.paraQuem === "familia") {
        return baseOpcoes.filter(o => o.value !== "1");
      }
      return baseOpcoes;
    },
  },
  {
    campo: "faixaEtaria",
    texto: (r) => {
      if (r.paraQuem === "so_eu") return "Qual é a sua idade?";
      if (r.paraQuem === "conjuge") return "Qual é a idade da pessoa mais velha entre vocês?";
      if (r.paraQuem === "pais") return "Qual é a idade do seu familiar mais velho?";
      return "Qual é a idade da pessoa mais velha que será incluída?";
    },
    mensagemEmpatica: "Entendido. Isso nos ajuda a indicar a melhor proteção.",
    opcoes: [
      { value: "ate-40", emoji: "🌱", label: "Até 40 anos" },
      { value: "41-59", emoji: "🌿", label: "Entre 41 e 59 anos" },
      { value: "60-70", emoji: "🍃", label: "Entre 60 e 70 anos" },
      { value: "70+", emoji: "🌳", label: "Acima de 70 anos" },
    ],
  },
  {
    campo: "prioridade",
    texto: "Na hora de escolher, o que pesa mais para você?",
    mensagemEmpatica: "Perfeito. Já temos quase tudo que precisamos.",
    opcoes: [
      { value: "menor_preco", emoji: "💰", label: "Pagar o menor valor possível" },
      { value: "equilibrio", emoji: "⚖️", label: "Equilíbrio entre preço e proteção" },
      { value: "melhor_cobertura", emoji: "🏆", label: "A melhor proteção, sem abrir mão da qualidade" },
    ],
  },
  {
    campo: "orcamento",
    texto: (r) => {
      if (r.paraQuem === "so_eu") return "Quanto você pode investir por mês na sua proteção?";
      if (r.paraQuem === "conjuge") return "Quanto vocês podem investir por mês na proteção do casal?";
      if (r.paraQuem === "pais") return "Quanto você pode investir por mês na proteção dos seus familiares?";
      return "Quanto você pode investir por mês na proteção da sua família?";
    },
    mensagemEmpatica: "Pronto! Calculando o melhor plano para você…",
    opcoes: [
      { value: "ate-40", emoji: "", label: "Até R$ 40,00 por mês" },
      { value: "40-70", emoji: "", label: "Entre R$ 40,00 e R$ 70,00 por mês" },
      { value: "acima-70", emoji: "", label: "Acima de R$ 70,00 por mês" },
      { value: "nao_sei", emoji: "", label: "Não sei, quero uma indicação" },
    ],
  },
];

const CALCULANDO_STEPS = [
  "Analisando perfil familiar...",
  "Buscando coberturas compatíveis...",
  "Calculando melhor custo-benefício...",
  "Gerando sua recomendação personalizada..."
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mascaraTelefone(v: string): string {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length === 0) return "";
  if (n.length <= 2) return `(${n}`;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

function fmtReais(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

// ─── Animações ────────────────────────────────────────────────────────────────
const fadeSlide = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: "easeIn" as const } },
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Simulador({ onClose }: { onClose?: () => void }) {
  const [fase, setFase] = useState<Fase>("quiz");
  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<Partial<Respostas>>({});
  const [mensagemEmpatica, setMensagemEmpatica] = useState<string | null>(null);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<string | null>(null);
  const [planoSlug, setPlanoSlug] = useState("amar-plus");
  const [planos, setPlanos] = useState<Record<string, PlanoInfo>>(FALLBACK);
  const [whatsapp, setWhatsapp] = useState("5511999999999");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/planos")
      .then((r) => r.json())
      .then((data) => {
        if (data.planos?.length) {
          const mapa: Record<string, PlanoInfo> = {};
          for (const p of data.planos) {
            mapa[p.slug] = {
              slug: p.slug,
              nome: p.nome,
              preco: p.preco,
              cobertura: p.cobertura ?? 0,
              tagline: p.tagline,
              beneficios: (p.beneficios as string[]).slice(0, 4),
            };
          }
          setPlanos((prev) => ({ ...prev, ...mapa }));
        }
      })
      .catch(() => {});

    fetch("/api/configuracoes")
      .then((r) => r.json())
      .then((data) => {
        if (data.configs?.whatsapp) setWhatsapp(data.configs.whatsapp);
      })
      .catch(() => {});

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Animando os passos de cálculo
  useEffect(() => {
    if (fase === "calculando") {
      setLoadingStep(0);
      const t1 = setTimeout(() => setLoadingStep(1), 500);
      const t2 = setTimeout(() => setLoadingStep(2), 1000);
      const t3 = setTimeout(() => setLoadingStep(3), 1500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [fase]);

  const perguntasAtivas = useMemo(() => {
    return PERGUNTAS.filter((p) => {
      if (p.campo === "quantidadePessoas") {
        if (respostas.paraQuem === "so_eu" || respostas.paraQuem === "conjuge") {
          return false;
        }
      }
      return true;
    });
  }, [respostas.paraQuem]);

  const perguntaAtual = perguntasAtivas[passo];
  const planoAtual = planos[planoSlug] ?? FALLBACK["amar-plus"];

  const obterTexto = (p: Pergunta) => {
    if (!p) return "";
    return typeof p.texto === "function" ? p.texto(respostas) : p.texto;
  };

  const obterMensagemEmpatica = (p: Pergunta) => {
    if (!p) return "";
    return typeof p.mensagemEmpatica === "function"
      ? p.mensagemEmpatica(respostas)
      : p.mensagemEmpatica;
  };

  const obterOpcoes = (p: Pergunta) => {
    if (!p) return [];
    return typeof p.opcoes === "function" ? p.opcoes(respostas) : p.opcoes;
  };

  function responder(valor: string) {
    if (opcaoSelecionada) return;

    const novasRespostas = { ...respostas, [perguntaAtual.campo]: valor };
    
    // Auto-preenchimento para perguntas que serão puladas
    if (perguntaAtual.campo === "paraQuem") {
      if (valor === "so_eu") {
        novasRespostas.quantidadePessoas = "1";
      } else if (valor === "conjuge") {
        novasRespostas.quantidadePessoas = "2";
      }
    }

    setRespostas(novasRespostas);
    setOpcaoSelecionada(valor);
    setMensagemEmpatica(obterMensagemEmpatica(perguntaAtual));

    // Determina as perguntas ativas com base nas respostas atualizadas
    const ativasDepois = PERGUNTAS.filter((p) => {
      if (p.campo === "quantidadePessoas") {
        if (novasRespostas.paraQuem === "so_eu" || novasRespostas.paraQuem === "conjuge") {
          return false;
        }
      }
      return true;
    });

    const indexAtual = ativasDepois.findIndex((p) => p.campo === perguntaAtual.campo);
    const isUltima = indexAtual === ativasDepois.length - 1;

    timerRef.current = setTimeout(() => {
      setMensagemEmpatica(null);
      setOpcaoSelecionada(null);

      if (isUltima) {
        const slug = recomendarSlug(novasRespostas as Respostas);
        setPlanoSlug(slug);
        setFase("calculando");
        timerRef.current = setTimeout(() => setFase("lead"), 2000);
      } else {
        setPasso(indexAtual + 1);
      }
    }, 1500);
  }

  function voltar() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMensagemEmpatica(null);
    setOpcaoSelecionada(null);
    if (passo === 0) {
      if (onClose) onClose();
    } else {
      setPasso((p) => p - 1);
    }
  }

  // Envia lead e revela o plano
  async function enviarLead(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) { setErro("Por favor, informe seu nome."); return; }
    if (telefone.replace(/\D/g, "").length < 10) { setErro("Por favor, informe um telefone válido."); return; }

    setEnviando(true);
    try {
      await fetch("/api/simulacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          telefone,
          email: "",
          paraQuem: respostas.paraQuem ?? "",
          quantidadePessoas: respostas.quantidadePessoas ?? "",
          faixaEtaria: respostas.faixaEtaria ?? "",
          prioridade: respostas.prioridade ?? "",
          orcamento: respostas.orcamento ?? "",
          planoRecomendado: planoSlug,
        }),
      }).catch(() => {});

      fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "simulacao_iniciada" }),
      }).catch(() => {});

      setFase("resultado");
    } finally {
      setEnviando(false);
    }
  }

  function abrirWhatsApp() {
    const msg = encodeURIComponent(
      `Olá! Fiz a simulação no site da AmaVidas e o plano indicado para mim foi o *${planoAtual.nome}* (R$ ${planoAtual.preco}/mês). Gostaria de saber mais.`
    );
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
    setFase("confirmado");
  }

  function linkWhatsAppDireto() {
    const msg = encodeURIComponent(
      `Olá! Gostaria de falar com um atendente da AmaVidas sobre os planos disponíveis.`
    );
    return `https://wa.me/${whatsapp}?text=${msg}`;
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <AnimatePresence mode="wait">

        {/* ── Quiz ── */}
        {fase === "quiz" && (
          <motion.div
            key={`quiz-${passo}`}
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Progresso com design premium */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--royal)]">
                  {perguntaAtual.campo === "paraQuem" || perguntaAtual.campo === "quantidadePessoas"
                    ? "Fase 1: Perfil Familiar"
                    : perguntaAtual.campo === "faixaEtaria"
                    ? "Fase 2: Faixas de Idade"
                    : "Fase 3: Suas Preferências"}
                </span>
                <span className="text-sm font-semibold text-[var(--ink-soft)]">
                  Pergunta {passo + 1} de {perguntasAtivas.length}
                </span>
              </div>
              <div className="relative w-full h-2 bg-[var(--bg-alt)] border border-[var(--line)] rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--royal) 0%, var(--magenta) 100%)" }}
                  animate={{ width: `${((passo + 1) / perguntasAtivas.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Pergunta */}
            <p className="text-xl font-bold mb-6.5 leading-snug text-[var(--ink)] text-serif">
              {obterTexto(perguntaAtual)}
            </p>

            {/* Opções interativas */}
            <div className="space-y-2.5 mb-6.5">
              {obterOpcoes(perguntaAtual).map((opcao) => {
                const selecionada = opcaoSelecionada === opcao.value;
                return (
                  <button
                    key={opcao.value}
                    onClick={() => responder(opcao.value)}
                    disabled={!!opcaoSelecionada}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl border text-left transition-all min-h-[62px] text-[15px] font-semibold cursor-pointer ${
                      selecionada
                        ? "border-[var(--magenta)] bg-[var(--magenta-soft)]/45 text-[var(--ink)] shadow-sm"
                        : opcaoSelecionada
                        ? "border-[var(--line)] bg-[var(--bg-alt)]/50 text-[var(--ink-mute)] opacity-40 cursor-default"
                        : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--royal)]/60 hover:bg-[var(--royal-soft)]/20 active:scale-[0.99] shadow-sm hover:shadow"
                    }`}
                  >
                    {/* Container do Emoji */}
                    {opcao.emoji && (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all ${
                        selecionada 
                          ? "bg-white text-white shadow-sm border border-[var(--magenta)]/20" 
                          : "bg-[var(--bg-alt)] border border-[var(--line)]"
                      }`}>
                        {opcao.emoji}
                      </div>
                    )}
                    
                    <span className="flex-1 leading-snug">{opcao.label}</span>
                    
                    {/* Botão de Rádio customizado no final */}
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                      selecionada
                        ? "border-[var(--magenta)] bg-[var(--magenta)]"
                        : "border-[var(--line-strong)] bg-white"
                    }`}>
                      {selecionada && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mensagem empática estilizada */}
            <AnimatePresence>
              {mensagemEmpatica && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[var(--royal-soft)]/75 border border-[var(--royal)]/10 rounded-2xl px-5 py-3.5 mb-5 flex items-center justify-center gap-2.5"
                >
                  <span className="text-lg">💡</span>
                  <p className="text-[14px] text-[var(--royal-deep)] font-semibold text-center leading-normal">
                    {mensagemEmpatica}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voltar */}
            {!(passo === 0 && !onClose) && (
              <button
                onClick={voltar}
                disabled={!!opcaoSelecionada}
                className="flex items-center gap-1.5 text-[14px] font-bold text-[var(--ink-mute)] hover:text-[var(--royal)] transition-colors disabled:opacity-30 mt-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                {passo === 0 ? "Fechar simulador" : "Voltar à pergunta anterior"}
              </button>
            )}
          </motion.div>
        )}

        {/* ── Calculando ── */}
        {fase === "calculando" && (
          <motion.div
            key="calculando"
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col py-6"
          >
            <div className="flex flex-col items-center justify-center mb-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--royal-soft)] flex items-center justify-center mb-4 relative shadow-sm border border-[var(--royal)]/15">
                <div className="absolute inset-0 rounded-2xl border-2 border-[var(--royal)] border-t-transparent animate-spin" />
                <svg className="w-6 h-6 text-[var(--royal)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[var(--ink)] text-serif">Analisando suas respostas...</h4>
              <p className="text-sm text-[var(--ink-soft)] mt-1">Nossa inteligência está cruzando os melhores benefícios para você.</p>
            </div>

            {/* Checklist sequencial animado */}
            <div className="bg-[var(--bg-alt)] border border-[var(--line)] rounded-2xl p-5 space-y-4 max-w-sm mx-auto w-full shadow-inner">
              {CALCULANDO_STEPS.map((stepText, idx) => {
                const isCompleted = loadingStep > idx;
                const isActive = loadingStep === idx;
                return (
                  <div key={idx} className="flex items-center gap-3.5 transition-all duration-300">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                      ) : isActive ? (
                        <div className="w-6 h-6 rounded-full border-2 border-[var(--royal)] border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-[var(--line-strong)] bg-white" />
                      )}
                    </div>
                    <span className={`text-[14px] font-semibold transition-colors duration-300 ${
                      isCompleted ? "text-[var(--ink-soft)] line-through opacity-70" : isActive ? "text-[var(--royal)] font-bold" : "text-[var(--ink-mute)]"
                    }`}>
                      {stepText}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Lead Gate: Coleta Nome + WhatsApp ── */}
        {fase === "lead" && (
          <motion.div
            key="lead"
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Título */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--magenta-soft)] text-[12px] font-bold uppercase tracking-wider text-[var(--magenta)] border border-[var(--magenta)]/15 shadow-sm">
                  ✨ Quase lá!
                </span>
              </div>
              <h3 className="text-xl font-bold leading-tight text-[var(--ink)] text-serif">
                Seu plano personalizado está pronto!
              </h3>
              <p className="text-sm text-[var(--ink-soft)] mt-1.5 leading-relaxed max-w-sm mx-auto">
                Para revelar qual plano a nossa plataforma calculou para seu perfil familiar, insira seu contato abaixo.
              </p>
            </div>

            {/* Preview desbloqueável sob vidro */}
            <div className="relative mb-6 rounded-2xl overflow-hidden border border-[var(--line-strong)] bg-gradient-to-br from-white to-[var(--bg-alt)] shadow-sm">
              <div className="blur-[5px] select-none pointer-events-none px-6 py-4.5 flex justify-between items-center bg-white/50">
                <div className="text-left">
                  <p className="text-[11px] font-bold text-[var(--ink-mute)] uppercase tracking-wider">Plano Ideal</p>
                  <p className="text-lg font-bold text-[var(--ink)] mt-0.5">Plano Indicado</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-[var(--ink-mute)] uppercase tracking-wider">Valor Estimado</p>
                  <p className="text-2xl font-bold text-[var(--royal)] mt-0.5">R$ XX,XX/mês</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                <div className="flex items-center gap-2 bg-white/95 border border-[var(--magenta)]/20 shadow-md px-4 py-2 rounded-full transform hover:scale-105 transition-transform duration-200">
                  <svg className="w-4 h-4 text-[var(--magenta)] flex-shrink-0 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span className="text-[12px] font-bold text-[var(--ink)]">Preencha abaixo para desbloquear</span>
                </div>
              </div>
            </div>

            {/* Formulário com ícones internos */}
            <form onSubmit={enviarLead} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5 pl-0.5">
                  Seu Nome Completo
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--ink-mute)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Maria da Silva"
                    className="w-full pl-11 pr-4 py-3.5 text-base border border-[var(--line-strong)] rounded-xl focus:border-[var(--royal)] focus:ring-4 focus:ring-[var(--royal-soft)]/50 focus:outline-none transition-all bg-white text-[var(--ink)] placeholder-[var(--ink-mute)]/50 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5 pl-0.5">
                  Seu WhatsApp
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--ink-mute)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.62214C2.25 5.6149 3.0649 4.8 4.07214 4.8H6.55171C7.14725 4.8 7.68305 5.17646 7.88298 5.7388L8.85735 8.48784C9.03457 8.98629 8.89531 9.54477 8.5029 9.89736L6.96781 11.2789C7.96205 13.2505 9.59371 14.8821 11.5653 15.8764L12.9469 14.3413C13.2995 13.9489 13.858 13.8097 14.3564 13.9869L17.1054 14.9613C17.6678 15.1612 18.0442 15.697 18.0442 16.2926V18.7721C18.0442 19.7794 17.2293 20.6042 16.2221 20.6042H15.2215C8.06208 20.6042 2.25 14.7922 2.25 7.63273V6.62214Z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full pl-11 pr-4 py-3.5 text-base border border-[var(--line-strong)] rounded-xl focus:border-[var(--royal)] focus:ring-4 focus:ring-[var(--royal-soft)]/50 focus:outline-none transition-all bg-white text-[var(--ink)] placeholder-[var(--ink-mute)]/50 font-medium"
                  />
                </div>
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[14px] font-semibold flex items-center gap-2">
                  <span>⚠️</span> {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[var(--magenta)] hover:bg-[var(--magenta)]/95 hover:shadow-lg active:scale-[0.99] text-white text-[14px] sm:text-base font-bold py-4 px-4 sm:px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 min-h-[56px] disabled:opacity-60 cursor-pointer whitespace-nowrap"
              >
                {enviando ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processando...
                  </>
                ) : (
                  <>
                    Desbloquear Plano Recomendado
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>

              <p className="text-[12px] text-[var(--ink-mute)] text-center">
                🔒 Seus dados estão seguros de acordo com a LGPD. Sem spam.
              </p>
            </form>
          </motion.div>
        )}

        {/* ── Resultado: Plano Revelado ── */}
        {fase === "resultado" && (
          <motion.div
            key="resultado"
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Payoff Header */}
            <div className="text-center mb-5">
              <div className="flex justify-center mb-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-green-50 text-[12px] font-bold uppercase tracking-wider text-green-700 border border-green-200 shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Plano Calculado com Sucesso!
                </span>
              </div>
              <h3 className="text-2xl font-bold leading-tight text-[var(--ink)] text-serif">
                Sua recomendação ideal
              </h3>
            </div>

            {/* Resumo das Respostas para validação */}
            <div className="bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl px-4 py-2.5 mb-5 text-[13px] flex flex-wrap gap-x-4 gap-y-1.5 items-center justify-center shadow-inner">
              <span className="text-[var(--ink-soft)] font-medium">
                <strong>Para:</strong> {
                  respostas.paraQuem === "so_eu" ? "Apenas você" :
                  respostas.paraQuem === "conjuge" ? "Você e Cônjuge" :
                  respostas.paraQuem === "familia" ? "Família" : "Pais ou Idosos"
                }
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--line-strong)]" />
              <span className="text-[var(--ink-soft)] font-medium">
                <strong>Pessoas:</strong> {respostas.quantidadePessoas === "5+" ? "5 ou mais" : respostas.quantidadePessoas}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--line-strong)]" />
              <span className="text-[var(--ink-soft)] font-medium">
                <strong>Prioridade:</strong> {
                  respostas.prioridade === "menor_preco" ? "Menor Preço" :
                  respostas.prioridade === "equilibrio" ? "Custo-Benefício" : "Melhor Cobertura"
                }
              </span>
            </div>

            {/* Card do Plano Redesenhado */}
            <div className="bg-white border-2 border-[var(--magenta)] rounded-[20px] shadow-md overflow-hidden mb-6 relative">
              <div className="bg-gradient-to-r from-[var(--magenta)] to-[var(--magenta)]/90 text-white text-center py-2 px-4 text-[12px] font-extrabold uppercase tracking-widest shadow-sm">
                ⭐ PLANO SUGERIDO SOB MEDIDA
              </div>
              
              <div className="text-center p-6 bg-gradient-to-b from-[var(--magenta-soft)]/20 to-transparent border-b border-[var(--line)]">
                <h4 className="text-2xl font-bold text-[var(--ink)]">{planoAtual.nome}</h4>
                <p className="text-[13px] text-[var(--ink-soft)] max-w-xs mx-auto mt-1 leading-normal">
                  {planoAtual.tagline}
                </p>
                <div className="flex items-baseline justify-center gap-1 mt-4">
                  <span className="text-sm font-semibold text-[var(--ink-soft)]">R$</span>
                  <span className="text-5xl font-black tracking-tight text-[var(--ink)]">{Math.floor(planoAtual.preco)}</span>
                  <span className="text-lg font-bold text-[var(--ink-soft)]">,{String((planoAtual.preco % 1).toFixed(2)).split(".")[1]}</span>
                  <span className="text-xs text-[var(--ink-mute)] font-semibold ml-1">/mês</span>
                </div>
              </div>

              <div className="p-6 bg-white space-y-3">
                {planoAtual.beneficios.map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-0.5 border border-green-200">
                      <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-[14px] text-[var(--ink-soft)] font-medium leading-tight">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={abrirWhatsApp}
                className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-[14px] sm:text-base font-bold py-4 px-4 sm:px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-0 min-h-[54px] cursor-pointer animate-whatsapp-pulse whitespace-nowrap"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contatar Consultor no WhatsApp
              </button>

              <a
                href={linkWhatsAppDireto()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-[var(--line-strong)] text-[var(--ink-soft)] hover:border-[var(--royal)] hover:text-[var(--royal)] text-[14px] font-bold py-3.5 rounded-xl transition-all min-h-[50px] bg-white hover:shadow-sm"
              >
                Falar com consultor agora por ligação
              </a>
            </div>
          </motion.div>
        )}

        {/* ── Confirmado ── */}
        {fase === "confirmado" && (
          <motion.div
            key="confirmado"
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center py-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 border border-green-200 shadow-sm"
            >
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </motion.div>

            <p className="text-2xl font-bold mb-3 text-[var(--ink)] text-serif">
              Tudo certo{nome ? `, ${nome.split(" ")[0]}` : ""}! 🎉
            </p>
            
            <p className="text-[15px] text-[var(--ink-soft)] leading-relaxed mb-6">
              Um consultor da AmaVidas entrará em contato com você em breve via WhatsApp para tirar qualquer dúvida e finalizar seu plano.
            </p>

            <div className="bg-[var(--royal-soft)]/50 border border-[var(--royal)]/10 rounded-2xl p-5 mb-6 text-left shadow-inner">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--royal)] mb-1">Seu plano recomendado</p>
              <p className="text-xl font-bold text-[var(--ink)]">{planoAtual.nome}</p>
              <p className="text-[14px] text-[var(--ink-soft)] mt-0.5">
                Preço: R$ {planoAtual.preco}/mês
              </p>
            </div>

            {onClose ? (
              <button
                onClick={onClose}
                className="text-[15px] font-bold text-[var(--royal)] hover:underline cursor-pointer"
              >
                Fechar janela
              </button>
            ) : (
              <p className="text-[14px] text-[var(--ink-mute)]">
                Enquanto isso, você pode{" "}
                <a href="/" className="text-[var(--royal)] font-bold hover:underline">
                  voltar à página inicial
                </a>.
              </p>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
