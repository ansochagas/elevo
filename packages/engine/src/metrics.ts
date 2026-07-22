import type { Activity, AttributeKey } from "./types.ts";
import { paceMinKm } from "./clean.ts";
import { median, percentile } from "./math.ts";
import { bestSustainedPace } from "./attributes.ts";

const DAY = 86_400_000;
const daysBetween = (a: Date, b: Date) => (b.getTime() - a.getTime()) / DAY;

export interface PersonalRecord {
  /** rótulo da faixa: "5 km", "10 km", "Mais longa" */
  label: string;
  paceMinKm?: number;
  distanceKm?: number;
  /** tempo total em segundos, quando aplicável */
  timeSec?: number;
  date: Date;
}

export interface MonthBucket {
  year: number;
  month: number; // 1-12
  runs: number;
  km: number;
}

export interface RunnerMetrics {
  totalKm: number;
  totalRuns: number;
  longestKm: number;
  /** volume dos últimos 7 e 30 dias */
  km7d: number;
  km30d: number;
  runs30d: number;
  /** mês corrente vs mês anterior (km) */
  kmThisMonth: number;
  kmLastMonth: number;
  /** sequência atual de semanas consecutivas com ≥1 corrida */
  activeWeekStreak: number;
  /** dias desde a última corrida (null se nenhuma) */
  daysSinceLast: number | null;
  bestPaceMinKm: number | null;
  avgPaceMinKm: number | null;
  records: PersonalRecord[];
  monthly: MonthBucket[];
}

/** Início da semana (segunda) para agrupar streak semanal. */
function weekKey(d: Date): number {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (t.getUTCDay() + 6) % 7; // 0 = segunda
  t.setUTCDate(t.getUTCDate() - dow);
  return t.getTime();
}

/**
 * Melhor ritmo entre corridas com distância ≥ minKm (recorde por faixa).
 * `floorPace` descarta candidatos rápidos demais para serem reais (glitch de
 * GPS que passou pela faxina) — mantém o recorde ancorado no esforço plausível.
 */
function bestPaceAtLeast(clean: readonly Activity[], minKm: number, floorPace: number): Activity | null {
  const elig = clean.filter((a) => a.distanceKm >= minKm && paceMinKm(a) >= floorPace);
  if (elig.length === 0) return null;
  return elig.reduce((best, a) => (paceMinKm(a) < paceMinKm(best) ? a : best));
}

/**
 * Métricas de exibição para o atleta — todas computáveis só com GPS+tempo+elevação.
 * Espera atividades JÁ LIMPAS (pós-faxina), ordenadas ou não.
 */
