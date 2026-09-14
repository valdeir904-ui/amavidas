"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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
  atualizadoEm?: string;
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
  historico?: { id: string; acao: string; usuario?: { nome: string } }[];
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
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
  outro: "Outro motivo",
};

const INTENCAO_LABELS: Record<string, { label: string; cor: string; icon: string }> = {
  contratar_agora: { label: "Quer contratar agora", cor: "bg-red-50 text-red-700 border-red-200", icon: "🔥" },
  entender_melhor: { label: "Quer entender melhor", cor: "bg-amber-50 text-amber-800 border-amber-200", icon: "💡" },
  pesquisando: { label: "Apenas pesquisando", cor: "bg-blue-50 text-blue-700 border-blue-200", icon: "🔍" },
};

const PLANO_LABEL: Record<string, string> = {
  essencial: "Essencial",
  familia: "Família",
  premium: "Premium",
  "amar-plus": "Amar Plus",
  "vida-plus": "Vida Plus",
  "plano-pet": "Plano Pet",
};

export default function LeadsDescartadosPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; perfil: string; nome?: string } | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [vendedores, setVendedores] = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroMotivo, setFiltroMotivo] = useState("todos");
  const [filtroIntencao, setFiltroIntencao] = useState("todos");
  const [filtroVendedor, setFiltroVendedor] = useState("todos");

  // Lead selecionado para detalhes
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loadingNotas, setLoadingNotas] = useState(false);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      })
      .catch(() => {});

    fetch("/api/admin/usuarios")
      .then((r) => r.json())
      .then((d) => {
        if (d.usuarios) setVendedores(d.usuarios);
      })
      .catch(() => {});
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const resp = await fetch("/api/leads");
      if (!resp.ok) throw new Error("Erro ao carregar leads.");
      const data = await resp.json();
      setLeads(data.leads || []);
    } catch {
      setErro("Não foi possível carregar os leads descartados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
        const apiHistorico = (d.historico || []).map((h: any) => ({
          id: h.id,
          tipo: "historico",
          conteudo: h.observacao || h.acao,
          autor: h.usuario?.nome || "Sistema",
          criadoEm: h.criadoEm,
        }));
        const combinada = [...apiNotas, ...apiHistorico].sort(
          (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
        );
        setTimeline(combinada);
      }
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    } finally {
      setLoadingNotas(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLead?.id) {
      carregarNotas(selectedLead.id);
    }
  }, [selectedLead, carregarNotas]);

  const reativarLead = async (lead: Lead) => {
    if (!currentUser) return;
    if (!confirm(`Deseja reativar o lead "${lead.nome}" e assumi-lo para retomar o contato comercial?`)) return;

    setProcessandoId(lead.id);
    try {
      const resp = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          status: "contatado",
          responsavelId: currentUser.id,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "Erro ao reativar lead");
      }

      alert(`🎉 Lead "${lead.nome}" reativado com sucesso e atribuído a você!`);
      if (selectedLead?.id === lead.id) setSelectedLead(null);
      fetchLeads();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setProcessandoId(null);
    }
  };

  // Filtragem de Leads Descartados
  const leadsPerdidos = leads.filter((l) => (l.status || "").toLowerCase() === "perdido");

  const leadsFiltrados = leadsPerdidos
    .filter((l) => {
      if (filtroMotivo === "todos") return true;
      const motivo = l.motivoDescarte || l.motivoPerda || "outro";
      return motivo === filtroMotivo;
    })
    .filter((l) => {
      if (filtroIntencao === "todos") return true;
      return l.intencao === filtroIntencao;
    })
    .filter((l) => {
      if (filtroVendedor === "todos") return true;
      if (filtroVendedor === "sem_responsavel") return !l.responsavelId;
      return l.responsavelId === filtroVendedor;
    })
    .filter((l) => {
      if (!busca.trim()) return true;
      const term = busca.toLowerCase();
      return (
        l.nome.toLowerCase().includes(term) ||
        (l.email && l.email.toLowerCase().includes(term)) ||
        l.telefone.includes(term)
      );
    });

  // Estatísticas de Descarte
  const totalDescartados = leadsPerdidos.length;
  const querContratarCount = leadsPerdidos.filter((l) => l.intencao === "contratar_agora").length;
  const querEntenderCount = leadsPerdidos.filter((l) => l.intencao === "entender_melhor").length;
  const achouCaroCount = leadsPerdidos.filter((l) => (l.motivoDescarte || l.motivoPerda) === "achou_caro").length;

  return (
    <main className="flex-1 p-6 lg:p-8 bg-[#f8fafc] min-h-screen">
      {/* Header da Página */}
      <div className="mb-8 border-b border-slate-200/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-100 text-red-700 border border-red-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Painel de Recuperação Comercial
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>❌</span> Leads Descartados & Perdidos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Encontre oportunidades descartadas, analise os motivos de perda e retome o contato para tentar fechar novas vendas.
          </p>
        </div>

        <Link
          href="/admin/oportunidades"
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 self-start md:self-auto cursor-pointer"
        >
          <span>⬅️</span> Voltar ao Pipeline Ativo
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Descartados</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalDescartados}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Oportunidades em histórico</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4.5 rounded-2xl border border-red-200 shadow-sm">
          <p className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
            🔥 Queriam Contratar
          </p>
          <p className="text-3xl font-black text-red-700 mt-1">{querContratarCount}</p>
          <p className="text-[10px] text-red-600 font-bold mt-1">Alta prioridade de resgate</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4.5 rounded-2xl border border-amber-200 shadow-sm">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            💡 Queriam Entender
          </p>
          <p className="text-3xl font-black text-amber-700 mt-1">{querEntenderCount}</p>
          <p className="text-[10px] text-amber-600 font-medium mt-1">Dúvidas sobre o produto</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Motivo: Achou Caro</p>
          <p className="text-3xl font-black text-purple-700 mt-1">{achouCaroCount}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Potencial para oferta de desconto</p>
        </div>
      </div>

      {/* Barra de Filtros Dedicada */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-7 space-y-4">
        <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
          {/* Busca por Texto */}
          <div className="relative flex-1 max-w-md">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-350 outline-none text-xs bg-slate-50/50 text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Filtros Dropdown */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* 1. Filtro Motivo da Perda */}
            <select
              value={filtroMotivo}
              onChange={(e) => setFiltroMotivo(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 shadow-2xs outline-none cursor-pointer"
            >
              <option value="todos">🎯 Todos os Motivos de Perda</option>
              {Object.entries(MOTIVOS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  ❌ {label}
                </option>
              ))}
            </select>

            {/* 2. Filtro Nível de Interesse / Intenção */}
            <select
              value={filtroIntencao}
              onChange={(e) => setFiltroIntencao(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 shadow-2xs outline-none cursor-pointer"
            >
              <option value="todos">🔥 Todos Níveis de Interesse</option>
              <option value="contratar_agora">🔥 Quer contratar agora</option>
              <option value="entender_melhor">💡 Quer entender melhor</option>
              <option value="pesquisando">🔍 Apenas pesquisando</option>
            </select>

            {/* 3. Filtro Vendedor que Descartou */}
            {(currentUser?.perfil === "MASTER" || currentUser?.perfil === "GERENTE") && (
              <select
                value={filtroVendedor}
                onChange={(e) => setFiltroVendedor(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 shadow-2xs outline-none cursor-pointer"
              >
                <option value="todos">👤 Todos os Vendedores</option>
                <option value="sem_responsavel">👤 Sem Responsável</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>
                    👤 {v.nome}
                  </option>
                ))}
              </select>
            )}

            {/* Resetar Filtros */}
            {(filtroMotivo !== "todos" || filtroIntencao !== "todos" || filtroVendedor !== "todos" || busca) && (
              <button
                type="button"
                onClick={() => {
                  setFiltroMotivo("todos");
                  setFiltroIntencao("todos");
                  setFiltroVendedor("todos");
                  setBusca("");
                }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors text-xs font-bold cursor-pointer"
                title="Limpar Filtros"
              >
                🧹 Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Leads Descartados */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-red-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Carregando leads descartados...</p>
        </div>
      ) : erro ? (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-sm text-red-600 font-bold text-xs">
          ⚠️ {erro}
        </div>
      ) : leadsFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <p className="text-4xl mb-2">🔍</p>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Nenhum lead descartado encontrado</h3>
          <p className="text-xs text-slate-400">Tente ajustar os filtros de busca ou motivo da perda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5">Lead / Contato</th>
                  <th className="text-left px-5 py-3.5">Motivo da Perda</th>
                  <th className="text-left px-5 py-3.5">Nível de Interesse</th>
                  <th className="text-left px-5 py-3.5">Observações do Descarte</th>
                  <th className="text-left px-5 py-3.5">Vendedor Anterior</th>
                  <th className="text-right px-5 py-3.5">Ação de Resgate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leadsFiltrados.map((lead) => {
                  const intencaoInfo = INTENCAO_LABELS[lead.intencao || ""] ?? {
                    label: "Não informada",
                    cor: "bg-slate-100 text-slate-600 border-slate-200",
                    icon: "⚪",
                  };
                  const motivoLabel = MOTIVOS_LABELS[lead.motivoDescarte || lead.motivoPerda || ""] || lead.motivoDescarte || lead.motivoPerda || "Não informado";

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Nome + Telefone */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{lead.nome}</div>
                        <div className="text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>📞 {lead.telefone}</span>
                          {lead.cidade && <span className="text-slate-400">• 📍 {lead.cidade}</span>}
                        </div>
                      </td>

                      {/* Motivo da Perda */}
                      <td className="px-5 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          ❌ {motivoLabel}
                        </span>
                      </td>

                      {/* Nível de Interesse */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${intencaoInfo.cor}`}>
                          <span>{intencaoInfo.icon}</span>
                          <span>{intencaoInfo.label}</span>
                        </span>
                      </td>

                      {/* Observações */}
                      <td className="px-5 py-4 text-slate-600 max-w-[220px]">
                        <p className="truncate italic" title={lead.descarteObservacao || "Sem observação adicional"}>
                          {lead.descarteObservacao || <span className="text-slate-400 italic">Sem observações</span>}
                        </p>
                      </td>

                      {/* Vendedor */}
                      <td className="px-5 py-4 text-slate-700">
                        {lead.responsavel ? (
                          <span className="font-semibold">{lead.responsavel.nome}</span>
                        ) : (
                          <span className="text-slate-400 italic">Sem responsável</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedLead(lead)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                          >
                            👁️ Ficha
                          </button>

                          <button
                            type="button"
                            disabled={processandoId === lead.id}
                            onClick={() => reativarLead(lead)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title="Reativar lead e assumir para a gerência"
                          >
                            {processandoId === lead.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <span>🔄</span>
                                <span>Retomar Contato</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Ficha Detalhada do Lead Descartado */}
      {selectedLead && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
                  Lead Descartado
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">{selectedLead.nome}</h3>
                <p className="text-xs text-slate-400 mt-0.5">📞 {selectedLead.telefone} {selectedLead.email ? `• 📧 ${selectedLead.email}` : ""}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white text-xl p-1"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                <div>
                  <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Motivo da Perda</p>
                  <p className="font-extrabold text-red-900 text-sm mt-0.5">
                    {MOTIVOS_LABELS[selectedLead.motivoDescarte || selectedLead.motivoPerda || ""] || selectedLead.motivoDescarte || "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Nível de Interesse</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {INTENCAO_LABELS[selectedLead.intencao || ""]?.icon} {INTENCAO_LABELS[selectedLead.intencao || ""]?.label || selectedLead.intencao || "Não informado"}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-red-100">
                  <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Observações do Descarte</p>
                  <p className="text-xs text-slate-700 italic mt-0.5">{selectedLead.descarteObservacao || "Sem observações registradas."}</p>
                </div>
              </div>

              {/* Informações da Simulação */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Dados da Simulação Original</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><strong>Plano Indicado:</strong> {PLANO_LABEL[selectedLead.planoRecomendado] || selectedLead.planoRecomendado}</div>
                  <div><strong>Orçamento:</strong> {selectedLead.orcamento || "Não informado"}</div>
                  <div><strong>Para quem:</strong> {selectedLead.paraQuem || "Não informado"}</div>
                  <div><strong>Cidade:</strong> {selectedLead.cidade || "Não informada"}</div>
                </div>
              </div>

              {/* Histórico / Linha do Tempo */}
              <div className="space-y-2 pt-2">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Histórico de Atendimento</p>
                {loadingNotas ? (
                  <p className="text-xs text-slate-400 italic">Carregando histórico...</p>
                ) : timeline.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Sem registros anteriores.</p>
                ) : (
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {timeline.map((item) => (
                      <div key={item.id} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-0.5">
                          <span>{item.autor}</span>
                          <span>{new Date(item.criadoEm).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <p className="text-slate-700">{item.conteudo}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => reativarLead(selectedLead)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <span>🔄</span>
                <span>Retomar Contato & Reativar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
