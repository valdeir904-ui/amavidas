"use client";

import React from "react";

export interface Beneficiario {
  nome: string;
  cpfOrRg?: string;
  parentesco: string;
  tipo: "DEPENDENTE" | "AGREGADO";
  dataNascimento?: string;
}

export interface ContratoData {
  numeroContrato?: string;
  tipoContratacao?: string; // "Nova contratação", "Portabilidade"
  natureza?: "PF" | "PJ";
  
  // Titular PF
  titularNome: string;
  titularCpf: string;
  titularRg?: string;
  titularEndereco?: string;
  titularBairro?: string;
  titularQuadra?: string;
  titularLote?: string;
  titularCidade?: string;
  titularUf?: string;
  titularCep?: string;
  titularTelefone?: string;
  titularEmail?: string;

  // Titular PJ
  pjRazaoSocial?: string;
  pjCnpj?: string;
  pjRepresentante?: string;
  pjRepresentanteCpf?: string;
  pjRepresentanteRg?: string;

  // Plano e Valores
  plano: string; // "Plano Básico (Cuidar Plus)", "Plano Completo (Amar Plus)", "Plano Alto Padrão (Vida Plus)"
  valorAdesao?: string;
  valorMensalidade?: string;
  formaPagamento?: string;
  cidadeAssinatura?: string;
  dataAssinatura?: string;

  beneficiarios: Beneficiario[];
  observacoes?: string;
  simulacaoId?: string;
}

interface ContractPDFTemplateProps {
  data: ContratoData;
}

