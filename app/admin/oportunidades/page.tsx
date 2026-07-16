"use client";

import { useState, useEffect, useCallback } from "react";

const PLANO_LABEL: Record<string, { label: string; cor: string }> = {
  essencial: { label: "Essencial", cor: "bg-slate-100 text-slate-700 border-slate-200" },
  familia: { label: "Família", cor: "bg-blue-50 text-blue-700 border-blue-100" },
  premium: { label: "Premium", cor: "bg-amber-50 text-amber-700 border-amber-100" },
};

const PRIORIDADE_LABEL: Record<string, string> = {
  preco: "Preço acessível",
  cobertura: "Cobertura completa",
  servicos: "Serviços diferenciados",
};

const WA_TEMPLATES = [
  {
    titulo: "👋 Primeiro Contato / Apresentação",
    getTexto: (nome: string, plano: string) => 
      `Olá, ${nome.split(" ")[0]}! Aqui é da equipe AmaVidas. Vi que você fez uma simulação em nosso site e recebeu a indicação do *Plano ${plano}*. Gostaria de te apresentar os detalhes e tirar suas dúvidas. Podemos conversar?`
  },
  {
    titulo: "📞 Acompanhamento / Follow-up",
    getTexto: (nome: string, plano: string) => 
      `Oi, ${nome.split(" ")[0]}! Tudo bem? Estou passando para saber se você conseguiu analisar o *Plano ${plano}* que conversamos. Ficou com alguma dúvida sobre a cobertura ou valores?`
  },
  {
    titulo: "🤝 Condição Especial (Fechamento)",
    getTexto: (nome: string, plano: string) => 
      `Olá, ${nome.split(" ")[0]}! Tenho uma ótima notícia: consegui liberar uma condição especial exclusiva para finalizarmos a contratação do seu *Plano ${plano}* hoje. Podemos fechar?`
  }
];

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  paraQuem: string;
  quantidadePessoas: string;
  faixaEtaria: string;
  prioridade: string;
  orcamento: string;
  planoRecomendado: string;
  contatado: boolean;
  status: string;
  criadoEm: string;
  cidade?: string;
  comoContatar?: string;
  responsavelId?: string | null;
  responsavel?: { id: string; nome: string } | null;
  intencao?: string | null;
  consentimento?: boolean;
  consentimentoEm?: string | null;
  motivoDescarte?: string | null;
  motivoPerda?: string | null;
  descarteObservacao?: string | null;
  primeiroContatoEm?: string | null;
  origem?: string;
  historico?: { id: string; acao: string }[];
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  referrer?: string | null;
  landingPage?: string | null;
  dispositivo?: string | null;
}

const MOTIVOS_LABELS: Record<string, string> = {
  numero_errado: "Número errado / não existe",
  nao_atende: "Não atende as ligações",
  nao_respondeu: "Não respondeu as mensagens",
  sem_interesse: "Sem interesse real",
  achou_caro: "Achou caro",
  vai_pensar: "Vai pensar / retornar depois",
  ja_tem_plano: "Já tem plano funerário",
  fora_area: "Fora da área de atendimento",
  dado_invalido: "Dado inválido (nome/telefone falso)",
  outro: "Outro",
};

const COLUNAS = [
  { id: "novo_lead", label: "Novo Lead", emoji: "⏳", corCol: "border-t-red-400 bg-red-50/5", textCor: "text-red-700" },
  { id: "contatado", label: "Em Contato", emoji: "📞", corCol: "border-t-blue-400 bg-blue-50/5", textCor: "text-blue-700" },
  { id: "negociando", label: "Negociando", emoji: "💬", corCol: "border-t-purple-400 bg-purple-50/5", textCor: "text-purple-700" },
  { id: "ganho", label: "Ganho (Contratado)", emoji: "🤝", corCol: "border-t-emerald-400 bg-emerald-50/5", textCor: "text-emerald-700" },
  { id: "perdido", label: "Perdido", emoji: "❌", corCol: "border-t-slate-350 bg-slate-50/5", textCor: "text-slate-600" },
] as const;

