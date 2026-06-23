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

  // Add verifySession import if not present
  if (!content.includes('verifySession')) {
    content = content.replace(/import \{ NextRequest \} from "next\/server";\n/, 'import { NextRequest } from "next/server";\nimport { verifySession } from "@/lib/session";\n');
    content = content.replace(/import \{ NextRequest, NextResponse \} from "next\/server";\n/, 'import { NextRequest, NextResponse } from "next/server";\nimport { verifySession } from "@/lib/session";\n');
  }

  // Replace definition of ADMIN_TOKEN and auth/checkAuth function
  // Match `const ADMIN_TOKEN ...` up to the end of the `function ...` block
  content = content.replace(/const ADMIN_TOKEN[\s\S]*?function (?:auth|checkAuth)[\s\S]*?}\n\n/m, '');
  content = content.replace(/const ADMIN_TOKEN[^\n]*\n/g, '');
  content = content.replace(/function (?:auth|checkAuth)[\s\S]*?}\n\n/m, '');

  // Replace usage
  content = content.replace(/if \(!checkAuth\(req\)\) return Response.json/g, 'const session = await verifySession();\n  if (!session) return Response.json');
  content = content.replace(/if \(!auth\(req\)\) return Response.json/g, 'const session = await verifySession();\n  if (!session) return Response.json');
  content = content.replace(/if \(!checkAuth\(req\)\) \{/g, 'const session = await verifySession();\n  if (!session) {');
  content = content.replace(/if \(!auth\(req\)\) \{/g, 'const session = await verifySession();\n  if (!session) {');

  // Also replace request parameter variations
  content = content.replace(/if \(!checkAuth\(request\)\) return Response.json/g, 'const session = await verifySession();\n  if (!session) return Response.json');
  content = content.replace(/if \(!auth\(request\)\) return Response.json/g, 'const session = await verifySession();\n  if (!session) return Response.json');

  fs.writeFileSync(file, content, 'utf8');
  console.log("Fixed", file);
}
