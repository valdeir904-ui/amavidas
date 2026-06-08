import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const DEFAULT_PARCEIROS = [
  {
    nome: "Drogasil",
    tipo: "Farmácia",
    desconto: "Até 60% em medicamentos",
    contato: "Todas as filiais físicas e site",
    logoUrl: null,
    ativo: true,
    ordem: 0,
  },
  {
    nome: "Pague Menos",
    tipo: "Farmácia",
    desconto: "Até 50% de desconto",
    contato: "Disponível nacionalmente",
    logoUrl: null,
    ativo: true,
    ordem: 1,
  },
  {
    nome: "Sabin Diagnósticos",
    tipo: "Exames e Laboratório",
    desconto: "Até 20% em exames",
    contato: "Apresentando a carteirinha do plano",
    logoUrl: null,
    ativo: true,
    ordem: 2,
  },
  {
    nome: "Clínica Sorriso",
    tipo: "Odontologia",
    desconto: "Avaliação gratuita + 15% em tratamentos",
    contato: "Agendamento pelo telefone (61) 99999-9999",
    logoUrl: null,
    ativo: true,
    ordem: 3,
  }
];

async function ensureSeed() {
  if ((await prisma.parceiro.count()) === 0) {
    await prisma.parceiro.createMany({ data: DEFAULT_PARCEIROS });
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureSeed();
    const parceiros = await prisma.parceiro.findMany({
      where: { ativo: true },
      orderBy: [
        { ordem: "asc" },
        { criadoEm: "desc" }
      ]
    });
    return Response.json({ parceiros });
  } catch (error) {
    console.error("Erro ao buscar parceiros públicos:", error);
    return Response.json({ error: "Erro ao buscar parceiros" }, { status: 500 });
  }
}
