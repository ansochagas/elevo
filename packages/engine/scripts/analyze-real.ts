/**
 * Validação de ponta a ponta: roda o motor de produção sobre os GPX reais do
 * export, parseando os arquivos direto (sem depender do CSV do Strava).
 * Uso: node --experimental-strip-types scripts/analyze-real.ts
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseGpx,
  cleanActivities,
  buildProfile,
  identityTimeline,
  type Activity,
} from "../src/index.ts";

const DIR = join("C:", "Users", "ander", "Desktop", "RunnerProfile", "data", "export", "activities");

const paceStr = (p: number | null) => {
  if (p === null) return "—";
  const m = Math.floor(p);
  const s = Math.round((p - m) * 60);
  return `${m}:${String(s === 60 ? 0 : s).padStart(2, "0")}/km`;
};

const files = readdirSync(DIR).filter((f) => f.endsWith(".gpx"));
const acts: Activity[] = [];
for (const f of files) {
  const a = parseGpx(readFileSync(join(DIR, f), "utf8"), { id: f.replace(".gpx", ""), source: "strava" });
  if (a) acts.push(a);
}

const { clean, flagged } = cleanActivities(acts);
const profile = buildProfile(clean);

console.log("=".repeat(56));
console.log("  MOTOR DE PRODUÇÃO — validação no dado real (GPX)");
console.log("=".repeat(56));
console.log(`Arquivos GPX: ${files.length} | parseados: ${acts.length} | limpos: ${clean.length} | removidos: ${flagged.length}`);
const byReason: Record<string, number> = {};
for (const f of flagged) byReason[f.reason] = (byReason[f.reason] ?? 0) + 1;
for (const [r, n] of Object.entries(byReason)) console.log(`   - ${n}× ${r}`);

console.log("\nRUNNER SCORE (identidade):", profile.identity.score, `[Geral ${profile.identity.geral}]`, profile.identity.calibrating ? "(calibrando)" : "");
console.log("FORMA ATUAL (90d):        ", profile.form?.score ?? "—", profile.form ? `[Geral ${profile.form.geral}]` : "");
console.log("Ritmo-base:", paceStr(profile.identity.bestPaceMinKm));
console.log("Atributos:");
for (const [k, v] of Object.entries(profile.identity.attributes)) {
  console.log(`   ${k.padEnd(13)} ${v ?? "—"}`);
}

const tl = identityTimeline(clean);
const maxJump = (get: (p: (typeof tl)[number]) => number) =>
  Math.max(...tl.slice(1).map((p, i) => Math.abs(get(p) - get(tl[i]!))));
console.log(`\nVolatilidade mensal — maior salto: cru ${maxJump((p) => p.raw)} pts | amortecido ${maxJump((p) => p.smoothed)} pts`);
console.log("=".repeat(56));
