import { prisma } from "@/lib/db";

// Rota pública — usada pela landing page para exibir os planos ativos
export async function GET() {
  const planos = await prisma.plano.findMany({
    where: { ativo: true },
    orderBy: { ordem: "asc" },
  });

  return Response.json({
    planos: planos.map((p) => ({
      ...p,
      beneficios: JSON.parse(p.beneficios) as string[],
      ausentes: JSON.parse(p.ausentes) as string[],
    })),
  });
}