export function computeMetrics(clean: readonly Activity[], now: Date): RunnerMetrics {
  const empty: RunnerMetrics = {
    totalKm: 0, totalRuns: 0, longestKm: 0, km7d: 0, km30d: 0, runs30d: 0,
    kmThisMonth: 0, kmLastMonth: 0, activeWeekStreak: 0, daysSinceLast: null,
    bestPaceMinKm: null, avgPaceMinKm: null, records: [], monthly: [],
  };
  if (clean.length === 0) return empty;

  const runs = [...clean].sort((a, b) => a.start.getTime() - b.start.getTime());
  const totalKm = runs.reduce((s, a) => s + a.distanceKm, 0);
  const longest = runs.reduce((m, a) => Math.max(m, a.distanceKm), 0);
  const last = runs[runs.length - 1]!;

  const within = (days: number) => runs.filter((a) => daysBetween(a.start, now) <= days && a.start <= now);
  const r7 = within(7);
  const r30 = within(30);

  // mês corrente vs anterior
  const y = now.getFullYear();
  const m = now.getMonth();
  const lm = m === 0 ? 11 : m - 1;
  const lmY = m === 0 ? y - 1 : y;
  const kmIn = (yy: number, mm: number) =>
    runs.filter((a) => a.start.getFullYear() === yy && a.start.getMonth() === mm).reduce((s, a) => s + a.distanceKm, 0);

  // streak de semanas ativas (consecutivas, terminando na semana de `now`)
  const activeWeeks = new Set(runs.map((a) => weekKey(a.start)));
  let streak = 0;
  let cursor = weekKey(now);
  // se a semana atual não tem corrida ainda, começa a contar da anterior
  if (!activeWeeks.has(cursor)) cursor -= 7 * DAY;
  while (activeWeeks.has(cursor)) {
    streak++;
    cursor -= 7 * DAY;
  }

  // recordes — piso de ritmo derivado do esforço sustentável (10% além do p15)
  // remove corridas rápidas demais para serem reais sem descartar PRs legítimos.
  const sustained = bestSustainedPace(runs);
  const floorPace = sustained !== null ? sustained * 0.9 : 0;
  const records: PersonalRecord[] = [];
  for (const [label, minKm] of [["5 km", 5] as const, ["10 km", 10] as const]) {
    const a = bestPaceAtLeast(runs, minKm, floorPace);
    if (a) records.push({ label, paceMinKm: paceMinKm(a), date: a.start });
  }
  const longestAct = runs.reduce((m2, a) => (a.distanceKm > m2.distanceKm ? a : m2));
  records.push({ label: "Mais longa", distanceKm: longestAct.distanceKm, date: longestAct.start });

  // buckets mensais (últimos 12 meses)
  const monthMap = new Map<string, MonthBucket>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(y, m - i, 1);
    monthMap.set(`${d.getFullYear()}-${d.getMonth()}`, { year: d.getFullYear(), month: d.getMonth() + 1, runs: 0, km: 0 });
  }
  for (const a of runs) {
    const k = `${a.start.getFullYear()}-${a.start.getMonth()}`;
    const b = monthMap.get(k);
    if (b) { b.runs++; b.km += a.distanceKm; }
  }

  const paces = runs.map(paceMinKm);
  return {
    totalKm,
    totalRuns: runs.length,
    longestKm: longest,
    km7d: r7.reduce((s, a) => s + a.distanceKm, 0),
    km30d: r30.reduce((s, a) => s + a.distanceKm, 0),
    runs30d: r30.length,
    kmThisMonth: kmIn(y, m),
    kmLastMonth: kmIn(lmY, lm),
    activeWeekStreak: streak,
    daysSinceLast: Math.floor(daysBetween(last.start, now)),
    bestPaceMinKm: bestSustainedPace(runs),
    avgPaceMinKm: paces.length ? median(paces) : null,
    records,
    monthly: [...monthMap.values()],
  };
}

/**
 * Previsão de tempo de prova pela fórmula de Riegel (1977): T2 = T1·(D2/D1)^1.06.
 * Usa o melhor esforço sustentado como âncora. É estimativa (~80%), rotular como tal.
 */
export function predictRaces(bestPaceMinKm: number | null): { label: string; distanceKm: number; timeSec: number }[] {
  if (bestPaceMinKm === null) return [];
  // âncora: assume o melhor pace sustentável ~ esforço de 5 km
  const anchorD = 5;
  const anchorT = bestPaceMinKm * 60 * anchorD; // segundos para 5 km
  const targets: [string, number][] = [["5 km", 5], ["10 km", 10], ["21 km", 21.0975]];
  return targets.map(([label, d]) => ({
    label,
    distanceKm: d,
    timeSec: Math.round(anchorT * Math.pow(d / anchorD, 1.06)),
  }));
}

export interface AttributeExplanation {
  key: string;
  text: string;
}

/**
 * Explica CADA atributo com o número-base real — o diferencial "caixa-branca"
 * vs. a caixa-preta do Strava.
 */
