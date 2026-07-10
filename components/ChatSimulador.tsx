"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/contexts/ConfigContext";
import { Send, CheckCircle2 } from "lucide-react";
import Image from "next/image";

// ─── Tipos ────────────────────────────────────────────────────────────────────
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
    texto: "Olá! Sou a assistente virtual da AmaVidas. 💙\n\nVocê está buscando proteção para quem?",
    mensagemEmpatica: "Que decisão importante. Vamos encontrar o plano certo para você.",
    opcoes: [
      { value: "so_eu", emoji: "🙋", label: "Só para mim" },
      { value: "conjuge", emoji: "👫", label: "Para mim e meu cônjuge" },
      { value: "familia", emoji: "👨‍👩‍👧‍👦", label: "Para minha família (filhos incluídos)" },
      { value: "pais", emoji: "👴", label: "Para meus pais ou familiares" },
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
        return baseOpcoes.filter((o) => o.value !== "1");
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
      { value: "menor_preco", emoji: "💰", label: "Pagar o menor valor" },
      { value: "equilibrio", emoji: "⚖️", label: "Custo x benefício" },
      { value: "melhor_cobertura", emoji: "🏆", label: "A melhor cobertura" },
    ],
  },
  {
    campo: "orcamento",
    texto: "Quanto você pode investir por mês?",
    mensagemEmpatica: "Excelente. Buscando as melhores opções dentro do planejado.",
    opcoes: [
      { value: "ate-40", emoji: "🟢", label: "Até R$ 40,00 por mês" },
      { value: "40-70", emoji: "🔵", label: "Entre R$ 40,00 e R$ 70,00" },
      { value: "acima-70", emoji: "🟣", label: "Acima de R$ 70,00 por mês" },
      { value: "nao_sei", emoji: "🟡", label: "Quero uma indicação" },
    ],
  },
  {
    campo: "intencao",
    texto: "Como podemos te ajudar agora?",
    mensagemEmpatica: "Maravilhoso. Estamos aqui para ajudar no seu ritmo.",
    opcoes: [
      { value: "contratar_agora", emoji: "⚡", label: "Quero contratar o quanto antes" },
      { value: "entender_melhor", emoji: "🤔", label: "Quero entender melhor antes de decidir" },
      { value: "pesquisando", emoji: "🔍", label: "Só estou pesquisando" },
    ],
  },
];

function mascaraTelefone(v: string): string {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length === 0) return "";
  if (n.length <= 2) return `(${n}`;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

interface MensagemChat {
  id: string;
  role: "bot" | "user";
  tipo: "texto" | "digitando" | "resultado" | "opcoes" | "contato_form";
  conteudo?: string;
  opcoes?: Opcao[];
  campoContexto?: keyof Respostas;
  planoRecomendado?: PlanoInfo;
}

