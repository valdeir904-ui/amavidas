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
        },
        historico: {
          select: {
            id: true,
            acao: true,
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

function validarNome(nome: string): boolean {
  const nomeTrim = nome.trim();
  if (nomeTrim.length < 3) return false;
  
  const temLetra = /[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/.test(nomeTrim);
  if (!temLetra) return false;

  const lowercase = nomeTrim.toLowerCase();
  const termosProibidos = [
    "pessoa", "pessoas", "so para mim", "so eu", "conjuge", "familia", "pais",
    "individual", "ate-50", "50-90", "90-120", "nao_sei", "nao sei",
    "aguas_lindas", "aguas lindas", "brasilia", "outros", "outra cidade",
    "visita", "ligacao", "whatsapp", "menor_preco", "menor preco", "equilibrio",
    "melhor_cobertura", "melhor cobertura", "contratar_agora", "contratar agora",
    "entender_melhor", "entender melhor", "pesquisando", "simulador",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"
  ];
  
  if (termosProibidos.includes(lowercase)) return false;
  if (/^\d+\s*pess/.test(lowercase)) return false;
  
  return true;
}

function validarTelefone(tel: string): boolean {
  const digitos = tel.replace(/\D/g, "");
  if (digitos.length !== 10 && digitos.length !== 11) return false;
  
  const todosIguais = /^(\d)\1+$/.test(digitos);
  if (todosIguais) return false;
  
  return true;
}

export async function PATCH(req: NextRequest) {
  const session = (await verifySession()) as any;
  if (!session) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { 
    id,
    status, 
    contatado, 
    responsavelId, 
    motivoPerda,
    motivoDescarte,
    descarteObservacao,
    primeiroContatoEm,
    nomeCompletoContrato,
    numeroDependentes,
    planoContratado,
    contratoAssinado,
    valorAdesao,
    valorPlano,
    registrarContato
  } = body;

  if (!id) return Response.json({ error: "ID não fornecido" }, { status: 400 });

  const currentLead = await prisma.simulacao.findUnique({ where: { id } });
  if (!currentLead) return Response.json({ error: "Não encontrado" }, { status: 404 });

  const updateData: any = {};
  if (contatado !== undefined) {
    updateData.contatado = contatado;
  }

  const historyLogs: any[] = [];

  if (status !== undefined && status !== currentLead.status) {
    updateData.status = status;
    if (status === "ganho" || status === "perdido" || status === "contatado" || status === "negociando") {
      updateData.contatado = true;
    } else if (status === "novo_lead") {
      updateData.contatado = false;
    }

    historyLogs.push({
      usuarioId: session.userId,
      acao: "mudou_status",
      statusAntes: currentLead.status,
      statusDepois: status,
      observacao: `Status alterado de "${currentLead.status}" para "${status}"`
    });
  }

  if (motivoDescarte !== undefined && motivoDescarte !== currentLead.motivoDescarte) {
    updateData.motivoDescarte = motivoDescarte;
    updateData.motivoPerda = motivoDescarte; // Retrocompatibilidade
  }
  if (descarteObservacao !== undefined) updateData.descarteObservacao = descarteObservacao;

  if (status === "perdido" && currentLead.status !== "perdido") {
    historyLogs.push({
      usuarioId: session.userId,
      acao: "descartou",
      statusAntes: currentLead.status,
      statusDepois: "perdido",
      observacao: `Lead perdido. Motivo: ${motivoDescarte || "Não informado"}${descarteObservacao ? ` (Obs: ${descarteObservacao})` : ""}`
    });
  }

  if (primeiroContatoEm !== undefined && !currentLead.primeiroContatoEm) {
    updateData.primeiroContatoEm = primeiroContatoEm ? new Date(primeiroContatoEm) : null;
    historyLogs.push({
      usuarioId: session.userId,
      acao: "contatou",
      observacao: "Primeiro contato comercial realizado."
    });
  }

  if (nomeCompletoContrato !== undefined) updateData.nomeCompletoContrato = nomeCompletoContrato;
  if (numeroDependentes !== undefined) updateData.numeroDependentes = numeroDependentes;
  if (planoContratado !== undefined) updateData.planoContratado = planoContratado;
  if (contratoAssinado !== undefined) updateData.contratoAssinado = contratoAssinado;
  if (valorAdesao !== undefined) updateData.valorAdesao = valorAdesao;
  if (valorPlano !== undefined) updateData.valorPlano = valorPlano;

  if (registrarContato !== undefined) {
    if (registrarContato === "ligacao") {
      historyLogs.push({
        usuarioId: session.userId,
        acao: "contato_ligacao",
        observacao: "Tentativa de contato via Ligação"
      });
    } else if (registrarContato === "whatsapp") {
      historyLogs.push({
        usuarioId: session.userId,
        acao: "contato_whatsapp",
        observacao: "Tentativa de contato via WhatsApp"
      });
    }
  }

  // Lógica de atribuição
  let finalResponsavelId = currentLead.responsavelId;
  if (responsavelId !== undefined) {
    if (session.perfil === "MASTER") {
      updateData.responsavelId = responsavelId;
      finalResponsavelId = responsavelId;
    } else {
      if (responsavelId === session.userId && !currentLead.responsavelId) {
        updateData.responsavelId = session.userId;
        finalResponsavelId = session.userId;
      }
    }
  }

  // Se sair de novo_lead e estiver sem responsável, assume automaticamente
  const finalStatus = status || currentLead.status;
  if (finalStatus !== "novo_lead" && !finalResponsavelId) {
    updateData.responsavelId = session.userId;
    finalResponsavelId = session.userId;
  }

  if (finalResponsavelId !== currentLead.responsavelId) {
    historyLogs.push({
      usuarioId: session.userId,
      acao: "atribuiu",
      statusAntes: currentLead.responsavelId,
      statusDepois: finalResponsavelId,
      observacao: finalResponsavelId ? `Responsável atribuído.` : "Responsável removido."
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const lead = await tx.simulacao.update({
      where: { id },
      data: updateData,
      include: {
        responsavel: {
          select: { id: true, nome: true }
        },
        historico: {
          select: { id: true, acao: true }
        }
      }
    });

    for (const log of historyLogs) {
      await tx.leadHistorico.create({
        data: {
          simulacaoId: id,
          ...log
        }
      });
    }

    return lead;
  });

  return Response.json({ success: true, lead: updated });
}

export async function POST(req: NextRequest) {
  const session = (await verifySession()) as any;
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
      origem,
      intencao,
      consentimento,
    } = body;

    if (!nome || !telefone || !planoRecomendado) {
      return Response.json(
        { error: "Nome, telefone e plano recomendado são obrigatórios." },
        { status: 400 }
      );
    }

    if (!validarNome(nome)) {
      return Response.json({ error: "O nome informado é inválido." }, { status: 400 });
    }

    if (!validarTelefone(telefone)) {
      return Response.json({ error: "O telefone informado é inválido." }, { status: 400 });
    }

    const initialStatus = status || "novo_lead";
    const contatado = initialStatus === "ganho" || initialStatus === "perdido" || initialStatus === "contatado" || initialStatus === "negociando";
    const finalOrigem = origem || "manual";

    const lead = await prisma.simulacao.create({
      data: {
        nome: nome.trim(),
        email: email ? email.trim().toLowerCase() : null,
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
        comoContatar: comoContatar ?? "whatsapp",
        responsavelId: session.userId as string, // quem cria já assume
        origem: finalOrigem,
        consentimento: consentimento ?? false,
        consentimentoEm: consentimento ? new Date() : null,
        intencao: intencao ?? null,
      },
      include: {
        responsavel: {
          select: { id: true, nome: true }
        }
      }
    });

    await prisma.leadHistorico.create({
      data: {
        simulacaoId: lead.id,
        usuarioId: session.userId,
        acao: "atribuiu",
        statusDepois: initialStatus,
        observacao: `Lead criado manualmente. Origem: ${finalOrigem}`
      }
    });

    return Response.json({ success: true, lead }, { status: 201 });
  } catch (err) {
    console.error("Erro ao cadastrar lead manualmente:", err);
    return Response.json({ error: "Erro interno ao cadastrar lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = (await verifySession()) as any;
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