export function explainAttributes(clean: readonly Activity[], now: Date): Record<string, string> {
  const out: Record<string, string> = {};
  if (clean.length === 0) return out;
  const runs = [...clean];
  const m = computeMetrics(runs, now);

  const fmtPace = (p: number | null) => {
    if (p === null) return "—";
    const mm = Math.floor(p);
    const ss = Math.round((p - mm) * 60);
    return `${mm}:${String(ss === 60 ? 0 : ss).padStart(2, "0")}/km`;
  };

  // Ritmo — melhor esforço sustentado
  out.ritmo = `Seu melhor esforço sustentado é ${fmtPace(m.bestPaceMinKm)}.`;

  // Resistência — corrida mais longa + volume
  const volWk = (m.km30d / 30) * 7;
  out.resistencia = `Sua corrida mais longa foi ${m.longestKm.toFixed(1).replace(".", ",")} km e você faz cerca de ${volWk.toFixed(0)} km por semana.`;

  // Regularidade — frequência recente
  const freqWk = (m.runs30d / 30) * 7;
  out.regularidade = `Você correu cerca de ${freqWk.toFixed(1).replace(".", ",")} vez(es) por semana no último mês.`;

  // Finalização — % de corridas com negative split
  const withSplit = runs.filter((a) => a.finishSplit != null);
  if (withSplit.length > 0) {
    const strong = withSplit.filter((a) => (a.finishSplit ?? 0) > 0.02).length;
    const pct = Math.round((strong / withSplit.length) * 100);
    out.finalizacao = `Você terminou mais rápido do que começou em ${pct}% das suas corridas.`;
  } else {
    out.finalizacao = "Precisamos de mais corridas com dados de percurso para medir sua finalização.";
  }

  // Subida — ganho de elevação por km
  const perKm = runs.filter((a) => a.distanceKm > 0.5).map((a) => a.elevGainM / a.distanceKm);
  const epk = perKm.length ? perKm.reduce((s, x) => s + x, 0) / perKm.length : 0;
  out.subida = `Seus percursos sobem em média ${epk.toFixed(0)} m por km.`;

  // Evolução — comparação recente vs. base
  out.evolucao = m.kmLastMonth > 0
    ? `Seu volume passou de ${m.kmLastMonth.toFixed(0)} km no mês passado para ${m.kmThisMonth.toFixed(0)} km neste mês.`
    : "Sua evolução aparece quando você acumular alguns meses de corridas.";

  return out;
}

export interface WeekVolume {
  /** segunda-feira (UTC) que abre a semana, em ms */
  weekStartMs: number;
  km: number;
  runs: number;
  /** atletas distintos que correram na semana */
  runners: number;
}

/**
 * Volume semanal AGREGADO da turma nas últimas `weeks` semanas (mais antiga → atual).
 * Trabalha sobre atividades já limpas de vários atletas (cada uma com userId).
 * Usa a mesma fronteira de semana (segunda, UTC) do streak individual.
 */
export function teamWeeklyVolume(
  acts: readonly { start: Date; distanceKm: number; userId: string }[],
  now: Date,
  weeks = 8,
): WeekVolume[] {
  const nowWeek = weekKey(now);
  const buckets = new Map<number, { km: number; runs: number; users: Set<string> }>();
  for (let i = weeks - 1; i >= 0; i--) {
    buckets.set(nowWeek - i * 7 * DAY, { km: 0, runs: 0, users: new Set<string>() });
  }
  for (const a of acts) {
    const b = buckets.get(weekKey(a.start));
    if (b) {
      b.km += a.distanceKm;
      b.runs++;
      b.users.add(a.userId);
    }
  }
  return [...buckets.entries()]
    .sort((x, y) => x[0] - y[0])
    .map(([weekStartMs, b]) => ({ weekStartMs, km: b.km, runs: b.runs, runners: b.users.size }));
}

const LEVEL_TIERS = ["Bronze", "Prata", "Ouro", "Platina", "Diamante"] as const;
const DIVISION_ROMAN = ["I", "II", "III"] as const;

export interface RunnerLevel {
  tier: string;
  division: number; // 1-3 (I..III dentro da faixa)
  label: string; // ex.: "Ouro II"
}

/**
 * Nível/patente derivado do Runner Score de identidade (0-990 = geral×10).
 * 5 faixas × 3 divisões, escada motivacional — calibrável quando houver base
 * de vários corredores. Determinístico.
 */
export function runnerLevel(identityScore: number): RunnerLevel {
  const g = Math.max(0, Math.min(99.999, identityScore / 10)); // 0-99 (=geral)
  const span = 100 / LEVEL_TIERS.length; // 20 por faixa
  const ti = Math.min(LEVEL_TIERS.length - 1, Math.floor(g / span));
  const within = g - ti * span; // 0..20
  const division = Math.min(3, Math.floor((within / span) * 3) + 1); // 1..3
  const tier = LEVEL_TIERS[ti]!;
  return { tier, division, label: `${tier} ${DIVISION_ROMAN[division - 1]}` };
}

