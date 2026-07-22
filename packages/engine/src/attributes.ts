import type { Activity, Attributes } from "./types.ts";
import { paceMinKm } from "./clean.ts";
import { lerp, mean, median, percentile, pstdev, clampScore } from "./math.ts";

const DAY = 86_400_000;
const daysBetween = (a: Date, b: Date) => (b.getTime() - a.getTime()) / DAY;

/**
 * Âncoras de referência (v0.2). PROVISÓRIAS — calibração real exige base de
 * vários corredores. A interpolação é robusta à ordem (ver math.lerp).
 */
export const ANCHORS = {
  /** ritmo: segundos/km → score (menor = melhor) */
  ritmo: [[480, 20], [420, 38], [360, 55], [330, 66], [300, 74], [270, 84], [240, 92], [229.8, 96]],
  /** corrida mais longa (km) → score */
  longest: [[3, 30], [5, 42], [8, 55], [10, 63], [15, 76], [21.1, 88], [30, 96]],
  /** volume semanal (km) → score */
  volume: [[5, 30], [10, 42], [20, 58], [30, 72], [40, 82], [60, 92]],
  /** frequência (corridas/semana) → score */
  freq: [[0.5, 25], [1, 42], [1.5, 54], [2, 64], [3, 77], [4, 86], [5, 92]],
  /** negative split (fração; positivo = terminou mais rápido) → score */
  finish: [[-0.15, 30], [-0.08, 42], [-0.03, 50], [0, 56], [0.05, 70], [0.1, 82], [0.15, 90]],
  /** ganho de elevação por km (m) → score */
  climb: [[2, 30], [5, 42], [8, 55], [12, 66], [18, 78], [25, 88]],
  /** tendência de ritmo em 90 dias (min/km; negativo = melhorando) → score */
  evolution: [[0.6, 25], [0.3, 38], [0.1, 48], [0, 52], [-0.1, 60], [-0.3, 74], [-0.6, 88]],
} as const;

/** Melhor esforço sustentado: percentil rápido entre corridas ≥ 2 km (não a média). */
export function bestSustainedPace(clean: readonly Activity[]): number | null {
  const elig = clean.filter((a) => a.distanceKm >= 2).map(paceMinKm);
  if (elig.length > 0) return percentile(elig, 0.15);
  const all = clean.map(paceMinKm);
  return all.length ? median(all) : null;
}

/**
 * Finalização de uma corrida: (ritmo 1ª metade − ritmo 2ª metade) / ritmo 1ª metade.
 * Positivo = terminou mais rápido (negative split). Requer série interna.
 */
export function finishSplit(a: Activity): number | null {
  const s = a.series;
  if (!s || s.length < 2) return null;
  const last = s[s.length - 1]!;
  const totalD = last.distM;
  const totalT = last.sec;
  if (totalD < 2000 || totalT < 300) return null;
  const half = totalD / 2;
  let tm: number | null = null;
  for (let i = 0; i < s.length - 1; i++) {
    const p0 = s[i]!;
    const p1 = s[i + 1]!;
    if (p0.distM <= half && half <= p1.distM) {
      tm = p1.distM > p0.distM
        ? p0.sec + ((half - p0.distM) / (p1.distM - p0.distM)) * (p1.sec - p0.sec)
        : p0.sec;
      break;
    }
  }
  if (tm === null || tm <= 0 || tm >= totalT) return null;
  const dHalfKm = half / 1000;
  const pace1 = tm / 60 / dHalfKm;
  const pace2 = (totalT - tm) / 60 / dHalfKm;
  if (pace1 <= 0) return null;
  return (pace1 - pace2) / pace1;
}

export interface AttributeResult {
  attributes: Attributes;
  bestPaceMinKm: number | null;
  finishCoverage: number;
}

/**
 * Calcula os 6 atributos (0-99). Frequência/volume usam a janela `windowDays`
 * mais recente; ritmo/resistência/finalização/subida/evolução usam todo o
 * conjunto `clean` passado.
 */
export function computeAttributes(
  clean: readonly Activity[],
  windowDays = 56,
): AttributeResult {
  const empty: Attributes = {
    ritmo: null, resistencia: null, regularidade: null,
    finalizacao: null, subida: null, evolucao: null,
  };
  if (clean.length === 0) return { attributes: empty, bestPaceMinKm: null, finishCoverage: 0 };

  const refDate = clean[clean.length - 1]!.start;
  const recent = clean.filter((a) => {
    const d = daysBetween(a.start, refDate);
    return d >= 0 && d <= windowDays;
  });
  const weeks = windowDays / 7;
  const freqPerWeek = recent.length / weeks;
  const weeklyVolume = recent.reduce((s, a) => s + a.distanceKm, 0) / weeks;

  // ritmo
  const best = bestSustainedPace(clean);
  const ritmo = best === null ? null : lerp(best * 60, ANCHORS.ritmo);

  // resistência
  const longest = Math.max(...clean.map((a) => a.distanceKm));
  const resistencia = 0.6 * lerp(longest, ANCHORS.longest) + 0.4 * lerp(weeklyVolume, ANCHORS.volume);

  // regularidade
  let regularidade = lerp(freqPerWeek, ANCHORS.freq);
  if (recent.length >= 3) {
    const gaps: number[] = [];
    for (let i = 0; i < recent.length - 1; i++) {
      gaps.push(daysBetween(recent[i]!.start, recent[i + 1]!.start));
    }
    const m = mean(gaps);
    const cv = m > 0 ? pstdev(gaps) / m : 0;
    regularidade *= Math.max(0.8, 1 - 0.15 * cv);
  }

  // finalização
  const fs = clean.map(finishSplit).filter((x): x is number => x !== null);
  const finalizacao = fs.length ? lerp(median(fs), ANCHORS.finish) : null;

  // subida
  const perKm = clean.filter((a) => a.distanceKm > 0.5).map((a) => a.elevGainM / a.distanceKm);
  const subida = perKm.length ? lerp(mean(perKm), ANCHORS.climb) : null;

  // evolução
  let evolucao: number | null;
  if (clean.length < 6) {
    evolucao = 50;
  } else {
    const t0 = clean[0]!.start;
    const xs = clean.map((a) => daysBetween(t0, a.start));
    const ys = clean.map(paceMinKm);
    const mx = mean(xs);
    const my = mean(ys);
    let num = 0;
    let den = 0;
    for (let i = 0; i < xs.length; i++) {
      num += (xs[i]! - mx) * (ys[i]! - my);
      den += (xs[i]! - mx) ** 2;
    }
    const slope = den === 0 ? 0 : num / den;
    evolucao = lerp(slope * 90, ANCHORS.evolution);
  }

  const round = (v: number | null) => (v === null ? null : clampScore(v));
  return {
    attributes: {
      ritmo: round(ritmo),
      resistencia: round(resistencia),
      regularidade: round(regularidade),
      finalizacao: round(finalizacao),
      subida: round(subida),
      evolucao: round(evolucao),
    },
    bestPaceMinKm: best,
    finishCoverage: fs.length,
  };
}
