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
}

const COLUNAS = [
  { id: "pendente", label: "Pendente", emoji: "⏳", corCol: "border-t-red-400 bg-red-50/5", textCor: "text-red-700" },
  { id: "contatado", label: "Em Contato", emoji: "📞", corCol: "border-t-blue-400 bg-blue-50/5", textCor: "text-blue-700" },
  { id: "ganho", label: "Ganho (Contratado)", emoji: "🤝", corCol: "border-t-emerald-400 bg-emerald-50/5", textCor: "text-emerald-700" },
  { id: "perdido", label: "Perdido", emoji: "❌", corCol: "border-t-slate-350 bg-slate-50/5", textCor: "text-slate-600" },
] as const;

export default function OportunidadesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "pendentes" | "contatados" | "ganhos" | "perdidos">("todos");
  const [busca, setBusca] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "tabela">("kanban");
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Estados para Timeline de Notas
  const [notas, setNotas] = useState<{ id: string; conteudo: string; autor: string; criadoEm: string }[]>([]);
  const [loadingNotas, setLoadingNotas] = useState(false);
  const [novaNota, setNovaNota] = useState("");

  // Estados para WhatsApp Modal
  const [waLead, setWaLead] = useState<Lead | null>(null);
  const [waMessage, setWaMessage] = useState("");
  const [activeTemplate, setActiveTemplate] = useState(0);

  // Estados para cadastro manual de leads
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<{ slug: string; nome: string }[]>([]);
  const [newLead, setNewLead] = useState({
    nome: "",
    email: "",
    telefone: "",
    planoRecomendado: "essencial",
    status: "pendente",
    paraQuem: "individual",
    quantidadePessoas: "1",
    faixaEtaria: "",
    prioridade: "",
    orcamento: "",
    cidade: "",
    comoContatar: "whatsapp",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showExtraFields, setShowExtraFields] = useState(false);

  useEffect(() => {
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
        status: "pendente",
        paraQuem: "individual",
        quantidadePessoas: "1",
        faixaEtaria: "",
        prioridade: "",
        orcamento: "",
        cidade: "",
        comoContatar: "whatsapp",
      });
      setShowExtraFields(false);
    } catch (err: any) {
      setSubmitError(err.message || "Ocorreu um erro ao salvar o lead.");
    } finally {
      setSubmitLoading(false);
    }
  };


  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/leads");
      if (!resp.ok) throw new Error("Erro ao carregar");
      const data = await resp.json();
      setLeads(data.leads);
    } catch {
      setErro("Erro ao carregar os leads. Verifique a conexão com o banco de dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateLeadStatus = async (id: string, status: string) => {
    // Atualização otimista no estado local
    setLeads((prev) => prev.map((l) => {
      if (l.id === id) {
        const contatado = status === "ganho" || status === "perdido" || status === "contatado";
        return { ...l, status, contatado };
      }
      return l;
    }));

    try {
      const r = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });
      if (!r.ok) throw new Error();
    } catch {
      // Reverter em caso de falha da API
      fetchLeads();
    }
  };

  const deletarLead = async (id: string): Promise<boolean> => {
    if (!confirm("Tem certeza que deseja excluir este lead permanentemente?")) return false;
    
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

  const carregarNotas = useCallback(async (leadId: string) => {
    setLoadingNotas(true);
    try {
      const r = await fetch(`/api/leads/${leadId}/notas`);
      if (r.ok) {
        const d = await r.json();
        setNotas(d.notas || []);
      }
    } catch (err) {
      console.error("Erro ao carregar notas:", err);
    } finally {
      setLoadingNotas(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLead?.id) {
      carregarNotas(selectedLead.id);
      setNovaNota("");
    } else {
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
      l.status === "ganho" ? "Ganho" : l.status === "perdido" ? "Perdido" : l.status === "contatado" ? "Em Contato" : "Pendente",
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
    return lead.status || (lead.contatado ? "contatado" : "pendente");
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
      await updateLeadStatus(draggedLeadId, status);
      setDraggedLeadId(null);
    }
  };

  const leadsFiltrados = leads
    .filter((l) => {
      const currentStatus = getStatusSafe(l);
      if (viewMode === "tabela") {
        if (filtro === "pendentes") return currentStatus === "pendente";
        if (filtro === "contatados") return currentStatus === "contatado";
        if (filtro === "ganhos") return currentStatus === "ganho";
        if (filtro === "perdidos") return currentStatus === "perdido";
      }
      return true;
    })
    .filter((l) =>
      busca
        ? l.nome.toLowerCase().includes(busca.toLowerCase()) ||
          l.email.toLowerCase().includes(busca.toLowerCase()) ||
          l.telefone.includes(busca)
        : true
    );

  const stats = {
    total: leads.length,
    pendentes: leads.filter((l) => getStatusSafe(l) === "pendente").length,
    contatados: leads.filter((l) => getStatusSafe(l) === "contatado").length,
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-7">
        {[
          { label: "Total de leads", value: stats.total, icon: "👥", color: "text-slate-900", bg: "bg-slate-50 border-slate-100" },
          { label: "Pendentes", value: stats.pendentes, icon: "⏳", color: "text-red-650", bg: "bg-red-50/50 border-red-100" },
          { label: "Em Contato", value: stats.contatados, icon: "📞", color: "text-blue-650", bg: "bg-blue-50/50 border-blue-100" },
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
        
        {/* Left Side: Search Bar and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl items-stretch sm:items-center">
          {/* Search Bar */}
          <div className="flex gap-2 flex-1">
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
              onClick={fetchLeads}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors bg-white shadow-sm cursor-pointer"
              title="Atualizar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
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
            {(["todos", "pendentes", "contatados", "ganhos", "perdidos"] as const).map((f) => (
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
                  ? `⏳ Pendentes (${stats.pendentes})`
                  : f === "contatados"
                  ? `📞 Contatados (${stats.contatados})`
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
        <div className="flex gap-4 overflow-x-auto pb-4 items-stretch select-none">
          {COLUNAS.map((col) => {
            const colLeads = leadsFiltrados.filter((l) => getStatusSafe(l) === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex-1 min-w-[280px] max-w-[340px] rounded-2xl border border-slate-200 border-t-4 p-4 ${col.corCol} flex flex-col min-h-[500px] shadow-sm`}
              >
                {/* Column header */}
                <div className="flex justify-between items-center mb-4 border-b border-slate-150/40 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{col.emoji}</span>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{col.label}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${col.textCor} bg-white border border-slate-200`}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-0.5">
                  {colLeads.map((lead) => {
                    const planoInfo = PLANO_LABEL[lead.planoRecomendado] ?? {
                      label: lead.planoRecomendado,
                      cor: "bg-slate-100 text-slate-700 border-slate-200",
                    };
                    const isDragging = draggedLeadId === lead.id;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedLead(lead)}
                        className={`cursor-pointer bg-white border rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-slate-350 transition-all duration-200 flex flex-col gap-2.5 relative group ${
                          isDragging ? "opacity-30 border-dashed border-[#2B3DA8] bg-slate-50" : "border-slate-200/80"
                        }`}
                      >
                        {/* Header card info */}
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-slate-800 text-xs leading-snug truncate max-w-[130px]" title={lead.nome}>
                            {lead.nome}
                          </p>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 leading-none ${planoInfo.cor}`}>
                            {planoInfo.label}
                          </span>
                        </div>

                        {/* Bottom Actions card */}
                        <div className="flex items-center justify-between mt-1 border-t border-slate-100 pt-2 gap-2">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(lead.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                          </span>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {/* Selector for mobile and quick change */}
                            <select
                              value={col.id}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border outline-none cursor-pointer transition-all ${
                                col.id === "ganho"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : col.id === "perdido"
                                  ? "bg-slate-50 text-slate-600 border-slate-200"
                                  : col.id === "contatado"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              <option value="pendente">⏳</option>
                              <option value="contatado">📞</option>
                              <option value="ganho">🤝</option>
                              <option value="perdido">❌</option>
                            </select>

                            {/* WhatsApp Shortcut */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirWhatsAppModal(lead);
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white p-1 rounded transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                              title="Conversar no WhatsApp"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                            </button>

                            {/* Deletar Shortcut */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deletarLead(lead.id);
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-650 p-1 rounded border border-red-200 transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                              title="Excluir Lead"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
                          <p className="font-bold text-slate-800 truncate">{lead.nome}</p>
                          <p className="text-slate-400 text-xs md:hidden mt-0.5 truncate">{lead.telefone}</p>
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
                          <select
                            value={currentStatus}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-all shadow-sm ${
                              currentStatus === "ganho"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : currentStatus === "perdido"
                                ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                : currentStatus === "contatado"
                                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }`}
                          >
                            <option value="pendente">⏳ Pendente</option>
                            <option value="contatado">📞 Em Contato</option>
                            <option value="ganho">🤝 Ganho (Contratado)</option>
                            <option value="perdido">❌ Perdido</option>
                          </select>
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
                              onClick={() => deletarLead(lead.id)}
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
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Detalhamento do Lead</span>
                <h3 className="text-xl font-extrabold text-slate-805 mt-1">{selectedLead.nome}</h3>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none font-medium cursor-pointer p-1"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Section 1: Contato */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Contato
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Telefone</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedLead.telefone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">E-mail</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 break-all">{selectedLead.email}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Respostas do Simulador */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Perfil da Simulação
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Proteger quem</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {selectedLead.paraQuem === "familia" ? "👨‍👩‍👧‍👦 Família" : "👤 Si mesmo"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Quantidade</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedLead.quantidadePessoas} pessoa(s)</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Cidade</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedLead.cidade || "Não informada"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Contato por</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {selectedLead.comoContatar === "whatsapp" ? "💬 WhatsApp" : selectedLead.comoContatar === "ligacao" ? "📞 Ligação" : selectedLead.comoContatar === "visita" ? "🏠 Visita" : selectedLead.comoContatar || "Não informado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Orçamento</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">Até {selectedLead.orcamento}/mês</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Prioridade Declarada</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      🎯 {PRIORIDADE_LABEL[selectedLead.prioridade] ?? selectedLead.prioridade}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Indicação */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Recomendação do Plano
                </h4>
                <div className="flex items-center gap-3 bg-amber-50/50 border border-amber-100 p-4 rounded-2xl">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-xs text-slate-500">O simulador indicou o plano:</p>
                    <p className="text-base font-extrabold text-amber-800 mt-0.5">
                      Plano {PLANO_LABEL[selectedLead.planoRecomendado]?.label ?? selectedLead.planoRecomendado}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Gestão do Funil */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Alterar Status Comercial
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "pendente", label: "⏳ Pendente", color: "bg-red-50 text-red-700 border-red-200" },
                    { id: "contatado", label: "📞 Em Contato", color: "bg-blue-50 text-blue-700 border-blue-200" },
                    { id: "ganho", label: "🤝 Ganho", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { id: "perdido", label: "❌ Perdido", color: "bg-slate-50 text-slate-600 border-slate-200" },
                  ].map((btn) => {
                    const currentStatus = getStatusSafe(selectedLead);
                    const isActive = currentStatus === btn.id;
                    return (
                      <button
                        key={btn.id}
                        onClick={async () => {
                          await updateLeadStatus(selectedLead.id, btn.id);
                          setSelectedLead((prev) => prev ? { ...prev, status: btn.id, contatado: btn.id !== "pendente" } : null);
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

              {/* Section 5: Histórico de Notas & Interações */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Notas & Histórico
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
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 mt-2">
                  {loadingNotas ? (
                    <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-xs">
                      <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-[#2B3DA8] rounded-full animate-spin" />
                      Carregando histórico...
                    </div>
                  ) : notas.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6 italic">
                      Nenhuma anotação registrada para este lead.
                    </p>
                  ) : (
                    <div className="relative pl-4 border-l border-slate-150 space-y-4 ml-1.5">
                      {notas.map((nota) => (
                        <div key={nota.id} className="relative group">
                          {/* Marcador circular na linha */}
                          <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full border border-white bg-slate-400 group-hover:bg-[#2B3DA8] transition-colors" />
                          
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1 shadow-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-600">{nota.autor}</span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(nota.criadoEm).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 leading-normal whitespace-pre-wrap">{nota.conteudo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer / Main CTA */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button 
                type="button"
                onClick={async () => {
                  const deletado = await deletarLead(selectedLead.id);
                  if (deletado) setSelectedLead(null);
                }}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <option value="pendente">⏳ Pendente</option>
                        <option value="contatado">📞 Em Contato</option>
                        <option value="ganho">🤝 Ganho (Contratado)</option>
                        <option value="perdido">❌ Perdido</option>
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
    </main>
  );
}
