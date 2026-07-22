import type { Activity, ActivitySource, TrackSample } from "../types.ts";
import { haversineM } from "../geo.ts";

interface Tp {
  lat: number;
  lon: number;
  ele?: number;
  time: Date;
}

/** Extrai trackpoints de um GPX. Parser focado (sem dependência de XML externo). */
function extractTrackpoints(xml: string): Tp[] {
  const out: Tp[] = [];
  const re =
    /<trkpt\b[^>]*?\blat="([^"]+)"[^>]*?\blon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const latS = m[1];
    const lonS = m[2];
    const body = m[3] ?? "";
    if (!latS || !lonS) continue;
    const lat = parseFloat(latS);
    const lon = parseFloat(lonS);
    if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
    const timeM = /<time>([\s\S]*?)<\/time>/.exec(body);
    if (!timeM || !timeM[1]) continue;
    const time = new Date(timeM[1].trim());
    if (Number.isNaN(time.getTime())) continue;
    const tp: Tp = { lat, lon, time };
    const eleM = /<ele>([\s\S]*?)<\/ele>/.exec(body);
    if (eleM && eleM[1]) {
      const e = parseFloat(eleM[1]);
      if (!Number.isNaN(e)) tp.ele = e;
    }
    out.push(tp);
  }
  return out;
}

/** Velocidade mínima (m/s) para contar como "em movimento" (exclui paradas). */
const MOVING_SPEED_MIN = 0.4;

/**
 * Converte o conteúdo de um arquivo GPX numa `Activity` normalizada.
 * Retorna null se o arquivo não tiver pontos/tempo suficientes.
 */
export function parseGpx(
  content: string,
  opts: { id?: string; source?: ActivitySource } = {},
): Activity | null {
  const pts = extractTrackpoints(content);
  if (pts.length < 10) return null;

  const t0 = pts[0]!.time;
  const series: TrackSample[] = [];
  let cum = 0;
  let elevGain = 0;
  let movingSec = 0;
  let prev: Tp | null = null;

  for (const p of pts) {
    if (prev) {
      const seg = haversineM(prev.lat, prev.lon, p.lat, p.lon);
      cum += seg;
      const dt = (p.time.getTime() - prev.time.getTime()) / 1000;
      if (dt > 0 && seg / dt > MOVING_SPEED_MIN) movingSec += dt;
      if (prev.ele != null && p.ele != null) {
        const d = p.ele - prev.ele;
        if (d > 0) elevGain += d;
      }
    }
    series.push({
      distM: cum,
      sec: (p.time.getTime() - t0.getTime()) / 1000,
      ...(p.ele != null ? { eleM: p.ele } : {}),
    });
    prev = p;
  }

  const elapsedSec = (pts[pts.length - 1]!.time.getTime() - t0.getTime()) / 1000;
  const distanceKm = cum / 1000;
  if (distanceKm <= 0 || elapsedSec <= 0) return null;

  return {
    id: opts.id ?? `gpx-${t0.getTime()}`,
    start: t0,
    distanceKm,
    movingSec: movingSec > 0 ? movingSec : elapsedSec,
    elapsedSec,
    elevGainM: elevGain,
    source: opts.source ?? "gpx",
    series,
  };
}
