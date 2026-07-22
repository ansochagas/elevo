import type { Activity, AttributeKey, Attributes, RunnerProfile, ScoreResult } from "./types.ts";
import { computeAttributes } from "./attributes.ts";
import { clampScore } from "./math.ts";

export const SCORE_VERSION = "v0.2";

/** Pesos do Geral (v0.2). Renormalizados quando um atributo está ausente. */
export const WEIGHTS: Record<AttributeKey, number> = {
  ritmo: 0.2,
  resistencia: 0.2,
  regularidade: 0.22,
  finalizacao: 0.1,
  subida: 0.08,
  evolucao: 0.2,
};

/** Abaixo disto, exibir "calibrando" em vez do número. */
export const CALIBRATION_MIN_ACTIVITIES = 8;

const DAY = 86_400_000;

/** Geral (0-99) = média ponderada dos atributos disponíveis (renormaliza nulos). */
export function computeGeral(attrs: Attributes): number {
  let sum = 0;
  let wsum = 0;
  for (const key of Object.keys(WEIGHTS) as AttributeKey[]) {
    const v = attrs[key];
    if (v === null) continue;
    sum += v * WEIGHTS[key];
    wsum += WEIGHTS[key];
  }
  if (wsum === 0) return 0;
  return clampScore(sum / wsum);
}

/** Calcula um ScoreResult para um conjunto de atividades já limpas. */
export function buildScore(clean: readonly Activity[], windowDays = 56): ScoreResult {
  const base = {
    version: SCORE_VERSION,
    activityCount: clean.length,
    calibrating: clean.length < CALIBRATION_MIN_ACTIVITIES,
  };
  if (clean.length === 0) {
    return {
      ...base,
      score: 0,
      geral: 0,
      bestPaceMinKm: null,
      attributes: { ritmo: null, resistencia: null, regularidade: null, finalizacao: null, subida: null, evolucao: null },
    };
  }
  const { attributes, bestPaceMinKm } = computeAttributes(clean, windowDays);
  const geral = computeGeral(attributes);
  return { ...base, attributes, bestPaceMinKm, geral, score: Math.round(geral * 10) };
}

/**
 * Perfil de duas camadas: identidade (carreira inteira, estável por construção)
 * e forma atual (janela recente, responsiva).
 */
export function buildProfile(
  clean: readonly Activity[],
  opts: { formWindowDays?: number } = {},
): RunnerProfile {
  const formWindow = opts.formWindowDays ?? 90;
  const identity = buildScore(clean);
  let form: ScoreResult | null = null;
  if (clean.length > 0) {
    const ref = clean[clean.length - 1]!.start;
    const recent = clean.filter((a) => (ref.getTime() - a.start.getTime()) / DAY <= formWindow);
    if (recent.length >= 3) form = buildScore(recent);
  }
  return { identity, form };
}

export interface TimelinePoint {
  year: number;
  month: number;
  raw: number;
  smoothed: number;
  activityCount: number;
}

/**
 * Trajetória mensal do Runner Score, com amortecimento (EMA) — é ESTA linha
 * suavizada que a interface mostra ao longo do tempo, nunca a crua.
 */
export function identityTimeline(clean: readonly Activity[], alpha = 0.35): TimelinePoint[] {
  if (clean.length === 0) return [];
  const monthsSet = new Set<string>();
  for (const a of clean) monthsSet.add(`${a.start.getFullYear()}-${a.start.getMonth()}`);
  const months = [...monthsSet]
    .map((k) => k.split("-").map(Number) as [number, number])
    .sort((x, y) => x[0] - y[0] || x[1] - y[1]);

  const out: TimelinePoint[] = [];
  let ema: number | null = null;
  for (const [year, monthIdx] of months) {
    const cutoff = new Date(year, monthIdx + 1, 1).getTime();
    const hist = clean.filter((a) => a.start.getTime() < cutoff);
    if (hist.length < 3) continue;
    const raw = buildScore(hist).score;
    ema = ema === null ? raw : Math.round(alpha * raw + (1 - alpha) * ema);
    out.push({ year, month: monthIdx + 1, raw, smoothed: ema, activityCount: hist.length });
  }
  return out;
}
