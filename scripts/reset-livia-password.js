const { PrismaClient } = require('@prisma/client');
const { scryptSync, randomBytes } = require('crypto');

function hashSenha(senha) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const prisma = new PrismaClient();

async function main() {
  const email = 'livia.antonieti@hotmail.com';
  const novaSenha = 'Livia@2026';

  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() }
  });

  if (!usuario) {
    console.error("Usuário não encontrado:", email);
    return;
  }

  const novaSenhaHash = hashSenha(novaSenha);
  const updated = await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      senhaHash: novaSenhaHash,
      ativo: true
    }
  });

  console.log("Senha da Livia atualizada com sucesso no banco de dados!");
  console.log("Email:", updated.email);
  console.log("Perfil:", updated.perfil);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
