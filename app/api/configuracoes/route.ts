// API pública — expõe apenas configurações seguras para o front-end
import { prisma } from "@/lib/db";

const PUBLIC_KEYS = [
  "whatsapp", "telefone", "email_contato", "empresa_nome", "empresa_cnpj", "empresa_endereco",
  "instagram", "facebook", "youtube", "secao_beneficios_ativa",
  "google_ads_id", "google_ads_conversion_label", "google_ads_wa_label", "meta_pixel_id", "gtm_id"
];

export async function GET() {
  const rows = await prisma.configuracao.findMany({
    where: { chave: { in: PUBLIC_KEYS } },
  });
  const configs = Object.fromEntries(rows.map((r) => [r.chave, r.valor]));
  return Response.json({ configs });
}
