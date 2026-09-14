const { PrismaClient } = require('@prisma/client');
const { scryptSync, randomBytes } = require('crypto');

function hashSenha(senha) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const prisma = new PrismaClient();

async function main() {
  const email = 'barbara@amavidas.com.br';
  const senha = 'Barbara123';
  const nome = 'Bárbara';
  const perfil = 'GERENTE';

  const existing = await prisma.usuario.findUnique({
    where: { email }
  });

  if (existing) {
    console.log(`Atualizando usuário existente ${email}...`);
    const updated = await prisma.usuario.update({
      where: { id: existing.id },
      data: {
        nome,
        senhaHash: hashSenha(senha),
        perfil,
        ativo: true
      }
    });
    console.log("Usuário atualizado:", updated.email, "Perfil:", updated.perfil);
  } else {
    console.log(`Criando novo usuário ${email}...`);
    const created = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash: hashSenha(senha),
        perfil,
        ativo: true
      }
    });
    console.log("Usuário criado:", created.email, "Perfil:", created.perfil);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
