import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      nome,
      telefone,
      paraQuem,
      quantidadePessoas,
      faixaEtaria,
      prioridade,
      orcamento,
      planoRecomendado,
      cidade,
      intencao,
      consentimento,
      sessionId,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      gclid,
      fbclid,
      referrer,
      landingPage,
      dispositivo,
      origem,
    } = body;

    if (!nome || !telefone || !planoRecomendado) {
      return Response.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    if (!validarNome(nome)) {
      return Response.json({ error: "O nome informado é inválido." }, { status: 400 });
    }

    if (!validarTelefone(telefone)) {
      return Response.json({ error: "O telefone informado é inválido." }, { status: 400 });
    }

    if (!consentimento) {
      return Response.json({ error: "O consentimento para contato é obrigatório." }, { status: 400 });
    }

    const simulacao = await prisma.simulacao.create({
      data: {
        nome: nome.trim(),
        telefone: telefone.trim(),
        paraQuem: paraQuem ?? "",
        quantidadePessoas: quantidadePessoas ?? "",
        faixaEtaria: faixaEtaria ?? "",
        prioridade: prioridade ?? "",
        orcamento: orcamento ?? "",
        planoRecomendado,
        cidade: cidade ?? "",
        status: "novo_lead",
        consentimento: true,
        consentimentoEm: new Date(),
        intencao: intencao ?? "pesquisando",
        origem: origem ?? "simulador",
        utmSource: utmSource ?? null,
        utmMedium: utmMedium ?? null,
        utmCampaign: utmCampaign ?? null,
        utmTerm: utmTerm ?? null,
        utmContent: utmContent ?? null,
        gclid: gclid ?? null,
        fbclid: fbclid ?? null,
        referrer: referrer ?? null,
        landingPage: landingPage ?? null,
        dispositivo: dispositivo ?? null,
      },
    });

    if (sessionId) {
      try {
        await prisma.simulacaoIncompleta.delete({
          where: { sessionId }
        });
      } catch (e) {
        // Ignorar se não existir ou falhar
      }
    }

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
