import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

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

export async function GET(req: NextRequest) {
  try {
    await ensureSeed();
    const depoimentos = await prisma.depoimento.findMany({
      where: { ativo: true },
      orderBy: [
        { ordem: "asc" },
        { criadoEm: "desc" }
      ]
    });
    return Response.json({ depoimentos });
  } catch (error) {
    console.error("Erro ao carregar depoimentos públicos:", error);
    return Response.json({ error: "Erro ao buscar depoimentos" }, { status: 500 });
  }
}
