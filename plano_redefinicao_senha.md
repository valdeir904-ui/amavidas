# Plano de Implementação: Fluxo de Redefinição de Senha (Admin)

Este documento detalha o planejamento técnico para implementar a recuperação e redefinição de senha para a área administrativa do site **AmaVidas**, utilizando o banco de dados MySQL atual (via Prisma) e o servidor de e-mail da Hostinger (via SMTP).

---

## 1. Variáveis de Ambiente Necessárias (`.env`)

No arquivo `.env` (tanto local quanto no servidor de produção da Hostinger), deverão ser adicionadas as seguintes chaves:

```env
# URL base do site para construir o link de redefinição
NEXT_PUBLIC_APP_URL="https://amavidas.com.br"

# Configurações do servidor SMTP da Hostinger
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_USER="suporte@amavidas.com.br"
SMTP_PASSWORD="senha_do_email_aqui"
```

---

## 2. Alteração no Banco de Dados (`prisma/schema.prisma`)

Devemos criar uma tabela para registrar os tokens temporários de redefinição gerados para os usuários:

```prisma
model PasswordResetToken {
  id       String   @id @default(cuid())
  email    String
  token    String   @unique
  expiraEm DateTime
  criadoEm DateTime @default(now())

  @@map("password_reset_tokens")
}
```

*Após alterar o schema, deve-se rodar o comando:*
`npx prisma db push` (ou criar migração correspondente) para aplicar a tabela no MySQL da Hostinger.

---

## 3. Dependências a Instalar

Para fazer o envio dos e-mails via código Node.js, utilizaremos o `nodemailer`:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

## 4. Estrutura de Arquivos a Ser Criada

```
amavidas/
├── app/
│   └── admin/
│       ├── recuperar-senha/
│       │   └── page.tsx           (Tela para o admin digitar o e-mail)
│       └── redefinir-senha/
│           └── page.tsx           (Tela para digitar a nova senha recebida no e-mail)
├── app/
│   └── api/
│       └── admin/
│           ├── recuperar-senha/
│           │   └── route.ts       (API que gera o token e dispara o e-mail)
│           └── redefinir-senha/
│               └── route.ts       (API que valida o token e atualiza a senha no banco)
└── lib/
    └── mail.ts                    (Utilitário de envio de e-mails usando Nodemailer)
```

---

## 5. Esboço das APIs e Lógica do Backend

### A. Utilitário de E-mail (`lib/mail.ts`)
```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // true para porta 465, false para outras
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function enviarEmailRecuperacao(email: string, token: string) {
  const urlBase = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${urlBase}/admin/redefinir-senha?token=${token}`;

  await transporter.sendMail({
    from: `"Suporte AmaVidas" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Redefinição de Senha - Painel Administrativo",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #1E293B;">Recuperação de Senha</h2>
        <p>Você solicitou a redefinição de senha para sua conta administrativa.</p>
        <p>Clique no botão abaixo para escolher uma nova senha. Este link expira em 1 hora.</p>
        <div style="margin: 24px 0;">
          <a href="${link}" style="background-color: #2B3DA8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir Senha</a>
        </div>
        <p style="color: #64748B; font-size: 12px;">Se você não solicitou essa redefinição, apenas desconsidere este e-mail.</p>
      </div>
    `,
  });
}
```

### B. API de Solicitação (`app/api/admin/recuperar-senha/route.ts`)
1. Recebe o e-mail via POST.
2. Verifica se o e-mail pertence a um `Usuario` ativo no banco.
3. Se sim, gera um token seguro (ex: `crypto.randomBytes(32).toString("hex")`).
4. Define a expiração para `now + 1 hora`.
5. Salva na tabela `PasswordResetToken` (ou substitui caso já exista um token para esse e-mail).
6. Dispara o e-mail de redefinição.
7. Retorna sucesso (importante: por segurança, sempre retornar sucesso mesmo se o e-mail não existir, para evitar varredura de contas).

### C. API de Redefinição (`app/api/admin/redefinir-senha/route.ts`)
1. Recebe o `token` e a `novaSenha` via POST.
2. Busca o token no banco na tabela `PasswordResetToken`.
3. Valida se o token existe e se a data `expiraEm` é posterior ao momento atual.
4. Se válido, atualiza a senha do usuário correspondente no banco (usando `hashSenha(novaSenha)` do `lib/auth-helpers`).
5. Remove o token utilizado do banco de dados.
6. Retorna resposta de sucesso.

---

## 6. Telas Frontend

1. **Alteração na Tela de Login (`app/admin/login/page.tsx`):**
   Adicionar um link discreto e elegante abaixo do campo de senha:
   ```tsx
   <Link href="/admin/recuperar-senha" className="text-xs text-white/50 hover:text-[#00B4C8] transition-colors mt-2 self-end">
     Esqueci minha senha
   </Link>
   ```

2. **Tela `/admin/recuperar-senha`:**
   Um formulário simples e premium com a identidade visual do site, contendo um campo para digitar o e-mail e um botão de envio. Ao enviar, mostra uma mensagem amigável: *"Se o e-mail informado estiver cadastrado, você receberá as instruções em instantes."*

3. **Tela `/admin/redefinir-senha`:**
   Lê o parâmetro `token` da URL (ex: `?token=XYZ`). Exibe campos para digitar a nova senha e confirmar a nova senha. Ao submeter com sucesso, redireciona o usuário para `/admin/login` com uma notificação de sucesso.

---

## 7. Passos para Executar Posteriormente

1. Obter os dados SMTP do e-mail da Hostinger.
2. Adicionar as variáveis SMTP no arquivo `.env`.
3. Rodar `npm install nodemailer @types/nodemailer`.
4. Criar a tabela `PasswordResetToken` no `schema.prisma` e rodar `npx prisma db push`.
5. Implementar os arquivos de lógica e frontend descritos.
6. Subir as alterações no Git e atualizar o servidor.
