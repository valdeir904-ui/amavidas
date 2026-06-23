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

const basePath = path.join(__dirname, '..', '..', '..', 'Users', 'valde', 'amavidas'); // or just '.' since cwd is amavidas

for (const relPath of filesToFix) {
  const file = path.join('.', relPath);
  if (!fs.existsSync(file)) {
    console.log("Missing:", file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');

  // Remove the old ADMIN_TOKEN and checkAuth
  content = content.replace(/const ADMIN_TOKEN[\s\S]*?}\n\n/m, '');
  content = content.replace(/const ADMIN_TOKEN[^\n]*\n/g, '');
  
  // Also if checkAuth is not fully removed (in case it wasn't matched)
  content = content.replace(/function checkAuth\([\s\S]*?}\n\n/m, '');

  // Add verifySession import if not present
  if (!content.includes('verifySession')) {
    content = content.replace(/import \{ NextRequest \} from "next\/server";\n/g, 'import { NextRequest } from "next/server";\nimport { verifySession } from "@/lib/session";\n');
    content = content.replace(/import \{ NextRequest, NextResponse \} from "next\/server";\n/g, 'import { NextRequest, NextResponse } from "next/server";\nimport { verifySession } from "@/lib/session";\n');
  }

  // Replace usage
  content = content.replace(/if \(!checkAuth\(req\)\) \{/g, 'const session = await verifySession();\n  if (!session) {');
  // For files where it's `if (!checkAuth(request)) {`
  content = content.replace(/if \(!checkAuth\(request\)\) \{/g, 'const session = await verifySession();\n  if (!session) {');

  // Some routes might not be async, but GET/POST usually are
  fs.writeFileSync(file, content, 'utf8');
  console.log("Fixed", file);
}