export default function ContractPDFTemplate({ data }: ContractPDFTemplateProps) {
  const isPJ = data.natureza === "PJ";
  const dataHoje = data.dataAssinatura ? new Date(data.dataAssinatura) : new Date();

  const dia = dataHoje.getDate();
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const mesExtenso = meses[dataHoje.getMonth()];
  const ano = dataHoje.getFullYear();
  const cidadeExtenso = data.cidadeAssinatura || "Águas Lindas de Goiás (GO)";

  // Rodapé padrão de cada página com o número exato da folha
  const PageFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="border-t border-slate-300 pt-2 mt-auto flex items-center justify-between text-[9px] text-slate-600 font-sans">
      <div className="leading-tight">
        <span>www.amavidas.com</span> | <span>Telefones: (61) 3613-6707 ou (61) 98545-8010</span> | <span>contato@amavidas.com</span>
        <br />
        <span>Endereço: Quadra 5, lote 23 s/n, Edifício Ribeiro, loja 04, Setor Mansões Águas Lindas, Águas Lindas de Goiás - GO</span>
      </div>
      <div className="font-bold text-xs text-slate-800 ml-4 flex-shrink-0">{pageNum}</div>
    </div>
  );

  // Cabeçalho com Logo Transparente Oficial AmaVidas
  const PageHeader = () => (
    <div className="text-center mb-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-amavidas-original.png"
        alt="AmaVidas - Quem Ama, Cuida"
        className="h-16 object-contain mx-auto"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/logo.png";
        }}
      />
    </div>
  );

  return (
    <div className="contract-document bg-slate-100 print:bg-white text-slate-900 font-sans max-w-4xl mx-auto space-y-8 print:space-y-0 print:p-0 print:border-none print:shadow-none print:max-w-none">
      
      {/* ESTILOS DE IMPRESSÃO A4 COM PÁGINAS EXATAS DE 297mm */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }

          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Ocultar tudo na página exceto o documento do contrato */
          body * {
            visibility: hidden !important;
          }

          .contract-document, .contract-document * {
            visibility: visible !important;
          }

          .contract-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }

          .contract-page-a4 {
            width: 210mm !important;
            height: 296mm !important;
            padding: 12mm 15mm 12mm 15mm !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            background: white !important;
          }
        }

        .contract-page-a4 {
          background: white;
          padding: 2rem;
          min-h: 1000px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          margin-bottom: 2rem;
        }
      `}</style>

      {/* ==================== PÁGINA 1 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />

          <div className="text-center space-y-1 mb-4">
            <h1 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
              PLANO DE ASSISTÊNCIA FAMILIAR
            </h1>
            <h2 className="text-xs font-bold uppercase text-slate-800">
              CONTRATO DE SERVIÇOS PÓSTUMOS
            </h2>
            <p className="text-xs font-bold italic text-slate-700">
              Minuta de Contrato Nº {data.numeroContrato || "CTR-NOVO"}
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 mb-4 text-[10.5px]">
            <p className="font-medium">
              <strong>Tipo de contratação:</strong> {data.tipoContratacao || "Nova contratação"} por Portabilidade, <strong>C.E.:</strong> Não. <strong>Natureza Jurídica do Titular:</strong> {isPJ ? "Pessoa Jurídica (PJ)" : "Pessoa Natural (Física)"}
            </p>
          </div>

          {/* DADOS DO TITULAR */}
          {!isPJ ? (
            <div className="mb-4 p-3.5 border border-slate-300 rounded bg-white space-y-2">
              <h3 className="font-bold text-[11px] uppercase bg-slate-100 p-1 border-b border-slate-300 text-center">
                PESSOA NATURAL
              </h3>
              <p className="text-justify text-[11px] leading-relaxed">
                De um lado, <strong className="border-b border-slate-400 px-1 font-bold">{data.titularNome || "______________________________________________________"}</strong>, portador (a) da cédula de identidade <strong className="border-b border-slate-400 px-1">{data.titularRg || "__________________"}</strong>, CPF <strong className="border-b border-slate-400 px-1 font-bold">{data.titularCpf || "____.____.____-__"}</strong>, residente e domiciliado sito a Rua <strong className="border-b border-slate-400 px-1">{data.titularEndereco || "________________________"}</strong>, Setor <strong className="border-b border-slate-400 px-1">{data.titularBairro || "________________"}</strong>, Quadra <strong className="border-b border-slate-400 px-1">{data.titularQuadra || "______"}</strong>, lote <strong className="border-b border-slate-400 px-1">{data.titularLote || "______"}</strong>, no município de <strong className="border-b border-slate-400 px-1">{data.titularCidade || "Águas Lindas de Goiás"}</strong>, CEP <strong className="border-b border-slate-400 px-1">{data.titularCep || "72.915-000"}</strong>, doravante denominado(a) <strong>CONTRATANTE</strong>, e de outro lado, a empresa <strong>AMA VIDAS PLANOS DE ASSISTÊNCIA FAMILIAR LTDA</strong>, inscrita no <strong>CNPJ 32.951.325/0001-46</strong>, com sede na Quadra 5, lote 23 s/n, Edifício Ribeiro, loja 04, Setor Mansões Águas Lindas, no município de Águas Lindas de Goiás / GO, CEP 72.915-192 doravante denominada <strong>CONTRATADA</strong>, tendo as partes entre si, justos e contratados o seguinte:
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3.5 border border-slate-300 rounded bg-white space-y-2">
              <h3 className="font-bold text-[11px] uppercase bg-slate-100 p-1 border-b border-slate-300 text-center">
                PESSOA JURÍDICA
              </h3>
              <p className="text-justify text-[11px] leading-relaxed">
                De um lado, <strong className="border-b border-slate-400 px-1 font-bold">{data.pjRazaoSocial || "______________________________________________________"}</strong>, Inscrita no CNPJ sob número <strong className="border-b border-slate-400 px-1 font-bold">{data.pjCnpj || "__.___.___/____-__"}</strong>, situada à <strong className="border-b border-slate-400 px-1">{data.titularEndereco || "________________________"}</strong>, no município de <strong className="border-b border-slate-400 px-1">{data.titularCidade || "________________"}</strong>, CEP neste contrato representada por <strong className="border-b border-slate-400 px-1">{data.pjRepresentante || "____________________"}</strong>, portador (a) da cédula de identidade nº <strong className="border-b border-slate-400 px-1">{data.pjRepresentanteRg || "__________"}</strong>, CPF <strong className="border-b border-slate-400 px-1 font-bold">{data.pjRepresentanteCpf || "____.____.____-__"}</strong>, doravante denominado(a) <strong>CONTRATANTE</strong>, e de outro lado, a empresa <strong>AMA VIDAS PLANOS DE ASSISTÊNCIA FAMILIAR LTDA</strong>, inscrita no <strong>CNPJ 32.951.325/0001-46</strong>, doravante denominada <strong>CONTRATADA</strong>.
              </p>
            </div>
          )}

          {/* CLÁUSULA I */}
          <div className="space-y-2.5 text-[11px] leading-relaxed">
            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1">
              1. CLÁUSULA I – DO OBJETO
            </h3>
            <p className="text-justify">
              1.1. O Objeto deste é a contratação do <strong className="text-[#4f6ef7] uppercase font-extrabold underline">{data.plano || "PLANO SELECIONADO"}</strong> da AMA VIDAS PLANOS DE ASSISTÊNCIA FAMILIAR LTDA que é uma empresa administradora de planos de ASSISTÊNCIA funerária, conforme previsto na LEI FEDERAL 13.261/2016, que mediante pagamentos mensais, garantirá a oferta de toda a infraestrutura do atendimento, conforme o plano escolhido.
            </p>
            <p>1.2. O atendimento ao cliente é classificado de 2 (duas) formas:</p>
            <p className="pl-4">1.2.1. O Atendimento Administrativo, voltado às questões contratuais e financeiras;</p>
            <p className="pl-4">1.2.2. O Atendimento Póstumo, que é a prestação dos serviços, abaixo discriminados, voltados à realização dos atendimentos póstumos do óbito, até o funeral, doravante denominado BENEFÍCIOS PÓSTUMOS.</p>
            <p className="font-bold pt-1">1.3. BENEFÍCIOS PÓSTUMOS:</p>
            <p className="pl-4 text-justify">
              1.3.1. Através do presente instrumento, o CONTRATANTE, seus DEPENDENTES e AGREGADOS, terão direito ao serviço funerário contratado, compreendido por:
            </p>

            {/* TABELA PARTE 1 */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-[10px] border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold text-center">
                    <th className="p-2 border border-slate-400 text-left w-1/3">Item</th>
                    <th className="p-2 border border-slate-400">Plano Básico (Cuidar Plus)</th>
                    <th className="p-2 border border-slate-400">Plano Completo (Amar Plus)</th>
                    <th className="p-2 border border-slate-400">Plano Alto Padrão (Vida Plus)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-300 font-semibold">Urna Adulto</td>
                    <td className="p-2 border border-slate-300 text-center">Modelo Padrão</td>
                    <td className="p-2 border border-slate-300 text-center">Modelo Padrão</td>
                    <td className="p-2 border border-slate-300 text-center font-bold">Modelo Alto Padrão</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2 border border-slate-300 font-semibold">Urna Infantil</td>
                    <td className="p-2 border border-slate-300 text-center">Laca Branca (De 0,60m a 1,60m)</td>
                    <td className="p-2 border border-slate-300 text-center">Laca Branca (De 0,60m a 1,60m)</td>
                    <td className="p-2 border border-slate-300 text-center">Laca Branca (De 0,60m a 1,60m)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <PageFooter pageNum={1} />
      </div>

      {/* ==================== PÁGINA 2 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />
          <div className="space-y-3">
            <h4 className="font-bold text-[11px] uppercase text-slate-800 border-b border-slate-300 pb-1 mb-2">
              BENEFÍCIOS PÓSTUMOS (CONTINUAÇÃO - TABELA DE COBERTURA)
            </h4>

            <table className="w-full text-[9.5px] border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-800 text-white font-bold text-center">
                  <th className="p-1.5 border border-slate-400 text-left w-1/3">Item</th>
                  <th className="p-1.5 border border-slate-400">Plano Básico (Cuidar Plus)</th>
                  <th className="p-1.5 border border-slate-400">Plano Completo (Amar Plus)</th>
                  <th className="p-1.5 border border-slate-400">Plano Alto Padrão (Vida Plus)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="p-1.5 border border-slate-300 font-semibold">Ornamentação Urna Funerária</td>
                  <td className="p-1.5 border border-slate-300 text-center">Flores Naturais (Padrão)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Flores Naturais (Padrão)</td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">Flores Naturais (Especial)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 font-semibold">Tule (véu)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / Padrão / 1 und.</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / Padrão / 1 und.</td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">Sim / Especial / 1 und.</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-semibold">Terço</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / Padrão / 1 und.</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / Padrão / 1 und.</td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">Sim / Especial / 1 und.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 font-semibold">Velas</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / 2 unidades</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / 2 unidades</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / 2 unidades</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-semibold">Vaso de flor</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / 2 unidades</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / 2 unidades</td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">Sim / 10 unidades</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 font-semibold">Cartões de homenagem</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-semibold">Livro de registro de presença</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / Padrão / 1 und.</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / Padrão / 1 und.</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim / Padrão / 1 und.</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 font-semibold">Montagem do velório incluindo paramentação de acordo com o credo religioso</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim (Católico ou Evangélico)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim (Católico ou Evangélico)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim (Católico ou Evangélico)</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-semibold">1 (uma) remoção no carro da CONTRATADA, no município de Águas Lindas de Goiás (GO)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 font-semibold">1 (um) cortejo no carro da CONTRATADA, no município de Águas Lindas de Goiás (GO)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-semibold">1 (uma) remoção de outro município para Águas Lindas de Goiás (GO). Exclusivamente via terrestre.</td>
                  <td className="p-1.5 border border-slate-300 text-center">Municípios distantes até 100 km</td>
                  <td className="p-1.5 border border-slate-300 text-center">Municípios distantes até 150 km</td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">Municípios distantes até 200 km</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 font-semibold">1 (um) traslado de Águas Lindas de Goiás (GO) para outra localidade. Exclusivamente via terrestre.</td>
                  <td className="p-1.5 border border-slate-300 text-center">Municípios distantes até 100 km</td>
                  <td className="p-1.5 border border-slate-300 text-center">Municípios distantes até 250 km</td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">Municípios distantes até 500 km</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-semibold">Higienização</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim (Externa)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim (Externa)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim (Externa)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 font-semibold">Necromaquiagem</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim (Completa)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim (Completa)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim (Completa)</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-semibold">Nota de Falecimento, Publicação On-line</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 font-semibold">Somatoconservação</td>
                  <td className="p-1.5 border border-slate-300 text-center text-slate-400">Não</td>
                  <td className="p-1.5 border border-slate-300 text-center font-semibold">Completo com Tanatopraxia para até 72 horas</td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">Completo com Tanatopraxia para até 72 horas</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-semibold">INVOL ou ENZIBAC</td>
                  <td className="p-1.5 border border-slate-300 text-center text-slate-400">Não</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim (tamanho compatível com a urna)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Sim (tamanho compatível com a urna)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 font-semibold">Coroa de Flor</td>
                  <td className="p-1.5 border border-slate-300 text-center text-slate-400">Não</td>
                  <td className="p-1.5 border border-slate-300 text-center">Natural Padrão (1 unidade)</td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">Natural Luxo (1 unidade)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <PageFooter pageNum={2} />
      </div>

      {/* ==================== PÁGINA 3 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />
          <div className="space-y-3">
            <table className="w-full text-[9.5px] border-collapse border border-slate-400 mb-3">
              <thead>
                <tr className="bg-slate-800 text-white font-bold text-center">
                  <th className="p-1.5 border border-slate-400 text-left w-1/3">Item</th>
                  <th className="p-1.5 border border-slate-400">Plano Básico (Cuidar Plus)</th>
                  <th className="p-1.5 border border-slate-400">Plano Completo (Amar Plus)</th>
                  <th className="p-1.5 border border-slate-400">Plano Alto Padrão (Vida Plus)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr>
                  <td className="p-1.5 border border-slate-300 font-semibold">Alimentação</td>
                  <td className="p-1.5 border border-slate-300 text-center text-slate-400">Não</td>
                  <td className="p-1.5 border border-slate-300 text-center">Kit Café</td>
                  <td className="p-1.5 border border-slate-300 text-center font-bold">Mini buffet (Até 30 pessoas)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 font-semibold">Conjunto de vestimentas Adulto Feminino</td>
                  <td className="p-1.5 border border-slate-300 text-center text-slate-400">Não</td>
                  <td className="p-1.5 border border-slate-300 text-center">Blazer (padrão)</td>
                  <td className="p-1.5 border border-slate-300 text-center">Blazer / Vestido / Camisa</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-slate-300 font-semibold">Conjunto de vestimentas Adulto Masculino</td>
                  <td className="p-1.5 border border-slate-300 text-center text-slate-400">Não</td>
                  <td className="p-1.5 border border-slate-300 text-center">Camisa, Calça, Gravata e Meias</td>
                  <td className="p-1.5 border border-slate-300 text-center">Paletó, Camisa, Calça, Gravata e Meias</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-1.5 border border-slate-300 font-semibold">Conjunto de vestimentas Infantil / Capela / Jazigo</td>
                  <td className="p-1.5 border border-slate-300 text-center text-slate-400">Não</td>
                  <td className="p-1.5 border border-slate-300 text-center text-slate-400">Não</td>
                  <td className="p-1.5 border border-slate-300 text-center text-slate-400">Não</td>
                </tr>
              </tbody>
            </table>

            <div className="bg-slate-50 p-3 rounded border border-slate-300 space-y-1.5 text-[10px] leading-relaxed">
              <p className="font-bold uppercase text-slate-800">Observações alimentação:</p>
              <p className="font-semibold">O KIT CAFÉ é composto de:</p>
              <p>a) 1 pacote de açúcar 1Kg; b) 1 pacote de pó de café de 500gr; c) 100 unidades de copo descartável para café; d) 100 unidades de copo descartável para água; e) 1 pacote de biscoito salgado; f) 1 pacote de biscoito doce; g) 1 caixa de Chá com 50 gramas.</p>
              <p className="font-semibold pt-1">O Mini buffet é composto de:</p>
              <p>a) 3 tipos de assados salgado; b) 1 tipo de assado doce; c) Bebidas: Refrigerantes normal e diet, Sucos, água e café; d) Serão disponibilizados, copos e pratos descartáveis, bem como guardanapos, em quantidades adequadas ao tamanho do evento.</p>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-300 space-y-1 text-[10px] leading-relaxed">
              <p className="font-bold uppercase text-slate-800">Observações transporte:</p>
              <p>a) O pagamento de quaisquer taxas referentes ao traslado de/para outro município, são de responsabilidade do CONTRATANTE.</p>
              <p>b) Caso haja taxa, tributos ou impostos a serem recolhidos no município de destino, estes ficaram a encargo da família.</p>
              <p>c) Traslados para municípios localizados com distância superior a cobertura do plano, podem ser realizados mediante o pagamento pelo CONTRATANTE do valor correspondente à distância que exceder a cobertura estabelecida, conforme tabela da CONTRATADA.</p>
              <p>d) Não estão inclusas taxas de uso ou de serviços de quaisquer cemitérios.</p>
              <p>e) A AMA VIDAS e/ou suas subcontratadas poderão se recusar a realizar viagens ou quaisquer tipo de deslocamentos por vias que não possuam pavimento asfáltico.</p>
              <p>f) Por não ser uma empresa de transporte de pessoas, a AMA VIDAS e/ou suas subcontratadas não podem levar familiares, amigos ou outras pessoas em seus veículos, que não sejam funcionários destas empresas.</p>
            </div>

            <div className="bg-slate-50 p-3 rounded border border-slate-300 space-y-1 text-[10px] leading-relaxed">
              <p className="font-bold uppercase text-slate-800">Observações Sazonalidade:</p>
              <p>a) Alguns itens podem ter sua disponibilidade temporariamente comprometida.</p>
              <p>b) Nestes casos a Funerária informará ao solicitante qual (is) item (ns) e oferecerá alternativas com qualidade igual ou superior ao cliente.</p>
            </div>

            <div className="space-y-1 pt-1 text-justify text-[11px] leading-relaxed">
              <p>1.4. Caso o CONTRATANTE se interesse, ou necessite, por algum outro serviço póstumo que não os relacionados acima, os mesmos poderão ser orçados junto a CONTRATADA e adquiridos à parte;</p>
              <p>1.5. Em caso de necessidade de outro tipo de urna, as alterações serão processadas das seguintes maneiras:</p>
              <p className="pl-4">1.5.1. Por necessidade de urnas mais largas ou mais compridas, com medidas superiores às da urna oferecidas neste contrato, poderá ser cobrado um acréscimo de 30% sobre o valor de tabela da urna do PLANO <strong className="underline">{data.plano}</strong>.</p>
            </div>
          </div>
        </div>
        <PageFooter pageNum={3} />
      </div>

      {/* ==================== PÁGINA 4 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />
          <div className="space-y-3 text-[11px] leading-relaxed">
            <p className="text-justify">
              1.5.2. Por necessidade de alteração do revestimento interno, para colocação do revestimento metálico (Zinco), poderá ser cobrado um acréscimo de 50% sobre o valor de tabela da urna do PLANO <strong className="underline">{data.plano}</strong>.
            </p>
            <p className="text-justify">
              1.6. Caso seja intenção ou vontade do beneficiário de utilizar uma urna de valor superior, a alteração da urna poderá ser feita, descontando o valor de tabela da urna disponibilizada pelo PLANO do valor da nova urna selecionada e aplicando um desconto de 50% (cinquenta por cento) sobre o saldo. Esta diferença só será paga no ato da solicitação do serviço.
            </p>
            <p className="text-justify">
              1.7. Caso a urna tenha sido desembalada, a mesma não poderá ser substituída, a não ser que o solicitante pague a nova urna integralmente ou 50% do valor da urna que foi desembalada;
            </p>
            <p className="text-justify">
              1.8. Caso o cliente opte por outra urna de menor valor de tabela, não haverá restituição de diferença ao cliente;
            </p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-2">
              2. CLÁUSULA II – DA FICHA DE ADESÃO E BENEFICIÁRIOS
            </h3>
            <p className="text-justify">
              2.1. A Ficha de Adesão é peça integrante deste instrumento, devendo obrigatoriamente acompanhá-lo, sendo de inteira responsabilidade do (a) CONTRATANTE a indicação dos Beneficiários e/ou Agregados, no ato da assinatura do presente contrato, bem como promover exclusões ou inclusões conforme as regras estabelecidas neste contrato.
            </p>
            <p>2.2. São BENEFICIÁRIOS deste Contrato:</p>
            <p className="pl-4 font-semibold">2.2.1. TITULAR:</p>
            <p className="pl-8 text-justify">2.2.1.1. Na pessoa do próprio CONTRATANTE caso seja PESSOA NATURAL ou PESSOA JURÍDICA que será representada por seu responsável legal;</p>
            <p className="pl-8">2.2.1.2. Só será admitido um único titular por contrato.</p>
            <p className="pl-8">2.2.1.3. Este só poderá ser substituído em caso de óbito, conforme cláusula 14 – “DO FALECIMENTO DO TITULAR.”</p>

            <p className="pl-4 font-semibold">2.2.2. DEPENDENTES:</p>
            <p className="pl-8">2.2.2.1. Cônjuge ou união estável, devidamente informados na ficha de adesão;</p>
            <p className="pl-8">2.2.2.2. Filhos e/ou enteados, menores, devidamente informados na ficha de adesão;</p>
            <p className="pl-8">2.2.2.3. Em caso de contratos firmados com PESSOA JURÍDICA não haverá dependentes;</p>

            <p className="pl-4 font-semibold">2.2.3. AGREGADOS:</p>
            <p className="pl-8">2.2.3.1. Filhos e enteados com maioridade civil, devidamente informados na ficha de adesão;</p>
            <p className="pl-8">2.2.3.2. Pessoas com qualquer outro parentesco com o TITULAR, devidamente informados na ficha de adesão;</p>
            <p className="pl-8">2.2.3.3. Pessoas sem parentesco com o TITULAR, devidamente informados na ficha de adesão;</p>
            <p className="pl-8 text-justify">2.2.3.4. Em contratos firmados com PESSOA JURÍDICA, todos os indivíduos relacionados na ficha de adesão serão considerados AGREGADOS para efeito de direitos e deveres com relação a este contrato inclusive, seus sócios proprietários ou diretores;</p>
            <p className="pl-8 text-justify">2.2.3.5. No ato de inclusão de cada AGREGADO, nos contratos realizados com Pessoa Jurídica, deverá ser entregue uma cópia de documento do respectivo AGREGADO;</p>

            {/* TABELA FICHA DE ADESÃO CADASTRADA */}
            <div className="mt-3 p-3 bg-slate-50 border border-slate-300 rounded">
              <p className="font-bold text-[10px] uppercase mb-1.5 text-slate-800">RELAÇÃO DE BENEFICIÁRIOS CADASTRADOS NA FICHA DE ADESÃO:</p>
              {data.beneficiarios && data.beneficiarios.length > 0 ? (
                <table className="w-full text-[10px] border-collapse border border-slate-300 bg-white">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 font-bold">
                      <th className="p-1.5 border border-slate-300 text-left">Nome</th>
                      <th className="p-1.5 border border-slate-300 text-center">Parentesco</th>
                      <th className="p-1.5 border border-slate-300 text-center">Tipo</th>
                      <th className="p-1.5 border border-slate-300 text-center">CPF / RG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.beneficiarios.map((b, i) => (
                      <tr key={i}>
                        <td className="p-1.5 border border-slate-300 font-semibold">{b.nome}</td>
                        <td className="p-1.5 border border-slate-300 text-center">{b.parentesco}</td>
                        <td className="p-1.5 border border-slate-300 text-center font-bold">{b.tipo}</td>
                        <td className="p-1.5 border border-slate-300 text-center">{b.cpfOrRg || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[10px] italic text-slate-500">Nenhum dependente ou agregado cadastrado nesta proposta.</p>
              )}
            </div>
          </div>
        </div>
        <PageFooter pageNum={4} />
      </div>

      {/* ==================== PÁGINA 5 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />
          <div className="space-y-3 text-[11px] leading-relaxed">
            <p className="font-semibold">2.2.4. ÓBITOS REGISTRADOS</p>
            <p className="pl-4">2.2.4.1. Óbitos de membros já relacionados na ficha de adesão, ocorridos no decorrer da vigência deste contrato;</p>
            <p className="pl-4">2.2.4.2. Para efeitos posteriores, será considerado sempre a idade da pessoa na data do óbito;</p>
            <p className="pl-4">2.2.4.3. Óbitos registrados, oriundos de processo de migração, são regidos pelas condições estabelecidas neste contrato;</p>
            <p className="pl-4 text-justify">2.2.4.4. O CONTRATANTE poderá solicitar a exclusão do beneficiário que tenha falecido na vigência do contrato, para os fins relativos às mensalidades;</p>
            <p>2.3. Os documentos aceitos para a inclusão de BENEFICIÁRIOS são:</p>
            <p className="pl-4">2.3.1. Para BENEFICIÁRIOS com 18 (dezoito) anos ou mais será aceito: CPF, RG, Habilitação ou Passaporte Válido;</p>
            <p className="pl-4">2.3.2. Para BENEFICIÁRIOS com idade inferior a 18 (dezoito) anos será aceito: CPF, RG ou Certidão de Nascimento;</p>
            <p className="text-justify">2.4. Na hipótese de se tratar do óbito do TITULAR, apenas os demais BENEFICIÁRIOS poderão solicitar os serviços do funeral do TITULAR e a sucessão do plano deverá ocorrer conforme cláusula 14 deste contrato.</p>
            <p className="text-justify">2.5. Não é necessário nenhum grau de parentesco entre o TITULAR e os AGREGADOS do plano, mas haverá incidência de um valor individual mensal por agregado;</p>
            <p>2.6. Não existe limite para a quantidade de DEPENDENTES e/ou AGREGADOS no plano;</p>
            <p className="text-justify">2.7. O CONTRATANTE poderá incluir novos BENEFICIÁRIOS a qualquer momento, mediante pagamento de taxa de inclusão e alteração na ficha de adesão;</p>
            <p className="text-justify">2.8. A carência para novos inscritos deverá obedecer a cláusula 4 – “DA CARÊNCIA”, deste contrato. Os prazos passarão a ser contados:</p>
            <p className="pl-4">2.8.1. Para DEPENDENTES, a partir do pagamento da taxa de inclusão;</p>
            <p className="pl-4">2.8.2. Para AGREGADOS, a partir do pagamento da taxa de manutenção corrigidas com o (s) novo (s) AGREGADOS (s).</p>
            <p className="text-justify">2.9. O CONTRATANTE somente poderá excluir BENEFICIÁRIO (s) de seu contrato 1 (uma) vez por ano de forma gratuita, devendo ser solicitado por escrito ainda no primeiro semestre, contudo esta alteração só será válida após janeiro do ano subsequente, até lá este BENEFICIÁRIO manterá todos seus direitos e deveres relativos a este contrato;</p>
            <p className="text-justify">2.10. Poderá o CONTRATANTE excluir BENEFICIÁRIO (s) de seu contrato em outros momentos, com efeito, já para o mês seguinte, contudo, nesse caso, deverá pagar a taxa de exclusão;</p>
            <p className="pl-4">2.10.1. As exclusões só serão processadas após a quitação da taxa de exclusão;</p>
            <p className="pl-4">2.10.2. O TITULAR deverá solicitar por escrito, com a opção de já surtir efeito imediato no mês seguinte;</p>
            <p className="text-justify">2.11. Caso o contrato seja firmado com uma PESSOA JURÍDICA, esta não poderá apresentar DEPENDENTES, tendo como BENEFICIÁRIOS unicamente seus AGREGADOS, devidamente informados na ficha de adesão;</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-2">
              3. CLÁUSULA III – DOS VALORES:
            </h3>
            <p className="font-semibold">3.1. TAXA DE ADESÃO.</p>
            <p className="pl-4 text-justify">3.1.1. O CONTRATANTE pagará à CONTRATADA no ato de solicitação da aquisição deste plano a taxa de adesão vigente quando da contratação, conforme tabela da CONTRATADA, sendo obrigatoriamente paga no ato da assinatura da proposta; <strong className="underline">Valor: R$ {data.valorAdesao || "150,00"}</strong></p>
            <p className="pl-4">3.1.2. Esta taxa tem efeito de matrícula e não pode ser considerada como taxa de manutenção ou mensalidade.</p>
            <p className="pl-4">3.1.3. O CONTRATANTE não tem direito a nenhum dos benefícios deste contrato antes de quitar a taxa de adesão ou a taxa de portabilidade.</p>
            <p className="pl-4">3.1.4. O Valor desta taxa é definido conforme tabela vigente, seu valor é calculado como sendo 3 vezes o valor da Taxa de Administração vigente no ato da assinatura da proposta;</p>

            <p className="font-semibold pt-1">3.2. TAXA DE MANUTENÇÃO - MENSALIDADE.</p>
            <p className="pl-4 text-justify">3.2.1. O TITULAR deste contrato pagará mensalmente à CONTRATADA uma mensalidade a título de TAXA DE MANUTENÇÃO; <strong className="underline font-bold">Valor: R$ {data.valorMensalidade || "79,90"}</strong> ({data.formaPagamento || "Boleto Bancário"})</p>
            <p className="pl-4">3.2.2. Caso o TITULAR não inclua AGREGADOS neste contrato, sua Taxa de Manutenção será composta unicamente pela Taxa de Administração.</p>
          </div>
        </div>
        <PageFooter pageNum={5} />
      </div>

      {/* ==================== PÁGINA 6 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />
          <div className="space-y-3 text-[11px] leading-relaxed">
            <p className="pl-8 text-justify">3.2.2.1. A Taxa de Administração dará cobertura ao TITULAR e seus DEPENDENTES conforme as condições do item 2.2 deste contrato;</p>
            <p className="pl-4 text-justify">3.2.3. Caso o TITULAR inclua AGREGADOS neste contrato, sua mensalidade será composta pela Taxa de Administração e o(s) valor(es) adicional(ais) para cada AGREGADO incluído neste contrato.</p>
            <p className="pl-8 text-justify">3.2.3.1. Para cada AGREGADO, seja ele filho/enteado com maioridade civil ou outra pessoa com ou sem grau de parentesco, deverá ser pago um valor individual mensal por agregado, definido em tabela vigente, que será acrescido no valor da mensalidade do titular;</p>
            <p className="pl-8">3.2.3.2. O valor padrão para cada AGREGADO é de 1/5 (um quinto, ou vinte por cento) do valor da Taxa de Administração vigente;</p>
            <p className="pl-8 text-justify">3.2.3.3. Exclusivamente nos contratos dos planos COMPLETO E ALTO PADRÃO, os agregados que se enquadrarem nas categorias de “Pai”, “Mãe”, “Sogro” e “Sogra” do titular deste contrato, recebem um fator de redução de 50% sobre sua taxa individual mencionada no item anterior;</p>
            <p className="pl-12">3.2.3.3.1. Esta situação não se aplica para os planos contratados por pessoas jurídicas;</p>
            <p className="pl-4 text-justify">3.2.4. Quando o TITULAR for uma PESSOA JURÍDICA, esta deverá recolher a Taxa de Administração, acrescida do valor individual mensal cobrado para cada AGREGADO, vezes a quantidade destes no contrato;</p>

            <p className="font-semibold pt-1">3.3. TAXA DE INCLUSÃO.</p>
            <p className="pl-4 text-justify">3.3.1. O CONTRATANTE pagará à CONTRATADA a taxa de inclusão sempre que desejar incluir novos DEPENDENTES e AGREGADOS;</p>
            <p className="pl-4">3.3.2. Esta taxa será cobrada por evento de alteração e não pela quantidade de indivíduos incluídos no evento;</p>
            <p className="pl-4 text-justify">3.3.3. O valor da taxa será de 1/5 (um quinto ou vinte por cento) do valor da Taxa de Administração vigente, vezes a quantidade de meses restantes até o mês de dezembro do ano da solicitação de inclusão;</p>
            <p className="pl-4 text-justify">3.3.4. Não será cobrado a taxa de inclusão no ato da contratação do plano, independentemente da quantidade de AGREGADOS adicionados neste momento;</p>
            <p className="pl-4 text-justify">3.3.5. No ato de inclusão de cada AGREGADO, nos contratos realizados com Pessoa Jurídica, deverá ser entregue uma cópia de documento do respectivo agregado.</p>
            <p className="pl-8">3.3.5.1. Para AGREGADO (S) com 18 (dezoito) anos ou mais será aceito: CPF, RG, Habilitação ou Passaporte Válido;</p>
            <p className="pl-8">3.3.5.2. Para AGREGADO (S) com idade inferior a 18 (dezoito) anos será aceito: CPF, RG ou Certidão de Nascimento;</p>

            <p className="font-semibold pt-1">3.4. TAXA DE EXCLUSÃO.</p>
            <p className="pl-4 text-justify">3.4.1. O CONTRATANTE pagará à CONTRATADA a taxa de exclusão sempre que desejar excluir DEPENDENTES e AGREGADOS, já com efeito no mês subsequente à solicitação.</p>
            <p className="pl-4 text-justify">3.4.2. Se o efeito do pedido de exclusão for para janeiro do próximo ano, não será cobrada taxa de exclusão, desde que o pedido seja realizado ainda no primeiro semestre;</p>
            <p className="pl-4">3.4.3. Esta taxa será cobrada por evento de alteração e não pela quantidade de indivíduos excluídos no evento;</p>
            <p className="pl-4 text-justify">3.4.4. O valor da taxa será de é de 1/5 (um quinto, ou vinte por cento) do valor da Taxa de Administração vigente, vezes a quantidade de meses restantes até o mês de dezembro do ano da solicitação de exclusão;</p>

            <p className="font-semibold pt-1">3.5. TAXA DE REATIVAÇÃO.</p>
            <p className="pl-4 text-justify">3.5.1. Quando o CONTRATANTE tiver seu plano BLOQUEADO, por inadimplemento das taxas de manutenção, conforme item 8.2 deste contrato, e desejar regularizar-se perante a CONTRATADA, o CONTRATANTE deverá pagar uma taxa de reativação, conforme tabela vigente, além das parcelas em atraso devidamente corrigidas com juros de 1% ao mês, multa de 2% e INPC.</p>
            <p className="pl-4">3.5.2. O valor da taxa será de 50% (cinquenta por cento) do valor da taxa de adesão, vigente na data da reativação;</p>
          </div>
        </div>
        <PageFooter pageNum={6} />
      </div>

      {/* ==================== PÁGINA 7 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />
          <div className="space-y-3 text-[11px] leading-relaxed">
            <p className="font-semibold">3.6. TAXA DE UTILIZAÇÃO.</p>
            <p className="pl-4 text-justify">3.6.1. Tendo o CONTRATANTE solicitado atendimento para utilização dos benefícios póstumos por causa de morte natural, em intervalo inferior a 12 meses no início da vigência do contrato, ou ainda, em intervalo inferior a 12 meses do último óbito natural do mesmo contrato, o CONTRATANTE deverá pagar à CONTRATADA uma taxa de utilização, conforme tabela vigente;</p>
            <p className="pl-4 text-justify">3.6.2. Também poderá ser cobrado esta taxa do CONTRATANTE, quando for aplicável, no momento da rescisão do contrato por parte do CONTRATANTE, conforme previsto na cláusula XI – DA RESCISÃO, deste contrato.</p>
            <p className="pl-4">3.6.3. O valor da taxa de utilização é definido conforme tabela vigente da contratada.</p>
            <p className="pl-8 text-justify">3.6.3.1. Seu valor é obtido considerando todos os benefícios póstumos oferecidos no objeto deste contrato e seus respectivos valores de mercado, após se chegar ao valor total destes benefícios, computa-se 1/10 (um décimo, ou dez porcento) esse montante.</p>

            <p className="font-semibold pt-1">3.7. TAXA DE PORTABILIDADE.</p>
            <p className="pl-4 text-justify">3.7.1. Quando o CONTRATANTE solicitar portabilidade de um outro plano, mantido por outra empresa do mesmo segmento, o mesmo poderá ser recebido neste contrato, respeitando as condições estipuladas na cláusula X – PORTABILIDADE DE PLANOS DE OUTRAS EMPRESAS, deste contrato.</p>
            <p className="pl-4">3.7.2. O valor da taxa de portabilidade será de 50% (cinquenta por cento) do valor da taxa de adesão, vigente na data da portabilidade do Plano;</p>
            <p className="pl-4">3.7.3. Esta taxa será paga no ato da assinatura da proposta;</p>
            <p className="pl-4">3.7.4. Não poderão ser prestados atendimentos, referentes aos benefícios póstumos, sem que esta taxa esteja quitada;</p>

            <p className="font-semibold pt-1">3.8. REAJUSTE DAS TAXAS</p>
            <p className="pl-4 text-justify">3.8.1. Os reajustes de todas taxas do contrato acontecerão todo mês de janeiro, independentemente da data de adesão ao plano.</p>
            <p className="pl-4 text-justify">3.8.2. O valor da TAXA DE MANUTENÇÃO, é definido conforme tabela vigente que será reajustada anualmente em outubro, levando em consideração o período compreendido entre outubro do ano anterior e setembro do ano corrente. Este reajuste será indexado pelo INPC acumulado do período mencionado;</p>
            <p className="pl-4 text-justify">3.8.3. Todos os valores previstos nesta cláusula que forem indexados pela TAXA DE MANUTENÇÃO, ou por desdobramentos desta indexação, terão seus valores automaticamente reajustados e passarão a ser praticados sempre em janeiro de cada ano;</p>
            <p className="pl-4 text-justify">3.8.4. Os valores reajustados, serão devidamente publicados em nosso site, bem como expostos em nossa loja, e entrarão em vigor em janeiro do próximo ano, independentemente da data em que houver sido realizado a contratação;</p>

            <p className="font-semibold pt-1">3.9. DO PAGAMENTO DAS TAXAS</p>
            <p className="pl-4 text-justify">3.9.1. O Pagamento das taxas acima apresentadas, poderá ser feito em uma de nossas unidades ou através de boleto bancário, cartão de crédito ou outros meios autorizados pela CONTRATANTE, previamente ajustado.</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-2">
              4. CLÁUSULA IV – DA CARÊNCIA
            </h3>
            <p>4.1. A carência do plano para atendimento dos BENEFÍCIOS PÓSTUMOS será de:</p>
            <p className="pl-4 text-justify"><strong>4.1.1. Morte Natural – 90 (noventa) dias</strong> após a quitação da TAXA DE ADESÃO ou a TAXA DE PORTABILIDADE e assinatura do contrato, desde que esteja com as TAXAS DE MANUTENÇÃO em dia;</p>
            <p className="pl-4 text-justify"><strong>4.1.2. Morte Acidental – 24 (vinte e quatro) horas</strong>, após a quitação da TAXA DE ADESÃO ou a TAXA DE PORTABILIDADE e assinatura do contrato, desde que esteja com as TAXAS DE MANUTENÇÃO em dia, ocorrendo o óbito após a quitação e a assinatura do contrato;</p>
            <p className="pl-4 text-justify"><strong>4.1.3. Suicídio – 24 (vinte e quatro) meses</strong> contados após a quitação da TAXA DE ADESÃO ou a TAXA DE PORTABILIDADE e assinatura do contrato, desde que esteja com as TAXAS DE MANUTENÇÃO em dia, ou o pagamento do valor correspondente a duas taxas de utilização vigentes, ocorrendo o óbito após a quitação e a assinatura do contrato.</p>
            <p className="pl-4 text-justify"><strong>4.1.4. Filhos Natimorto – 24 (vinte e quatro) horas</strong>, após a quitação da TAXA DE ADESÃO ou a TAXA DE PORTABILIDADE e assinatura do contrato, desde que esteja com as TAXAS DE MANUTENÇÃO em dia, ocorrendo o óbito após a quitação e a assinatura do contrato;</p>
            <p className="text-justify">4.2. Novos BENEFICIÁRIOS poderão ser incorporados ao plano a qualquer momento, mediante incidência das mesmas carências dos itens 4.1, e seus subitens, após aceitação de sua inclusão.</p>
            <p className="pl-4 text-justify">4.2.1. Para aceitação do novo BENEFICIÁRIO, deverá ser preenchido formulário de solicitação junto a CONTRATADA e fornecido RG, CPF do BENEFICIÁRIO, se houver, além das informações para contato disponíveis.</p>
            <p className="text-justify">4.3. Filhos recém-nascidos poderão ser incluídos no plano sem carência, até 180 (cento e oitenta) dias após o nascimento.</p>
          </div>
        </div>
        <PageFooter pageNum={7} />
      </div>

      {/* ==================== PÁGINA 8 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />
          <div className="space-y-3 text-[11px] leading-relaxed">
            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1">
              5. CLÁUSULA V - DA UTILIZAÇÃO DOS BENEFÍCIOS:
            </h3>
            <p className="text-justify">5.1. Para usufruir de qualquer benefício é obrigatório que o BENEFICIÁRIO tenha pago integralmente a taxa de adesão ou a taxa de portabilidade e esteja em dia com as suas taxas de manutenção, bem como com todas as suas obrigações conforme establishedo na cláusula VI - DAS OBRIGAÇÕES DAS PARTES, e seus subitens, neste contrato.</p>
            <p className="pl-4">5.1.1. Em hipótese alguma haverá atendimento caso esta condição seja descumprida.</p>
            <p className="text-justify">5.2. Na hipótese de mortes naturais, o plano cobre um acionamento a cada 12 meses.</p>
            <p className="text-justify">5.3. Caso haja óbito natural antes de completar 12 meses de vigência deste contrato, o cliente poderá utilizar o benefício mediante pagamento de taxa de utilização vigente;</p>
            <p className="text-justify">5.4. Caso haja novo óbito por causas naturais em intervalo inferior a 12 meses da última utilização, o cliente poderá utilizar o benefício mediante pagamento de taxa de utilização vigente;</p>
            <p className="text-justify">5.5. A taxa de utilização não se aplica às situações de filho natimorto. Os benefícios poderão ser usufruídos nesta situação, desde que a taxa de adesão ou a taxa de portabilidade esteja totalmente paga e o evento tenha ocorrido após a carência 24 horas, conforme estabelecido na CLÁUSULA IV - DA CARÊNCIA;</p>
            <p className="text-justify">5.6. A taxa de utilização não se aplica em caso de morte acidental, entendendo-se como tal aquela decorrente de causa violenta, súbita, e alheia à expectativa do falecido. Os benefícios poderão ser usufruídos nesta situação, desde que a taxa de adesão ou a taxa de portabilidade esteja quitada e o evento tenha ocorrido após a carência de 24 horas, conforme estabelecido na CLÁUSULA IV - DA CARÊNCIA;</p>
            <p>5.7. As formas de acionamento são:</p>
            <p className="pl-4 font-semibold">5.7.1. Águas Lindas de Goiás - GO:</p>
            <p className="pl-8">5.7.1.1. Escritório de administração do plano AMA VIDAS</p>
            <p className="pl-8">5.7.1.2. No endereço: Quadra 5, lote 23 s/n, Edifício Ribeiro, loja 04, Mansões Águas Lindas;</p>
            <p className="pl-8">5.7.1.3. Pelos telefones: (61) 3613-6707;</p>
            <p className="pl-8">5.7.1.4. Horário de atendimento: Segunda a Sexta das 08:00 às 18:00h | Sábado das 08:00 às 12:00h</p>
            <p className="pl-4 font-semibold">5.7.2. Plantão telefônico 24 horas por dia: (61) 98545-8010</p>
            <p className="pl-4 font-semibold">5.7.3. Brasília - DF:</p>
            <p className="pl-8">5.7.3.1. Funerária Bom Samaritano Premier</p>
            <p className="pl-8">5.7.3.2. No endereço: Asa Sul CLS 413 Loja 12, BL B - Asa Sul, Brasília - DF, 71290-520</p>
            <p className="pl-8">5.7.3.3. Pelos telefones: (61) 3536-9496 em qualquer horário;</p>
            <p className="pl-4 text-justify">5.7.4. A CONTRATADA se reserva o direito de mudar estes endereços e telefones sem aviso prévio, porém com comunicação posterior e ampla divulgação dos novos endereços e telefones de contato.</p>
            <p>5.8. A contratada também sempre manterá em seu site (www.amavidas.com) todos os dados para contato, devidamente atualizados;</p>
            <p className="text-justify">5.9. Para garantir o acionamento, deve-se sempre portar documento pessoal com foto do membro solicitante, bem como informar o nome do óbito para consulta no sistema.</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-2">
              6. CLÁUSULA VI - DAS OBRIGAÇÕES DAS PARTES:
            </h3>
            <p className="font-semibold">6.1. CONTRATANTE:</p>
            <p className="pl-4 text-justify">6.1.1. Agir com veracidade e exatidão nas informações inseridas na FICHA DE ADESÃO, respondendo por elas civil e criminalmente;</p>
            <p className="pl-4 text-justify">6.1.2. Manter as informações de cadastro e contato (endereço, telefone e e-mail), se houver, sempre atualizados tanto referente ao TITULAR, bem como de seus BENEFICIÁRIOS para qualquer comunicação necessária.</p>
          </div>
        </div>
        <PageFooter pageNum={8} />
      </div>

      {/* ==================== PÁGINA 9 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />
          <div className="space-y-3 text-[11px] leading-relaxed">
            <p className="pl-4 text-justify">6.1.3. Quando houver alteração do cônjuge (casamento ou união estável, registrado na ficha do cliente), nascimento de filhos, casamento de filhos ou saída dos filhos da residência do titular, o contratante deverá solicitar as alterações no plano, sob pena de perda de cobertura e de benefícios;</p>
            <p className="pl-4">6.1.4. Manter em dia o pagamento de suas mensalidades;</p>
            <p className="font-semibold pt-1">6.2. CONTRATADA:</p>
            <p className="pl-4 text-justify">6.2.1. Prestar de forma integral e imediata o atendimento referente ao OBJETO deste contrato aos BENEFICIÁRIOS que estiverem regulares com todas as suas obrigações;</p>
            <p className="pl-4 text-justify">6.2.2. Prestar ASSISTÊNCIA funeral em estrita observância aos ditames legais e aos fundamentos da boa-fé e, ao tempo do óbito;</p>
            <p className="pl-4 text-justify">6.2.3. Iniciar a execução do atendimento até 02 (duas) horas da comunicação formal do fato, mediante entrega pela representante legal da CONTRATANTE e/ou beneficiário para a CONTRATADA, de um dos seguintes documentos:</p>
            <p className="pl-8">6.2.3.1. Declaração de óbito, emitida por autoridade competente;</p>
            <p className="pl-8">6.2.3.2. Autorização para retirada da “Declaração de Óbito” e para a remoção do BENEFICIÁRIO falecido;</p>
            <p className="pl-4">6.2.4. Gerir o Plano com estrita observância às condições e cláusulas descritas neste contrato e aos ditames legais;</p>
            <p className="pl-4">6.2.5. Manter toda a atividade de cobrança e disponibilidade dos serviços;</p>
            <p className="pl-4 text-justify">6.2.6. Garantir que a estrutura voltada ao atendimento dos clientes deste contrato, esteja sempre adequada e moderna; 6.2.7. Facilitar acesso dos BENEFICIÁRIOS aos serviços oferecidos;</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-2">
              7. CLÁUSULA VII - DA VIGÊNCIA DO CONTRATO E ÁREA DE ABRANGÊNCIA:
            </h3>
            <p className="text-justify">7.1. O contrato é assinado com prazo de 60 meses, prorrogável automaticamente por igual período quando não houver manifestação em contrário de nenhuma das partes, com vigência a contar da assinatura deste contrato pela CONTRATADA e da quitação da taxa de adesão ou a taxa de portabilidade pelo CONTRATANTE, em hipótese alguma o contrato será considerado vigente se ambas as exigências não estiverem atendidas.</p>
            <p className="text-justify">7.2. Para efeito de contagem do início da vigência do contrato, será considerado a data do último evento relacionado no item anterior (7.1) deste contrato;</p>
            <p>7.3. A área de abrangência do plano é constituída por:</p>
            <p className="pl-4">7.3.1. Águas Lindas de Goiás - GO; 7.3.2. Brasília - DF;</p>
            <p className="pl-4 text-justify">7.3.3. Demais municípios no estado de Goiás e do Distrito Federal, localizados em um raio de até 100 KM de distância dos municípios mencionados nos itens 7.3.1 e 7.3.2, onde os serviços poderão ser prestados pela equipe da CONTRATADA, ou por empresas terceirizadas acionadas e remuneradas pela CONTRATADA.</p>
            <p className="pl-4 text-justify">7.3.4. Os velórios só podem ser realizados nas estruturas públicas dos municípios destinadas a estes fins (velórios públicos ou cemitérios), ou nas residências ou em espaços particulares que trabalhem com este tipo de evento póstumo, a saber igrejas, câmara de vereadores, salões de eventos, prefeitura, etc.....</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-2">
              8. CLÁUSULA VIII - DA SUSPENSÃO DOS DIREITOS:
            </h3>
            <p className="text-justify">8.1. O contrato será temporariamente suspenso, quando houver atraso de 03 (três) parcelas consecutivas ou não, da taxa de manutenção (mensalidade).</p>
            <p className="pl-4 text-justify">8.1.1. A reativação deste contrato e dos respectivos benefícios, se dará após a quitação das parcelas em atraso, com cobrança de juros de 1% ao mês, multa de 2% e INPC.</p>
            <p className="pl-4 text-justify">8.1.2. A CONTRATADA se reserva o período de até 30 dias para restabelecer os benefícios previsto no contrato, após a comprovação da regularização financeira.</p>
            <p className="text-justify">8.2. O contrato será BLOQUEADO, quando o atraso completar 06 (seis) parcelas consecutivas ou não, da taxa de manutenção.</p>
          </div>
        </div>
        <PageFooter pageNum={9} />
      </div>

      {/* ==================== PÁGINA 10 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />
          <div className="space-y-3 text-[11px] leading-relaxed">
            <p className="pl-4 text-justify">8.2.1. A reativação deste contrato e dos respectivos benefícios, se dará após a quitação das parcelas em atraso, com cobrança de juros de 1% ao mês, multa de 2% e INPC, além de taxa de reativação, prevista no item 3.5 deste contrato;</p>
            <p className="pl-4 text-justify">8.2.2. A CONTRATADA se reserva o período de até 60 dias para restabelecer os benefícios previsto no contrato, após a comprovação da regularização financeira.</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-2">
              9. CLÁUSULA IX - DA MIGRAÇÃO DE OUTROS PLANOS DA AMA VIDAS:
            </h3>
            <p className="text-justify">9.1. O CONTRATANTE que possuir outro plano administrado pela CONTRATADA poderá a qualquer tempo migrar para este plano, desde que não restem pendências por parte do CONTRATANTE com a CONTRATADA com relação ao plano de origem e os seus integrantes obedeçam às exigências e critérios deste contrato;</p>
            <p className="text-justify">9.2. Nestas situações será considerado todos os prazos já cumpridos pela CONTRATANTE para todos os efeitos deste contrato.</p>
            <p className="text-justify">9.3. Não será cobrado taxa de adesão, caso a taxa de adesão do plano de origem esteja inteiramente quitada; 9.3.1. Caso esta taxa não tenha sido paga integralmente, será cobrado a diferença;</p>
            <p className="text-justify">9.4. Para efeito das mensalidades, deverá ser feito cálculo de composição da taxa de manutenção conforme previsto na cláusula III – DOS VALORES deste instrumento.</p>
            <p className="text-justify">9.5. Caso tenha ocorrido atendimento para óbito no plano de origem, deverá ser realizado o atendimento das cláusulas rescisórias e afins do contrato de origem, ou a manutenção da pessoa falecida no outro contrato como AGREGADO neste novo contrato.</p>
            <p className="text-justify">9.6. Em caso de migração entre planos da AMA VIDAS PLANOS DE ASSISTÊNCIA FAMILIAR LTDA, em decorrência dos benefícios do presente contrato, não será possível o arrependimento, em especial se houver a transferência do óbito do contrato anterior para este. Só será possível a rescisão nos termos da cláusula 11.</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-2">
              10. CLÁUSULA X – PORTABILIDADE DE PLANOS DE OUTRAS EMPRESAS:
            </h3>
            <p className="text-justify">10.1. O CONTRATANTE que possuir outro plano administrado por outra empresa do mesmo segmento, poderá a qualquer tempo migrar para este plano, desde que não restem pendências por parte do CONTRATANTE com a empresa anterior, com relação ao plano de origem e os seus integrantes obedeçam às exigências e critérios deste contrato;</p>
            <p className="text-justify">10.2. Caso existam pendências entre a empresa anterior e o CONTRATANTE, a CONTRATADA não se responsabilizará por nenhuma destas obrigações contraídas anteriormente;</p>
            <p className="text-justify">10.3. Para a portabilidade ser processada, a CONTRATANTE deverá apresentar cópia do contrato anterior, ou documento equivalente, bem como comprovar o pagamento de no mínimo 3 meses para a empresa anterior;</p>
            <p className="text-justify">10.4. A TAXA DE PORTABILIDADE deve ser paga no momento da assinatura do contrato e os prazos de vigência só passarão a ser contabilizados após a quitação integral da taxa.</p>
            <p className="text-justify">10.5. Para se beneficiar do tempo de carência cumprido no plano de origem, o CONTRATANTE deverá comprovar permanência por período igual ao solicitado neste contrato. Se não tiver permanecido o tempo necessário no outro plano, o CONTRATANTE deverá cumprir de forma complementar, o tempo necessário ao cumprimento do período de carência neste plano, para se beneficiar dos direitos previstos neste contrato;</p>
            <p className="text-justify">10.6. A portabilidade só será considerada efetivada, após a realização das etapas de pós-venda e da celebração do contrato por ambas as partes.</p>
            <p className="text-justify">10.7. A portabilidade poderá ser desistida em até 7 dias, após este período a rescisão obedecerá às situações prevista na cláusula XI- DA RESCISÃO, deste contrato.</p>
          </div>
        </div>
        <PageFooter pageNum={10} />
      </div>

      {/* ==================== PÁGINA 11 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />
          <div className="space-y-3 text-[11px] leading-relaxed">
            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1">
              11. CLÁUSULA XI - DA RESCISÃO:
            </h3>
            <p className="text-justify">11.1. O CONTRATANTE, <span className="underline font-bold">não tendo utilizado</span> nenhum dos BENEFÍCIOS PÓSTUMOS objeto deste instrumento e estando suas obrigações em dia, poderá em decisão unilateral, solicitar a rescisão deste contrato, desde que o faça por escrito, com reconhecimento de firma e observando as seguintes condições:</p>
            <p className="pl-4 text-justify">11.1.1. Se for feito dentro do prazo de 24 (vinte e quatro) meses do início da vigência do contrato, o CONTRATANTE deverá pagar uma multa rescisória correspondente ao valor de uma taxa de utilização vigente à época da solicitação, para custear as despesas administrativas e operacionais do contrato.</p>
            <p className="pl-4 text-justify">11.1.2. Se o cancelamento for feito após o vigésimo quinto mês, sem utilização dos serviços póstumos, nenhuma multa será devida.</p>
            <p className="text-justify">11.2. Caso o contrato seja rescindido e os benefícios póstumos <span className="underline font-bold">tenham sido utilizados</span>, o CONTRATANTE pagará uma multa correspondente a uma taxa de utilização (valor de tabela vigente no ato da rescisão) para cada óbito atendido durante a vigência do contrato, independente da(s) morte(s) ter(em) sido(s) de caráter NATURAL ou ACIDENTAL. A multa somente não será cobrada se o contrato tiver vigorado por 120 meses para cada óbito atendido no período do contrato.</p>
            <p className="text-justify">11.3. Sem prejuízo das cláusulas acima contida, o contrato poderá ser cancelado, desde que tal intenção seja manifestada por escrito, com no mínimo 30 (trinta) dias de antecedência, por qualquer das Partes CONTRATANTE e/ou CONTRATADA.</p>
            <p className="text-justify">11.4. A CONTRATADA poderá rescindir automaticamente este contrato quando o CONTRATANTE completar 07 (sete) parcelas não pagas da taxa de manutenção.</p>
            <p className="text-justify">11.5. Mesmo que o cancelamento seja feito por inadimplemento, são devidas as multas previstas neste contrato e as mensalidades até a data do contrato ser considerado rescindido no sistema pela CONTRATADA.</p>
            <p className="text-justify">11.6. O contrato também poderá ser automaticamente rescindido pela CONTRATADA se verificada a não veracidade das informações prestadas pelo CONTRATANTE contidas na Ficha de Adesão;</p>
            <p className="text-justify">11.7. A rescisão do presente contrato não dá ensejo a qualquer devolução de quantias pagas pelo (a) CONTRATANTE a CONTRATADA seja a que título for, ou qualquer tipo de ressarcimento ou indenização, em decorrência do objeto e natureza do presente contrato.</p>
            <p className="text-justify">11.8. Na hipótese de rescisão do contrato por inadimplência, facultará ao CONTRATANTE celebrar novo contrato com a CONTRATADA, com carência de 60 (sessenta) dias a contar da assinatura do novo contrato e desde que pague todas as taxas atrasadas, devidamente atualizadas monetariamente pelo INPC e acrescida dos juros de mora de 1% (um por cento) ao mês e da multa de 2% (dois por cento) sobre o saldo devedor apurado, além de nova taxa de adesão.</p>
            <p className="text-justify">11.9. Apenas o TITULAR pode solicitar a rescisão do contrato, ou em caso de óbito ou invalidez do TITULAR, será utilizado a cláusula XIV - DO FALECIMENTO DO TITULAR, deste contrato.</p>
            <p className="text-justify">11.10. Os DEPENDENTES, desde que maiores de idade, podem solicitar a sua desvinculação do contrato vigente, respeitando as cláusulas de exclusão de beneficiário contidas neste contrato.</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-2">
              12. CLÁUSULA XII - DO REEMBOLSO DE SERVIÇOS PÓSTUMOS:
            </h3>
            <p className="text-justify">12.1. Este contrato não prevê nenhum tipo de reembolso, todos os acionamentos que sejam elegíveis pelas condições do presente sinistro, serão atendidos por nossa equipe ou empresas parceiras.</p>
            <p className="text-justify">12.2. A impossibilidade de atendimento por estar fora da cobertura do contrato, não configura caráter de exceção a este evento, não dando direito a reembolso.</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-2">
              13. CLÁUSULA XIII - DAS VENDAS:
            </h3>
            <p className="text-justify">13.1. As vendas serão realizadas na sede da CONTRATADA, ou por seus vendedores externos, ou em atividades externas promocionais, sempre devidamente uniformizados e identificados por crachás da empresa.</p>
            <p className="text-justify">13.2. As vendas só serão consideradas efetivadas após a realização do pós-venda pela equipe da ADMINISTRAÇÃO do plano, que confirmará os dados e poderá prestar outros esclarecimentos. Este contato deverá acontecer em no máximo 3 dias úteis.</p>
            <p className="text-justify">13.3. Caso a venda não seja aprovada pela equipe de pós-venda ou pela administração do plano, todos os documentos serão cancelados e qualquer valor recebido será devolvido.</p>
          </div>
        </div>
        <PageFooter pageNum={11} />
      </div>

      {/* ==================== PÁGINA 12 ==================== */}
      <div className="contract-page-a4">
        <div>
          <PageHeader />
          <div className="space-y-3 text-[11px] leading-relaxed">
            <p className="text-justify">13.4. O beneficiário da proposta comercial, mesmo tendo pago a taxa de adesão ou a taxa de portabilidade de forma parcial ou total, poderá exercer o direito de desistência no prazo de 07 (sete) dias corridos, da assinatura da proposta, tendo o direito à devolução integral do valor pago em até 60 dias;</p>
            <p className="text-justify">13.5. A desistência deverá ser realizada em uma de nossas lojas físicas, onde deverá ser protocolado solicitação formal de desistência, dentro do prazo estipulado;</p>
            <p className="text-justify">13.6. A partir do oitavo dia da assinatura da proposta e antes da formalização do contrato, a CONTRATADA fica desobrigada de realizar a devolução de valores referentes a taxa de adesão ou a taxa de portabilidade;</p>
            <p className="text-justify">13.7. A partir da quitação da taxa de adesão ou a taxa de portabilidade e do aceite por parte da CONTRATADA, qualquer rescisão deverá obedecer às condições previstas na cláusula 11 - DA RESCISÃO, deste contrato.</p>
            <p>13.8. Para a formalização deste contrato será necessário que o TITULAR forneça cópias dos seguintes documentos:</p>
            <p className="pl-4">13.8.1. Documento de identidade com foto; 13.8.2. Cadastro Nacional de Pessoa Física – CPF; 13.8.3. Comprovante de endereço; 13.8.4. Documento de proposta devidamente preenchido e assinado pelo cliente;</p>
            <p>13.9. Quando o titular for uma PESSOA JURÍDICA, será necessário a cópia dos seguintes documentos:</p>
            <p className="pl-4">13.9.1. Cartão CNPJ; 13.9.2. Ato constitutivo, estatuto ou contrato social em vigor, devidamente registrado; 13.9.3. Comprovante de endereço; 13.9.4. Ficha de Adesão devidamente preenchida e assinado pelo cliente;</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-1">
              14. CLÁUSULA XIV – DO FALECIMENTO DO TITULAR
            </h3>
            <p className="text-justify">14.1. Na hipótese de falecimento do titular, o Plano ora contratado não se interrompe de forma alguma, sendo obrigação dos herdeiros e/ou sucessores regularizar a sucessão contratual, além da obrigação de manter rigorosamente em dia os pagamentos mensais.</p>
            <p className="pl-4">14.1.1. Fica previamente definido como sucessor o cônjuge, ou em sua falta o (a) filho (a) mais velho (a).</p>
            <p className="pl-4">14.2. Somente será admitido 01 (um) titular sucessor para o presente contrato.</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-1">
              15. CLÁUSULA XV – PENAL & 16. CLÁUSULA XVI - IRREVOGABILIDADE
            </h3>
            <p className="text-justify">15.1. No caso de mora e inadimplência por parte do (a) CONTRATANTE dos valores previstos neste instrumento, os valores serão acrescidos de multa de 2% (dois) por cento, juros de mora de 1% ao mês e correção pelo INPC.</p>
            <p className="text-justify">16.1. Trata-se a presente avença de compromisso irrevogável e irretratável, obrigando-se as partes contratantes e seus sucessores a respeitá-lo enquanto persistir sua vigência.</p>

            <h3 className="font-bold uppercase text-slate-900 text-xs border-b border-slate-300 pb-1 pt-1">
              17. CLÁUSULA XVII - DAS CONDIÇÕES GERAIS
            </h3>
            <p className="text-justify">17.6. O presente Contrato de Plano de ASSISTÊNCIA Familiar é regido pela LEI Nº 13.261, DE 22 DE MARÇO DE 2016.</p>
            <p className="text-justify">17.8. Fica eleito o Foro de <strong>Águas Lindas de Goiás (GO)</strong>, para dirimir quaisquer dúvidas ou omissões decorrentes do presente contrato.</p>
            <p className="text-justify font-medium">17.9. Por se acharem em perfeito acordo, em tudo quanto foi pactuado neste contrato, obrigam-se a cumpri-lo, assinando-o, em duas vias de igual teor e forma.</p>

            {/* ENCERRAMENTO E ASSINATURAS */}
            <div className="pt-4 space-y-6">
              <p className="text-center font-bold text-xs text-slate-900">
                {cidadeExtenso}, <span className="border-b border-slate-600 px-2">{dia}</span> de <span className="border-b border-slate-600 px-4">{mesExtenso}</span> de 20<span className="border-b border-slate-600 px-2">{ano.toString().slice(-2)}</span>.
              </p>

              <div className="grid grid-cols-2 gap-8 pt-2">
                {/* ASSINATURA CONTRATANTE */}
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-56 border-b border-slate-800 mb-1"></div>
                  <p className="font-bold text-slate-900 uppercase text-[10px]">
                    {data.titularNome || data.pjRazaoSocial || "CONTRATANTE"}
                  </p>
                  <p className="text-[9px] text-slate-600">
                    CPF/CNPJ: {data.titularCpf || data.pjCnpj || "____.____.____-__"}
                  </p>
                  <p className="text-[9px] font-semibold text-slate-500">CONTRATANTE</p>
                </div>

                {/* ASSINATURA AMAVIDAS */}
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-56 border-b border-slate-800 mb-1"></div>
                  <p className="font-bold text-slate-900 uppercase text-[10px]">
                    AMA VIDAS PLANOS DE ASSISTÊNCIA FAMILIAR
                  </p>
                  <p className="text-[9px] text-slate-600">CNPJ: 32.951.325/0001-46</p>
                  <p className="text-[9px] font-bold text-slate-700">DIRETORIA / CONTRATADA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <PageFooter pageNum={12} />
      </div>

    </div>
  );
}
