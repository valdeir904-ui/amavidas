import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando migração de leads...");

  // 1. Atualizar status de "pendente" para "novo_lead"
  const pendentes = await prisma.simulacao.updateMany({
    where: {
      status: "pendente"
    },
    data: {
      status: "novo_lead"
    }
  });
  console.log(`Atualizados ${pendentes.count} leads de 'pendente' para 'novo_lead'.`);

  // 2. Tratar leads com nomes inválidos ("7 pessoas", "6" ou somente dígitos)
  const leads = await prisma.simulacao.findMany();
  let invalidosCount = 0;

  for (const lead of leads) {
    const nomeTrim = lead.nome.trim();
    const temLetra = /[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/.test(nomeTrim);
    const eInvalido = !temLetra || nomeTrim === "7 pessoas" || nomeTrim === "6" || /^\d+$/.test(nomeTrim);

    if (eInvalido) {
      await prisma.simulacao.update({
        where: { id: lead.id },
        data: {
          status: "perdido",
          motivoDescarte: "dado_invalido",
          descarteObservacao: `Migrado como inválido. Nome original: "${lead.nome}"`
        }
      });
      invalidosCount++;
    }
  }
  console.log(`Marcados ${invalidosCount} leads como 'perdido' por possuírem dados inválidos.`);

  // 3. Definir consentimento = false para leads que não possuem a flag marcada
  const consentimentos = await prisma.simulacao.updateMany({
    where: {
      consentimento: {
        equals: false
      }
    },
    data: {
      consentimento: false
    }
  });
  console.log("Migração concluída com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro na migração:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
