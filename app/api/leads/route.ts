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
      // ATENDENTE só vê leads sem responsável ou os seus próprios
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

export async function PATCH(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id, contatado, status, responsavelId } = await req.json();

  const currentLead = await prisma.simulacao.findUnique({ where: { id } });
  if (!currentLead) return Response.json({ error: "Não encontrado" }, { status: 404 });

  const updateData: any = {};
  if (contatado !== undefined) {
    updateData.contatado = contatado;
  }
  if (status !== undefined) {
    updateData.status = status;
    if (status === "ganho" || status === "perdido" || status === "contatado") {
      updateData.contatado = true;
    } else if (status === "pendente") {
      updateData.contatado = false;
    }
  }

  // Lógica de atribuição
  if (responsavelId !== undefined) {
    if (session.perfil === "MASTER") {
      updateData.responsavelId = responsavelId; // Master pode atribuir para qualquer um (ou null)
    } else {
      // Atendente só pode assumir para si mesmo se estiver livre
      if (responsavelId === session.userId && !currentLead.responsavelId) {
        updateData.responsavelId = session.userId;
      }
    }
  } else if (!currentLead.responsavelId && (status || contatado !== undefined)) {
    // Se interagir e estiver sem responsável, assume
    updateData.responsavelId = session.userId;
  }

  const updated = await prisma.simulacao.update({
    where: { id },
    data: updateData,
    include: {
      responsavel: {
        select: { id: true, nome: true }
      }
    }
  });

  return Response.json({ success: true, lead: updated });
}

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      nome,
      email,
      telefone,
      paraQuem,
      quantidadePessoas,
      faixaEtaria,
      prioridade,
      orcamento,
      planoRecomendado,
      status,
      cidade,
      comoContatar,
    } = body;

    if (!nome || !telefone || !planoRecomendado) {
      return Response.json(
        { error: "Nome, telefone e plano recomendado são obrigatórios." },
        { status: 400 }
      );
    }

    const initialStatus = status || "pendente";
    const contatado = initialStatus === "ganho" || initialStatus === "perdido" || initialStatus === "contatado";

    const lead = await prisma.simulacao.create({
      data: {
        nome: nome.trim(),
        email: (email ?? "").trim().toLowerCase(),
        telefone: telefone.trim(),
        paraQuem: paraQuem ?? "",
        quantidadePessoas: quantidadePessoas ?? "",
        faixaEtaria: faixaEtaria ?? "",
        prioridade: prioridade ?? "",
        orcamento: orcamento ?? "",
        planoRecomendado,
        status: initialStatus,
        contatado,
        cidade: cidade ?? "",
        comoContatar: comoContatar ?? "",
        responsavelId: session.userId as string, // quem cria já assume
      },
      include: {
        responsavel: {
          select: { id: true, nome: true }
        }
      }
    });

    return Response.json({ success: true, lead }, { status: 201 });
  } catch (err) {
    console.error("Erro ao cadastrar lead manualmente:", err);
    return Response.json({ error: "Erro interno ao cadastrar lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }
  
  if (session.perfil !== "MASTER") {
    return Response.json({ error: "Apenas Master pode deletar leads" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.simulacao.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Erro ao deletar lead:", err);
    return Response.json({ error: "Erro interno ao deletar lead" }, { status: 500 });
  }
}
