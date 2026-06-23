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

  // Strip ADMIN_TOKEN entirely
  content = content.replace(/const ADMIN_TOKEN = process\.env\.ADMIN_TOKEN[^;]+;\n/g, '');

  // Strip checkAuth / auth functions entirely
  content = content.replace(/function (?:checkAuth|auth)\(.*?\)[\s\S]*?\n\}\n/g, '');

  // Replace usage
  const replacement = 'const session = await verifySession();\n  if (!session) {';
  
  content = content.replace(/if \(!checkAuth\(req\)\) \{/g, replacement);
  content = content.replace(/if \(!checkAuth\(request\)\) \{/g, replacement);
  
  // For one-liners like `if (!auth(req)) return Response...`
  const replOneLinerReq = 'const session = await verifySession();\n  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });';
  content = content.replace(/if \(!auth\(req\)\) return Response.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);/g, replOneLinerReq);
  content = content.replace(/if \(!checkAuth\(req\)\) return Response.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);/g, replOneLinerReq);

  const replOneLinerRequest = 'const session = await verifySession();\n  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });';
  content = content.replace(/if \(!auth\(request\)\) return Response.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);/g, replOneLinerRequest);
  content = content.replace(/if \(!checkAuth\(request\)\) return Response.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);/g, replOneLinerRequest);

  // Fix imports
  if (!content.includes('verifySession')) {
    content = content.replace(/import \{ NextRequest \} from "next\/server";\n/, 'import { NextRequest } from "next/server";\nimport { verifySession } from "@/lib/session";\n');
    content = content.replace(/import \{ NextRequest, NextResponse \} from "next\/server";\n/, 'import { NextRequest, NextResponse } from "next/server";\nimport { verifySession } from "@/lib/session";\n');
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log("Fixed", file);
}
