/**
 * Cadastra os 2 alunos que o Leo enviou, sob a assessoria dele, com convite
 * pendente (mesma lógica do addAthlete). Idempotente por telefone: se o aluno
 * já existe na assessoria, só re-imprime o link. Uso: node scripts/add-leo-athletes.mjs
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const sql = neon(env.DATABASE_URL);
const token = () => randomBytes(18).toString("base64url");
const BASE = "https://elevo-liart.vercel.app";

// Assessoria do Leo (dono teamleoadm@hotmail.com)
const OWNER_EMAIL = "teamleoadm@hotmail.com";

const ALUNOS = [
  { name: "Raylson Alves", phone: "558588722626" },
  { name: "Tati Caffé", phone: "558594191424" },
];

const [{ id: assId, name: assName }] = await sql`
  select a.id, a.name from assessorias a
  join users u on u.id = a.owner_id
  where u.email = ${OWNER_EMAIL} limit 1`;
console.log(`Assessoria: ${assName} (${assId})\n`);

for (const al of ALUNOS) {
  // já existe alguém com esse telefone nessa assessoria?
  const existing = await sql`
    select u.id, u.name, p.invite_token
    from users u join athlete_profiles p on p.user_id = u.id
    where u.phone = ${al.phone} and p.assessoria_id = ${assId} limit 1`;
  if (existing.length) {
    const e = existing[0];
    const link = e.invite_token ? `${BASE}/convite/${e.invite_token}` : "(já ativado)";
    console.log(`= ${al.name} já existe — ${link}`);
    continue;
  }
  const invite = token();
  const email = `convite-${invite.slice(0, 10)}@pendente.elevo`;
  const passwordHash = bcrypt.hashSync(token() + token(), 10);
  const [u] = await sql`
    insert into users (name, email, password_hash, role, phone)
    values (${al.name}, ${email}, ${passwordHash}, 'athlete', ${al.phone})
    returning id`;
  await sql`
    insert into athlete_profiles (user_id, assessoria_id, invite_token)
    values (${u.id}, ${assId}, ${invite})`;
  console.log(`+ ${al.name} criado — ${BASE}/convite/${invite}`);
}
console.log("\nPronto.");
