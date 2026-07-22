import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL não configurada");

/**
 * Driver TCP (postgres.js) contra o pooler do Neon — funciona igual em dev e
 * na Vercel (runtime Node). `max: 1` porque em serverless cada instância deve
 * segurar no máximo uma conexão (o pooler do Neon faz o resto).
 */
const client = postgres(url, { max: 1 });
export const db = drizzle(client, { schema });
export * as tables from "./schema";
