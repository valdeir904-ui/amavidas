import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/admin/contratos - Listar todos os contratos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const contratos = await prisma.contrato.findMany({
      where: search
        ? {
            OR: [
              { numeroContrato: { contains: search } },
              { titularNome: { contains: search } },
              { titularCpf: { contains: search } },
              { pjRazaoSocial: { contains: search } },
              { pjCnpj: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json({ success: true, contratos });
  } catch (error: any) {
    console.error("Erro ao listar contratos:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

// POST /api/admin/contratos - Criar novo contrato
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const count = await prisma.contrato.count();
    const anoAtual = new Date().getFullYear();
    const numeroContrato = body.numeroContrato || `CTR-${anoAtual}-${String(count + 1).padStart(4, "0")}`;

    const contrato = await prisma.contrato.create({
      data: {
        numeroContrato,
        tipoContratacao: body.tipoContratacao || "Nova contratação",
        portabilidade: Boolean(body.portabilidade),
        natureza: body.natureza || "PF",
        plano: body.plano,
        valorAdesao: body.valorAdesao || null,
        valorMensalidade: body.valorMensalidade || null,
        formaPagamento: body.formaPagamento || null,
        cidadeAssinatura: body.cidadeAssinatura || "Águas Lindas de Goiás - GO",
        dataAssinatura: body.dataAssinatura ? new Date(body.dataAssinatura) : new Date(),

        // Titular PF
        titularNome: body.titularNome,
        titularCpf: body.titularCpf,
        titularRg: body.titularRg || null,
        titularEndereco: body.titularEndereco || null,
        titularBairro: body.titularBairro || null,
        titularCidade: body.titularCidade || null,
        titularUf: body.titularUf || null,
        titularCep: body.titularCep || null,
        titularTelefone: body.titularTelefone || null,
        titularEmail: body.titularEmail || null,

        // Titular PJ
        pjRazaoSocial: body.pjRazaoSocial || null,
        pjCnpj: body.pjCnpj || null,
        pjRepresentante: body.pjRepresentante || null,
        pjRepresentanteCpf: body.pjRepresentanteCpf || null,
        pjRepresentanteRg: body.pjRepresentanteRg || null,

        beneficiarios: body.beneficiarios ? JSON.stringify(body.beneficiarios) : null,
        observacoes: body.observacoes || null,
        simulacaoId: body.simulacaoId || null,
      },
    });

    if (body.simulacaoId) {
      await prisma.simulacao.update({
        where: { id: body.simulacaoId },
        data: {
          contratoAssinado: true,
          nomeCompletoContrato: body.titularNome || body.pjRazaoSocial,
          planoContratado: body.plano,
          valorAdesao: body.valorAdesao,
          valorPlano: body.valorMensalidade,
          status: "venda_ganha",
        },
      }).catch((err) => console.error("Erro ao atualizar lead vinculado:", err));
    }

    return NextResponse.json({ success: true, contrato }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar contrato:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erro ao salvar contrato" },
      { status: 500 }
    );
  }
}