/** Nome de arquétipo por atributo dominante (evolução é meta, não conta). */
const ARCHETYPE_NAME: Record<Exclude<AttributeKey, "evolucao">, string> = {
  ritmo: "Velocista",
  resistencia: "Fundista",
  regularidade: "Constante",
  finalizacao: "Finalizador",
  subida: "Escalador",
};

/**
 * Arquétipo = o atributo em que o corredor mais se destaca no PRÓPRIO perfil.
 * Se nenhum se sobressai (perfil equilibrado), "Completo". Null se dados de
 * menos. Empate resolvido pela ordem estável das chaves.
 */
export function runnerArchetype(attrs: Partial<Record<AttributeKey, number | null>>): string | null {
  const keys: Exclude<AttributeKey, "evolucao">[] = ["ritmo", "resistencia", "regularidade", "finalizacao", "subida"];
  const avail = keys.filter((k) => typeof attrs[k] === "number");
  if (avail.length < 3) return null;
  const vals = avail.map((k) => attrs[k] as number);
  const mean = vals.reduce((s, x) => s + x, 0) / vals.length;
  const topKey = avail.reduce((hi, k) => ((attrs[k] as number) > (attrs[hi] as number) ? k : hi));
  const top = attrs[topKey] as number;
  if (top - mean < 8) return "Completo";
  return ARCHETYPE_NAME[topKey];
}

/** Faixa qualitativa de um atributo 0-100 (dá significado à nota). */
export function attributeTier(score: number): string {
  if (score >= 83) return "Avançado";
  if (score >= 70) return "Forte";
  if (score >= 55) return "Bom";
  if (score >= 40) return "Em desenvolvimento";
  return "Iniciante";
}

/** Direção SEGURA e genérica por atributo — nunca prescrição (ritmo/volume). */
const FOCUS_HINT: Record<AttributeKey, string> = {
  ritmo: "Seu ritmo é onde há mais espaço para ganhar velocidade.",
  resistencia: "Aumentar aos poucos a distância dos treinos longos costuma elevar a resistência.",
  regularidade: "Constância é o que mais destrava tudo — correr com mais frequência puxa os outros atributos junto.",
  finalizacao: "Terminar as corridas mais forte do que começou é um hábito treinável.",
  subida: "Incluir percursos com mais subida fortalece esse ponto.",
  evolucao: "Manter a constância das últimas semanas sustenta sua evolução.",
};

export interface FocusArea {
  key: AttributeKey;
  score: number;
  tier: string;
  hint: string;
}

/** Atributo mais fraco (exceto Evolução, que é meta) = foco sugerido. */
export function focusArea(attrs: Partial<Record<AttributeKey, number | null>>): FocusArea | null {
  const keys: AttributeKey[] = ["ritmo", "resistencia", "regularidade", "finalizacao", "subida"];
  const avail = keys.filter((k) => typeof attrs[k] === "number");
  if (avail.length === 0) return null;
  const key = avail.reduce((lo, k) => ((attrs[k] as number) < (attrs[lo] as number) ? k : lo));
  const score = attrs[key] as number;
  return { key, score, tier: attributeTier(score), hint: FOCUS_HINT[key] };
}

export interface AttrChange {
  key: AttributeKey;
  from: number;
  to: number;
  delta: number;
}

/** Compara dois conjuntos de atributos (snapshot atual vs. anterior). */
export function attributeChanges(
  latest: Partial<Record<AttributeKey, number | null>>,
  prev: Partial<Record<AttributeKey, number | null>> | null,
): { improved: AttrChange[]; declined: AttrChange[] } {
  const improved: AttrChange[] = [];
  const declined: AttrChange[] = [];
  if (!prev) return { improved, declined };
  const keys: AttributeKey[] = ["ritmo", "resistencia", "regularidade", "finalizacao", "subida", "evolucao"];
  for (const k of keys) {
    const to = latest[k];
    const from = prev[k];
    if (typeof to !== "number" || typeof from !== "number") continue;
    const delta = to - from;
    if (delta > 0) improved.push({ key: k, from, to, delta });
    else if (delta < 0) declined.push({ key: k, from, to, delta });
  }
  improved.sort((a, b) => b.delta - a.delta);
  declined.sort((a, b) => a.delta - b.delta);
  return { improved, declined };
}
