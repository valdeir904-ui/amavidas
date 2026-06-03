// API pública — expõe apenas configurações seguras para o front-end
import { prisma } from "@/lib/db";

const PUBLIC_KEYS = ["whatsapp", "telefone", "email_contato", "empresa_nome", "empresa_cnpj", "empresa_endereco", "instagram", "facebook", "youtube"];

export async function GET() {
  const rows = await prisma.configuracao.findMany({
    where: { chave: { in: PUBLIC_KEYS } },
  });
  const configs = Object.fromEntries(rows.map((r) => [r.chave, r.valor]));
  return Response.json({ configs });
}
