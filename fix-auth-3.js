const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/api/dashboard/route.ts',
  'app/api/admin/planos/route.ts',
  'app/api/admin/parceiros/route.ts',
  'app/api/admin/depoimentos/route.ts',
  'app/api/admin/configuracoes/route.ts',
  'app/api/admin/upload/route.ts',
  'app/api/leads/[id]/notas/route.ts',
];

for (const relPath of filesToFix) {
  const file = path.join('.', relPath);
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Remove const ADMIN_TOKEN ...
  content = content.replace(/const ADMIN_TOKEN[^\n]*\n/g, '');

  // Remove function auth or function checkAuth block
  content = content.replace(/function\s+(?:auth|checkAuth)\s*\([\s\S]*?}\n/g, '');

  // Replace usage
  content = content.replace(/if\s*\(\!checkAuth\(req\)\)\s*return\s*Response\.json\(\{\s*error:\s*"Unauthorized"\s*\}\s*,\s*\{\s*status:\s*401\s*\}\);?/g, 'const session = await verifySession();\n  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });');
  content = content.replace(/if\s*\(\!auth\(req\)\)\s*return\s*Response\.json\(\{\s*error:\s*"Unauthorized"\s*\}\s*,\s*\{\s*status:\s*401\s*\}\);?/g, 'const session = await verifySession();\n  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });');

  content = content.replace(/if\s*\(\!checkAuth\(req\)\)\s*\{[\s\n]*return\s*Response\.json\(\{\s*error:\s*"Não autorizado"\s*\}\s*,\s*\{\s*status:\s*401\s*\}\);?[\s\n]*\}/g, 'const session = await verifySession();\n  if (!session) return Response.json({ error: "Não autorizado" }, { status: 401 });');
  content = content.replace(/if\s*\(\!auth\(req\)\)\s*\{[\s\n]*return\s*Response\.json\(\{\s*error:\s*"Não autorizado"\s*\}\s*,\s*\{\s*status:\s*401\s*\}\);?[\s\n]*\}/g, 'const session = await verifySession();\n  if (!session) return Response.json({ error: "Não autorizado" }, { status: 401 });');

  content = content.replace(/if\s*\(\!checkAuth\(request\)\)\s*return\s*NextResponse\.json\(\{\s*error:\s*"Não autorizado"\s*\}\s*,\s*\{\s*status:\s*401\s*\}\);?/g, 'const session = await verifySession();\n  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });');
  content = content.replace(/if\s*\(\!auth\(request\)\)\s*return\s*NextResponse\.json\(\{\s*error:\s*"Não autorizado"\s*\}\s*,\s*\{\s*status:\s*401\s*\}\);?/g, 'const session = await verifySession();\n  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });');

  // Fix imports
  if (!content.includes('verifySession')) {
    content = content.replace(/import \{ NextRequest \} from "next\/server";\n/, 'import { NextRequest } from "next/server";\nimport { verifySession } from "@/lib/session";\n');
    content = content.replace(/import \{ NextRequest,\s*NextResponse \} from "next\/server";\n/, 'import { NextRequest, NextResponse } from "next/server";\nimport { verifySession } from "@/lib/session";\n');
  }

  fs.writeFileSync(file, content, 'utf8');
}
