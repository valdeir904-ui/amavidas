const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.usuario.findUnique({
    where: { email: 'admin@amavidas.com.br' },
  });
  console.log(admin);
}

main().finally(() => prisma.$disconnect());
