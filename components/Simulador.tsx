"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/contexts/ConfigContext";
import { trackLeadConversion, trackWhatsAppClick } from "@/lib/analytics";

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
  tipoPet?: string;
  nomePet?: string;
  portePet?: string;
  idadePet?: string;
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
  "plano-pet": {
    slug: "plano-pet",
    nome: "Plano Pet",
    preco: 25,
    cobertura: 1500,
    tagline: "Proteção e dignidade para o seu companheiro de estimação nos momentos difíceis",
    beneficios: [
      "Cobertura para 1 animal de estimação",
      "Deslocamento até o memorial",
      "Sala de velório para despedida",
      "Embalagem protetora ecológica",
    ],
  },
};

function recomendarSlug(r: Partial<Respostas>): string {
  if (r.paraQuem === "pet") return "plano-pet";
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
      { value: "so_eu", emoji: "👤", label: "Individual (uma pessoa)" },
      { value: "familia", emoji: "👨‍👩‍👧‍👦", label: "Familiar" },
      { value: "familia_pet", emoji: "🐾", label: "Familiar e pet" },
      { value: "pet", emoji: "🐶", label: "Pet" },
      { value: "terceiros", emoji: "🤝", label: "Para terceiros" },
    ],
  },
  {
    campo: "quantidadePessoas",
    texto: "Quantas pessoas você quer proteger no total?",
    mensagemEmpatica: (r) => {
      if (r.paraQuem === "familia" || r.paraQuem === "familia_pet") return "Sua família segura é a sua maior tranquilidade. Quantos vocês são?";
      if (r.paraQuem === "terceiros" || r.paraQuem === "pais") return "Cuidar de quem é importante para você é um ato de carinho. Quantos vamos proteger?";
      return "Ótimo. Proteger quem mais importa.";
    },
    opcoes: (r) => {
      const baseOpcoes = [
        { value: "1", emoji: "1️⃣", label: "1 pessoa (só eu)" },
        { value: "2", emoji: "2️⃣", label: "2 pessoas" },
        { value: "3-4", emoji: "👨‍👩‍👧", label: "3 a 4 pessoas" },
        { value: "5+", emoji: "👪", label: "5 ou mais pessoas" },
      ];
      if (r.paraQuem === "familia" || r.paraQuem === "familia_pet") {
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
    campo: "tipoPet",
    texto: "Seu pet é um cão ou um gato?",
    mensagemEmpatica: "Que carinho especial! Nossos amiguinhos trazem tanta alegria para nossa vida.",
    opcoes: [
      { value: "cao", emoji: "🐶", label: "Cão" },
      { value: "gato", emoji: "🐱", label: "Gato" },
    ],
  },
  {
    campo: "nomePet",
    texto: "Qual é o nome do seu pet?",
    mensagemEmpatica: "Lindo nome! Vamos cuidar muito bem dele(a).",
    opcoes: null,
  },
  {
    campo: "portePet",
    texto: (r) => (r.tipoPet === "gato" ? "Qual o porte do seu gato?" : "Qual o porte do seu cão?"),
    mensagemEmpatica: "Entendido! O Plano Pet atende animais de todos os portes com todo o cuidado.",
    opcoes: [
      { value: "pequeno", emoji: "🐕", label: "Pequeno (até 10kg)" },
      { value: "medio", emoji: "🦮", label: "Médio (10kg a 25kg)" },
      { value: "grande", emoji: "🐕‍🦺", label: "Grande (acima de 25kg)" },
    ],
  },
  {
    campo: "idadePet",
    texto: "Qual a idade do seu pet?",
    mensagemEmpatica: "Excelente! É muito importante garantir proteção e carinho em todas as fases da vida.",
    opcoes: [
      { value: "filhote", emoji: "🐾", label: "Filhote (até 1 ano)" },
      { value: "adulto", emoji: "🐕", label: "Adulto (1 a 7 anos)" },
      { value: "idoso", emoji: "🦴", label: "Idoso (acima de 7 anos)" },
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
  const [nomePetInput, setNomePetInput] = useState("");

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
      const isPetPlan = respostas.paraQuem === "pet";
      const isPetRelacionado = respostas.paraQuem === "pet" || respostas.paraQuem === "familia_pet";

      if (isPetPlan) {
        if (p.campo === "quantidadePessoas" || p.campo === "faixaEtaria" || p.campo === "prioridade" || p.campo === "orcamento") {
          return false;
        }
      }
      if (respostas.paraQuem === "so_eu" && p.campo === "quantidadePessoas") {
        return false;
      }
      if (!isPetRelacionado) {
        if (p.campo === "tipoPet" || p.campo === "nomePet" || p.campo === "portePet" || p.campo === "idadePet") {
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
    const origemSalva = typeof window !== "undefined" ? sessionStorage.getItem("amavidas_origem") : null;
    const origem = origemSalva ? JSON.parse(origemSalva) : {};
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
          ...origem,
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
    
    if (perguntaAtual.campo === "paraQuem" && (valor === "so_eu" || valor === "pet")) {
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

  function confirmarNomePet() {
    if (!nomePetInput.trim() || opcaoSelecionada) return;

    const novasRespostas = { ...respostas, nomePet: nomePetInput.trim() };
    setRespostas(novasRespostas);
    setOpcaoSelecionada(nomePetInput.trim());
    setMensagemEmpatica(obterMensagemEmpatica(perguntaAtual));

    const indexAtualNoQuiz = perguntasAtivas.findIndex((p) => p.campo === "nomePet");
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
      const origemSalva = typeof window !== "undefined" ? sessionStorage.getItem("amavidas_origem") : null;
      const origem = origemSalva ? JSON.parse(origemSalva) : {};

      const payload = {
        ...respostas,
        nome: nome.trim(),
        telefone: telefone.trim(),
        consentimento: true,
        intencao: respostas.intencao || "pesquisando",
        planoRecomendado: planoSlug,
        cidade: respostas.cidade || "Não informada",
        sessionId,
        ...origem,
        origem: "simulador",
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

      // Disparar conversão Google Ads e Meta Ads
      trackLeadConversion({
        plano: planoSlug,
        valor: planoAtual?.preco || 0,
        googleAdsId: configs.google_ads_id,
        googleAdsConversionLabel: configs.google_ads_conversion_label,
      });

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
    
    trackWhatsAppClick({
      origem: "simulador_resultado",
      googleAdsId: configs.google_ads_id,
      googleAdsWaLabel: configs.google_ads_wa_label,
    });

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

        {/* ── Introdução (Estilo nimbuu-ui-ux) ── */}
        {fase === "introducao" && (
          <motion.div
            key="introducao"
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center py-4"
          >
            <div className="mb-6 relative w-20 h-20 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-200 shadow-sm">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-2xl font-extrabold mb-3 text-slate-900 leading-tight">
              Descubra o plano ideal para sua família
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-8 max-w-xs mx-auto">
              Cotação rápida e sob medida para proteger quem você ama em instantes. 7 perguntas rápidas, sem compromisso.
            </p>
            <button
              onClick={() => {
                setFase("quiz");
                setPasso(0);
              }}
              className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-base font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Começar agora</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* ── Quiz (Perguntas 1 a 7 com Estilo nimbuu-ui-ux) ── */}
        {fase === "quiz" && (
          <motion.div
            key={`quiz-${perguntaAtual?.campo}`}
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-left"
          >
            {/* Barra de Progresso */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-700">
                  {perguntaAtual.campo === "paraQuem" || perguntaAtual.campo === "quantidadePessoas"
                    ? "Fase 1: Perfil familiar"
                    : perguntaAtual.campo === "faixaEtaria" || perguntaAtual.campo === "cidade"
                    ? "Fase 2: Detalhes"
                    : "Fase 3: Preferências"}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Pergunta {passo + 1} de {perguntasAtivas.length}
                </span>
              </div>
              <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full rounded-full bg-emerald-600"
                  animate={{ width: `${((passo + 1) / perguntasAtivas.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Pergunta */}
            <p className="text-xl font-extrabold mb-6 leading-snug text-slate-900">
              {obterTexto(perguntaAtual)}
            </p>

            {/* Opções (Touch target mínimo 48px, contraste garantido) */}
            {obterOpcoes(perguntaAtual) !== null ? (
              mostrarInputCidade ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    required
                    value={cidadeOutros}
                    onChange={(e) => setCidadeOutros(e.target.value)}
                    placeholder="Digite o nome da sua cidade"
                    className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all bg-white text-slate-900 font-medium text-base"
                    onKeyDown={(e) => { if (e.key === "Enter" && cidadeOutros.trim()) confirmarCidadeOutros(); }}
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setMostrarInputCidade(false);
                        setOpcaoSelecionada(null);
                      }}
                      className="h-12 px-5 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      disabled={!cidadeOutros.trim()}
                      onClick={confirmarCidadeOutros}
                      className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-base font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      Confirmar cidade
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {obterOpcoes(perguntaAtual)!.map((opcao) => {
                    const selecionada = opcaoSelecionada === opcao.value;
                    return (
                      <button
                        key={opcao.value}
                        onClick={() => responder(opcao.value)}
                        disabled={!!opcaoSelecionada}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all min-h-[52px] text-base font-semibold cursor-pointer ${
                          selecionada
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20 font-bold shadow-sm"
                            : opcaoSelecionada
                            ? "border-slate-200 bg-slate-50 text-slate-400 opacity-40 cursor-default"
                            : "border-slate-300 bg-white text-slate-900 hover:border-emerald-600/60 hover:bg-emerald-50/40 active:scale-[0.99] shadow-sm"
                        }`}
                      >
                        {opcao.emoji && (
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 transition-all ${
                            selecionada 
                              ? "bg-white shadow-sm border border-emerald-200" 
                              : "bg-slate-100 border border-slate-200"
                          }`}>
                            {opcao.emoji}
                          </div>
                        )}
                        <span className="flex-1 leading-snug">{opcao.label}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                          selecionada ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"
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
            ) : (
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  required
                  value={nomePetInput}
                  onChange={(e) => setNomePetInput(e.target.value)}
                  placeholder="Digite o nome do seu pet (ex: Thor, Mel)..."
                  className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all bg-white text-slate-900 font-medium text-base"
                  onKeyDown={(e) => { if (e.key === "Enter" && nomePetInput.trim()) confirmarNomePet(); }}
                  autoFocus
                />
                <button
                  disabled={!nomePetInput.trim()}
                  onClick={confirmarNomePet}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-base font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Continuar</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            )}

            {/* Mensagem Empática */}
            <AnimatePresence>
              {mensagemEmpatica && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5 flex items-center justify-center gap-2.5"
                >
                  <span className="text-lg">💡</span>
                  <p className="text-sm text-emerald-900 font-semibold text-center leading-normal">
                    {mensagemEmpatica}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voltar */}
            <button
              onClick={voltar}
              disabled={!!opcaoSelecionada}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors disabled:opacity-30 mt-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span>Voltar</span>
            </button>
          </motion.div>
        )}
        {fase === "contato" && (
          <motion.div
            key="contato"
            variants={fadeSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-left"
          >
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-[12px] font-bold text-emerald-800 border border-emerald-200 shadow-sm mb-3">
                ✨ Simulação concluída!
              </span>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                Para onde enviamos seu resultado?
              </h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-normal max-w-xs mx-auto">
                Insira seus dados para ver a cotação recomendada sem compromisso.
              </p>
            </div>

            <form onSubmit={submeterContato} className="space-y-4 mb-5">
              {/* Campo 1: Nome Completo (Label acima do input - PUI) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="simulador-nome" className="text-sm font-bold text-slate-800">
                  Nome completo <span className="text-emerald-600">*</span>
                </label>
                <input
                  id="simulador-nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                  autoComplete="name"
                  className="h-12 w-full px-4 border border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all bg-white text-slate-900 font-medium text-base"
                />
              </div>

              {/* Campo 2: WhatsApp (Label acima do input - PUI) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="simulador-tel" className="text-sm font-bold text-slate-800">
                  Seu WhatsApp com DDD <span className="text-emerald-600">*</span>
                </label>
                <input
                  id="simulador-tel"
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                  placeholder="(61) 99999-9999"
                  autoComplete="tel"
                  className="h-12 w-full px-4 border border-slate-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none transition-all bg-white text-slate-900 font-mono text-base"
                />
              </div>

              {/* Consentimento transparente */}
              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-all">
                <input
                  type="checkbox"
                  required
                  checked={consentimento}
                  onChange={(e) => setConsentimento(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600 leading-snug">
                  Concordo em receber a cotação sem compromisso via WhatsApp.
                </span>
              </label>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm font-semibold flex items-center gap-2">
                  <span>⚠️</span> {erro}
                </div>
              )}

              {/* Botão de envio primário em Sentence case, target 52px */}
              <button
                type="submit"
                disabled={enviando}
                className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-base font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {enviando ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Processando simulação...</span>
                  </>
                ) : (
                  <>
                    <span>Ver meu plano recomendado</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">
                🔒 Seus dados estão seguros e protegidos pela AmaVidas.
              </p>
              <button
                onClick={voltar}
                className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
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
            className="flex flex-col py-6 text-center"
          >
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 relative border border-emerald-200">
                <div className="absolute inset-0 rounded-2xl border-2 border-emerald-600 border-t-transparent animate-spin" />
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900">Analisando suas respostas...</h4>
              <p className="text-sm text-slate-600 mt-1">Cruzando coberturas e benefícios ideais para você.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 max-w-sm mx-auto w-full text-left">
              {CALCULANDO_STEPS.map((stepText, idx) => {
                const isCompleted = loadingStep > idx;
                const isActive = loadingStep === idx;
                return (
                  <div key={idx} className="flex items-center gap-3.5">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                      ) : isActive ? (
                        <div className="w-6 h-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-300 bg-white" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isCompleted ? "text-slate-500 line-through" : isActive ? "text-emerald-700 font-bold" : "text-slate-400"
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
            className="text-left"
          >
            <div className="text-center mb-5">
              <div className="flex justify-center mb-3">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Cotação calculada com sucesso!
                </span>
              </div>
              <h3 className="text-2xl font-bold leading-tight text-slate-900">
                Seu plano recomendado
              </h3>
            </div>

            {/* Card do Plano Recomendado com nimbuu-ui-ux palette */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden mb-6 relative">
              <div className="bg-slate-900 text-white text-center py-2.5 px-4 text-xs font-bold tracking-tight border-b border-slate-800 flex items-center justify-center gap-2">
                <span className="text-emerald-400 font-bold">⭐</span>
                <span>Recomendação ideal para seu perfil</span>
              </div>
              
              <div className="text-center p-6 bg-slate-50 border-b border-slate-200">
                <h4 className="text-2xl font-extrabold text-slate-900">{planoAtual.nome}</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 leading-relaxed">
                  {planoAtual.tagline}
                </p>
                <div className="flex items-baseline justify-center gap-1 mt-4">
                  <span className="text-sm font-semibold text-slate-600">R$</span>
                  <span className="text-5xl font-extrabold tracking-tight text-slate-900">{Math.floor(planoAtual.preco)}</span>
                  <span className="text-lg font-bold text-slate-600">,{String((planoAtual.preco % 1).toFixed(2)).split(".")[1]}</span>
                  <span className="text-xs text-slate-500 font-medium ml-1">/mês</span>
                </div>
              </div>

              <div className="p-6 bg-white space-y-3">
                {planoAtual.beneficios.map((b) => (
                  <div key={b} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5 border border-emerald-200">
                      <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-700 font-medium leading-relaxed">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs com peso primário e alvos de 52px */}
            <div className="space-y-3">
              <button
                onClick={abrirWhatsApp}
                className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold h-13 px-6 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Falar com atendente no WhatsApp</span>
              </button>

              <a
                href={`tel:${(configs.telefone || configs.whatsapp || "5561985825621").replace(/\D/g, "")}`}
                className="w-full h-12 flex items-center justify-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold rounded-xl transition-all bg-white"
              >
                Falar por ligação telefônica
              </a>
            </div>
          </motion.div>
        )}ref={`tel:${(configs.telefone || configs.whatsapp || "5561985825621").replace(/\D/g, "")}`}
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
