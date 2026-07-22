import { gunzipSync } from "node:zlib";
import { unzipSync } from "fflate";
import { and, eq } from "drizzle-orm";
import {
  parseGpx,
  parseFit,
  cleanActivities,
  finishSplit,
  buildProfile,
  SCORE_VERSION,
  type Activity,
} from "@elevo/engine";
import { db } from "./db";
import { activities, scoreSnapshots } from "./db/schema";

export interface IngestFile {
  name: string;
  bytes: Uint8Array;
}

export interface IngestResult {
  parsed: number;
  inserted: number;
  duplicates: number;
  skipped: string[];
  identityScore: number | null;
  calibrating: boolean;
}

/** Converte linha do banco em Activity do motor (sem série; finish pré-calculado). */
function rowToActivity(r: typeof activities.$inferSelect): Activity {
  return {
    id: r.id,
    start: r.start,
    distanceKm: r.distanceKm,
    movingSec: r.movingSec,
    elapsedSec: r.elapsedSec,
    elevGainM: r.elevGainM,
    source: (r.source as Activity["source"]) ?? "gpx",
    finishSplit: r.finishSplit,
  };
}

/** Recalcula a faxina + o perfil do usuário sobre TODO o histórico e grava snapshot. */
export async function recomputeUser(userId: string) {
  const rows = await db.select().from(activities).where(eq(activities.userId, userId));
  const all = rows.map(rowToActivity);
  const { clean, flagged } = cleanActivities(all);

  const flaggedById = new Map(flagged.map((f) => [f.activity.id, f.reason]));
  for (const r of rows) {
    const newReason = flaggedById.get(r.id) ?? null;
    if ((r.flaggedReason ?? null) !== newReason) {
      await db.update(activities).set({ flaggedReason: newReason }).where(eq(activities.id, r.id));
    }
  }

  const profile = buildProfile(clean);
  if (clean.length > 0) {
    await db.insert(scoreSnapshots).values({
      userId,
      identityScore: profile.identity.score,
      formScore: profile.form?.score ?? null,
      geral: profile.identity.geral,
      attributes: profile.identity.attributes,
      version: SCORE_VERSION,
    });
  }
  return profile;
}

/** Parseia arquivos (.gpx/.fit, já explodidos de zip/gz) e ingere para o usuário. */
export async function ingestFiles(userId: string, files: IngestFile[]): Promise<IngestResult> {
  const skipped: string[] = [];
  const parsed: Activity[] = [];

  for (const f of files) {
    let name = f.name.toLowerCase();
    let bytes = f.bytes;
    if (name.endsWith(".gz")) {
      try {
        bytes = gunzipSync(bytes);
        name = name.slice(0, -3);
      } catch {
        skipped.push(f.name);
        continue;
      }
    }
    let act: Activity | null = null;
    if (name.endsWith(".gpx")) {
      act = parseGpx(new TextDecoder().decode(bytes), { id: f.name, source: "gpx" });
    } else if (name.endsWith(".fit")) {
      act = await parseFit(bytes, { id: f.name, source: "fit" });
    } else {
      skipped.push(f.name);
      continue;
    }
    if (!act) {
      skipped.push(f.name);
      continue;
    }
    parsed.push({ ...act, finishSplit: finishSplit(act) });
  }

  let inserted = 0;
  for (const a of parsed) {
    const res = await db
      .insert(activities)
      .values({
        userId,
        start: a.start,
        distanceKm: a.distanceKm,
        movingSec: Math.round(a.movingSec),
        elapsedSec: Math.round(a.elapsedSec),
        elevGainM: a.elevGainM,
        source: a.source,
        finishSplit: a.finishSplit ?? null,
      })
      .onConflictDoNothing({ target: [activities.userId, activities.start] })
      .returning({ id: activities.id });
    if (res.length > 0) inserted++;
  }

  const profile = await recomputeUser(userId);
  return {
    parsed: parsed.length,
    inserted,
    duplicates: parsed.length - inserted,
    skipped,
    identityScore: profile.identity.activityCount > 0 ? profile.identity.score : null,
    calibrating: profile.identity.calibrating,
  };
}

/** Dev/servidor: explode um ZIP (ex.: export do Strava) em arquivos individuais. */
export function explodeZip(bytes: Uint8Array): IngestFile[] {
  const out: IngestFile[] = [];
  const entries = unzipSync(bytes, {
    filter: (f) => /\.(gpx|fit)(\.gz)?$/i.test(f.name),
  });
  for (const [name, data] of Object.entries(entries)) {
    out.push({ name, bytes: data });
  }
  return out;
}