export default function OportunidadesPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; perfil: string } | null>(null);
  const [atendentes, setAtendentes] = useState<{ id: string; nome: string }[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "pendentes" | "contatados" | "negociando" | "ganhos" | "perdidos">("todos");
  const [filtroCanal, setFiltroCanal] = useState<string>("todos");
  const [filtroCampanha, setFiltroCampanha] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "tabela">("kanban");
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Timer para calcular tempo do lead pendente
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // atualiza a cada 1 minuto
    return () => clearInterval(timer);
  }, []);

  const getTimeAgo = useCallback((dateStr: string, currentDate: Date) => {
    try {
      const diff = currentDate.getTime() - new Date(dateStr).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return "Agora";
      if (minutes < 60) return `${minutes} min`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ${minutes % 60}m`;
      const days = Math.floor(hours / 24);
      return `${days} d`;
    } catch {
      return "";
    }
  }, []);

  const formatResponseTime = useCallback((criadoEmStr: string, primeiroContatoEmStr: string) => {
    try {
      const diff = new Date(primeiroContatoEmStr).getTime() - new Date(criadoEmStr).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return "menos de 1 min";
      if (minutes < 60) return `${minutes} min`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ${minutes % 60}m`;
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } catch {
      return "";
    }
  }, []);

  const [motivoModal, setMotivoModal] = useState<{ id: string, responsavelId?: string | null } | null>(null);
  const [motivoTexto, setMotivoTexto] = useState("");
  const [motivoSelecionado, setMotivoSelecionado] = useState("");

  const [ganhoModal, setGanhoModal] = useState<{ id: string, responsavelId?: string | null } | null>(null);
  const [ganhoDados, setGanhoDados] = useState({
    nomeCompletoContrato: "",
    numeroDependentes: "0",
    planoContratado: "",
    valorAdesao: "",
    valorPlano: "",
    contratoAssinado: false
  });

  // Estados para Timeline de Notas
  const [notas, setNotas] = useState<{ id: string; conteudo: string; autor: string; criadoEm: string }[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loadingNotas, setLoadingNotas] = useState(false);
  const [novaNota, setNovaNota] = useState("");

  // Estados para WhatsApp Modal
  const [waLead, setWaLead] = useState<Lead | null>(null);
  const [waMessage, setWaMessage] = useState("");
  const [activeTemplate, setActiveTemplate] = useState(0);

  // Estados para cadastro manual de leads
  const [isAddingLead, setIsAddingLead] = useState(false);

  // Estados para Confirmação de Exclusão
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<{ slug: string; nome: string }[]>([]);
  const [newLead, setNewLead] = useState({
    nome: "",
    email: "",
    telefone: "",
    planoRecomendado: "essencial",
    status: "novo_lead",
    paraQuem: "individual",
    quantidadePessoas: "1",
    faixaEtaria: "",
    prioridade: "",
    orcamento: "",
    cidade: "",
    comoContatar: "whatsapp",
    origem: "whatsapp_direto",
    intencao: "contratar_agora",
    consentimento: true,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showExtraFields, setShowExtraFields] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const resp = await fetch("/api/admin/me");
        if (resp.ok) {
          const data = await resp.json();
          setCurrentUser(data.user);
          if (data.user.perfil === "MASTER") {
            const respUsuarios = await fetch("/api/admin/usuarios");
            if (respUsuarios.ok) {
              const uData = await respUsuarios.json();
              setAtendentes(uData.usuarios);
            }
          }
        }
      } catch (e) {}
    };
    fetchMe();

    const fetchPlans = async () => {
      try {
        const resp = await fetch("/api/planos");
        if (resp.ok) {
          const data = await resp.json();
          setAvailablePlans(data.planos || []);
          if (data.planos && data.planos.length > 0) {
            setNewLead(prev => ({ ...prev, planoRecomendado: data.planos[0].slug }));
          }
        }
      } catch (err) {
        console.error("Erro ao carregar planos:", err);
      }
    };
    fetchPlans();
  }, []);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLead(prev => ({ ...prev, telefone: formatPhone(e.target.value) }));
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.nome.trim()) {
      setSubmitError("O nome é obrigatório.");
      return;
    }
    if (!newLead.telefone.trim()) {
      setSubmitError("O telefone é obrigatório.");
      return;
    }
    
    setSubmitLoading(true);
    setSubmitError("");
    
    try {
      const resp = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Erro ao salvar o lead");
      }
      
      setLeads((prev) => [data.lead, ...prev]);
      setIsAddingLead(false);
      
      setNewLead({
        nome: "",
        email: "",
        telefone: "",
        planoRecomendado: availablePlans[0]?.slug || "essencial",
        status: "novo_lead",
        paraQuem: "individual",
        quantidadePessoas: "1",
        faixaEtaria: "",
        prioridade: "",
        orcamento: "",
        cidade: "",
        comoContatar: "whatsapp",
        origem: "whatsapp_direto",
        intencao: "contratar_agora",
        consentimento: true,
      });
      setShowExtraFields(false);
    } catch (err: any) {
      setSubmitError(err.message || "Ocorreu um erro ao salvar o lead.");
    } finally {
      setSubmitLoading(false);
    }
  };


  const playNotificationSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Arpejo rápido de 3 notas (Acorde Sucesso: Plim-Plom-Plam)
      const playNote = (time: number, freq: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, time);
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.2, time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.3);
      };
      
      playNote(ctx.currentTime, 523.25); // C5
      playNote(ctx.currentTime + 0.1, 659.25); // E5
      playNote(ctx.currentTime + 0.2, 783.99); // G5

    } catch (e) {
      console.warn("Áudio bloqueado pelo navegador", e);
    }
  }, []);

  const fetchLeads = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const resp = await fetch("/api/leads");
      if (!resp.ok) throw new Error("Erro ao carregar");
      const data = await resp.json();
      
      setLeads((prev) => {
        if (isPolling && data.leads.length > 0) {
          const newLatestId = data.leads[0].id;
          const oldLatestId = prev.length > 0 ? prev[0].id : null;
          
          if (oldLatestId && newLatestId !== oldLatestId) {
            playNotificationSound();
          }
        }
        return data.leads;
      });
    } catch {
      if (!isPolling) setErro("Erro ao carregar os leads. Verifique a conexão com o banco de dados.");
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [playNotificationSound]);

  useEffect(() => { 
    fetchLeads(false); 
    const interval = setInterval(() => {
      fetchLeads(true);
    }, 15000); // Checa novos leads a cada 15 segundos
    return () => clearInterval(interval);
  }, [fetchLeads]);

  const handleStatusChangeRequest = (id: string, status: string, responsavelId?: string | null) => {
    if (status === "perdido") {
      setMotivoModal({ id, responsavelId });
    } else if (status === "ganho") {
      const currentLead = leads.find(l => l.id === id);
      setGanhoDados({
        nomeCompletoContrato: currentLead?.nome || "",
        numeroDependentes: currentLead?.quantidadePessoas || "0",
        planoContratado: currentLead?.planoRecomendado || "",
        valorAdesao: "",
        valorPlano: "",
        contratoAssinado: false
      });
      setGanhoModal({ id, responsavelId });
    } else {
      updateLeadStatus(id, status, responsavelId);
    }
  };

  const updateLeadStatus = async (
    id: string,
    status: string,
    responsavelId?: string | null,
    motivoDescarte?: string,
    descarteObservacao?: string,
    extraGanhoDados?: any
  ) => {
    // Atualização otimista no estado local
    setLeads((prev) => prev.map((l) => {
      if (l.id === id) {
        const contatado = status === "ganho" || status === "perdido" || status === "contatado" || status === "negociando";
        const novoResp = responsavelId !== undefined 
          ? (responsavelId === null ? null : atendentes.find(a => a.id === responsavelId) || l.responsavel)
          : l.responsavel;
        return { 
          ...l, 
          status, 
          contatado, 
          responsavelId: responsavelId !== undefined ? responsavelId : l.responsavelId, 
          responsavel: novoResp,
          motivoDescarte: motivoDescarte !== undefined ? motivoDescarte : l.motivoDescarte,
          descarteObservacao: descarteObservacao !== undefined ? descarteObservacao : l.descarteObservacao
        };
      }
      return l;
    }));

    try {
      const payload: any = { id, status };
      if (responsavelId !== undefined) payload.responsavelId = responsavelId;
      if (motivoDescarte !== undefined) payload.motivoDescarte = motivoDescarte;
      if (descarteObservacao !== undefined) payload.descarteObservacao = descarteObservacao;
      if (extraGanhoDados) {
        Object.assign(payload, extraGanhoDados);
      }

      const r = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error();
    } catch {
      // Reverter em caso de falha da API
      fetchLeads();
    }
  };

  const deletarLead = async (id: string): Promise<boolean> => {
    // Atualização otimista
    setLeads((prev) => prev.filter((l) => l.id !== id));
    
    try {
      const r = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) throw new Error();
      return true;
    } catch {
      alert("Erro ao excluir o lead.");
      fetchLeads();
      return false;
    }
  };

  const confirmarExclusao = async () => {
    if (!deletingLead) return;
    setIsDeleting(true);
    const sucesso = await deletarLead(deletingLead.id);
    setIsDeleting(false);
    if (sucesso) {
      if (selectedLead?.id === deletingLead.id) {
        setSelectedLead(null);
      }
      setDeletingLead(null);
    }
  };

  const carregarNotas = useCallback(async (leadId: string) => {
    setLoadingNotas(true);
    try {
      const r = await fetch(`/api/leads/${leadId}/notas`);
      if (r.ok) {
        const d = await r.json();
        const apiNotas = (d.notas || []).map((n: any) => ({
          id: n.id,
          tipo: "nota",
          conteudo: n.conteudo,
          autor: n.autor,
          criadoEm: n.criadoEm,
        }));
        
        const apiHistorico = (d.historico || []).map((h: any) => {
          let desc = "";
          if (h.acao === "cadastro") desc = `Lead cadastrado via ${h.origem || "simulador"}.`;
          else if (h.acao === "mudou_status") {
            const statusLabels: Record<string, string> = {
              novo_lead: "Novo Lead",
              contatado: "Em Contato",
              negociando: "Negociando",
              ganho: "Ganho",
              perdido: "Perdido"
            };
            const de = statusLabels[h.statusAntes || ""] || h.statusAntes || "início";
            const para = statusLabels[h.statusDepois || ""] || h.statusDepois || "";
            desc = `Alterou status de "${de}" para "${para}".`;
          } else if (h.acao === "atribuiu") {
            desc = `Lead atribuído a ${h.usuario?.nome || "outro atendente"}.`;
          } else if (h.acao === "primeiro_contato") {
            desc = `Primeiro contato comercial realizado.`;
          } else if (h.acao === "contato_ligacao") {
            desc = `Tentativa de contato via Ligação.`;
          } else if (h.acao === "contato_whatsapp") {
            desc = `Tentativa de contato via WhatsApp.`;
          } else {
            desc = h.observacao || h.acao;
          }
          
          return {
            id: h.id,
            tipo: "historico",
            conteudo: desc,
            autor: h.usuario?.nome || "Sistema",
            criadoEm: h.criadoEm,
          };
        });

        const combinada = [...apiNotas, ...apiHistorico].sort(
          (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
        );
        
        setTimeline(combinada);
        setNotas(d.notas || []);
      }
    } catch (err) {
      console.error("Erro ao carregar notas/histórico:", err);
    } finally {
      setLoadingNotas(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLead?.id) {
      carregarNotas(selectedLead.id);
      setNovaNota("");
    } else {
      setTimeline([]);
      setNotas([]);
    }
  }, [selectedLead, carregarNotas]);

  const adicionarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaNota.trim() || !selectedLead) return;

    try {
      const r = await fetch(`/api/leads/${selectedLead.id}/notas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo: novaNota, autor: "Administrador" }),
      });
      if (r.ok) {
        const d = await r.json();
        const novaNotaItem = {
          id: d.nota.id,
          tipo: "nota",
          conteudo: d.nota.conteudo,
          autor: d.nota.autor,
          criadoEm: d.nota.criadoEm,
        };
        setTimeline((prev) => [novaNotaItem, ...prev]);
        setNotas((prev) => [d.nota, ...prev]);
        setNovaNota("");
      }
    } catch (err) {
      console.error("Erro ao salvar nota:", err);
    }
  };

  const abrirWhatsAppModal = (lead: Lead) => {
    const plano = PLANO_LABEL[lead.planoRecomendado]?.label || lead.planoRecomendado;
    setWaLead(lead);
    setActiveTemplate(0);
    setWaMessage(WA_TEMPLATES[0].getTexto(lead.nome, plano));
  };

  const enviarWhatsApp = () => {
    if (!waLead) return;
    const numero = waLead.telefone.replace(/\D/g, "");
    const url = `https://wa.me/55${numero}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, "_blank");
    setWaLead(null);
  };

  const exportarCSV = () => {
    const headers = [
      "Nome",
      "E-mail",
      "Telefone",
      "Cidade",
      "Contato por",
      "Plano Recomendado",
      "Status",
      "Para Quem",
      "Qtd Pessoas",
      "Faixa Etaria",
      "Prioridade",
      "Orcamento",
      "Contatado",
      "Data de Cadastro"
    ];

    const rows = leadsFiltrados.map((l) => [
      l.nome,
      l.email || "",
      l.telefone,
      l.cidade || "",
      l.comoContatar || "",
      PLANO_LABEL[l.planoRecomendado]?.label || l.planoRecomendado,
      l.status === "ganho" ? "Ganho" : l.status === "perdido" ? "Perdido" : l.status === "contatado" ? "Em Contato" : l.status === "negociando" ? "Negociando" : "Pendente",
      l.paraQuem === "familia" ? "Família" : "Individual",
      l.quantidadePessoas,
      l.faixaEtaria,
      PRIORIDADE_LABEL[l.prioridade] || l.prioridade || "",
      l.orcamento,
      l.contatado ? "Sim" : "Não",
      new Date(l.criadoEm).toLocaleDateString("pt-BR")
    ]);

    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_oportunidades_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusSafe = (lead: Lead) => {
    return lead.status || (lead.contatado ? "contatado" : "novo_lead");
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedLeadId) {
      handleStatusChangeRequest(draggedLeadId, status);
      setDraggedLeadId(null);
    }
  };

  const campanhasDisponiveis = Array.from(
    new Set(leads.map((l) => l.utmCampaign).filter(Boolean))
  ) as string[];

  const leadsFiltrados = leads
    .filter((l) => {
      const currentStatus = getStatusSafe(l);
      if (viewMode === "tabela") {
        if (filtro === "pendentes") return currentStatus === "novo_lead";
        if (filtro === "contatados") return currentStatus === "contatado";
        if (filtro === "negociando") return currentStatus === "negociando";
        if (filtro === "ganhos") return currentStatus === "ganho";
        if (filtro === "perdidos") return currentStatus === "perdido";
      }
      return true;
    })
    .filter((l) => {
      if (filtroCanal === "todos") return true;
      if (filtroCanal === "whatsapp") return l.origem === "whatsapp_direto";
      if (filtroCanal === "google") return l.utmSource?.toLowerCase() === "google";
      if (filtroCanal === "meta") return l.utmSource?.toLowerCase() === "meta";
      if (filtroCanal === "organico") return !l.utmSource && l.origem !== "whatsapp_direto" && l.origem !== "manual";
      if (filtroCanal === "manual") return l.origem === "manual";
      return true;
    })
    .filter((l) => {
      if (filtroCampanha === "todos") return true;
      return l.utmCampaign === filtroCampanha;
    })
    .filter((l) =>
      busca
        ? l.nome.toLowerCase().includes(busca.toLowerCase()) ||
          (l.email && l.email.toLowerCase().includes(busca.toLowerCase())) ||
          l.telefone.includes(busca)
        : true
    );

  const stats = {
    total: leads.length,
    pendentes: leads.filter((l) => getStatusSafe(l) === "novo_lead").length,
    contatados: leads.filter((l) => getStatusSafe(l) === "contatado").length,
    negociando: leads.filter((l) => getStatusSafe(l) === "negociando").length,
    ganhos: leads.filter((l) => getStatusSafe(l) === "ganho").length,
    perdidos: leads.filter((l) => getStatusSafe(l) === "perdido").length,
  };

  return (
    <main className="flex-1 p-6 lg:p-8 bg-[#f8fafc] min-h-screen relative">
      {/* Page header */}
      <div className="mb-7 lg:pl-0 pl-10 border-b border-slate-200/60 pb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Oportunidades (CRM)</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestão visual do pipeline comercial. Clique nos cartões ou linhas para abrir o detalhamento completo.
          </p>
        </div>

        {/* Action Buttons: Exportar na esquerda, Novo Lead na direita */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportarCSV}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer h-[38px]"
          >
            📥 Exportar CSV
          </button>

          <button
            onClick={() => setIsAddingLead(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer h-[38px]"
          >
            ➕ Novo Lead
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-7">
        {[
          { label: "Total de leads", value: stats.total, icon: "👥", color: "text-slate-900", bg: "bg-slate-50 border-slate-100" },
          { label: "Novos Leads", value: stats.pendentes, icon: "⏳", color: "text-red-650", bg: "bg-red-50/50 border-red-100" },
          { label: "Em Contato", value: stats.contatados, icon: "📞", color: "text-blue-650", bg: "bg-blue-50/50 border-blue-100" },
          { label: "Negociando", value: stats.negociando, icon: "💬", color: "text-purple-650", bg: "bg-purple-50/50 border-purple-100" },
          { label: "Ganhos (Contratados)", value: stats.ganhos, icon: "🤝", color: "text-emerald-650", bg: "bg-emerald-50/50 border-emerald-100" },
          { label: "Perdidos", value: stats.perdidos, icon: "❌", color: "text-slate-550", bg: "bg-slate-100 border-slate-200" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${s.bg}`}>
            <div className="flex items-start justify-between mb-1.5">
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search and context tips */}
      <div className="mb-6 flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center">
        
        {/* Left Side: Search Bar, Filters and View Toggle */}
        <div className="flex flex-col xl:flex-row gap-3 flex-1 items-stretch xl:items-center">
          {/* Search Bar */}
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
              />
            </div>
            <button
              onClick={() => fetchLeads()}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors bg-white shadow-sm cursor-pointer"
              title="Atualizar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Filtros de Canal e Campanha */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <select
              value={filtroCanal}
              onChange={(e) => setFiltroCanal(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs font-bold focus:outline-none shadow-sm cursor-pointer h-[38px] min-w-[130px]"
            >
              <option value="todos">Todos os Canais</option>
              <option value="google">Google Ads</option>
              <option value="meta">Meta Ads</option>
              <option value="whatsapp">WhatsApp Direto</option>
              <option value="organico">Orgânico/Direto</option>
              <option value="manual">Cadastro Manual</option>
            </select>

            <select
              value={filtroCampanha}
              onChange={(e) => setFiltroCampanha(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs font-bold focus:outline-none shadow-sm cursor-pointer h-[38px] max-w-[180px]"
            >
              <option value="todos">Campanhas (Todas)</option>
              {campanhasDisponiveis.map(camp => (
                <option key={camp} value={camp}>{camp}</option>
              ))}
            </select>
          </div>

          {/* View Toggle (Kanban vs Lista) */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-250 shadow-inner h-[38px] flex-shrink-0">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "kanban" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-855"
              }`}
            >
              📊 Quadro Kanban
            </button>
            <button
              onClick={() => setViewMode("tabela")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "tabela" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-855"
              }`}
            >
              📋 Tabela Clássica
            </button>
          </div>
        </div>

        {/* Right Side: Filters or Info */}
        {viewMode === "tabela" ? (
          <div className="flex flex-wrap gap-1.5 xl:justify-end">
            {(["todos", "pendentes", "contatados", "negociando", "ganhos", "perdidos"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  filtro === f
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "text-slate-555 border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                }`}
              >
                {f === "todos"
                  ? `Todos (${stats.total})`
                  : f === "pendentes"
                  ? `⏳ Novos Leads (${stats.pendentes})`
                  : f === "contatados"
                  ? `📞 Contatados (${stats.contatados})`
                  : f === "negociando"
                  ? `💬 Negociando (${stats.negociando})`
                  : f === "ganhos"
                  ? `🤝 Ganhos (${stats.ganhos})`
                  : `❌ Perdidos (${stats.perdidos})`}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 py-2 xl:justify-end">
            <span>💡</span>
            <span>Cards compactos: arraste para atualizar o funil, ou clique neles para ver a ficha completa do lead.</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-7 h-7 border-2 border-slate-300 border-t-[#2B3DA8] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Carregando leads...</p>
        </div>
      ) : erro ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-250 shadow-sm">
          <p className="text-red-650 font-semibold text-sm">{erro}</p>
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN VIEW */
        <div className="flex gap-4 overflow-x-auto pb-6 items-stretch select-none min-h-[650px] scrollbar-thin">
          {COLUNAS.map((col) => {
            const colLeads = leadsFiltrados.filter((l) => getStatusSafe(l) === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`w-[310px] shrink-0 rounded-2xl border border-slate-200 border-t-4 p-4 ${col.corCol} flex flex-col shadow-sm`}
              >
                {/* Column header */}
                <div className="flex justify-between items-center mb-4 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-base border border-slate-100">
                      {col.emoji}
                    </div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{col.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {col.id === "novo_lead" && (
                      <button 
                        onClick={() => setIsAddingLead(true)}
                        className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-sm"
                        title="Adicionar Novo Lead"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
                      </button>
                    )}
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${col.textCor} bg-white shadow-sm border border-slate-150`}>
                      {colLeads.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-0.5 scrollbar-thin">
                  {colLeads.map((lead) => {
                    const planoInfo = PLANO_LABEL[lead.planoRecomendado] ?? {
                      label: lead.planoRecomendado,
                      cor: "bg-slate-100 text-slate-700 border-slate-200",
                    };
                    const isDragging = draggedLeadId === lead.id;
                    const totalTentativas = lead.historico?.filter((h) => ["contato_ligacao", "contato_whatsapp"].includes(h.acao)).length || 0;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedLead(lead)}
                        className={`cursor-pointer bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3 relative group overflow-hidden w-full shrink-0 ${
                          isDragging 
                            ? "opacity-40 border-dashed border-blue-400" 
                            : col.id === "novo_lead" 
                              ? "border-l-4 border-l-red-500 border-red-100 hover:border-red-200" 
                              : col.id === "contatado"
                              ? "border-l-4 border-l-blue-500 border-slate-200 hover:border-slate-300"
                              : col.id === "negociando"
                              ? "border-l-4 border-l-purple-500 border-slate-200 hover:border-slate-300"
                              : col.id === "ganho"
                              ? "border-l-4 border-l-emerald-500 border-slate-200 hover:border-slate-300"
                              : "border-l-4 border-l-slate-400 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {/* Header card info */}
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Badges de Intenção & Origem */}
                            <div className="flex flex-wrap gap-1 mb-2">
                              {lead.intencao === "contratar_agora" && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-100 text-red-700 border border-red-200">🔴 Quer contratar</span>
                              )}
                              {lead.intencao === "entender_melhor" && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">🟡 Quer entender</span>
                              )}
                              {lead.intencao === "pesquisando" && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">⚪ Pesquisando</span>
                              )}

                              {lead.origem === "whatsapp_direto" ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-250">🟢 WhatsApp Direto</span>
                              ) : lead.utmSource?.toLowerCase() === "google" ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">🔵 Google Ads</span>
                              ) : lead.utmSource?.toLowerCase() === "meta" ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">🟣 Meta Ads</span>
                              ) : lead.origem === "manual" ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">👤 Manual</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-50 text-slate-500 border border-slate-200">⚪ Orgânico/Direto</span>
                              )}
                            </div>

                            <h4 className="font-bold text-slate-800 text-[15px] leading-tight truncate flex items-center gap-2" title={lead.nome}>
                              {col.id === "novo_lead" && (
                                <span className="relative flex h-2 w-2 flex-shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              )}
                              <span className="truncate">{lead.nome}</span>
                            </h4>
                            <div className="flex flex-col gap-1.5 mt-2">
                              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 font-medium">
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                {lead.telefone}
                              </p>
                              {lead.cidade && (
                                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 font-medium" title={lead.cidade}>
                                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  {lead.cidade}
                                </p>
                              )}
                              {lead.criadoEm && (
                                <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5" title="Data/Hora de Criação">
                                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  {new Date(lead.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {new Date(lead.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                              
                              {lead.primeiroContatoEm ? (
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <p className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-150 px-2 py-0.5 rounded-md flex items-center gap-1.5 w-max" title="Tempo de Resposta comercial (SLA)">
                                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    SLA: {formatResponseTime(lead.criadoEm, lead.primeiroContatoEm)}
                                  </p>
                                  {totalTentativas > 0 && (
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-1" title={`${totalTentativas} tentativas de contato`}>
                                      💬 {totalTentativas}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                lead.status !== "ganho" && lead.status !== "perdido" && (
                                  <div className="flex flex-col gap-1.5 mt-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-[11px] font-bold text-red-650 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md flex items-center gap-1.5 w-max animate-pulse" title="Aguardando primeiro contato">
                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                        Espera: {getTimeAgo(lead.criadoEm, now)}
                                      </p>
                                      {totalTentativas > 0 && (
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-1" title={`${totalTentativas} tentativas de contato`}>
                                          💬 {totalTentativas}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm("Marcar primeiro contato comercial para este lead agora?")) {
                                          await updateLeadStatus(lead.id, lead.status, lead.responsavelId, undefined, undefined, { primeiroContatoEm: new Date().toISOString() });
                                          fetchLeads(false);
                                        }
                                      }}
                                      className="text-[9px] bg-slate-900 text-white font-bold px-2 py-1 rounded-md hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1 mt-0.5 w-max"
                                    >
                                      📞 Marcar contato
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 leading-none ${planoInfo.cor}`}>
                            {planoInfo.label}
                          </span>
                        </div>

                        {/* Bottom Actions card */}
                        <div className="flex items-center justify-between mt-2 border-t border-slate-100 pt-3 gap-2" onClick={(e) => e.stopPropagation()}>
                          
                          <div>
                            {lead.responsavel ? (
                              <div className="flex items-center gap-1 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded-lg" title={lead.responsavel.nome}>
                                <div className="w-4 h-4 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[9px] font-bold text-blue-700">
                                  {lead.responsavel.nome.charAt(0)}
                                </div>
                                <span className="text-[10px] font-semibold text-slate-655 truncate max-w-[65px]">{lead.responsavel.nome.split(" ")[0]}</span>
                              </div>
                            ) : currentUser?.perfil === "ATENDENTE" ? (
                              <button onClick={() => handleStatusChangeRequest(lead.id, lead.status, currentUser.id)} className="text-[10px] bg-cyan-50 text-cyan-600 border border-cyan-200 hover:bg-cyan-100 px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer">
                                👋 Assumir
                              </button>
                            ) : (
                              <span className="text-[9px] bg-slate-50 border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded-md italic">Sem dono</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Selector for quick change */}
                            <select
                              value={col.id}
                              onChange={(e) => handleStatusChangeRequest(lead.id, e.target.value)}
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border outline-none cursor-pointer transition-all ${
                                col.id === "ganho"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : col.id === "perdido"
                                  ? "bg-slate-50 text-slate-650 border-slate-200"
                                  : col.id === "negociando"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : col.id === "contatado"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              <option value="novo_lead">⏳</option>
                              <option value="contatado">📞</option>
                              <option value="negociando">💬</option>
                              <option value="ganho">🤝</option>
                              <option value="perdido">❌</option>
                            </select>

                            {/* WhatsApp Shortcut */}
                            <button
                              onClick={() => abrirWhatsAppModal(lead)}
                              className="bg-green-500 hover:bg-green-600 text-white p-1 rounded transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                              title="Conversar no WhatsApp"
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                            </button>

                            {/* Deletar Shortcut */}
                            <button
                              onClick={() => setDeletingLead(lead)}
                              className="bg-red-50 hover:bg-red-100 text-red-650 p-1.5 rounded-lg border border-red-200 transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                              title="Excluir Lead"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {colLeads.length === 0 && (
                    <div className="flex-1 border-2 border-dashed border-slate-200/50 rounded-2xl flex items-center justify-center p-6 text-center text-xs text-slate-400 min-h-[140px]">
                      Arraste leads para cá
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (CLASSIC) */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {leadsFiltrados.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-3xl mb-3">📭</p>
              <p className="font-semibold text-slate-600">Nenhum lead nesta aba</p>
              <p className="text-xs mt-1">Ajuste os filtros ou selecione outra aba.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50/50">
                    <th className="text-left px-5 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-wider">Nome</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-wider hidden md:table-cell">Contato</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-wider hidden md:table-cell">Data</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-wider">Status do Lead</th>
                    <th className="text-left px-5 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leadsFiltrados.map((lead) => {
                    const currentStatus = getStatusSafe(lead);
                    
                    return (
                      <tr 
                        key={lead.id} 
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-4 w-[20%] max-w-[200px]">
                          <div className="flex flex-col gap-1">
                            <p className="font-bold text-slate-800 truncate">{lead.nome}</p>
                            <div className="flex flex-wrap gap-1">
                              {lead.origem === "whatsapp_direto" ? (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-250 w-max leading-none">WhatsApp Direto</span>
                              ) : lead.utmSource?.toLowerCase() === "google" ? (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 w-max leading-none">Google Ads</span>
                              ) : lead.utmSource?.toLowerCase() === "meta" ? (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 w-max leading-none">Meta Ads</span>
                              ) : lead.origem === "manual" ? (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 w-max leading-none">Manual</span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-slate-50 text-slate-500 border border-slate-200 w-max leading-none">Orgânico/Direto</span>
                              )}
                            </div>
                            <p className="text-slate-400 text-xs md:hidden mt-0.5 truncate">{lead.telefone}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell w-[20%] max-w-[200px]">
                          <p className="text-slate-700 font-medium truncate">{lead.telefone}</p>
                          <p className="text-slate-400 text-xs mt-0.5 truncate">{lead.email}</p>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell whitespace-nowrap">
                          <p className="text-slate-400 text-xs">
                            {new Date(lead.criadoEm).toLocaleDateString("pt-BR", {
                              day: "2-digit", month: "2-digit", year: "2-digit",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-2">
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusChangeRequest(lead.id, e.target.value)}
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-all shadow-sm ${
                                currentStatus === "ganho"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : currentStatus === "perdido"
                                  ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                  : currentStatus === "negociando"
                                  ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                  : currentStatus === "contatado"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                  : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              }`}
                            >
                              <option value="novo_lead">⏳ Novo Lead</option>
                              <option value="contatado">📞 Em Contato</option>
                              <option value="negociando">💬 Negociando</option>
                              <option value="ganho">🤝 Ganho (Contratado)</option>
                              <option value="perdido">❌ Perdido</option>
                            </select>

                            {currentUser?.perfil === "MASTER" ? (
                              <select
                                value={lead.responsavelId || ""}
                                onChange={(e) => handleStatusChangeRequest(lead.id, lead.status, e.target.value || null)}
                                className="text-[10px] px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 outline-none w-full max-w-[140px]"
                              >
                                <option value="">Sem responsável</option>
                                {atendentes.map(a => (
                                  <option key={a.id} value={a.id}>{a.nome}</option>
                                ))}
                              </select>
                            ) : lead.responsavel ? (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded w-max">
                                👤 {lead.responsavel.nome.split(" ")[0]}
                              </span>
                            ) : (
                              <button onClick={() => handleStatusChangeRequest(lead.id, lead.status, currentUser?.id)} className="text-[10px] bg-[#00B4C8]/10 text-[#00B4C8] hover:bg-[#00B4C8]/20 px-2 py-1 rounded font-bold w-max transition-colors">
                                Assumir Lead
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => abrirWhatsAppModal(lead)}
                              className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              WhatsApp
                            </button>
                            <button
                              onClick={() => setDeletingLead(lead)}
                              className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                              title="Deletar Lead"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLead(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100 opacity-100 mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-white flex justify-between items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-2xl font-bold text-white shadow-md border border-slate-700">
                  {selectedLead.nome.charAt(0)}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">Ficha do Lead</span>
                    {selectedLead.criadoEm && (
                      <span className="text-[10px] font-medium text-slate-400 bg-white border border-slate-150 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(selectedLead.criadoEm).toLocaleDateString('pt-BR')} às {new Date(selectedLead.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">{selectedLead.nome}</h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors relative z-10 cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto bg-slate-50/30">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                
                {/* Left Column (Main Details & Status) - Span 3/5 */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* Section 1: Contato */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-sm">📞</div>
                      Contato
                    </h4>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Telefone</p>
                          <p className="text-sm font-semibold text-slate-800">{selectedLead.telefone}</p>
                        </div>
                        <button onClick={() => abrirWhatsAppModal(selectedLead)} className="text-[#25D366] bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors border border-green-200" title="Chamar no WhatsApp">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        </button>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">E-mail</p>
                          <p className="text-sm font-semibold text-slate-800 break-all">{selectedLead.email || "Não informado"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 1.5: Origem do Lead */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">🌐</div>
                      Origem do Lead
                    </h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Canal/Origem</p>
                        <p className="font-bold text-slate-800 mt-0.5">
                          {selectedLead.origem === "whatsapp_direto" ? (
                            <span className="text-emerald-755">🟢 WhatsApp Direto</span>
                          ) : selectedLead.utmSource?.toLowerCase() === "google" ? (
                            <span className="text-blue-755">🔵 Google Ads (CPC)</span>
                          ) : selectedLead.utmSource?.toLowerCase() === "meta" ? (
                            <span className="text-purple-755">🟣 Meta Ads (CPC)</span>
                          ) : selectedLead.origem === "manual" ? (
                            <span className="text-slate-755">👤 Cadastro Manual</span>
                          ) : (
                            <span className="text-slate-500">⚪ Orgânico / Direto</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Campanha</p>
                        <p className="font-semibold text-slate-800 mt-0.5 truncate" title={selectedLead.utmCampaign || "Sem campanha"}>
                          {selectedLead.utmCampaign || <span className="text-slate-400 italic">Sem campanha</span>}
                        </p>
                      </div>

                      {selectedLead.utmSource?.toLowerCase() === "google" && selectedLead.utmTerm && (
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Palavra-chave (Google)</p>
                          <p className="font-semibold text-slate-800 mt-0.5 truncate" title={selectedLead.utmTerm}>{selectedLead.utmTerm}</p>
                        </div>
                      )}

                      {selectedLead.utmSource?.toLowerCase() === "meta" && selectedLead.utmContent && (
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Criativo (Meta)</p>
                          <p className="font-semibold text-slate-800 mt-0.5 truncate" title={selectedLead.utmContent}>{selectedLead.utmContent}</p>
                        </div>
                      )}

                      {selectedLead.utmSource?.toLowerCase() === "meta" && selectedLead.utmTerm && (
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Conjunto (Meta)</p>
                          <p className="font-semibold text-slate-800 mt-0.5 truncate" title={selectedLead.utmTerm}>{selectedLead.utmTerm}</p>
                        </div>
                      )}

                      {selectedLead.dispositivo && (
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dispositivo</p>
                          <p className="font-semibold text-slate-800 mt-0.5 uppercase">
                            {selectedLead.dispositivo === "mobile" ? "📱 Mobile" : selectedLead.dispositivo === "tablet" ? "📟 Tablet" : "💻 Desktop"}
                          </p>
                        </div>
                      )}

                      {selectedLead.landingPage && (
                        <div className="col-span-2 pt-2 border-t border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Página de Entrada</p>
                          <p className="font-mono text-slate-700 truncate mt-0.5" title={selectedLead.landingPage}>{selectedLead.landingPage}</p>
                        </div>
                      )}

                      {selectedLead.referrer && (
                        <div className="col-span-2 pt-2 border-t border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Origem de Referência (Referrer)</p>
                          <p className="font-semibold text-slate-655 truncate mt-0.5" title={selectedLead.referrer}>{selectedLead.referrer}</p>
                        </div>
                      )}

                      {(selectedLead.gclid || selectedLead.fbclid) && (
                        <div className="col-span-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                          {selectedLead.gclid && (
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Google Click ID (GCLID)</p>
                              <p className="font-mono text-[10px] text-slate-600 truncate mt-0.5" title={selectedLead.gclid}>{selectedLead.gclid}</p>
                            </div>
                          )}
                          {selectedLead.fbclid && (
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Facebook Click ID (FBCLID)</p>
                              <p className="font-mono text-[10px] text-slate-600 truncate mt-0.5" title={selectedLead.fbclid}>{selectedLead.fbclid}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 2: Respostas do Simulador */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-cyan-50 text-cyan-600 flex items-center justify-center text-sm">📋</div>
                      Perfil da Simulação
                    </h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Proteger quem</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">
                          {selectedLead.paraQuem === "familia" ? "👨‍👩‍👧‍👦 Família" : "👤 Si mesmo"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vidas</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedLead.quantidadePessoas} pessoa(s)</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Orçamento</p>
                        <p className="text-sm font-semibold text-emerald-600 mt-0.5">Até {selectedLead.orcamento}/mês</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cidade</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate" title={selectedLead.cidade}>{selectedLead.cidade || "Não informada"}</p>
                      </div>
                      <div className="col-span-2 pt-3 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prioridade Declarada</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">
                          🎯 {PRIORIDADE_LABEL[selectedLead.prioridade] ?? selectedLead.prioridade ?? "Não informada"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Indicação */}
                  <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 p-5 rounded-2xl shadow-sm">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center text-sm">🏆</div>
                      Plano Recomendado
                    </h4>
                    <p className="text-2xl font-black text-amber-900">
                      Plano {PLANO_LABEL[selectedLead.planoRecomendado]?.label ?? selectedLead.planoRecomendado}
                    </p>
                  </div>

                  {/* Section 4: Gestão do Funil */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-sm shadow-sm">🎯</div>
                      Atualizar Status
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "novo_lead", label: "⏳ Novo Lead", color: "bg-red-50 text-red-700 border-red-200" },
                        { id: "contatado", label: "📞 Em Contato", color: "bg-blue-50 text-blue-700 border-blue-200" },
                        { id: "negociando", label: "💬 Negociando", color: "bg-purple-50 text-purple-700 border-purple-200" },
                        { id: "ganho", label: "🤝 Ganho", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                        { id: "perdido", label: "❌ Perdido", color: "bg-slate-50 text-slate-650 border-slate-200" },
                      ].map((btn) => {
                        const currentStatus = getStatusSafe(selectedLead);
                        const isActive = currentStatus === btn.id;
                        return (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={async () => {
                              if (btn.id === "perdido") {
                                setMotivoModal({ id: selectedLead.id, responsavelId: selectedLead.responsavelId });
                              } else {
                                await updateLeadStatus(selectedLead.id, btn.id);
                                setSelectedLead((prev) => prev ? { ...prev, status: btn.id, contatado: btn.id !== "novo_lead" } : null);
                              }
                            }}
                            className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isActive ? `${btn.color} ring-2 ring-offset-2 ring-current/25 shadow-sm` : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 4.5: Lead Descartado / Perdido */}
                  {selectedLead.status === "perdido" && (
                    <div className="bg-red-50/50 border border-red-200 p-5 rounded-2xl shadow-sm">
                      <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-red-100 text-red-650 flex items-center justify-center text-sm">❌</div>
                        Informações do Descarte (Perda)
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Motivo da Perda</p>
                          <p className="text-sm font-bold text-slate-800 mt-0.5">
                            {MOTIVOS_LABELS[selectedLead.motivoDescarte || selectedLead.motivoPerda || ""] ?? selectedLead.motivoDescarte ?? selectedLead.motivoPerda ?? "Não informado"}
                          </p>
                        </div>
                        {selectedLead.descarteObservacao && (
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Observações / Detalhes</p>
                            <p className="text-xs text-slate-600 font-medium bg-white p-3 border border-red-150 rounded-xl leading-relaxed whitespace-pre-wrap mt-1">
                              {selectedLead.descarteObservacao}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column (Notes & History logs & Attempts) - Span 2/5 */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Contact Attempts Summary */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">📊</div>
                      Contador de Contatos
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex flex-col justify-between">
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Ligações</p>
                        <p className="text-2xl font-black text-blue-700 mt-1">
                          {selectedLead.historico?.filter(h => h.acao === "contato_ligacao").length || 0}
                        </p>
                      </div>
                      <div className="bg-green-50/50 border border-green-100 p-3 rounded-xl flex flex-col justify-between">
                        <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">WhatsApp</p>
                        <p className="text-2xl font-black text-green-700 mt-1">
                          {selectedLead.historico?.filter(h => h.acao === "contato_whatsapp").length || 0}
                        </p>
                      </div>
                    </div>
                    {/* Botões de Registrar Contato */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm("Registrar tentativa de contato por Ligação para este lead?")) {
                            await updateLeadStatus(selectedLead.id, selectedLead.status, selectedLead.responsavelId, undefined, undefined, { registrarContato: "ligacao" });
                            setSelectedLead(prev => prev ? {
                              ...prev,
                              historico: [...(prev.historico || []), { id: Math.random().toString(), acao: "contato_ligacao" }]
                            } : null);
                            carregarNotas(selectedLead.id);
                            fetchLeads(false);
                          }
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-blue-200 cursor-pointer shadow-sm"
                      >
                        📞 Registrar Ligação
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm("Registrar tentativa de contato por WhatsApp para este lead?")) {
                            await updateLeadStatus(selectedLead.id, selectedLead.status, selectedLead.responsavelId, undefined, undefined, { registrarContato: "whatsapp" });
                            setSelectedLead(prev => prev ? {
                              ...prev,
                              historico: [...(prev.historico || []), { id: Math.random().toString(), acao: "contato_whatsapp" }]
                            } : null);
                            carregarNotas(selectedLead.id);
                            fetchLeads(false);
                          }
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-green-200 cursor-pointer shadow-sm"
                      >
                        💬 Registrar WhatsApp
                      </button>
                    </div>
                  </div>

                  {/* Section 5: Histórico de Notas & Interações */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                      <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-sm">📝</div>
                      Anotações & Histórico
                    </h4>

                    {/* Form para Adicionar Nota */}
                    <form onSubmit={adicionarNota} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <textarea
                          placeholder="Adicione uma anotação de acompanhamento..."
                          value={novaNota}
                          onChange={(e) => setNovaNota(e.target.value)}
                          rows={2}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-slate-350 outline-none bg-white text-slate-900 placeholder:text-slate-400 shadow-sm resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!novaNota.trim()}
                        className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-md cursor-pointer h-[38px] mb-1"
                      >
                        Salvar
                      </button>
                    </form>

                    {/* Lista de Notas (Timeline) */}
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 mt-2 scrollbar-thin">
                      {loadingNotas ? (
                        <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-xs">
                          <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-[#2B3DA8] rounded-full animate-spin" />
                          Carregando histórico...
                        </div>
                      ) : timeline.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-6 italic">
                          Nenhuma anotação ou ação de histórico registrada para este lead.
                        </p>
                      ) : (
                        <div className="relative pl-4 border-l border-slate-150 space-y-4 ml-1.5">
                          {timeline.map((item) => {
                            const isNota = item.tipo === "nota";
                            return (
                              <div key={item.id} className="relative group">
                                {/* Marcador circular na linha */}
                                <span className={`absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full border border-white transition-colors ${
                                  isNota 
                                    ? "bg-slate-400 group-hover:bg-blue-600" 
                                    : "bg-emerald-500 group-hover:bg-emerald-600"
                                }`} />
                                
                                <div className={`p-3 rounded-xl border flex flex-col gap-1 shadow-sm ${
                                  isNota 
                                    ? "bg-slate-50 border-slate-100" 
                                    : "bg-emerald-50/20 border-emerald-100/50 border-dashed"
                                }`}>
                                  <div className="flex justify-between items-center">
                                    <span className={`text-[10px] font-bold ${isNota ? "text-slate-600" : "text-emerald-700"}`}>
                                      {isNota ? item.autor : `🛠️ Histórico`}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-semibold">
                                      {new Date(item.criadoEm).toLocaleDateString("pt-BR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </span>
                                  </div>
                                  <p className={`text-xs leading-normal whitespace-pre-wrap ${
                                    isNota ? "text-slate-700 font-medium" : "text-slate-655 italic font-semibold"
                                  }`}>{item.conteudo}</p>
                                  {!isNota && (
                                    <span className="text-[9px] text-slate-400 mt-0.5">Por: {item.autor}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Main CTA */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button 
                type="button"
                onClick={() => setDeletingLead(selectedLead)}
                className="px-4 py-3 rounded-xl border border-red-200 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                title="Excluir Lead"
              >
                Excluir
              </button>
              <button 
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 flex-1 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => abrirWhatsAppModal(selectedLead)}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md flex-1 text-center cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Iniciar WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddingLead && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsAddingLead(false)}
        >
          <form 
            onSubmit={handleCreateLead}
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cadastrar Lead</span>
                <h3 className="text-xl font-extrabold text-slate-805 mt-1">Novo Lead Comercial</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddingLead(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none font-medium cursor-pointer p-1"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {submitError && (
                <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-100 text-xs font-semibold">
                  ⚠️ {submitError}
                </div>
              )}

              {/* Informações Básicas */}
              <div className="space-y-3.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Dados Principais
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Nome Completo *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex: João Silva"
                      value={newLead.nome}
                      onChange={(e) => setNewLead(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Telefone / WhatsApp *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: (11) 99999-9999"
                        value={newLead.telefone}
                        onChange={handlePhoneChange}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">E-mail (Opcional)</label>
                      <input 
                        type="email"
                        placeholder="Ex: joao@gmail.com"
                        value={newLead.email}
                        onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Plano Recomendado *</label>
                      <select
                        value={newLead.planoRecomendado}
                        onChange={(e) => setNewLead(prev => ({ ...prev, planoRecomendado: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 shadow-sm cursor-pointer"
                      >
                        {availablePlans.length > 0 ? (
                          availablePlans.map((p) => (
                            <option key={p.slug} value={p.slug}>{p.nome}</option>
                          ))
                        ) : (
                          <>
                            <option value="essencial">Essencial</option>
                            <option value="familia">Família</option>
                            <option value="premium">Premium</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Status Inicial *</label>
                      <select
                        value={newLead.status}
                        onChange={(e) => setNewLead(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 shadow-sm cursor-pointer"
                      >
                        <option value="novo_lead">⏳ Novo Lead</option>
                        <option value="contatado">📞 Em Contato</option>
                        <option value="negociando">💬 Negociando</option>
                        <option value="ganho">🤝 Ganho (Contratado)</option>
                        <option value="perdido">❌ Perdido</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Origem do Lead *</label>
                      <select
                        value={newLead.origem}
                        onChange={(e) => setNewLead(prev => ({ ...prev, origem: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 shadow-sm cursor-pointer"
                      >
                        <option value="whatsapp_direto">📲 WhatsApp Direto (Orgânico)</option>
                        <option value="whatsapp_meta_ads">📣 Meta Ads (WhatsApp Direto)</option>
                        <option value="manual">✍️ Cadastro Manual</option>
                        <option value="simulador">🎯 Simulador</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão para mostrar campos adicionais */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowExtraFields(!showExtraFields)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{showExtraFields ? "▼" : "▶"}</span>
                  <span>Informações Opcionais / Perfil do Simulador</span>
                </button>
              </div>

              {/* Campos adicionais colapsáveis */}
              {showExtraFields && (
                <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-150 border-dashed animate-fadeIn">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Perfil da Simulação
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Proteger quem?</label>
                      <select
                        value={newLead.paraQuem}
                        onChange={(e) => setNewLead(prev => ({ ...prev, paraQuem: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 shadow-sm cursor-pointer"
                      >
                        <option value="">Não informado</option>
                        <option value="individual">Si mesmo (Individual)</option>
                        <option value="familia">Família</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Quantidade Pessoas</label>
                      <input 
                        type="text"
                        placeholder="Ex: 3 pessoas"
                        value={newLead.quantidadePessoas}
                        onChange={(e) => setNewLead(prev => ({ ...prev, quantidadePessoas: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Orçamento Máximo</label>
                      <input 
                        type="text"
                        placeholder="Ex: 300"
                        value={newLead.orcamento}
                        onChange={(e) => setNewLead(prev => ({ ...prev, orcamento: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Prioridade</label>
                      <select
                        value={newLead.prioridade}
                        onChange={(e) => setNewLead(prev => ({ ...prev, prioridade: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 shadow-sm cursor-pointer"
                      >
                        <option value="">Não informado</option>
                        <option value="preco">Preço acessível</option>
                        <option value="cobertura">Cobertura completa</option>
                        <option value="servicos">Serviços diferenciados</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Cidade</label>
                      <input 
                        type="text"
                        placeholder="Ex: Águas Lindas"
                        value={newLead.cidade}
                        onChange={(e) => setNewLead(prev => ({ ...prev, cidade: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Contato por</label>
                      <select
                        value={newLead.comoContatar}
                        onChange={(e) => setNewLead(prev => ({ ...prev, comoContatar: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 shadow-sm cursor-pointer"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="ligacao">Ligação</option>
                        <option value="visita">Visita residencial</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button 
                type="button"
                onClick={() => setIsAddingLead(false)}
                className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 flex-1 cursor-pointer"
                disabled={submitLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md flex-1 cursor-pointer disabled:opacity-50"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Lead"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WhatsApp Message Selection Modal */}
      {waLead && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setWaLead(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mensagem rápida</span>
                <h3 className="text-lg font-extrabold text-slate-805 mt-1">Disparo para {waLead.nome.split(" ")[0]}</h3>
              </div>
              <button 
                type="button"
                onClick={() => setWaLead(null)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none font-medium cursor-pointer p-1"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Template Buttons */}
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Escolha um Modelo</p>
                <div className="flex flex-col gap-2">
                  {WA_TEMPLATES.map((tpl, idx) => {
                    const plano = PLANO_LABEL[waLead.planoRecomendado]?.label || waLead.planoRecomendado;
                    const isActive = activeTemplate === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveTemplate(idx);
                          setWaMessage(tpl.getTexto(waLead.nome, plano));
                        }}
                        className={`text-left px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                            : "bg-white text-slate-655 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {tpl.titulo}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message text area */}
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Personalizar Mensagem</p>
                <textarea
                  rows={6}
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-xs bg-white text-slate-900 placeholder:text-slate-400 shadow-sm resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button 
                type="button"
                onClick={() => setWaLead(null)}
                className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 flex-1 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={enviarWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md flex-1 text-center cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      {deletingLead && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setDeletingLead(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4 text-red-600 text-2xl">
                ⚠️
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2 tracking-tight">Excluir Lead?</h3>
              <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita e todos os dados serão perdidos.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeletingLead(null)}
                  disabled={isDeleting}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 flex-1 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-3 rounded-xl text-xs font-bold flex-1 transition-colors"
                >
                  {isDeleting ? "Excluindo..." : "Sim, excluir"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Motivo Perda */}
      {motivoModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => { setMotivoModal(null); setMotivoTexto(""); setMotivoSelecionado(""); }}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-600 text-2xl">
                📝
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2 text-center tracking-tight">Motivo da Perda</h3>
              <p className="text-xs text-slate-500 mb-4 text-center">
                Por favor, informe o motivo do descarte do lead.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Selecione o Motivo *</label>
                  <select
                    value={motivoSelecionado}
                    onChange={(e) => setMotivoSelecionado(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-sm bg-white text-slate-900 shadow-sm cursor-pointer"
                  >
                    <option value="">-- Selecione --</option>
                    <option value="numero_errado">Número errado / não existe</option>
                    <option value="nao_atende">Não atende as ligações</option>
                    <option value="nao_respondeu">Não respondeu as mensagens</option>
                    <option value="sem_interesse">Sem interesse real</option>
                    <option value="achou_caro">Achou caro</option>
                    <option value="vai_pensar">Vai pensar / retornar depois</option>
                    <option value="ja_tem_plano">Já tem plano funerário</option>
                    <option value="fora_area">Fora da área de atendimento</option>
                    <option value="dado_invalido">Dado inválido (nome/telefone falso)</option>
                    <option value="outro">Outro (especificar)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Observações {motivoSelecionado === "outro" ? "*" : "(Opcional)"}
                  </label>
                  <textarea
                    value={motivoTexto}
                    onChange={(e) => setMotivoTexto(e.target.value)}
                    placeholder="Adicione detalhes ou observações..."
                    rows={3}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-slate-350 outline-none bg-white text-slate-900 placeholder:text-slate-400 shadow-sm resize-none"
                  />
                  {motivoSelecionado === "outro" && (
                    <div className="flex justify-between items-center mt-1 px-1">
                      <span className={`text-[10px] font-bold ${motivoTexto.trim().length < 5 ? "text-red-500" : "text-emerald-600"}`}>
                        {motivoTexto.trim().length < 5 ? `Escreva pelo menos mais ${5 - motivoTexto.trim().length} caracteres` : "Observação preenchida"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 w-full mt-6">
                <button
                  onClick={() => { setMotivoModal(null); setMotivoTexto(""); setMotivoSelecionado(""); }}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 flex-1 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!motivoSelecionado) return;
                    if (motivoSelecionado === "outro" && motivoTexto.trim().length < 5) return;
                    
                    await updateLeadStatus(motivoModal.id, "perdido", motivoModal.responsavelId, motivoSelecionado, motivoTexto.trim());
                    if (selectedLead?.id === motivoModal.id) {
                      setSelectedLead((prev) => prev ? { 
                        ...prev, 
                        status: "perdido", 
                        contatado: true,
                        motivoDescarte: motivoSelecionado,
                        descarteObservacao: motivoTexto.trim()
                      } : null);
                    }
                    setMotivoModal(null);
                    setMotivoTexto("");
                    setMotivoSelecionado("");
                  }}
                  disabled={!motivoSelecionado || (motivoSelecionado === "outro" && motivoTexto.trim().length < 5)}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl text-xs font-bold flex-1 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Fechamento (Ganho) */}
      {ganhoModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
          onClick={() => setGanhoModal(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden my-8 transform scale-100 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600 text-2xl">
                🤝
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2 text-center tracking-tight">Fechamento Concluído!</h3>
              <p className="text-xs text-slate-500 mb-6 text-center">
                Preencha os dados reais do contrato para finalizar.
              </p>
              
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={ganhoDados.nomeCompletoContrato}
                    onChange={(e) => setGanhoDados({...ganhoDados, nomeCompletoContrato: e.target.value})}
                    placeholder="Nome completo do titular"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-slate-350 outline-none bg-white text-slate-900 shadow-sm"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Qtd. Vidas</label>
                    <input
                      type="number"
                      value={ganhoDados.numeroDependentes}
                      onChange={(e) => setGanhoDados({...ganhoDados, numeroDependentes: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-slate-350 outline-none bg-white text-slate-900 shadow-sm"
                    />
                  </div>
                  <div className="w-2/3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Plano Contratado</label>
                    <select
                      value={ganhoDados.planoContratado}
                      onChange={(e) => setGanhoDados({...ganhoDados, planoContratado: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-slate-350 outline-none bg-white text-slate-900 shadow-sm"
                    >
                      <option value="" disabled>Selecione um plano...</option>
                      {availablePlans.map((p) => (
                        <option key={p.slug} value={p.slug}>{p.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Valor da Adesão</label>
                    <input
                      type="text"
                      placeholder="Ex: R$ 150,00"
                      value={ganhoDados.valorAdesao}
                      onChange={(e) => setGanhoDados({...ganhoDados, valorAdesao: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-slate-350 outline-none bg-white text-slate-900 shadow-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Valor do Plano</label>
                    <input
                      type="text"
                      placeholder="Ex: R$ 300,00"
                      value={ganhoDados.valorPlano}
                      onChange={(e) => setGanhoDados({...ganhoDados, valorPlano: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-slate-350 outline-none bg-white text-slate-900 shadow-sm"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={ganhoDados.contratoAssinado}
                    onChange={(e) => setGanhoDados({...ganhoDados, contratoAssinado: e.target.checked})}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-sm font-bold text-slate-700">Contrato Assinado</span>
                </label>
              </div>

              <div className="flex gap-2 w-full mt-6">
                <button
                  onClick={() => setGanhoModal(null)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 flex-1 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!ganhoDados.nomeCompletoContrato || !ganhoDados.planoContratado || !ganhoDados.valorAdesao || !ganhoDados.valorPlano) {
                      alert("Preencha todos os campos.");
                      return;
                    }
                    await updateLeadStatus(ganhoModal.id, "ganho", ganhoModal.responsavelId, undefined, undefined, ganhoDados);
                    if (selectedLead?.id === ganhoModal.id) {
                      setSelectedLead((prev) => prev ? { ...prev, status: "ganho", contatado: true } : null);
                    }
                    setGanhoModal(null);
                  }}
                  disabled={!ganhoDados.nomeCompletoContrato || !ganhoDados.planoContratado || !ganhoDados.valorAdesao || !ganhoDados.valorPlano}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl text-xs font-bold flex-1 transition-colors"
                >
                  Confirmar Venda
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
