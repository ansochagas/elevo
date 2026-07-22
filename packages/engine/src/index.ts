/**
 * @elevo/engine — motor analítico da Elevo.
 * Pipeline: parse (GPX/…) → normaliza → faxina → atributos → Runner Score.
 * Funções puras e determinísticas. Independente da interface.
 */

export type {
  Activity,
  ActivitySource,
  TrackSample,
  AttributeKey,
  Attributes,
  ScoreResult,
  RunnerProfile,
  FlaggedActivity,
  CleanResult,
} from "./types.ts";

export { parseGpx } from "./parse/gpx.ts";
export { parseFit } from "./parse/fit.ts";
export { cleanActivities, paceMinKm, CLEAN_THRESHOLDS } from "./clean.ts";
export {
  computeAttributes,
  bestSustainedPace,
  finishSplit,
  ANCHORS,
  type AttributeResult,
} from "./attributes.ts";
export {
  buildScore,
  buildProfile,
  computeGeral,
  identityTimeline,
  WEIGHTS,
  SCORE_VERSION,
  CALIBRATION_MIN_ACTIVITIES,
  type TimelinePoint,
} from "./score.ts";
export {
  computeMetrics,
  predictRaces,
  explainAttributes,
  attributeTier,
  focusArea,
  attributeChanges,
  type RunnerMetrics,
  type PersonalRecord,
  type MonthBucket,
  type FocusArea,
  type AttrChange,
} from "./metrics.ts";
export { lerp, median, mean, percentile, clampScore, type Anchor } from "./math.ts";
export { haversineM } from "./geo.ts";
