import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

export function hashSenha(senha: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verificarSenha(senha: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const hashBuf = Buffer.from(hash, "hex");
    const verif   = scryptSync(senha, salt, 64);
    return timingSafeEqual(hashBuf, verif);
  } catch {
    return false;
  }
}
