import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarSenha } from "@/lib/auth-helpers";
import { ensureSeed } from "@/app/api/admin/usuarios/route";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "amavidas-admin-2024";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
  }

  // Garante que o usuário padrão (admin) existe se a tabela estiver vazia
  await ensureSeed();

  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!usuario) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  if (!usuario.ativo) {
    return NextResponse.json({ error: "Sua conta está inativa." }, { status: 403 });
  }

  const senhaValida = verificarSenha(password, usuario.senhaHash);
  if (!senhaValida) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  // Atualiza a data do último acesso
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcesso: new Date() },
  }).catch(() => {});

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin-session", ADMIN_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
