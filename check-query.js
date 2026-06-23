const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const leads = await prisma.simulacao.findMany({
      where: {
        OR: [
          { responsavelId: null },
          { responsavelId: 'cmpl68755000114kvp50lv7bd' }
        ]
      },
      include: { responsavel: true }
    });
    console.log("Leads length:", leads.length);
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  }
}

main().finally(() => prisma.$disconnect());
