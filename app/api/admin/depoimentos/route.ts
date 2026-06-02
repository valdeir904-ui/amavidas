import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "amavidas-admin-2024";

function auth(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (session === ADMIN_TOKEN) return true;

  const h = req.headers.get("authorization");
  return h === `Bearer ${ADMIN_TOKEN}`;
}

const DEFAULT_DEPOIMENTOS = [
  {
    nome: "Rosângela Martins",
    cidade: "Águas Lindas, GO",
    relacao: "março de 2026",
    texto: "Em 15 minutos a AmaVidas estava na minha casa. Cuidaram da minha mãe com tanto carinho que parecia família. Não tive que me preocupar com nada — só pude chorar e abraçar quem ficou.",
    tipo: "audio",
    mediaUrl: "/audio/depoimento.mp3",
    fotoUrl: null,
    ativo: true,
    ordem: 0,
  },
  {
    nome: "Carlos Eduardo Lima",
    cidade: "Goiânia, GO",
    relacao: "janeiro de 2026",
    texto: "Contratei o plano há 4 anos pra meu pai. Quando chegou a hora, não precisei fazer absolutamente nada — eles cuidaram da papelada, do velório, do sepultamento. Vale cada centavo.",
    tipo: "texto",
    mediaUrl: null,
    fotoUrl: null,
    ativo: true,
    ordem: 1,
  },
  {
    nome: "Maria Aparecida Silva",
    cidade: "Brasília, DF",
    relacao: "novembro de 2025",
    texto: "Atendimento humano de verdade. A consultora ligou três vezes nos dias seguintes só pra saber como eu estava. Fui surpreendida pelo carinho.",
    tipo: "texto",
    mediaUrl: null,
    fotoUrl: null,
    ativo: true,
    ordem: 2,
  }
];

async function ensureSeed() {
  if ((await prisma.depoimento.count()) === 0) {
    await prisma.depoimento.createMany({ data: DEFAULT_DEPOIMENTOS });
  }
}

// GET - List all testimonials
export async function GET(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSeed();
  const depoimentos = await prisma.depoimento.findMany({
    orderBy: [
      { ordem: "asc" },
      { criadoEm: "desc" }
    ]
  });
  return Response.json({ depoimentos });
}

// POST - Create a new testimonial
export async function POST(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { nome, cidade, relacao, texto, tipo, mediaUrl, fotoUrl, ativo } = body;

    if (!nome || !cidade || !tipo) {
      return Response.json({ error: "Nome, cidade e tipo são obrigatórios" }, { status: 400 });
    }

    const { _max } = await prisma.depoimento.aggregate({ _max: { ordem: true } });
    const ordem = (_max.ordem ?? -1) + 1;

    const depoimento = await prisma.depoimento.create({
      data: {
        nome,
        cidade,
        relacao: relacao ?? "",
        texto: texto ?? "",
        tipo,
        mediaUrl: mediaUrl ?? null,
        fotoUrl: fotoUrl ?? null,
        ativo: ativo ?? true,
        ordem,
      },
    });

    return Response.json({ ok: true, depoimento }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar depoimento:", error);
    return Response.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

// PATCH - Update a testimonial
export async function PATCH(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, criadoEm, atualizadoEm, ...rest } = body;

    if (!id) {
      return Response.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const depoimento = await prisma.depoimento.update({
      where: { id },
      data: rest,
    });

    return Response.json({ ok: true, depoimento });
  } catch (error) {
    console.error("Erro ao atualizar depoimento:", error);
    return Response.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

// DELETE - Delete a testimonial
export async function DELETE(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.depoimento.delete({
      where: { id },
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir depoimento:", error);
    return Response.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
