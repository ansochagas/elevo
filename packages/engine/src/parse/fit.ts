import type { Activity, ActivitySource, TrackSample } from "../types.ts";

/**
 * Parser de arquivos FIT (formato binário de Garmin/Coros/Wahoo etc.) usando o
 * SDK oficial da Garmin. Constrói a `Activity` a partir das record messages
 * (timestamp + distância cumulativa + altitude).
 *
 * Nota: validado com a suíte contra GPX; a validação com FITs reais acontece
 * no piloto (não havia FIT no export de estudo).
 */
export async function parseFit(
  bytes: Uint8Array,
  opts: { id?: string; source?: ActivitySource } = {},
): Promise<Activity | null> {
  let Decoder: any;
  let Stream: any;
  try {
    const sdk = await import("@garmin/fitsdk");
    Decoder = sdk.Decoder;
    Stream = sdk.Stream;
  } catch {
    return null;
  }

  try {
    const stream = Stream.fromByteArray(Array.from(bytes));
    const decoder = new Decoder(stream);
    if (!decoder.isFIT() || !decoder.checkIntegrity()) return null;
    const { messages } = decoder.read({ applyScaleAndOffset: true, mergeHeartRates: true });
    const records: any[] = messages?.recordMesgs ?? [];
    if (records.length < 10) return null;

    const pts = records
      .filter((r) => r.timestamp != null)
      .map((r) => ({
        t: new Date(r.timestamp).getTime(),
        dist: typeof r.distance === "number" ? r.distance : null, // metros cumulativos
        alt: typeof r.enhancedAltitude === "number" ? r.enhancedAltitude
          : typeof r.altitude === "number" ? r.altitude : null,
      }))
      .sort((a, b) => a.t - b.t);
    if (pts.length < 10) return null;

    const t0 = pts[0]!.t;
    const series: TrackSample[] = [];
    let lastDist = 0;
    let movingSec = 0;
    let elevGain = 0;
    let prev: (typeof pts)[number] | null = null;

    for (const p of pts) {
      const dist = p.dist ?? lastDist;
      if (prev) {
        const dt = (p.t - prev.t) / 1000;
        const dd = dist - lastDist;
        if (dt > 0 && dd / dt > 0.4) movingSec += dt;
        if (prev.alt != null && p.alt != null && p.alt > prev.alt) elevGain += p.alt - prev.alt;
      }
      series.push({ distM: dist, sec: (p.t - t0) / 1000, ...(p.alt != null ? { eleM: p.alt } : {}) });
      lastDist = dist;
      prev = p;
    }

    const elapsedSec = (pts[pts.length - 1]!.t - t0) / 1000;
    const distanceKm = lastDist / 1000;
    if (distanceKm <= 0 || elapsedSec <= 0) return null;

    return {
      id: opts.id ?? `fit-${t0}`,
      start: new Date(t0),
      distanceKm,
      movingSec: movingSec > 0 ? movingSec : elapsedSec,
      elapsedSec,
      elevGainM: elevGain,
      source: opts.source ?? "fit",
      series,
    };
  } catch {
    return null;
  }
}
