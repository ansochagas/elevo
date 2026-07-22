/** Tipos do motor analítico da Elevo. Fonte-agnósticos: parsers produzem `Activity`. */

export type ActivitySource = "gpx" | "fit" | "tcx" | "strava" | "garmin" | "manual";

/** Amostra da série interna de uma corrida (para pacing/finalização). */
export interface TrackSample {
  /** distância acumulada em metros */
  distM: number;
  /** segundos decorridos desde o início */
  sec: number;
  /** elevação em metros (opcional) */
  eleM?: number;
}

/** Atividade normalizada — a unidade de entrada do motor, venha de onde vier. */
export interface Activity {
  id: string;
  start: Date;
  distanceKm: number;
  movingSec: number;
  elapsedSec: number;
  elevGainM: number;
  source: ActivitySource;
  /** série cumulativa distância×tempo; opcional (necessária para Finalização) */
  series?: TrackSample[];
}

export type AttributeKey =
  | "ritmo"
  | "resistencia"
  | "regularidade"
  | "finalizacao"
  | "subida"
  | "evolucao";

/** Atributos 0-99. `null` = sem dado suficiente (excluído do peso). */
export type Attributes = Record<AttributeKey, number | null>;

export interface ScoreResult {
  /** Runner Score 0-990 (Geral × 10). */
  score: number;
  /** Geral 0-99. */
  geral: number;
  attributes: Attributes;
  bestPaceMinKm: number | null;
  /** true quando há poucos dados — exibir "calibrando" em vez do número. */
  calibrating: boolean;
  activityCount: number;
  version: string;
}

/** Perfil de duas camadas: identidade estável + forma responsiva. */
export interface RunnerProfile {
  /** identidade / carreira (histórico inteiro). */
  identity: ScoreResult;
  /** forma atual (janela recente); null se poucos dados na janela. */
  form: ScoreResult | null;
}

export interface FlaggedActivity {
  activity: Activity;
  reason: string;
}

export interface CleanResult {
  clean: Activity[];
  flagged: FlaggedActivity[];
}
