"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/contexts/ConfigContext";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Fase = "introducao" | "quiz" | "contato" | "calculando" | "resultado" | "confirmado";

interface Respostas {
  paraQuem: string;
  quantidadePessoas: string;
  faixaEtaria: string;
  cidade: string;
  prioridade: string;
  orcamento: string;
  intencao: string;
  nome: string;
  telefone: string;
  consentimento: boolean;
}

interface PlanoInfo {
  slug: string;
  nome: string;
  preco: number;
  cobertura: number;
  tagline: string;
  beneficios: string[];
}

const FALLBACK: Record<string, PlanoInfo> = {
  "amar-plus": {
    slug: "amar-plus",
    nome: "Amar Plus",
    preco: 43,
    cobertura: 2500,
    tagline: "O equilíbrio certo entre proteção e valor para toda a família",
    beneficios: [
      "Urna (caixão) modelo padrão",
      "Ornamentação com flores naturais",
      "Translado 500 km rodados",
      "Necromaquiagem",
    ],
  },
  "vida-plus": {
    slug: "vida-plus",
    nome: "Vida Plus",
    preco: 90,
    cobertura: 3500,
    tagline: "A cobertura mais completa para famílias maiores",
    beneficios: [
      "Urna (caixão alto padrão)",
      "Ornamentação",
      "Traslado de até 1.000 km rodados",
      "Necromaquiagem",
    ],
  },
};

function recomendarSlug(r: Partial<Respostas>): string {
  if (r.quantidadePessoas === "5+") return "vida-plus";
  if (r.prioridade === "melhor_cobertura") return "vida-plus";
  if (r.orcamento === "acima-70") return "vida-plus";
  return "amar-plus";
}

interface Opcao {
  value: string;
  emoji: string;
  label: string;
}

interface Pergunta {
  campo: keyof Respostas;
  texto: string | ((r: Partial<Respostas>) => string);
  opcoes: Opcao[] | ((r: Partial<Respostas>) => Opcao[]) | null;
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
        { value: "1", emoji: "1️⃣", label: "1 pessoa (só eu)" },
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
    texto: "Qual a idade da pessoa mais velha que será incluída?",
    mensagemEmpatica: "Entendido. A idade é um fator importante para garantirmos a melhor assistência.",
    opcoes: [
      { value: "ate_40", emoji: "👶", label: "Até 40 anos" },
      { value: "41_59", emoji: "🧑", label: "Entre 41 e 59 anos" },
      { value: "60_70", emoji: "🧓", label: "Entre 60 e 70 anos" },
      { value: "acima_70", emoji: "👵", label: "Acima de 70 anos" },
    ],
  },
  {
    campo: "cidade",
    texto: "De qual cidade você é?",
    mensagemEmpatica: "Excelente! Atendemos com excelência na sua região.",
    opcoes: [
      { value: "aguas_lindas", emoji: "🏙️", label: "Águas Lindas de Goiás" },
      { value: "brasilia", emoji: "🏛️", label: "Brasília" },
      { value: "entorno", emoji: "📍", label: "Cidades do Entorno" },
      { value: "outros", emoji: "🗺️", label: "Outra cidade" },
    ],
  },
  {
    campo: "prioridade",
    texto: "O que pesa mais na sua escolha?",
    mensagemEmpatica: "Perfeito. Isso direciona as coberturas que fazem mais sentido para você.",
    opcoes: [
      { value: "menor_preco", emoji: "💰", label: "Pagar o menor valor possível" },
      { value: "equilibrio", emoji: "⚖️", label: "Equilíbrio entre preço e cobertura" },
      { value: "melhor_cobertura", emoji: "🏆", label: "A melhor cobertura, sem abrir mão de qualidade" },
    ],
  },
  {
    campo: "orcamento",
    texto: "Quanto você pode investir por mês?",
    mensagemEmpatica: "Excelente. Buscando as melhores opções dentro do planejado.",
    opcoes: [
      { value: "ate-40", emoji: "🟢", label: "Até R$ 40,00 por mês" },
      { value: "40-70", emoji: "🔵", label: "Entre R$ 40,00 e R$ 70,00 por mês" },
      { value: "acima-70", emoji: "🟣", label: "Acima de R$ 70,00 por mês" },
      { value: "nao_sei", emoji: "🟡", label: "Não sei, quero uma indicação" },
    ],
  },
  {
    campo: "intencao",
    texto: "Como podemos te ajudar agora?",
    mensagemEmpatica: "Maravilhoso. Estamos aqui para ajudar no seu ritmo.",
    opcoes: [
      { value: "contratar_agora", emoji: "⚡", label: "Quero contratar o quanto antes" },
      { value: "entender_melhor", emoji: "🤔", label: "Quero entender melhor antes de decidir" },
      { value: "pesquisando", emoji: "🔍", label: "Só estou pesquisando por enquanto" },
    ],
  },
];

