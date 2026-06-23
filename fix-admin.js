const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.usuario.updateMany({
    where: { email: 'admin@amavidas.com.br' },
    data: { perfil: 'MASTER' }
  });
  console.log('Updated users:', result.count);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
