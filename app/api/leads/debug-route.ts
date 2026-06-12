import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const whereClause: any = {};
    
    if (session.perfil !== "MASTER") {
      whereClause.OR = [
        { responsavelId: null },
        { responsavelId: session.userId },
      ];
    }

    const leads = await prisma.simulacao.findMany({
      where: whereClause,
      orderBy: { criadoEm: "desc" },
      take: 500,
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
          }
        }
      }
    });

    return Response.json({ leads });
  } catch (error: any) {
    console.error("GET /api/leads error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