const CALCULANDO_STEPS = [
  "Analisando perfil familiar...",
  "Buscando coberturas compatíveis...",
  "Calculando melhor custo-benefício...",
  "Gerando sua recomendação personalizada..."
];

function mascaraTelefone(v: string): string {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length === 0) return "";
  if (n.length <= 2) return `(${n}`;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

function validarNome(nome: string): boolean {
  const nomeTrim = nome.trim();
  if (nomeTrim.length < 3) return false;
  
  const temLetra = /[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/.test(nomeTrim);
  if (!temLetra) return false;

  const lowercase = nomeTrim.toLowerCase();
  const termosProibidos = [
    "pessoa", "pessoas", "so para mim", "so eu", "conjuge", "familia", "pais",
    "individual", "ate-50", "50-90", "90-120", "nao_sei", "nao sei",
    "aguas_lindas", "aguas lindas", "brasilia", "outros", "outra cidade",
    "visita", "ligacao", "whatsapp", "menor_preco", "menor preco", "equilibrio",
    "melhor_cobertura", "melhor cobertura", "contratar_agora", "contratar agora",
    "entender_melhor", "entender melhor", "pesquisando", "simulador",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"
  ];
  
  if (termosProibidos.includes(lowercase)) return false;
  if (/^\d+\s*pess/.test(lowercase)) return false;
  
  return true;
}

function validarTelefone(tel: string): boolean {
  const digitos = tel.replace(/\D/g, "");
  if (digitos.length !== 10 && digitos.length !== 11) return false;
  
  const todosIguais = /^(\d)\1+$/.test(digitos);
  if (todosIguais) return false;
  
  return true;
}

const fadeSlide = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: "easeIn" as const } },
};