export default function ChatSimulador() {
  const { configs } = useConfig();
  const whatsapp = configs.whatsapp || "5561985825621";

  const [respostas, setRespostas] = useState<Partial<Respostas>>({});
  const [planos, setPlanos] = useState<Record<string, PlanoInfo>>(FALLBACK);
  const [sessionId, setSessionId] = useState("");
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [passo, setPasso] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Inputs para o formulário de contato final
  const [nomeContato, setNomeContato] = useState("");
  const [telefoneContato, setTelefoneContato] = useState("");
  const [consentimentoContato, setConsentimentoContato] = useState(true);
  const [erroContato, setErroContato] = useState("");
  const [submetendo, setSubmetendo] = useState(false);

  // Cidade Custom
  const [cidadeOutros, setCidadeOutros] = useState("");
  const [mostrarInputCidade, setMostrarInputCidade] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rolagem automática
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens]);

  // Inicializar sessionId
  useEffect(() => {
    let sId = sessionStorage.getItem("amavidas_session_id");
    if (!sId) {
      sId = "sess_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("amavidas_session_id", sId);
    }
    setSessionId(sId);
  }, []);

  // Carregar planos e iniciar chat
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

    // Iniciar a primeira pergunta
    adicionarPergunta(0, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const perguntasAtivas = useMemo(() => {
    return PERGUNTAS.filter((p) => {
      if (p.campo === "quantidadePessoas" && respostas.paraQuem === "so_eu") return false;
      return true;
    });
  }, [respostas.paraQuem]);

  const obterTexto = (p: Pergunta, r: Partial<Respostas>) => typeof p.texto === "function" ? p.texto(r) : p.texto;
  const obterEmpatia = (p: Pergunta, r: Partial<Respostas>) => typeof p.mensagemEmpatica === "function" ? p.mensagemEmpatica(r) : p.mensagemEmpatica;
  const obterOpcoes = (p: Pergunta, r: Partial<Respostas>) => typeof p.opcoes === "function" ? p.opcoes(r) : p.opcoes;

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

  function setTyping(ativar: boolean) {
    if (ativar) {
      setMensagens((prev) => [...prev.filter((m) => m.tipo !== "digitando"), { id: "typing", role: "bot", tipo: "digitando" }]);
    } else {
      setMensagens((prev) => prev.filter((m) => m.tipo !== "digitando"));
    }
  }

  function adicionarPergunta(index: number, currentResp: Partial<Respostas>) {
    const ativas = PERGUNTAS.filter((p) => {
      if (p.campo === "quantidadePessoas" && currentResp.paraQuem === "so_eu") return false;
      return true;
    });

    const pergunta = ativas[index];
    if (!pergunta) return;

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const opcoes = obterOpcoes(pergunta, currentResp);

      setMensagens((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "bot", tipo: "texto", conteudo: obterTexto(pergunta, currentResp) },
      ]);

      if (opcoes && opcoes.length > 0) {
        setMensagens((prev) => [
          ...prev,
          { id: Date.now().toString() + "_opt", role: "bot", tipo: "opcoes", opcoes, campoContexto: pergunta.campo },
        ]);
      }
    }, 800);
  }

  async function handleRespostaUser(valorReal: string, labelExibicao: string) {
    // Se escolheu 'Outros' no campo cidade, ativa input
    if (valorReal === "outros" && perguntasAtivas[passo].campo === "cidade") {
      setMostrarInputCidade(true);
      setMensagens((prev) => prev.filter((m) => m.tipo !== "opcoes"));
      return;
    }

    setMostrarInputCidade(false);

    // Adiciona resposta do usuário ao chat
    setMensagens((prev) =>
      prev.filter((m) => m.tipo !== "opcoes").concat([
        { id: Date.now().toString(), role: "user", tipo: "texto", conteudo: labelExibicao },
      ])
    );

    const perguntaAtual = perguntasAtivas[passo];
    
    let valorFinal = valorReal;
    if (perguntaAtual.campo === "cidade") {
      if (valorReal === "aguas_lindas") valorFinal = "Águas Lindas de Goiás";
      if (valorReal === "brasilia") valorFinal = "Brasília";
      if (valorReal === "entorno") valorFinal = "Cidades do Entorno";
    }

    const novasRespostas = { ...respostas, [perguntaAtual.campo]: valorFinal };

    if (perguntaAtual.campo === "paraQuem" && valorReal === "so_eu") {
      novasRespostas.quantidadePessoas = "1";
    }

    setRespostas(novasRespostas);

    // Rastrear abandono
    const indexAtualNoQuiz = perguntasAtivas.findIndex((p) => p.campo === perguntaAtual.campo);
    const etapaNumero = indexAtualNoQuiz + 1;
    trackAbandono(etapaNumero, novasRespostas);

    const isUltima = indexAtualNoQuiz === perguntasAtivas.length - 1;

    // Mensagem de empatia
    const empatia = obterEmpatia(perguntaAtual, novasRespostas);
    if (empatia) {
      setTyping(true);
      await new Promise((r) => setTimeout(r, 800));
      setTyping(false);
      setMensagens((prev) => [...prev, { id: Date.now().toString() + "_emp", role: "bot", tipo: "texto", conteudo: empatia }]);
    }

    if (isUltima) {
      // Registrar etapa 8 como contato pendente e exibir formulário
      trackAbandono(8, novasRespostas);
      setTyping(true);
      await new Promise((r) => setTimeout(r, 800));
      setTyping(false);
      setMensagens((prev) => [
        ...prev,
        { id: "contato_texto", role: "bot", tipo: "texto", conteudo: "Perfeito! Para finalizar a sua simulação e descobrir o seu plano ideal, insira os dados de contato abaixo:" },
        { id: "contato_form", role: "bot", tipo: "contato_form" },
      ]);
    } else {
      setPasso(indexAtualNoQuiz + 1);
      adicionarPergunta(indexAtualNoQuiz + 1, novasRespostas);
    }
  }

  function handleInputCidadeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cidadeOutros.trim()) return;
    handleRespostaUser(cidadeOutros.trim(), `🗺️ ${cidadeOutros.trim()}`);
    setCidadeOutros("");
  }

  async function handleContatoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErroContato("");

    const nomeTrim = nomeContato.trim();
    if (nomeTrim.length < 3 || !/[a-zA-Z]/.test(nomeTrim)) {
      setErroContato("Insira seu nome completo (mínimo de 3 caracteres e deve conter letras).");
      return;
    }

    const telLimpo = telefoneContato.replace(/\D/g, "");
    if (telLimpo.length !== 10 && telLimpo.length !== 11) {
      setErroContato("Insira um número de telefone com DDD válido.");
      return;
    }

    const todosIguais = /^(\d)\1+$/.test(telLimpo);
    if (todosIguais) {
      setErroContato("Telefone inválido.");
      return;
    }

    if (!consentimentoContato) {
      setErroContato("Você precisa autorizar o contato para concluir a simulação.");
      return;
    }

    setSubmetendo(true);

    const slugRecomendado = recomendarSlug(respostas);

    try {
      const payload = {
        ...respostas,
        nome: nomeTrim,
        telefone: telefoneContato.trim(),
        consentimento: true,
        intencao: respostas.intencao || "pesquisando",
        planoRecomendado: slugRecomendado,
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

      // Pixel lead event
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead");
      }

      // Disparar simulacao iniciada eventos
      fetch("/api/eventos", { method: "POST", body: JSON.stringify({ tipo: "simulacao_iniciada" }) }).catch(() => {});

      setIsFinished(true);

      // Remover o formulário e exibir resultado
      setMensagens((prev) => prev.filter((m) => m.tipo !== "contato_form"));

      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const plano = planos[slugRecomendado] ?? FALLBACK["amar-plus"];
        setMensagens((prev) => [
          ...prev,
          { id: "final_success", role: "bot", tipo: "texto", conteudo: `Obrigado, ${nomeTrim.split(" ")[0]}! Aqui está a recomendação de plano ideal para o seu perfil:` },
          { id: "final_result", role: "bot", tipo: "resultado", planoRecomendado: plano },
        ]);
      }, 2000);

    } catch (err: any) {
      setErroContato(err.message || "Não foi possível concluir. Tente novamente.");
    } finally {
      setSubmetendo(false);
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#F0F2F5] relative overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-[#008ba3] text-white px-4 py-3.5 flex items-center gap-3 shadow-md z-10">
        <div className="relative w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/20 shadow-inner">
          <Image src="/icon.png" alt="AmaVidas" width={28} height={28} className="object-contain" />
        </div>
        <div>
          <h1 className="font-extrabold text-[16px] leading-tight tracking-tight">AmaVidas</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Atendente Virtual</p>
          </div>
        </div>
      </header>

      {/* Message Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: "radial-gradient(circle at 10% 20%, rgba(216, 241, 230, 0.46) 0.1%, rgba(233, 226, 226, 0.28) 90.1%)",
          backgroundSize: "cover",
        }}
      >
        <AnimatePresence initial={false}>
          {mensagens.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "bot" ? "justify-start" : "justify-end"}`}
            >
              {msg.role === "bot" && msg.tipo !== "opcoes" && (
                <div className="w-8 h-8 rounded-full bg-white mr-2 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 mt-1 shadow-sm">
                  <Image src="/icon.png" alt="AmaVidas" width={20} height={20} />
                </div>
              )}

              <div className={`max-w-[85%] ${msg.tipo === "opcoes" ? "w-full pl-10" : ""}`}>
                {msg.tipo === "texto" && (
                  <div
                    className={`p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap font-medium ${
                      msg.role === "bot"
                        ? "bg-white text-slate-800 rounded-tl-sm border border-slate-100"
                        : "bg-[#DCF8C6] text-slate-900 rounded-tr-sm"
                    }`}
                  >
                    {msg.conteudo}
                  </div>
                )}

                {msg.tipo === "digitando" && (
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm inline-flex items-center gap-1.5 border border-slate-100 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#008ba3]/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#008ba3]/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#008ba3] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}

                {msg.tipo === "opcoes" && msg.opcoes && (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {msg.opcoes.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleRespostaUser(opt.value, `${opt.emoji} ${opt.label}`)}
                        className="bg-white border border-slate-200 text-[#008ba3] hover:bg-slate-50 px-4 py-2.5 rounded-full text-xs font-extrabold shadow-sm active:scale-[0.97] transition-all flex items-center gap-2 cursor-pointer border-b-2 border-b-slate-300"
                      >
                        {opt.emoji && <span className="text-sm">{opt.emoji}</span>}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {msg.tipo === "contato_form" && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-md mt-2 w-full max-w-sm flex flex-col gap-4">
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">📋 Seus Dados de Contato</h3>
                    
                    <form onSubmit={handleContatoSubmit} className="space-y-4">
                      {erroContato && (
                        <p className="text-[11px] font-bold text-red-650 bg-red-50 border border-red-100 p-2.5 rounded-xl leading-relaxed">
                          ⚠️ {erroContato}
                        </p>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nome Completo</label>
                        <input
                          type="text"
                          required
                          value={nomeContato}
                          onChange={(e) => setNomeContato(e.target.value)}
                          placeholder="Digite seu nome..."
                          className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl text-slate-800 text-xs font-semibold border border-slate-200 focus:outline-none focus:border-[#00B4C8]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">WhatsApp</label>
                        <input
                          type="tel"
                          required
                          value={telefoneContato}
                          onChange={(e) => setTelefoneContato(mascaraTelefone(e.target.value))}
                          placeholder="(00) 90000-0000"
                          className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl text-slate-800 text-xs font-semibold border border-slate-200 focus:outline-none focus:border-[#00B4C8]"
                        />
                      </div>

                      <label className="flex items-start gap-2.5 select-none cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={consentimentoContato}
                          onChange={(e) => setConsentimentoContato(e.target.checked)}
                          className="w-4 h-4 rounded text-[#008ba3] border-slate-300 focus:ring-[#00B4C8] mt-0.5"
                        />
                        <span className="text-[10px] text-slate-500 font-semibold leading-normal">
                          Autorizo a equipe AmaVidas a entrar em contato via WhatsApp ou ligação telefônica para apresentar a cotação.
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={submetendo}
                        className="w-full bg-[#008ba3] hover:bg-[#00768b] disabled:opacity-50 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-md transition-colors cursor-pointer text-center uppercase tracking-wider border-b-4 border-b-[#006072]"
                      >
                        {submetendo ? "Processando..." : "Ver meu plano recomendado ➔"}
                      </button>
                    </form>
                  </div>
                )}

                {msg.tipo === "resultado" && msg.planoRecomendado && (
                  <div className="bg-white border-2 border-[#2B3DA8] rounded-3xl overflow-hidden shadow-xl mt-2 w-full max-w-sm">
                    <div className="bg-gradient-to-r from-[#2B3DA8] to-[#008ba3] p-5 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Plano Indicado
                      </p>
                      <h3 className="font-extrabold text-2xl mt-1 tracking-tight">{msg.planoRecomendado.nome}</h3>
                    </div>
                    <div className="p-5">
                      <div className="mb-4">
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Mensalidade</span>
                        <div className="flex items-end gap-1 mt-0.5">
                          <span className="text-3xl font-black text-slate-900 leading-none">
                            R$ {msg.planoRecomendado.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-slate-500 text-xs font-semibold mb-0.5">/mês</span>
                        </div>
                      </div>

                      <div className="space-y-2.5 mb-6 pt-2 border-t border-slate-100">
                        {msg.planoRecomendado.beneficios.map((b, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-slate-650 font-medium leading-relaxed">
                            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✔</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>

                      <a
                        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                          `Olá! Realizei a simulação conversacional no site da AmaVidas e o meu plano recomendado foi o *${msg.planoRecomendado.nome}*. Gostaria de mais informações.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-center uppercase tracking-wider border-b-4 border-b-green-700"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                        </svg>
                        Falar com Consultor no WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={chatRef} />
        </AnimatePresence>
      </div>

      {/* Input area for custom city if "outros" was selected */}
      {mostrarInputCidade && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-3.5 border-t border-slate-200 z-10 shadow-lg">
          <form onSubmit={handleInputCidadeSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Digite o nome de outra cidade..."
              value={cidadeOutros}
              onChange={(e) => setCidadeOutros(e.target.value)}
              className="flex-1 bg-slate-100 px-4 py-3 rounded-full text-slate-800 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B4C8]"
              autoFocus
            />
            <button
              type="submit"
              disabled={!cidadeOutros.trim()}
              className="w-12 h-12 bg-[#008ba3] hover:bg-[#00768b] text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:bg-slate-350 transition-colors shadow-sm cursor-pointer"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
