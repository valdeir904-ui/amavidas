const { PrismaClient } = require('@prisma/client');
const { scryptSync, randomBytes } = require('crypto');

function hashSenha(senha) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@amavidas.com.br';
  const adminToken = process.env.ADMIN_TOKEN || 'AmV!d@s-Pr0d-2026';

  const existing = await prisma.usuario.findUnique({
    where: { email: adminEmail }
  });

  if (!existing) {
    console.log(`Criando usuário ${adminEmail}...`);
    const newUser = await prisma.usuario.create({
      data: {
        nome: "Administrador Master",
        email: adminEmail,
        senhaHash: hashSenha(adminToken),
        ativo: true,
        perfil: "MASTER"
      }
    });
    console.log("Usuário criado com sucesso:", newUser.email);
  } else {
    console.log(`Usuário ${adminEmail} já existe.`);
  }

  const allUsers = await prisma.usuario.findMany({
    select: { id: true, nome: true, email: true, perfil: true, ativo: true }
  });
  console.log("Usuários cadastrados no banco:", allUsers);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