export default function Simulador({ onClose }: { onClose?: () => void }) {
  const { configs } = useConfig();
  const whatsapp = configs.whatsapp || "5561985825621";
  
  const [fase, setFase] = useState<Fase>("introducao");
  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<Partial<Respostas>>({});
  const [sessionId, setSessionId] = useState("");
  
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [cidadeOutros, setCidadeOutros] = useState("");
  const [mostrarInputCidade, setMostrarInputCidade] = useState(false);

  const [opcaoSelecionada, setOpcaoSelecionada] = useState<string | null>(null);
  const [mensagemEmpatica, setMensagemEmpatica] = useState<string | null>(null);
  const [planoSlug, setPlanoSlug] = useState("amar-plus");
  const [planos, setPlanos] = useState<Record<string, PlanoInfo>>(FALLBACK);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inicializar sessionId
  useEffect(() => {
    let sId = sessionStorage.getItem("amavidas_session_id");
    if (!sId) {
      sId = "sess_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("amavidas_session_id", sId);
    }
    setSessionId(sId);
  }, []);

  // Carregar planos da API
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

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Controlar passos de calculando
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
        if (respostas.paraQuem === "so_eu") {
          return false;
        }
      }
      return true;
    });
  }, [respostas.paraQuem]);

  const perguntaAtual = perguntasAtivas[passo];
  const planoAtual = planos[planoSlug] ?? FALLBACK["amar-plus"];

  const trackAbandono = async (etapaIndex: number, respostasParciais: Partial<Respostas>) => {
    if (!sessionId) return;
    try {
      await fetch("/api/simulacao-incompleta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ultimaEtapa: etapaIndex,
          paraQuem: respostasParciais.paraQuem,
          quantidadePessoas: respostasParciais.quantidadePessoas,
          faixaEtaria: respostasParciais.faixaEtaria,
          cidade: respostasParciais.cidade === "outros" ? cidadeOutros : respostasParciais.cidade,
          prioridade: respostasParciais.prioridade,
          orcamento: respostasParciais.orcamento,
          intencao: respostasParciais.intencao,
        }),
      });
    } catch (err) {
      console.error("Erro ao registrar abandono:", err);
    }
  };

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

    if (perguntaAtual.campo === "cidade" && valor === "outros") {
      setMostrarInputCidade(true);
      return;
    }

    let valorFinal = valor;
    if (perguntaAtual.campo === "cidade") {
      if (valor === "aguas_lindas") valorFinal = "Águas Lindas de Goiás";
      if (valor === "brasilia") valorFinal = "Brasília";
      if (valor === "entorno") valorFinal = "Cidades do Entorno";
    }

    const novasRespostas = { ...respostas, [perguntaAtual.campo]: valorFinal };
    
    if (perguntaAtual.campo === "paraQuem" && valor === "so_eu") {
      novasRespostas.quantidadePessoas = "1";
    }

    setRespostas(novasRespostas);
    setOpcaoSelecionada(valor);
    setMensagemEmpatica(obterMensagemEmpatica(perguntaAtual));

    // Determina a etapa numérica (1 a 8) e rastreia o progresso
    const indexAtualNoQuiz = perguntasAtivas.findIndex((p) => p.campo === perguntaAtual.campo);
    const etapaNumero = indexAtualNoQuiz + 1;
    trackAbandono(etapaNumero, novasRespostas);

    const isUltima = indexAtualNoQuiz === perguntasAtivas.length - 1;
    const currentSlug = recomendarSlug(novasRespostas);

    timerRef.current = setTimeout(() => {
      setMensagemEmpatica(null);
      setOpcaoSelecionada(null);

      if (isUltima) {
        setPlanoSlug(currentSlug);
        setFase("contato");
        // Registrar etapa 8 como contato pendente
        trackAbandono(8, novasRespostas);
      } else {
        setPasso(indexAtualNoQuiz + 1);
      }
    }, 1300);
  }

  function confirmarCidadeOutros() {
    if (!cidadeOutros.trim() || opcaoSelecionada) return;
    setMostrarInputCidade(false);

    const novasRespostas = { ...respostas, cidade: cidadeOutros.trim() };
    setRespostas(novasRespostas);
    setOpcaoSelecionada(cidadeOutros.trim());
    setMensagemEmpatica(obterMensagemEmpatica(perguntaAtual));

    const indexAtualNoQuiz = perguntasAtivas.findIndex((p) => p.campo === "cidade");
    trackAbandono(indexAtualNoQuiz + 1, novasRespostas);

    const isUltima = indexAtualNoQuiz === perguntasAtivas.length - 1;
    const currentSlug = recomendarSlug(novasRespostas);

    timerRef.current = setTimeout(() => {
      setMensagemEmpatica(null);
      setOpcaoSelecionada(null);

      if (isUltima) {
        setPlanoSlug(currentSlug);
        setFase("contato");
        trackAbandono(8, novasRespostas);
      } else {
        setPasso(indexAtualNoQuiz + 1);
      }
    }, 1300);
  }

  async function submeterContato(e: React.FormEvent) {
    e.preventDefault();
    if (!validarNome(nome)) {
      setErro("Nome inválido. Insira pelo menos 3 caracteres e uma letra.");
      return;
    }
    if (!validarTelefone(telefone)) {
      setErro("Telefone inválido. Utilize o formato (00) 90000-0000.");
      return;
    }
    if (!consentimento) {
      setErro("É necessário autorizar o contato para prosseguir.");
      return;
    }

    setErro("");
    setEnviando(true);

    try {
      const payload = {
        ...respostas,
        nome: nome.trim(),
        telefone: telefone.trim(),
        consentimento: true,
        intencao: respostas.intencao || "pesquisando",
        planoRecomendado: planoSlug,
        cidade: respostas.cidade || "Não informada",
        sessionId,
      };

      const resp = await fetch("/api/simulacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Erro de rede.");
      }

      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead");
      }

      setFase("calculando");
      timerRef.current = setTimeout(() => {
        setFase("resultado");
      }, 2500);

    } catch (err: any) {
      setErro(err.message || "Conexão falhou. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function voltar() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMensagemEmpatica(null);
    setOpcaoSelecionada(null);
    setMostrarInputCidade(false);
    setErro("");

    if (fase === "contato") {
      setFase("quiz");
      setPasso(perguntasAtivas.length - 1);
    } else if (fase === "quiz") {
      if (passo === 0) {
        setFase("introducao");
      } else {
        setPasso((p) => p - 1);
      }
    }
  }

  function abrirWhatsApp() {
    const msg = encodeURIComponent(
      `Olá! Fiz a simulação no site da AmaVidas e o plano indicado para mim foi o *${planoAtual.nome}* (R$ ${planoAtual.preco}/mês). Gostaria de saber mais.`
    );
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
    
    // Dispara evento comercial no banco
    fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "whatsapp_clicado" }),
    }).catch(() => {});

    setFase("confirmado");
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <AnimatePresence mode="wait">

        {/* ── Introdução ── */}
        {fase === "introducao" && (
          <motion.div
            key="introducao"
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center py-4"
          >
            <div className="mb-6 relative w-20 h-20 mx-auto rounded-2xl bg-[var(--royal-soft)] flex items-center justify-center border border-[var(--royal)]/15 shadow-sm">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-2xl font-black mb-3 text-[var(--ink)] text-serif leading-tight">
              Descubra o plano ideal para sua família
            </h2>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed mb-8 max-w-xs mx-auto">
              Descubra em instantes a cobertura funerária sob medida para proteger quem você ama. São 7 perguntas rápidas. Sem compromisso.
            </p>
            <button
              onClick={() => {
                setFase("quiz");
                setPasso(0);
              }}
              className="w-full bg-[var(--royal)] hover:bg-[var(--royal)]/90 active:scale-[0.99] text-white text-[15px] font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              Começar agora
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* ── Quiz (Perguntas 1 a 7) ── */}
        {fase === "quiz" && (
          <motion.div
            key={`quiz-${perguntaAtual?.campo}`}
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Progresso */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--royal)]">
                  {perguntaAtual.campo === "paraQuem" || perguntaAtual.campo === "quantidadePessoas"
                    ? "Fase 1: Perfil Familiar"
                    : perguntaAtual.campo === "faixaEtaria" || perguntaAtual.campo === "cidade"
                    ? "Fase 2: Detalhes"
                    : "Fase 3: Preferências"}
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
            <p className="text-xl font-bold mb-6 leading-snug text-[var(--ink)] text-serif">
              {obterTexto(perguntaAtual)}
            </p>

            {/* Opções */}
            {obterOpcoes(perguntaAtual) !== null ? (
              mostrarInputCidade ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    required
                    value={cidadeOutros}
                    onChange={(e) => setCidadeOutros(e.target.value)}
                    placeholder="Digite o nome da sua cidade"
                    className="w-full px-5 py-4 border border-[var(--line-strong)] rounded-2xl focus:border-[var(--royal)] focus:ring-4 focus:ring-[var(--royal-soft)]/50 focus:outline-none transition-all bg-white text-[var(--ink)] placeholder-[var(--ink-mute)]/50 font-medium text-[15px]"
                    onKeyDown={(e) => { if (e.key === "Enter" && cidadeOutros.trim()) confirmarCidadeOutros(); }}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setMostrarInputCidade(false);
                        setOpcaoSelecionada(null);
                      }}
                      className="px-4 py-3 rounded-xl border border-[var(--line-strong)] text-[14px] font-bold text-[var(--ink-soft)] bg-white hover:bg-[var(--bg-alt)] cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      disabled={!cidadeOutros.trim()}
                      onClick={confirmarCidadeOutros}
                      className="flex-1 bg-[var(--royal)] hover:bg-[var(--royal)]/90 active:scale-[0.99] text-white text-[15px] font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      Confirmar Cidade
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 mb-6">
                  {obterOpcoes(perguntaAtual)!.map((opcao) => {
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
                        {opcao.emoji && (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all ${
                            selecionada 
                              ? "bg-white shadow-sm border border-[var(--magenta)]/20" 
                              : "bg-[var(--bg-alt)] border border-[var(--line)]"
                          }`}>
                            {opcao.emoji}
                          </div>
                        )}
                        <span className="flex-1 leading-snug">{opcao.label}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                          selecionada ? "border-[var(--magenta)] bg-[var(--magenta)]" : "border-[var(--line-strong)] bg-white"
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
              )
            ) : null}

            {/* Mensagem Empática */}
            <AnimatePresence>
              {mensagemEmpatica && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
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
            <button
              onClick={voltar}
              disabled={!!opcaoSelecionada}
              className="flex items-center gap-1.5 text-[14px] font-bold text-[var(--ink-mute)] hover:text-[var(--royal)] transition-colors disabled:opacity-30 mt-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Voltar
            </button>
          </motion.div>
        )}

        {/* ── Contato (Etapa 8 — Captura de Lead) ── */}
        {fase === "contato" && (
          <motion.div
            key="contato"
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--royal-soft)] text-[12px] font-bold uppercase tracking-wider text-[var(--royal)] border border-[var(--royal)]/15 shadow-sm mb-3">
                ✨ Simulação Concluída!
              </span>
              <h3 className="text-2xl font-black text-[var(--ink)] text-serif leading-tight">
                Para onde enviamos seu resultado?
              </h3>
              <p className="text-sm text-[var(--ink-soft)] mt-1.5 leading-normal max-w-xs mx-auto">
                Insira seus dados para ver o plano sugerido e receber o detalhamento completo sem compromisso.
              </p>
            </div>

            <form onSubmit={submeterContato} className="space-y-4 mb-5">
              <div>
                <label className="text-[11px] font-bold uppercase text-[var(--ink-soft)] tracking-wider block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Ana Maria Silva"
                  className="w-full px-4 py-3.5 border border-[var(--line-strong)] rounded-2xl focus:border-[var(--royal)] focus:ring-4 focus:ring-[var(--royal-soft)]/50 focus:outline-none transition-all bg-white text-[var(--ink)] placeholder-[var(--ink-mute)]/40 font-medium text-[15px]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-[var(--ink-soft)] tracking-wider block mb-1">Seu WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                  placeholder="Ex: (61) 99999-9999"
                  className="w-full px-4 py-3.5 border border-[var(--line-strong)] rounded-2xl focus:border-[var(--royal)] focus:ring-4 focus:ring-[var(--royal-soft)]/50 focus:outline-none transition-all bg-white text-[var(--ink)] placeholder-[var(--ink-mute)]/40 font-medium text-[15px]"
                />
              </div>

              <label className="flex items-start gap-3 p-3 bg-[var(--bg-alt)] border border-[var(--line)] rounded-2xl cursor-pointer hover:border-[var(--line-strong)] transition-all">
                <input
                  type="checkbox"
                  required
                  checked={consentimento}
                  onChange={(e) => setConsentimento(e.target.checked)}
                  className="w-5 h-5 rounded text-[var(--royal)] border-[var(--line-strong)] focus:ring-[var(--royal-soft)] mt-0.5 cursor-pointer"
                />
                <span className="text-[13px] font-semibold text-[var(--ink-soft)] leading-snug">
                  Autorizo a AmaVidas a entrar em contato comigo pelo WhatsApp.
                </span>
              </label>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-[14px] font-semibold flex items-center gap-2">
                  <span>⚠️</span> {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[var(--royal)] hover:bg-[var(--royal)]/95 hover:shadow-lg active:scale-[0.99] text-white text-[15px] font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 min-h-[56px] disabled:opacity-60 cursor-pointer"
              >
                {enviando ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processando simulação...
                  </>
                ) : (
                  <>
                    Ver Meu Plano Recomendado
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-[12px] text-[var(--ink-mute)] font-medium leading-relaxed mb-4">
                🔒 Seus dados ficam seguros. Apenas um atendente da AmaVidas entrará em contato, sem compromisso comercial.
              </p>
              <button
                onClick={voltar}
                className="text-[14px] font-bold text-[var(--ink-soft)] hover:text-[var(--royal)] transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Corrigir respostas anteriores
              </button>
            </div>
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
              <p className="text-sm text-[var(--ink-soft)] mt-1">Cruzando os melhores benefícios e custos para você.</p>
            </div>

            <div className="bg-[var(--bg-alt)] border border-[var(--line)] rounded-2xl p-5 space-y-4 max-w-sm mx-auto w-full shadow-inner">
              {CALCULANDO_STEPS.map((stepText, idx) => {
                const isCompleted = loadingStep > idx;
                const isActive = loadingStep === idx;
                return (
                  <div key={idx} className="flex items-center gap-3.5 transition-all duration-300">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-green-550 flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: "#22c55e" }}>
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
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

        {/* ── Resultado ── */}
        {fase === "resultado" && (
          <motion.div
            key="resultado"
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="text-center mb-5">
              <div className="flex justify-center mb-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-green-50 text-[12px] font-bold uppercase tracking-wider text-green-700 border border-green-200 shadow-sm animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Indicação Calculada com Sucesso!
                </span>
              </div>
              <h3 className="text-2xl font-bold leading-tight text-[var(--ink)] text-serif">
                Seu Plano Recomendado
              </h3>
            </div>

            <div className="bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl px-4 py-2.5 mb-5 text-[13px] flex flex-wrap gap-x-4 gap-y-1.5 items-center justify-center shadow-inner">
              <span className="text-[var(--ink-soft)] font-medium">
                <strong>Para:</strong> {
                  respostas.paraQuem === "so_eu" ? "Apenas você" :
                  respostas.paraQuem === "conjuge" ? "Casal" :
                  respostas.paraQuem === "familia" ? "Família" : "Pais ou Idosos"
                }
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--line-strong)]" />
              <span className="text-[var(--ink-soft)] font-medium">
                <strong>Vidas:</strong> {respostas.quantidadePessoas === "5+" ? "5 ou mais" : respostas.quantidadePessoas}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--line-strong)]" />
              <span className="text-[var(--ink-soft)] font-medium">
                <strong>Foco:</strong> {
                  respostas.prioridade === "menor_preco" ? "Menor Preço" :
                  respostas.prioridade === "equilibrio" ? "Custo-Benefício" : "Qualidade"
                }
              </span>
            </div>

            {/* Card do Plano */}
            <div className="bg-white border-2 border-[var(--magenta)] rounded-[20px] shadow-md overflow-hidden mb-6 relative">
              <div className="bg-gradient-to-r from-[var(--magenta)] to-[var(--magenta)]/90 text-white text-center py-2 px-4 text-[12px] font-extrabold uppercase tracking-widest shadow-sm">
                ⭐ RECOMENDAÇÃO IDEAL
              </div>
              
              <div className="text-center p-6 bg-gradient-to-b from-[var(--magenta-soft)]/20 to-transparent border-b border-[var(--line)]">
                <h4 className="text-2xl font-black text-[var(--ink)]">{planoAtual.nome}</h4>
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
                      <svg className="w-3.5 h-3.5 text-green-650" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" style={{ color: "#16a34a" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-[14px] text-[var(--ink-soft)] font-semibold leading-tight">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={abrirWhatsApp}
                className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-[15px] font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] min-h-[54px] cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Falar com Atendente no WhatsApp
              </button>

              <a
                href={`tel:${(configs.telefone || configs.whatsapp || "5561985825621").replace(/\D/g, "")}`}
                className="w-full flex items-center justify-center gap-2 border border-[var(--line-strong)] text-[var(--ink-soft)] hover:border-[var(--royal)] hover:text-[var(--royal)] text-[14px] font-bold py-3.5 rounded-xl transition-all min-h-[50px] bg-white hover:shadow-sm"
              >
                Falar por ligação telefônica
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
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 border border-green-200 shadow-sm">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>

            <p className="text-2xl font-bold mb-3 text-[var(--ink)] text-serif">
              Tudo certo{nome ? `, ${nome.split(" ")[0]}` : ""}! 🎉
            </p>
            
            <p className="text-[15px] text-[var(--ink-soft)] leading-relaxed mb-6">
              Um consultor da AmaVidas entrará em contato com você em breve via WhatsApp para tirar dúvidas e finalizar seu plano.
            </p>

            <div className="bg-[var(--royal-soft)]/50 border border-[var(--royal)]/10 rounded-2xl p-5 mb-6 text-left shadow-inner">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--royal)] mb-1">Plano Escolhido</p>
              <p className="text-xl font-bold text-[var(--ink)]">{planoAtual.nome}</p>
              <p className="text-[14px] text-[var(--ink-soft)] mt-0.5">
                Investimento mensal estimado: R$ {planoAtual.preco}/mês
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
