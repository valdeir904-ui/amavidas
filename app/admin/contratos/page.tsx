"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ContractPDFTemplate, { ContratoData } from "@/components/admin/ContractPDFTemplate";

export default function ContratosPage() {
  const [contratos, setContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedContrato, setSelectedContrato] = useState<ContratoData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchContratos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contratos?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setContratos(data.contratos || []);
      }
    } catch (err) {
      console.error("Erro ao carregar contratos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContratos();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contrato?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/contratos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setContratos((prev) => prev.filter((c) => c.id !== id));
        if (selectedContrato && (selectedContrato as any).id === id) {
          setSelectedContrato(null);
        }
      } else {
        alert("Erro ao excluir: " + (data.error || "Erro desconhecido"));
      }
    } catch (err) {
      alert("Erro ao conectar com servidor.");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatContractData = (c: any): ContratoData => {
    let beneficiariosArr: any[] = [];
    if (c.beneficiarios) {
      try {
        beneficiariosArr = typeof c.beneficiarios === "string" ? JSON.parse(c.beneficiarios) : c.beneficiarios;
      } catch (e) {}
    }

    return {
      numeroContrato: c.numeroContrato,
      tipoContratacao: c.tipoContratacao,
      natureza: c.natureza,
      plano: c.plano,
      valorAdesao: c.valorAdesao,
      valorMensalidade: c.valorMensalidade,
      formaPagamento: c.formaPagamento,
      cidadeAssinatura: c.cidadeAssinatura,
      dataAssinatura: c.dataAssinatura,

      titularNome: c.titularNome,
      titularCpf: c.titularCpf,
      titularRg: c.titularRg,
      titularEndereco: c.titularEndereco,
      titularBairro: c.titularBairro,
      titularCidade: c.titularCidade,
      titularUf: c.titularUf,
      titularCep: c.titularCep,
      titularTelefone: c.titularTelefone,
      titularEmail: c.titularEmail,

      pjRazaoSocial: c.pjRazaoSocial,
      pjCnpj: c.pjCnpj,
      pjRepresentante: c.pjRepresentante,
      pjRepresentanteCpf: c.pjRepresentanteCpf,
      pjRepresentanteRg: c.pjRepresentanteRg,

      beneficiarios: beneficiariosArr,
      observacoes: c.observacoes,
    };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER DA TELA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-[#4f6ef7] to-[#06b6d4] text-white rounded-xl shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Gerador de Contratos</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gere, visualize e exporte os contratos oficiais em PDF para os clientes da AmaVidas.
          </p>
        </div>

        <Link
          href="/admin/contratos/novo"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#4f6ef7] to-[#06b6d4] text-white font-semibold rounded-xl hover:opacity-95 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Criar Novo Contrato
        </Link>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Buscar por cliente, CPF, CNPJ ou nº do contrato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="text-xs font-medium text-slate-500">
          Total: <strong className="text-slate-900">{contratos.length}</strong> contrato(s) emitido(s)
        </div>
      </div>

      {/* LISTAGEM DE CONTRATOS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm">Carregando contratos...</p>
          </div>
        ) : contratos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">Nenhum contrato encontrado</p>
            <p className="text-xs text-slate-400">Clique no botão &quot;Criar Novo Contrato&quot; para preencher o primeiro contrato.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4">Nº Contrato</th>
                  <th className="px-6 py-4">Titular / Razão Social</th>
                  <th className="px-6 py-4">Plano</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Mensalidade</th>
                  <th className="px-6 py-4">Data Emissão</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {contratos.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {c.numeroContrato}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{c.titularNome || c.pjRazaoSocial}</p>
                        <p className="text-xs text-slate-400">{c.titularCpf || c.pjCnpj}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {c.plano}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      <span className={`px-2 py-0.5 rounded ${c.natureza === "PJ" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {c.natureza === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {c.valorMensalidade ? `R$ ${c.valorMensalidade}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(c.dataAssinatura || c.criadoEm).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedContrato(formatContractData(c))}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-all shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver / PDF
                      </button>

                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                        title="Excluir Contrato"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE VISUALIZAÇÃO E IMPRESSÃO DO CONTRATO */}
      {selectedContrato && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 overflow-y-auto flex items-center justify-center p-4 print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl my-8 print:my-0 print:shadow-none print:w-full">
            {/* BARRA SUPERIOR DO MODAL */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Contrato Nº {selectedContrato.numeroContrato}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Titular: {selectedContrato.titularNome || selectedContrato.pjRazaoSocial}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gradient-to-r from-[#4f6ef7] to-[#06b6d4] text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-md flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Exportar PDF / Imprimir
                </button>

                <button
                  onClick={() => setSelectedContrato(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* CORPO DO CONTRATO PARA PREVIEW E PRINT */}
            <div className="p-6 max-h-[80vh] overflow-y-auto print:max-h-none print:p-0">
              <ContractPDFTemplate data={selectedContrato} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
