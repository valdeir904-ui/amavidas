import { verifySession } from "@/lib/session";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "amavidas-admin-2024";

function auth(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (session === ADMIN_TOKEN) return true;

  return req.headers.get("authorization") === `Bearer ${ADMIN_TOKEN}`;
}

// Valores padrão que são criados na primeira requisição
const DEFAULTS: Record<string, string> = {
  whatsapp:        "5561985825621",
  secao_beneficios_ativa: "true",
  telefone:        "",
  email_contato:   "contato@amavidas.com.br",
  empresa_nome:    "AmaVidas",
  empresa_cnpj:    "",
  empresa_endereco:"",
  instagram:       "",
  facebook:        "",
  youtube:         "",
};

async function ensureSeed() {
  const existentes = await prisma.configuracao.findMany();
  const chaves = new Set(existentes.map((c) => c.chave));
  const faltando = Object.entries(DEFAULTS).filter(([k]) => !chaves.has(k));
  if (faltando.length > 0) {
    await prisma.configuracao.createMany({
      data: faltando.map(([chave, valor]) => ({ chave, valor })),
    });
  }
}

// ── GET — retorna todas as configs ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSeed();
  const rows = await prisma.configuracao.findMany();
  const configs = Object.fromEntries(rows.map((r) => [r.chave, r.valor]));
  return Response.json({ configs });
}

// ── PATCH — upsert em lote { configs: Record<string, string> } ────────────────
export async function PATCH(req: NextRequest) {
  const session = await verifySession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { configs } = await req.json() as { configs: Record<string, string> };
  if (!configs || typeof configs !== "object")
    return Response.json({ error: "configs obrigatório." }, { status: 400 });

  await Promise.all(
    Object.entries(configs).map(([chave, valor]) =>
      prisma.configuracao.upsert({
        where: { chave },
        update: { valor: String(valor) },
        create: { chave, valor: String(valor) },
      })
    )
  );

  const rows = await prisma.configuracao.findMany();
  const updated = Object.fromEntries(rows.map((r) => [r.chave, r.valor]));
  return Response.json({ ok: true, configs: updated });
}
