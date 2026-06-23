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

  // Fix imports
  if (!content.includes('verifySession')) {
    content = 'import { verifySession } from "@/lib/session";\n' + content;
  }

  fs.writeFileSync(file, content, 'utf8');
}
