const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Atualizar Amar Plus
  const amarPlus = await prisma.plano.update({
    where: { slug: 'amar-plus' },
    data: {
      beneficios: JSON.stringify([
        "Urna (caixão) modelo padrão",
        "Ornamentação com flores naturais",
        "Translado 500 km rodados",
        "Necromaquiagem",
        "Conjunto de vestimenta",
        "Coroa de flores",
        "Clube de Benefícios",
        "Kit lanche",
        "Tule padrão, Terço e Velas",
        "Livro de presença, Cartões de homenagem e Nota de falecimento"
      ]),
      ausentes: JSON.stringify([
        "Mini buffet para até 30 pessoas",
        "Tule especial",
        "Translado de até 1.000 km",
        "Sem cobertura internacional"
      ])
    }
  });
  console.log('Amar Plus atualizado:', amarPlus.nome);

  // 2. Atualizar Vida Plus
  const vidaPlus = await prisma.plano.update({
    where: { slug: 'vida-plus' },
    data: {
      beneficios: JSON.stringify([
        "Tudo do Plano Amar Plus, e mais:",
        "Urna (caixão) alto padrão",
        "Traslado de até 1.000 km rodados",
        "Conjunto de vestimenta alto padrão",
        "Mini buffet para até 30 pessoas",
        "Tule especial"
      ]),
      ausentes: JSON.stringify([
        "Sem cobertura internacional"
      ])
    }
  });
  console.log('Vida Plus atualizado:', vidaPlus.nome);
}

main()
  .catch(e => {
    console.error('Erro ao atualizar planos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
