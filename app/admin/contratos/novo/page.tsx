"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ContractPDFTemplate, { ContratoData, Beneficiario } from "@/components/admin/ContractPDFTemplate";

function NovoContratoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [savedContractId, setSavedContractId] = useState<string | null>(null);

  // LISTA DE LEADS PARA VINCULAR
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  // MÁSCARAS DE FORMATAÇÃO
  const formatCPF = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatCNPJ = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // ESTADO DO FORMULÁRIO DO CONTRATO
  const [formData, setFormData] = useState<ContratoData>({
    numeroContrato: "CTR-2026-0001",
    tipoContratacao: "Nova contratação",
    natureza: "PF",
    plano: "Plano Completo (Amar Plus)",
    valorAdesao: "150,00",
    valorMensalidade: "79,90",
    formaPagamento: "Boleto Bancário",
    cidadeAssinatura: "Águas Lindas de Goiás - GO",

    titularNome: "",
    titularCpf: "",
    titularRg: "",
    titularEndereco: "",
    titularBairro: "Mansões Águas Lindas",
    titularQuadra: "",
    titularLote: "",
    titularCidade: "Águas Lindas de Goiás",
    titularUf: "GO",
    titularCep: "72.915-000",
    titularTelefone: "",
    titularEmail: "",

    pjRazaoSocial: "",
    pjCnpj: "",
    pjRepresentante: "",
    pjRepresentanteCpf: "",
    pjRepresentanteRg: "",

    beneficiarios: [],
    observacoes: "",
    simulacaoId: "",
  });

  // ESTADO AUXILIAR PARA ADICIONAR BENEFICIÁRIO
  const [novoBeneficiario, setNovoBeneficiario] = useState<Beneficiario>({
    nome: "",
    cpfOrRg: "",
    parentesco: "Cônjuge",
    tipo: "DEPENDENTE",
    dataNascimento: "",
  });

  // CARREGAR LISTA DE LEADS DO CRM
  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.leads && Array.isArray(data.leads)) {
          setLeads(data.leads);
        }
      })
      .catch(() => {});
  }, []);

  // SE HOUVER PARAMETRO ?leadId NA URL, PREENCHER DADOS AUTOMATICAMENTE
  useEffect(() => {
    const paramLeadId = searchParams.get("leadId");
    if (paramLeadId && leads.length > 0) {
      const found = leads.find((l) => l.id === paramLeadId);
      if (found) {
        selectLead(found);
      }
    }
  }, [searchParams, leads]);

  // VINCULAR LEAD E PREENCHER CAMPOS AUTOMATICAMENTE
  const selectLead = (lead: any) => {
    setSelectedLeadId(lead.id);

    let planoNome = "Plano Completo (Amar Plus)";
    let mensalidade = "79,90";
    let adesao = "150,00";

    const pRec = (lead.planoRecomendado || "").toLowerCase();
    if (pRec.includes("cuidar")) {
      planoNome = "Plano Básico (Cuidar Plus)";
      mensalidade = "35,00";
      adesao = "105,00";
    } else if (pRec.includes("vida")) {
      planoNome = "Plano Alto Padrão (Vida Plus)";
      mensalidade = "90,00";
      adesao = "270,00";
    }

    setFormData((prev) => ({
      ...prev,
      simulacaoId: lead.id,
      titularNome: lead.nomeCompletoContrato || lead.nome || prev.titularNome,
      titularTelefone: formatPhone(lead.telefone || ""),
      titularEmail: lead.email || prev.titularEmail,
      titularCidade: lead.cidade || prev.titularCidade,
      plano: planoNome,
      valorMensalidade: mensalidade,
      valorAdesao: adesao,
    }));
  };

  // ATUALIZAÇÃO DOS CAMPOS COM MÁSCARA AUTOMÁTICA
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "plano") {
      let defaultMensalidade = "79,90";
      let defaultAdesao = "150,00";

      if (value.includes("Cuidar")) {
        defaultMensalidade = "35,00";
        defaultAdesao = "105,00";
      } else if (value.includes("Vida")) {
        defaultMensalidade = "90,00";
        defaultAdesao = "270,00";
      } else if (value.includes("Amar")) {
        defaultMensalidade = "79,90";
        defaultAdesao = "150,00";
      }

      setFormData((prev) => ({
        ...prev,
        plano: value,
        valorMensalidade: defaultMensalidade,
        valorAdesao: defaultAdesao,
      }));
      return;
    }

    if (name === "titularCpf" || name === "pjRepresentanteCpf") {
      setFormData((prev) => ({ ...prev, [name]: formatCPF(value) }));
      return;
    }

    if (name === "pjCnpj") {
      setFormData((prev) => ({ ...prev, [name]: formatCNPJ(value) }));
      return;
    }

    if (name === "titularTelefone") {
      setFormData((prev) => ({ ...prev, [name]: formatPhone(value) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [validationErrorModal, setValidationErrorModal] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<{ id: string; numeroContrato: string } | null>(null);

  // ADICIONAR BENEFICIÁRIO
  const handleAddBeneficiario = () => {
    if (!novoBeneficiario.nome.trim()) {
      setValidationErrorModal("Por favor, informe o nome do beneficiário antes de adicioná-lo à proposta.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      beneficiarios: [...prev.beneficiarios, novoBeneficiario],
    }));
    setNovoBeneficiario({
      nome: "",
      cpfOrRg: "",
      parentesco: "Cônjuge",
      tipo: "DEPENDENTE",
      dataNascimento: "",
    });
  };

  // REMOVER BENEFICIÁRIO
  const handleRemoveBeneficiario = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      beneficiarios: prev.beneficiarios.filter((_, i) => i !== index),
    }));
  };

  // SALVAR CONTRATO NO BANCO
  const saveContract = async (redirectOnSuccess = true) => {
    if (formData.natureza === "PF" && !formData.titularNome.trim()) {
      setValidationErrorModal("Por favor, preencha o nome do titular contratante.");
      return null;
    }
    if (formData.natureza === "PJ" && !formData.pjRazaoSocial?.trim()) {
      setValidationErrorModal("Por favor, preencha a Razão Social da empresa contratante.");
      return null;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSavedContractId(data.contrato.id);
        if (redirectOnSuccess) {
          setSuccessModal({ id: data.contrato.id, numeroContrato: data.contrato.numeroContrato });
        }
        return data.contrato;
      } else {
        setValidationErrorModal("Erro ao salvar contrato: " + (data.error || "Erro desconhecido"));
        return null;
      }
    } catch (err) {
      setValidationErrorModal("Falha de conexão com o servidor ao tentar salvar o contrato.");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => saveContract(true);

  // IMPRIMIR / SALVAR PDF (AUTO-SALVA SE AINDA NÃO FOI SALVO)
  const handlePrint = async () => {
    if (!savedContractId) {
      const saved = await saveContract(false);
      if (!saved) return;
    }
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER DA TELA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/contratos"
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all mr-1"
              title="Voltar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Novo Contrato AmaVidas</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Preencha os dados do cliente para gerar o contrato com pré-visualização em tempo real e exportação em PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            disabled={saving}
            className="px-4 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            )}
            Exportar PDF / Imprimir
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-[#4f6ef7] to-[#06b6d4] text-white font-semibold text-xs rounded-xl hover:opacity-95 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Salvar Contrato
          </button>
        </div>
      </div>

      {/* GRID COM FORMULÁRIO (ESQUERDA) E PREVIEW (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA ESQUERDA: FORMULÁRIO */}
        <div className="lg:col-span-6 space-y-6 print:hidden">
          {/* TIPO, NATUREZA E VÍNCULO DE LEAD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
              Tipo de Contratação & Vínculo de Lead
            </h2>

            {/* SELETOR DE LEAD DO CRM */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                🔗 Vincular a um Lead do CRM (Opcional)
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => {
                  const lead = leads.find((l) => l.id === e.target.value);
                  if (lead) selectLead(lead);
                  else setSelectedLeadId("");
                }}
                className="w-full px-3 py-2 bg-blue-50/60 border border-blue-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Nenhum lead selecionado (Contrato Avulso)</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome} ({l.telefone}) - {l.planoRecomendado || "Sem plano"}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Ao selecionar um lead, os dados do titular e plano recomendado serão preenchidos automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Número do Contrato</label>
                <input
                  type="text"
                  name="numeroContrato"
                  placeholder="Ex: CTR-2026-0001"
                  value={formData.numeroContrato}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Contratação</label>
                <select
                  name="tipoContratacao"
                  value={formData.tipoContratacao}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Nova contratação">Nova Contratação</option>
                  <option value="Portabilidade">Portabilidade de outro plano</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Natureza do Titular</label>
                <select
                  name="natureza"
                  value={formData.natureza}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="PF">Pessoa Natural (Física)</option>
                  <option value="PJ">Pessoa Jurídica (Empresa)</option>
                </select>
              </div>
            </div>
          </div>

          {/* DADOS DO TITULAR (PF / PJ) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
              Dados do Titular ({formData.natureza === "PF" ? "Pessoa Natural" : "Pessoa Jurídica"})
            </h2>

            {formData.natureza === "PF" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo do Titular *</label>
                    <input
                      type="text"
                      name="titularNome"
                      placeholder="Nome do cliente"
                      value={formData.titularNome}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CPF (apenas números)</label>
                    <input
                      type="text"
                      name="titularCpf"
                      placeholder="000.000.000-00"
                      maxLength={14}
                      inputMode="numeric"
                      value={formData.titularCpf}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">RG / Órgão Expedidor</label>
                    <input
                      type="text"
                      name="titularRg"
                      placeholder="Ex: 1234567 SSP/GO"
                      value={formData.titularRg}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço (Rua / Logradouro)</label>
                    <input
                      type="text"
                      name="titularEndereco"
                      placeholder="Ex: Rua 10"
                      value={formData.titularEndereco}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro / Setor</label>
                    <input
                      type="text"
                      name="titularBairro"
                      value={formData.titularBairro}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quadra</label>
                    <input
                      type="text"
                      name="titularQuadra"
                      placeholder="Qd 05"
                      value={formData.titularQuadra}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Lote</label>
                    <input
                      type="text"
                      name="titularLote"
                      placeholder="Lt 23"
                      value={formData.titularLote}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      name="titularCidade"
                      value={formData.titularCidade}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estado (UF)</label>
                    <input
                      type="text"
                      name="titularUf"
                      value={formData.titularUf}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CEP</label>
                    <input
                      type="text"
                      name="titularCep"
                      value={formData.titularCep}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      name="titularTelefone"
                      placeholder="(61) 98545-8010"
                      maxLength={15}
                      inputMode="tel"
                      value={formData.titularTelefone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      name="titularEmail"
                      placeholder="cliente@email.com"
                      value={formData.titularEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Razão Social da Empresa *</label>
                    <input
                      type="text"
                      name="pjRazaoSocial"
                      placeholder="Empresa LTDA"
                      value={formData.pjRazaoSocial}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ</label>
                    <input
                      type="text"
                      name="pjCnpj"
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      value={formData.pjCnpj}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Representante Legal</label>
                    <input
                      type="text"
                      name="pjRepresentante"
                      placeholder="Nome do representante"
                      value={formData.pjRepresentante}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CPF Representante</label>
                    <input
                      type="text"
                      name="pjRepresentanteCpf"
                      placeholder="000.000.000-00"
                      maxLength={14}
                      value={formData.pjRepresentanteCpf}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">RG Representante</label>
                    <input
                      type="text"
                      name="pjRepresentanteRg"
                      placeholder="RG"
                      value={formData.pjRepresentanteRg}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço da Empresa</label>
                    <input
                      type="text"
                      name="titularEndereco"
                      value={formData.titularEndereco}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade da Empresa</label>
                    <input
                      type="text"
                      name="titularCidade"
                      value={formData.titularCidade}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PLANO E CONDIÇÕES FINANCEIRAS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</span>
              Plano & Valores
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plano Selecionado</label>
                <select
                  name="plano"
                  value={formData.plano}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Plano Básico (Cuidar Plus)">Plano Básico (Cuidar Plus)</option>
                  <option value="Plano Completo (Amar Plus)">Plano Completo (Amar Plus)</option>
                  <option value="Plano Alto Padrão (Vida Plus)">Plano Alto Padrão (Vida Plus)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Taxa de Adesão (R$)</label>
                  <input
                    type="text"
                    name="valorAdesao"
                    placeholder="150,00"
                    value={formData.valorAdesao}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mensalidade (R$)</label>
                  <input
                    type="text"
                    name="valorMensalidade"
                    placeholder="79,90"
                    value={formData.valorMensalidade}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    name="formaPagamento"
                    value={formData.formaPagamento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Boleto Bancário">Boleto Bancário</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="PIX Recorrente">PIX Recorrente</option>
                    <option value="Dinheiro / Presencial">Dinheiro / Presencial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade da Assinatura</label>
                  <input
                    type="text"
                    name="cidadeAssinatura"
                    value={formData.cidadeAssinatura}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data da Assinatura</label>
                  <input
                    type="date"
                    name="dataAssinatura"
                    value={formData.dataAssinatura ? formData.dataAssinatura.slice(0, 10) : new Date().toISOString().slice(0, 10)}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DEPENDENTES E AGREGADOS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">4</span>
              Ficha de Adesão (Dependentes & Agregados)
            </h2>

            {/* FORMULÁRIO DE ADIÇÃO DE BENEFICIÁRIO */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase">Adicionar Integrante</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Nome do integrante"
                    value={novoBeneficiario.nome}
                    onChange={(e) => setNovoBeneficiario((prev) => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">CPF ou RG</label>
                  <input
                    type="text"
                    placeholder="Documento"
                    value={novoBeneficiario.cpfOrRg}
                    onChange={(e) => setNovoBeneficiario((prev) => ({ ...prev, cpfOrRg: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Grau de Parentesco</label>
                  <select
                    value={novoBeneficiario.parentesco}
                    onChange={(e) => setNovoBeneficiario((prev) => ({ ...prev, parentesco: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Cônjuge">Cônjuge / Companheiro(a)</option>
                    <option value="Filho(a)">Filho(a)</option>
                    <option value="Pai / Mãe">Pai / Mãe</option>
                    <option value="Sogro(a)">Sogro(a)</option>
                    <option value="Irmão(ã)">Irmão(ã)</option>
                    <option value="Outro Parentesco">Outro Parentesco</option>
                    <option value="Sem Parentesco">Sem Parentesco</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Classificação</label>
                  <select
                    value={novoBeneficiario.tipo}
                    onChange={(e) => setNovoBeneficiario((prev) => ({ ...prev, tipo: e.target.value as any }))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="DEPENDENTE">DEPENDENTE (Direto)</option>
                    <option value="AGREGADO">AGREGADO (Adicional)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddBeneficiario}
                className="w-full py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <span>+ Adicionar à Ficha</span>
              </button>
            </div>

            {/* TABELA DE BENEFICIÁRIOS ADICIONADOS */}
            {formData.beneficiarios.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Nome</th>
                      <th className="p-2.5">Parentesco</th>
                      <th className="p-2.5">Tipo</th>
                      <th className="p-2.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.beneficiarios.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-medium">{b.nome}</td>
                        <td className="p-2.5 text-slate-600">{b.parentesco}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.tipo === "DEPENDENTE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                            {b.tipo}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleRemoveBeneficiario(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">
                Nenhum dependente ou agregado adicionado até o momento.
              </p>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: LIVE PREVIEW DO CONTRATO A4 */}
        <div className="lg:col-span-6 sticky top-6">
          <div className="bg-slate-200 p-4 rounded-2xl border border-slate-300 shadow-inner max-h-[85vh] overflow-y-auto scrollbar-thin print:p-0 print:border-none print:bg-transparent print:max-h-none print:overflow-visible">
            <div className="text-center mb-3 text-xs font-bold text-slate-600 uppercase tracking-wider print:hidden">
              📄 Pré-visualização ao Vivo do Contrato
            </div>
            <ContractPDFTemplate data={formData} />
          </div>
        </div>
      </div>

      {/* MODAL DE VALIDAÇÃO / DADOS FALTANTES COM DESIGN DA MARCA */}
      {validationErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn print:hidden">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl space-y-5 relative overflow-hidden transform transition-all scale-100">
            {/* Linha de destaque com gradiente oficial AmaVidas */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#4f6ef7] via-[#06b6d4] to-[#4f6ef7]" />

            <div className="flex items-start gap-4 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                ⚠️
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Dados Faltantes
                </h3>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  {validationErrorModal}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setValidationErrorModal(null)}
                className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Entendido, vou preencher</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SUCESSO AO GERAR CONTRATO */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn print:hidden">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl space-y-5 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />

            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🎉
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Contrato Salvo com Sucesso!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                O contrato <strong className="font-bold text-slate-900">{successModal.numeroContrato}</strong> foi registrado no banco de dados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => router.push("/admin/contratos")}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Ir para Meus Contratos
              </button>
              <button
                onClick={() => setSuccessModal(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Continuar Editando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NovoContratoPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        Carregando gerador de contratos...
      </div>
    }>
      <NovoContratoContent />
    </Suspense>
  );
}
