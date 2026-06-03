import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "amavidas-admin-2024";

function checkAuth(req: NextRequest): boolean {
  const session = req.cookies.get("admin-session")?.value;
  if (session === ADMIN_TOKEN) return true;

  const auth = req.headers.get("authorization");
  return auth === `Bearer ${ADMIN_TOKEN}`;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const leads = await prisma.simulacao.findMany({
    orderBy: { criadoEm: "desc" },
    take: 500,
  });

  return Response.json({ leads });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id, contatado, status } = await req.json();

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

  const updated = await prisma.simulacao.update({
    where: { id },
    data: updateData,
  });

  return Response.json({ success: true, lead: updated });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
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
      },
    });

    return Response.json({ success: true, lead }, { status: 201 });
  } catch (err) {
    console.error("Erro ao cadastrar lead manualmente:", err);
    return Response.json({ error: "Erro interno ao cadastrar lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return Response.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Deletar as notas vinculadas antes (se houver), 
    // mas se o Prisma schema tiver onDelete: Cascade não precisa.
    // Vamos tentar deletar direto.
    await prisma.simulacao.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Erro ao deletar lead:", err);
    return Response.json({ error: "Erro interno ao deletar lead" }, { status: 500 });
  }
}
