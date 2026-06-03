import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
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
      cidade,
      comoContatar,
    } = body;

    if (!nome || !telefone || !planoRecomendado) {
      return Response.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    const simulacao = await prisma.simulacao.create({
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
        cidade: cidade ?? "",
        comoContatar: comoContatar ?? "",
      },
    });

    return Response.json({ success: true, id: simulacao.id }, { status: 201 });
  } catch (err) {
    console.error("Erro ao salvar simulação:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return Response.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const updated = await prisma.simulacao.update({
      where: { id },
      data: updateData,
    });

    return Response.json({ success: true, lead: updated }, { status: 200 });
  } catch (err) {
    console.error("Erro ao atualizar simulação:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
