import type { Activity, CleanResult, FlaggedActivity } from "./types.ts";

/** Ritmo (min/km) a partir do tempo em movimento. */
export function paceMinKm(a: Activity): number {
  return a.movingSec / 60 / a.distanceKm;
}

/**
 * Limiares de sanidade (v0.2). Provisórios — em produção alguns devem virar
 * robustos relativos ao histórico do próprio usuário, não fixos.
 */
export const CLEAN_THRESHOLDS = {
  /** ritmo mais rápido que isto (min/km) = glitch de GPS */
  glitchPaceMinKm: 3.75,
  /** ritmo mais lento que isto (min/km) = caminhada / run-walk */
  walkPaceMinKm: 10.5,
  /** distância maior que isto × a maior corrida (do resto) = atividade trocada */
  outlierDistanceFactor: 2.5,
} as const;

/**
 * Faxina de outliers antes do cálculo. Remove glitches de GPS, atividades
 * trocadas (distância fora do padrão) e caminhadas. Retorna o conjunto limpo
 * e a lista sinalizada (transparência: o usuário deve poder ver o que saiu).
 *
 * Duas passadas: 1) ritmo/curta (não contaminadas por distância); 2) distância,
 * avaliada SÓ sobre os sobreviventes — para um glitch não mascarar outro
 * (ex.: um "90 km" não pode esconder um "47 km" trocado).
 */
export function cleanActivities(activities: readonly Activity[]): CleanResult {
  const flagged: FlaggedActivity[] = [];

  // Passada 1: sanidade de ritmo/duração.
  const stage1: Activity[] = [];
  for (const a of activities) {
    if (a.distanceKm < 0.3 || a.movingSec < 60) {
      flagged.push({ activity: a, reason: "atividade curta/incompleta" });
      continue;
    }
    const pace = paceMinKm(a);
    if (pace < CLEAN_THRESHOLDS.glitchPaceMinKm) {
      flagged.push({ activity: a, reason: "glitch de GPS (ritmo impossível)" });
      continue;
    }
    if (pace > CLEAN_THRESHOLDS.walkPaceMinKm) {
      flagged.push({ activity: a, reason: "caminhada / run-walk" });
      continue;
    }
    stage1.push(a);
  }

  // Passada 2: distância fora do padrão, relativa ao restante dos sobreviventes.
  const sorted = stage1.map((a) => a.distanceKm).sort((a, b) => b - a);
  const globalMax = sorted[0] ?? 0;
  const secondMax = sorted[1] ?? 0;
  const factor = CLEAN_THRESHOLDS.outlierDistanceFactor;

  const clean: Activity[] = [];
  for (const a of stage1) {
    const maxOthers = a.distanceKm >= globalMax ? secondMax : globalMax;
    if (maxOthers > 0 && a.distanceKm > factor * maxOthers) {
      flagged.push({ activity: a, reason: "distância fora do padrão (atividade trocada?)" });
      continue;
    }
    clean.push(a);
  }

  clean.sort((x, y) => x.start.getTime() - y.start.getTime());
  return { clean, flagged };
}
