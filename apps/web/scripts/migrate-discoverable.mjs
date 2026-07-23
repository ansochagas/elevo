/**
 * Adiciona a coluna public_discoverable (opt-in de SEO) em athlete_profiles.
 * Idempotente. Uso: node scripts/migrate-discoverable.mjs
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const sql = neon(env.DATABASE_URL);

await sql`alter table athlete_profiles add column if not exists public_discoverable boolean not null default false`;
console.log("coluna public_discoverable ok");
