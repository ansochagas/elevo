import type { Activity, TrackSample } from "../src/types.ts";

export function run(opts: {
  id?: string;
  date: Date;
  km: number;
  paceMinKm: number;
  elevGainM?: number;
  series?: TrackSample[];
}): Activity {
  const movingSec = opts.paceMinKm * 60 * opts.km;
  return {
    id: opts.id ?? `r-${opts.date.getTime()}`,
    start: opts.date,
    distanceKm: opts.km,
    movingSec,
    elapsedSec: movingSec,
    elevGainM: opts.elevGainM ?? opts.km * 8,
    source: "manual",
    ...(opts.series ? { series: opts.series } : {}),
  };
}

/** Série uniforme de `km` a `paceMinKm` (finish ≈ 0). */
export function uniformSeries(km: number, paceMinKm: number, points = 50): TrackSample[] {
  const totalM = km * 1000;
  const totalS = paceMinKm * 60 * km;
  const out: TrackSample[] = [];
  for (let i = 0; i <= points; i++) {
    const f = i / points;
    out.push({ distM: totalM * f, sec: totalS * f, eleM: 10 });
  }
  return out;
}

/** GPX sintético: linha reta para o leste, espaçamento e passo de tempo fixos. */
export function makeGpx(points: number, spacingM = 10, stepS = 5): string {
  const dlon = spacingM / 111_320; // ~metros por grau no equador
  const t0 = new Date("2025-06-01T06:00:00Z").getTime();
  const trk: string[] = [];
  for (let i = 0; i < points; i++) {
    const lon = (i * dlon).toFixed(7);
    const time = new Date(t0 + i * stepS * 1000).toISOString();
    trk.push(`<trkpt lat="0.0000000" lon="${lon}"><ele>${10 + i * 0.1}</ele><time>${time}</time></trkpt>`);
  }
  return `<?xml version="1.0"?><gpx><trk><trkseg>${trk.join("")}</trkseg></trk></gpx>`;
}
