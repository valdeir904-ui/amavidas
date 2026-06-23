const { SignJWT } = require("jose");
const secretKey = process.env.JWT_SECRET || "super_secret_amavidas_key_2024";
const encodedKey = new TextEncoder().encode(secretKey);

async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

async function main() {
  const token = await encrypt({ userId: "cmpl68755000114kvp50lv7bd", email: "admin@amavidas.com.br", perfil: "MASTER", expiresAt: new Date(Date.now()+10000) });
  const resp = await fetch('http://localhost:3000/api/leads', { headers: { Cookie: 'admin-session='+token } });
  const text = await resp.text();
  console.log("STATUS:", resp.status);
  console.log("TEXT:", text);
}

main().catch(console.error);
