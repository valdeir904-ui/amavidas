"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfig } from "@/contexts/ConfigContext";
import { Send, UserCircle2 } from "lucide-react";
import Image from "next/image";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Respostas {
  paraQuem: string;
  quantidadePessoas: string;
  prioridade: string;
  orcamento: string;
  nome: string;
  telefone: string;
  cidade: string;
  comoContatar: string;
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

function recomendarSlug(r: Respostas): string {
  if (r.quantidadePessoas === "5+") return "vida-plus";
  if (r.prioridade === "melhor_cobertura") return "vida-plus";
  if (r.orcamento === "90-120") return "vida-plus";
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
      { value: "familia", emoji: "👨‍👩‍👧‍👦", label: "Para minha família" },
      { value: "pais", emoji: "👴", label: "Para meus pais" },
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
        { value: "5+", emoji: "👪", label: "5 ou mais" },
      ];
      if (r.paraQuem === "familia" || r.paraQuem === "conjuge") {
        return baseOpcoes.filter(o => o.value !== "1");
      }
      return baseOpcoes;
    },
  },
  {
    campo: "nome",
    texto: "Como posso te chamar? (Digite seu Nome Completo)",
    mensagemEmpatica: "Muito prazer! Vamos prosseguir.",
    opcoes: null,
  },
  {
    campo: "telefone",
    texto: "Qual é o seu WhatsApp de contato? (Prometo que não enviamos spam 😊)",
    mensagemEmpatica: "Perfeito! Isso ajudará a enviar os detalhes do plano.",
    opcoes: null,
  },
  {
    campo: "prioridade",
    texto: "Na hora de escolher, o que é mais importante para você?",
    mensagemEmpatica: "Perfeito. Já temos quase tudo que precisamos.",
    opcoes: [
      { value: "menor_preco", emoji: "💰", label: "Menor valor" },
      { value: "equilibrio", emoji: "⚖️", label: "Custo x benefício" },
      { value: "melhor_cobertura", emoji: "🏆", label: "Melhor cobertura" },
    ],
  },
  {
    campo: "orcamento",
    texto: (r) => {
      if (r.paraQuem === "so_eu") return "Quanto você pode investir por mês na sua proteção?";
      if (r.paraQuem === "conjuge") return "Quanto vocês podem investir por mês na proteção do casal?";
      if (r.paraQuem === "pais") return "Quanto você pode investir por mês na proteção dos familiares?";
      return "Quanto você pode investir por mês na proteção da família?";
    },
    mensagemEmpatica: "Excelente! Definindo as opções ideais...",
    opcoes: [
      { value: "ate-50", emoji: "🪙", label: "Até R$ 50" },
      { value: "50-90", emoji: "💵", label: "R$ 50 a R$ 90" },
      { value: "90-120", emoji: "💶", label: "R$ 90 a R$ 120" },
      { value: "nao_sei", emoji: "🤔", label: "Ainda não sei" },
    ],
  },
  {
    campo: "cidade",
    texto: "De qual cidade você é?",
    mensagemEmpatica: "Ótimo saber! Atendemos com excelência na sua região.",
    opcoes: [
      { value: "aguas_lindas", emoji: "🏙️", label: "Águas Lindas" },
      { value: "brasilia", emoji: "🏛️", label: "Brasília" },
      { value: "outros", emoji: "📍", label: "Outra Cidade" },
    ],
  },
  {
    campo: "comoContatar",
    texto: "Como você deseja ser contatado pelo nosso time comercial?",
    mensagemEmpatica: "Pronto! Quase lá...",
    opcoes: (r) => {
      const isAguasLindas = r.cidade && (
        r.cidade.toLowerCase().replace(/[\s_-]+/g, "") === "aguaslindas" || 
        r.cidade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_-]+/g, "").includes("aguaslindas")
      );
      const opts = [];
      if (isAguasLindas) {
        opts.push({ value: "visita", emoji: "🏠", label: "Visita presencial" });
      }
      opts.push({ value: "ligacao", emoji: "📞", label: "Ligação" });
      opts.push({ value: "whatsapp", emoji: "💬", label: "WhatsApp" });
      return opts;
    },
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
  tipo: "texto" | "digitando" | "resultado" | "opcoes";
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
  const [leadId, setLeadId] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [passo, setPasso] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // Inputs
  const [inputValue, setInputValue] = useState("");
  const [cidadeOutros, setCidadeOutros] = useState("");
  
  const chatRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rolagem automática
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens]);

  // Carregar planos da API
  useEffect(() => {
    fetch("/api/planos")
      .then((r) => r.json())
      .then((data) => {
        if (data.planos?.length) {
          const mapa: Record<string, PlanoInfo> = {};
          for (const p of data.planos) {
            mapa[p.slug] = p;
          }
          setPlanos((prev) => ({ ...prev, ...mapa }));
        }
      })
      .catch(() => {});
      
    // Iniciar o chat enviando a primeira mensagem
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

  function setTyping(ativar: boolean) {
    if (ativar) {
      setMensagens(prev => [...prev.filter(m => m.tipo !== "digitando"), { id: "typing", role: "bot", tipo: "digitando" }]);
    } else {
      setMensagens(prev => prev.filter(m => m.tipo !== "digitando"));
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
      
      setMensagens(prev => [
        ...prev,
        { id: Date.now().toString(), role: "bot", tipo: "texto", conteudo: obterTexto(pergunta, currentResp) }
      ]);

      if (opcoes && opcoes.length > 0) {
        // Mostrar as opções como bolhas
        setMensagens(prev => [
          ...prev,
          { id: Date.now().toString() + "_opt", role: "bot", tipo: "opcoes", opcoes, campoContexto: pergunta.campo }
        ]);
      }
    }, 1000);
  }

  async function handleRespostaUser(valorReal: string, labelExibicao: string) {
    // Adiciona resposta do usuário ao chat
    setMensagens(prev => prev.filter(m => m.tipo !== "opcoes").concat([
      { id: Date.now().toString(), role: "user", tipo: "texto", conteudo: labelExibicao }
    ]));

    const perguntaAtual = perguntasAtivas[passo];
    const novasRespostas = { ...respostas, [perguntaAtual.campo]: valorReal };
    
    // Auto fill
    if (perguntaAtual.campo === "paraQuem" && valorReal === "so_eu") {
      novasRespostas.quantidadePessoas = "1";
    }

    setRespostas(novasRespostas);
    setInputValue("");
    setCidadeOutros("");

    // Disparar criação/atualização de lead se precisar
    const campoAtual = perguntaAtual.campo;
    const currentSlug = recomendarSlug(novasRespostas as Respostas);

    if (campoAtual === "telefone") {
      try {
        const resp = await fetch("/api/simulacao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: (novasRespostas.nome || "").trim(),
            telefone: valorReal.trim(),
            email: "",
            paraQuem: novasRespostas.paraQuem ?? "",
            quantidadePessoas: novasRespostas.quantidadePessoas ?? "",
            prioridade: "",
            orcamento: "",
            planoRecomendado: "indefinido",
            cidade: "",
            comoContatar: "",
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.id) {
            setLeadId(data.id);
            if (typeof window !== "undefined" && (window as any).fbq) {
              (window as any).fbq("track", "Lead");
            }
          }
        }
      } catch (e) {}
    } else if (leadId) {
      let valorParaSalvar = valorReal;
      if (campoAtual === "cidade" && valorReal === "aguas_lindas") valorParaSalvar = "Águas Lindas";
      if (campoAtual === "cidade" && valorReal === "brasilia") valorParaSalvar = "Brasília";

      fetch("/api/simulacao", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          [campoAtual]: valorParaSalvar,
          planoRecomendado: currentSlug,
        }),
      }).catch(() => {});
    }

    // Mensagem de empatia (opcional)
    const empatia = obterEmpatia(perguntaAtual, novasRespostas);
    if (empatia) {
      setTyping(true);
      await new Promise(r => setTimeout(r, 800));
      setTyping(false);
      setMensagens(prev => [...prev, { id: Date.now().toString(), role: "bot", tipo: "texto", conteudo: empatia }]);
    }

    // Calcular proxima pergunta
    const ativasDepois = PERGUNTAS.filter((p) => {
      if (p.campo === "quantidadePessoas" && novasRespostas.paraQuem === "so_eu") return false;
      return true;
    });

    const indexAtual = ativasDepois.findIndex((p) => p.campo === campoAtual);
    const isUltima = indexAtual === ativasDepois.length - 1;

    if (isUltima) {
      finalizarChat(novasRespostas, currentSlug);
    } else {
      setPasso(indexAtual + 1);
      adicionarPergunta(indexAtual + 1, novasRespostas);
    }
  }

  async function finalizarChat(r: Partial<Respostas>, planoSlug: string) {
    setIsFinished(true);
    setTyping(true);
    
    // Atualiza evento simulacao_iniciada -> se não foi enviado ainda
    fetch("/api/eventos", { method: "POST", body: JSON.stringify({ tipo: "simulacao_iniciada" }) }).catch(() => {});

    setTimeout(() => {
      setTyping(false);
      const plano = planos[planoSlug] ?? FALLBACK["amar-plus"];
      setMensagens(prev => [
        ...prev,
        { id: "final1", role: "bot", tipo: "texto", conteudo: "Pronto! Finalizamos a análise do seu perfil. 🎉" },
        { id: "final2", role: "bot", tipo: "resultado", planoRecomendado: plano }
      ]);
    }, 2000);
  }

  function handleInputSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pAtual = perguntasAtivas[passo];
    
    if (pAtual.campo === "cidade" && pAtual.opcoes) {
      // Se era cidade e escolheu "outros" usando input
      if (!cidadeOutros.trim()) return;
      handleRespostaUser(cidadeOutros, cidadeOutros);
    } else {
      if (!inputValue.trim()) return;
      // Validação de telefone básica
      if (pAtual.campo === "telefone") {
        if (inputValue.replace(/\D/g, "").length < 10) return;
      }
      handleRespostaUser(inputValue, inputValue);
    }
  }

  const pAtual = perguntasAtivas[passo];
  const aguardandoInput = !isFinished && pAtual && !obterOpcoes(pAtual, respostas);
  const aguardandoCidadeOutros = !isFinished && pAtual?.campo === "cidade" && mensagens.find(m => m.tipo === "opcoes") === undefined && respostas.cidade === undefined;

  // Se o botão de opções já foi clicado mas o state ainda nao atualizou, evitamos mostrar
  const mostrarBotaoInput = aguardandoInput || aguardandoCidadeOutros;

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-[#F0F2F5] shadow-2xl relative overflow-hidden font-sans">
      
      {/* Header do Chat */}
      <header className="bg-[#008ba3] text-white px-4 py-3 flex items-center gap-3 shadow-md z-10">
        <div className="relative w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
          <Image src="/icon.png" alt="AmaVidas" width={28} height={28} className="object-contain" />
        </div>
        <div>
          <h1 className="font-bold text-[16px] leading-tight">AmaVidas</h1>
          <p className="text-xs text-white/80">Online</p>
        </div>
      </header>

      {/* Área de Mensagens */}
      <div 
        ref={containerRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ backgroundImage: "url('/chat-bg.png')", backgroundSize: "cover" }}
      >
        <AnimatePresence initial={false}>
          {mensagens.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "bot" ? "justify-start" : "justify-end"}`}
            >
              {msg.role === "bot" && msg.tipo !== "opcoes" && (
                <div className="w-8 h-8 rounded-full bg-white mr-2 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 mt-1">
                  <Image src="/icon.png" alt="AmaVidas" width={20} height={20} />
                </div>
              )}

              <div className={`max-w-[85%] ${msg.tipo === "opcoes" ? "w-full pl-10" : ""}`}>
                
                {msg.tipo === "texto" && (
                  <div className={`p-3 rounded-2xl text-[15px] shadow-sm whitespace-pre-wrap ${
                    msg.role === "bot" 
                      ? "bg-white text-slate-800 rounded-tl-sm border border-slate-100" 
                      : "bg-[#DCF8C6] text-slate-900 rounded-tr-sm"
                  }`}>
                    {msg.conteudo}
                  </div>
                )}

                {msg.tipo === "digitando" && (
                  <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm inline-flex items-center gap-1.5 border border-slate-100">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}

                {msg.tipo === "opcoes" && msg.opcoes && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.opcoes.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          if (opt.value === "outros" && msg.campoContexto === "cidade") {
                            // Entra no modo input pra cidade
                            setMensagens(prev => prev.filter(m => m.tipo !== "opcoes"));
                          } else {
                            handleRespostaUser(opt.value, `${opt.emoji} ${opt.label}`);
                          }
                        }}
                        className="bg-white border border-[#00B4C8] text-[#008ba3] px-3.5 py-2 rounded-full text-sm font-semibold shadow-sm active:scale-[0.95] transition-transform flex items-center gap-1.5 hover:bg-[#00B4C8]/10"
                      >
                        {opt.emoji && <span className="text-base">{opt.emoji}</span>}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {msg.tipo === "resultado" && msg.planoRecomendado && (
                  <div className="bg-white border-2 border-[var(--royal)] rounded-2xl overflow-hidden shadow-lg mt-2">
                    <div className="bg-gradient-to-r from-[var(--royal)] to-[#008ba3] p-4 text-white">
                      <h3 className="font-bold text-lg mb-1">O Plano ideal para você!</h3>
                      <p className="text-sm opacity-90">{msg.planoRecomendado.nome}</p>
                    </div>
                    <div className="p-4">
                      <div className="mb-4">
                        <span className="text-sm text-slate-500 font-medium">Apenas</span>
                        <div className="flex items-end gap-1">
                          <span className="text-2xl font-bold text-slate-800">R$ {msg.planoRecomendado.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          <span className="text-slate-500 mb-1">/mês</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-5">
                        {msg.planoRecomendado.beneficios.map((b, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <svg className="w-5 h-5 text-[var(--magenta)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>

                      <a
                        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Fiz a simulação no site e o plano indicado para mim foi o *${msg.planoRecomendado.nome}*. Gostaria de saber mais.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        Contratar Agora!
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

      {/* Input Area (Text) */}
      {mostrarBotaoInput && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-3 border-t border-slate-200 z-10"
        >
          <form onSubmit={handleInputSubmit} className="flex gap-2">
            <input
              key={pAtual?.campo}
              type={pAtual?.campo === "telefone" ? "tel" : "text"}
              inputMode={pAtual?.campo === "telefone" ? "numeric" : "text"}
              placeholder={pAtual?.campo === "cidade" ? "Digite sua cidade..." : "Digite sua resposta..."}
              className="flex-1 bg-slate-100 px-4 py-3 rounded-full text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00B4C8]"
              value={pAtual?.campo === "cidade" ? cidadeOutros : inputValue}
              onChange={(e) => {
                if (pAtual?.campo === "cidade") {
                  setCidadeOutros(e.target.value);
                } else if (pAtual?.campo === "telefone") {
                  setInputValue(mascaraTelefone(e.target.value));
                } else {
                  setInputValue(e.target.value);
                }
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={pAtual?.campo === "telefone" ? inputValue.replace(/\D/g, "").length < 10 : (pAtual?.campo === "cidade" ? !cidadeOutros.trim() : !inputValue.trim())}
              className="w-12 h-12 bg-[#008ba3] text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:bg-slate-300 transition-colors"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </motion.div>
      )}

      {/* Se já preencheu a cidade com "Outros", exibe o text input. */}
    </div>
  );
}
