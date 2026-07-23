/**
 * Cria a tabela `briefs` (cache semanal da leitura de IA). Idempotente.
 * Rode ao ligar a camada de IA. Uso: node scripts/migrate-briefs.mjs
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const sql = neon(env.DATABASE_URL);

await sql`
  create table if not exists briefs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id),
    week_of text not null,
    brief jsonb not null,
    source text not null,
    created_at timestamptz not null default now()
  )`;
await sql`create unique index if not exists briefs_user_week_idx on briefs (user_id, week_of)`;
console.log("tabela briefs ok");
