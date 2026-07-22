/**
 * Seed do piloto fechado: cria o treinador (dono da assessoria) e um atleta,
 * com senhas aleatórias exibidas UMA vez no terminal. Idempotente: rodar de
 * novo re-gera as senhas das mesmas contas.
 * Uso: node scripts/seed.mjs
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
if (!env.DATABASE_URL) throw new Error(".env.local sem DATABASE_URL");
const sql = neon(env.DATABASE_URL);

const senha = () => randomBytes(9).toString("base64url").replace(/[-_]/g, "x").slice(0, 12);

async function upsertUser(name, email, role, plain) {
  const hash = bcrypt.hashSync(plain, 10);
  const rows = await sql`
    insert into users (name, email, password_hash, role)
    values (${name}, ${email}, ${hash}, ${role})
    on conflict (email) do update set password_hash = ${hash}, name = ${name}, role = ${role}
    returning id`;
  return rows[0].id;
}

const senhaCoach = senha();
const senhaAtleta = senha();

const coachId = await upsertUser("Treinador Piloto", "treinador@elevo.app", "coach", senhaCoach);
const atletaId = await upsertUser("Atleta Piloto", "atleta@elevo.app", "athlete", senhaAtleta);

// assessoria do treinador (cria se não existir)
let ass = await sql`select id from assessorias where owner_id = ${coachId} limit 1`;
if (ass.length === 0) {
  ass = await sql`insert into assessorias (name, owner_id) values ('Assessoria Piloto', ${coachId}) returning id`;
}
const assId = ass[0].id;

// vínculo do atleta com a assessoria
await sql`
  insert into athlete_profiles (user_id, assessoria_id, city, level, archetype)
  values (${atletaId}, ${assId}, 'Fortaleza, CE', 'Prata II', 'Fundista')
  on conflict (user_id) do update set assessoria_id = ${assId}`;

console.log("== CONTAS DO PILOTO (guarde e envie com cuidado) ==");
console.log(`TREINADOR  treinador@elevo.app  senha: ${senhaCoach}`);
console.log(`ATLETA     atleta@elevo.app     senha: ${senhaAtleta}`);
console.log("Assessoria Piloto criada e atleta vinculado.");
