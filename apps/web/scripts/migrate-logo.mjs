/**
 * Adiciona a coluna logo_url em assessorias e ajusta o nome da assessoria do
 * Leo para a marca real. Idempotente. Uso: node scripts/migrate-logo.mjs
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const sql = neon(env.DATABASE_URL);

await sql`alter table assessorias add column if not exists logo_url text`;
console.log("coluna logo_url ok");

const r = await sql`
  update assessorias set name = 'Team Leo'
  where owner_id = (select id from users where email = 'teamleoadm@hotmail.com')
    and name = 'Léo'
  returning name`;
console.log(r.length ? `assessoria renomeada -> ${r[0].name}` : "assessoria já com nome ajustado");
