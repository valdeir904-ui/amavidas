import { verifySession } from "@/lib/session";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "amavidas-admin-2024";

function auth(req: NextRequest) {
  const session = req.cookies.get("admin-session")?.value;
  if (session === ADMIN_TOKEN) return true;

  const h = req.headers.get("authorization");
  return h === `Bearer ${ADMIN_TOKEN}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SEED: any[] = [
  {
    slug: "cuidar-plus", nome: "Cuidar Plus", icone: "🌿",
    tagline: "Proteção acessível para você ou um familiar próximo",
    preco: 35, cobertura: 2100, ativo: true, destaque: false, badge: null,
    beneficios: JSON.stringify([
      "Assistência funeral completa",
      "Urna e ornamentação",
      "Translado local",
      "Atendimento 24 horas",
      "Documentação básica incluída",
    ]),
    ausentes: JSON.stringify(["Translado nacional","Cônjuge e filhos","Clube de descontos"]),
    ordem: 0,
  },
  {
    slug: "amar-plus", nome: "Amar Plus", icone: "🏡",
    tagline: "O equilíbrio certo entre proteção e valor para toda a família",
    preco: 43, cobertura: 2500, ativo: true, destaque: true, badge: "Mais escolhido",
    beneficios: JSON.stringify([
      "Urna (caixão) modelo padrão",
      "Ornamentação com flores naturais",
      "Translado 500 km rodados",
      "Necromaquiagem",
      "Conjunto de vestimenta",
      "Coroa de flores",
      "Kit lanche",
      "Tule padrão",
      "Terço",
      "Velas",
      "Cartões de homenagem",
      "Livro de presença",
      "Nota de falecimento"
    ]),
    ausentes: JSON.stringify([
      "Translado internacional",
      "Família ampliada",
      "Mini buffet para até 30 pessoas",
      "Higienização"
    ]),
    ordem: 1,
  },
  {
    slug: "vida-plus", nome: "Vida Plus", icone: "⭐",
    tagline: "A cobertura mais completa para famílias maiores ou quem quer o melhor",
    preco: 90, cobertura: 3500, ativo: true, destaque: false, badge: null,
    beneficios: JSON.stringify([
      "Urna (caixão alto padrão)",
      "Ornamentação",
      "Traslado de até 1.000 km rodados",
      "Necromaquiagem",
      "Conjunto de vestimenta alto padrão",
      "Coroa de flores",
      "Mini buffet para até 30 pessoas",
      "Tule especial",
      "Terço",
      "Velas",
      "Cartões de homenagem",
      "Livro de registro de presença",
      "Higienização",
      "Nota de falecimento"
    ]),
    ausentes: JSON.stringify([]),
    ordem: 2,
  },
];

async function ensureSeed() {
  if ((await prisma.plano.count()) === 0) {
    await prisma.plano.createMany({ data: SEED });
  }
}

function parse(p: { beneficios: string; ausentes: string; [k: string]: unknown }) {
  return { ...p, beneficios: JSON.parse(p.beneficios) as string[], ausentes: JSON.parse(p.ausentes) as string[] };
}

// ── GET — lista todos os planos ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSeed();
  const planos = await prisma.plano.findMany({ orderBy: { ordem: "asc" } });
  return Response.json({ planos: planos.map(parse) });
}

// ── POST — cria novo plano ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const nome: string = (body.nome ?? "Novo Plano").trim();

  const base = nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let slug = base;
  let attempt = 0;
  while (await prisma.plano.findUnique({ where: { slug } })) { attempt++; slug = `${base}-${attempt}`; }

  const { _max } = await prisma.plano.aggregate({ _max: { ordem: true } });
  const plano = await prisma.plano.create({
    data: {
      slug, nome,
      tagline: body.tagline ?? "Descrição do plano",
      preco: body.preco ?? 0,
      icone: body.icone ?? "📄",
      ativo: false,
      destaque: false,
      badge: body.badge ?? null,
      beneficios: JSON.stringify(body.beneficios ?? []),
      ausentes: JSON.stringify(body.ausentes ?? []),
      ordem: (_max.ordem ?? -1) + 1,
    },
  });
  return Response.json({ ok: true, plano: parse(plano) }, { status: 201 });
}

// ── PATCH — atualiza plano ────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const session = await verifySession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, beneficios, ausentes, criadoEm, atualizadoEm, ...rest } = await req.json();
  if (!id) return Response.json({ error: "id obrigatório" }, { status: 400 });

  const plano = await prisma.plano.update({
    where: { id },
    data: { ...rest, beneficios: JSON.stringify(beneficios ?? []), ausentes: JSON.stringify(ausentes ?? []) },
  });
  return Response.json({ ok: true, plano: parse(plano) });
}

// ── DELETE — exclui plano ─────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await verifySession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return Response.json({ error: "id obrigatório" }, { status: 400 });

  const total = await prisma.plano.count();
  if (total <= 1) return Response.json({ error: "Não é possível excluir o único plano cadastrado." }, { status: 400 });

  await prisma.plano.delete({ where: { id } });
  return Response.json({ ok: true });
}
