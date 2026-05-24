import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashSenha } from "@/lib/auth-helpers";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "amavidas-admin-2024";

function auth(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (session === ADMIN_TOKEN) return true;

  return req.headers.get("authorization") === `Bearer ${ADMIN_TOKEN}`;
}

// Seed: cria o usuário admin padrão na primeira execução
export async function ensureSeed() {
  if ((await prisma.usuario.count()) === 0) {
    await prisma.usuario.create({
      data: {
        nome: "Admin",
        email: "admin@amavidas.com.br",
        senhaHash: hashSenha(ADMIN_TOKEN),
        ativo: true,
      },
    });
  }
}

function sanitize(u: { senhaHash?: string; [k: string]: unknown }) {
  // nunca expõe o hash
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { senhaHash: _, ...rest } = u;
  return rest;
}

// ── GET — lista todos os usuários ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSeed();
  const usuarios = await prisma.usuario.findMany({ orderBy: { criadoEm: "asc" } });
  return Response.json({ usuarios: usuarios.map(sanitize) });
}

// ── POST — cria novo usuário ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { nome, email, senha } = await req.json();

  if (!nome?.trim())  return Response.json({ error: "Nome obrigatório."  }, { status: 400 });
  if (!email?.trim()) return Response.json({ error: "E-mail obrigatório."}, { status: 400 });
  if (!senha || senha.length < 6)
    return Response.json({ error: "Senha deve ter ao menos 6 caracteres." }, { status: 400 });

  const existe = await prisma.usuario.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existe) return Response.json({ error: "E-mail já cadastrado." }, { status: 409 });

  const usuario = await prisma.usuario.create({
    data: { nome: nome.trim(), email: email.trim().toLowerCase(), senhaHash: hashSenha(senha), ativo: true },
  });
  return Response.json({ ok: true, usuario: sanitize(usuario) }, { status: 201 });
}

// ── PATCH — edita nome/email/ativo  OU  troca senha ──────────────────────────
export async function PATCH(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, novaSenha, ...rest } = body;
  if (!id) return Response.json({ error: "id obrigatório." }, { status: 400 });

  // Troca de senha
  if (novaSenha !== undefined) {
    if (novaSenha.length < 6)
      return Response.json({ error: "Senha deve ter ao menos 6 caracteres." }, { status: 400 });
    const usuario = await prisma.usuario.update({
      where: { id },
      data: { senhaHash: hashSenha(novaSenha) },
    });
    return Response.json({ ok: true, usuario: sanitize(usuario) });
  }

  // Edição de dados
  const { criadoEm, atualizadoEm, ultimoAcesso, ...campos } = rest;
  void criadoEm; void atualizadoEm; void ultimoAcesso;

  if (campos.email) campos.email = campos.email.trim().toLowerCase();

  const usuario = await prisma.usuario.update({ where: { id }, data: campos });
  return Response.json({ ok: true, usuario: sanitize(usuario) });
}

// ── DELETE — exclui usuário ───────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!auth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return Response.json({ error: "id obrigatório." }, { status: 400 });

  const ativos = await prisma.usuario.count({ where: { ativo: true } });
  const alvo   = await prisma.usuario.findUnique({ where: { id } });
  if (!alvo) return Response.json({ error: "Usuário não encontrado." }, { status: 404 });
  if (alvo.ativo && ativos <= 1)
    return Response.json({ error: "Não é possível excluir o único usuário ativo." }, { status: 400 });

  await prisma.usuario.delete({ where: { id } });
  return Response.json({ ok: true });
}
