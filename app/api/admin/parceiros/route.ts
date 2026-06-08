import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "amavidas-admin-2024";

function auth(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (session === ADMIN_TOKEN) return true;

  const h = req.headers.get("authorization");
  return h === `Bearer ${ADMIN_TOKEN}`;
}

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

// GET - List all partners
export async function GET(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSeed();
  const parceiros = await prisma.parceiro.findMany({
    orderBy: [
      { ordem: "asc" },
      { criadoEm: "desc" }
    ]
  });
  return Response.json({ parceiros });
}

// POST - Create a new partner
export async function POST(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { nome, tipo, desconto, contato, logoUrl, ativo } = body;

    if (!nome || !tipo || !desconto) {
      return Response.json({ error: "Nome, tipo e desconto são obrigatórios" }, { status: 400 });
    }

    const { _max } = await prisma.parceiro.aggregate({ _max: { ordem: true } });
    const ordem = (_max.ordem ?? -1) + 1;

    const parceiro = await prisma.parceiro.create({
      data: {
        nome,
        tipo,
        desconto,
        contato: contato ?? null,
        logoUrl: logoUrl ?? null,
        ativo: ativo ?? true,
        ordem,
      },
    });

    return Response.json({ ok: true, parceiro }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar parceiro:", error);
    return Response.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

// PATCH - Update a partner
export async function PATCH(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, criadoEm, atualizadoEm, ...rest } = body;

    if (!id) {
      return Response.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const parceiro = await prisma.parceiro.update({
      where: { id },
      data: rest,
    });

    return Response.json({ ok: true, parceiro });
  } catch (error) {
    console.error("Erro ao atualizar parceiro:", error);
    return Response.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

// DELETE - Delete a partner
export async function DELETE(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.parceiro.delete({
      where: { id },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir parceiro:", error);
    return Response.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
