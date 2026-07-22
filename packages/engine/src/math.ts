/** Utilitários numéricos puros. */

export type Anchor = readonly [x: number, score: number];

/**
 * Interpolação linear por âncoras.
 * IMPORTANTE: robusta à ordem das âncoras (lição do estudo — âncoras em ordem
 * decrescente alimentando um interpolador que esperava crescente travavam o
 * atributo no valor mínimo).
 */
export function lerp(x: number, anchors: readonly Anchor[]): number {
  if (anchors.length === 0) throw new Error("lerp: sem âncoras");
  const pts = [...anchors].sort((a, b) => a[0] - b[0]);
  const first = pts[0]!;
  const last = pts[pts.length - 1]!;
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]!;
    const [x1, y1] = pts[i + 1]!;
    if (x0 <= x && x <= x1) {
      const t = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

export function mean(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function median(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/** Percentil por interpolação linear. q ∈ [0,1]. */
export function percentile(xs: readonly number[], q: number): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const i = q * (s.length - 1);
  const lo = Math.floor(i);
  const hi = Math.min(lo + 1, s.length - 1);
  return s[lo]! + (i - lo) * (s[hi]! - s[lo]!);
}

/** Desvio-padrão populacional. */
export function pstdev(xs: readonly number[]): number {
  if (xs.length === 0) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

/** Arredonda e limita ao intervalo de score de atributo. */
export function clampScore(x: number, lo = 1, hi = 99): number {
  return Math.max(lo, Math.min(hi, Math.round(x)));
}
