/**
 * Define uma nova senha para um usuário (treinador ou atleta) pelo e-mail.
 * A senha é escolhida por você e nunca fica registrada em lugar nenhum além
 * do banco (criptografada). Uso:
 *   node scripts/set-coach-password.mjs teamleoadm@hotmail.com "SenhaQueVoceEscolher"
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";

const [, , emailArg, senha] = process.argv;
if (!emailArg || !senha) {
  console.error('Uso: node scripts/set-coach-password.mjs <email> "<senha>"');
  process.exit(1);
}
if (senha.length < 8) {
  console.error("A senha precisa ter pelo menos 8 caracteres.");
  process.exit(1);
}

const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const sql = neon(env.DATABASE_URL);

const email = emailArg.toLowerCase();
const hash = bcrypt.hashSync(senha, 10);
const r = await sql`update users set password_hash = ${hash} where email = ${email} returning name, role`;
if (r.length) {
  console.log(`Senha definida para ${r[0].name} (${email}, ${r[0].role}).`);
} else {
  console.log(`Nenhum usuário com o e-mail ${email}.`);
}
