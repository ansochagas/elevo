import { desc, eq, inArray } from "drizzle-orm";
import { identityTimeline, type Activity } from "@elevo/engine";
import { db } from "./db";
import { activities, assessorias, athleteProfiles, scoreSnapshots, users } from "./db/schema";
import type { AthleteStatus } from "./types";

const DAY = 86_400_000;

export interface RealAthlete {
  userId: string;
  name: string;
  initials: string;
  phone: string | null;
  level: string | null;
  archetype: string | null;
  invitePending: boolean;
  inviteToken: string | null;
  consentAt: Date | null;
  identityScore: number | null;
  formScore: number | null;
  geral: number | null;
  attributes: Record<string, number | null> | null;
  delta: number | null;
  lastRunAt: Date | null;
  lastRunKm: number | null;
  cleanCount: number;
  calibrating: boolean;
  status: AthleteStatus | "sem-dados";
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

function statusOf(a: {
  lastRunAt: Date | null;
  delta: number | null;
  identityScore: number | null;
}): AthleteStatus | "sem-dados" {
  if (!a.lastRunAt || a.identityScore === null) return "sem-dados";
  const days = (Date.now() - a.lastRunAt.getTime()) / DAY;
  if (days > 10) return "sumido";
  if (a.delta !== null && a.delta < 0) return "atencao";
  if (a.delta !== null && a.delta > 0) return "evoluindo";
  return "estavel";
}

/** Assessoria do treinador logado (ou null). */
export async function getAssessoriaOf(coachUserId: string) {
  const rows = await db
    .select()
    .from(assessorias)
    .where(eq(assessorias.ownerId, coachUserId))
    .limit(1);
  return rows[0] ?? null;
}

/** Todos os atletas da assessoria, com snapshot mais recente e última corrida. */
export async function getAthletesOf(assessoriaId: string): Promise<RealAthlete[]> {
  const profs = await db
    .select({
      userId: athleteProfiles.userId,
      level: athleteProfiles.level,
      archetype: athleteProfiles.archetype,
      inviteToken: athleteProfiles.inviteToken,
      consentAt: athleteProfiles.consentAt,
      name: users.name,
      phone: users.phone,
    })
    .from(athleteProfiles)
    .innerJoin(users, eq(users.id, athleteProfiles.userId))
    .where(eq(athleteProfiles.assessoriaId, assessoriaId));

  if (profs.length === 0) return [];
  const ids = profs.map((p) => p.userId);

  const snaps = await db
    .select()
    .from(scoreSnapshots)
    .where(inArray(scoreSnapshots.userId, ids))
    .orderBy(desc(scoreSnapshots.computedAt));

  const acts = await db
    .select({
      userId: activities.userId,
      start: activities.start,
      distanceKm: activities.distanceKm,
      flaggedReason: activities.flaggedReason,
    })
    .from(activities)
    .where(inArray(activities.userId, ids))
    .orderBy(desc(activities.start));

  return profs.map((p) => {
    const mySnaps = snaps.filter((s) => s.userId === p.userId);
    const latest = mySnaps[0] ?? null;
    const prev = mySnaps.find((s) => s.identityScore !== latest?.identityScore) ?? null;
    const myClean = acts.filter((a) => a.userId === p.userId && !a.flaggedReason);
    const lastRun = myClean[0] ?? null;
    const base = {
      userId: p.userId,
      name: p.name,
      initials: initialsOf(p.name),
      phone: p.phone,
      level: p.level,
      archetype: p.archetype,
      invitePending: p.inviteToken !== null,
      inviteToken: p.inviteToken,
      consentAt: p.consentAt,
      identityScore: latest?.identityScore ?? null,
      formScore: latest?.formScore ?? null,
      geral: latest?.geral ?? null,
      attributes: (latest?.attributes as Record<string, number | null>) ?? null,
      delta: latest && prev ? latest.identityScore - prev.identityScore : null,
      lastRunAt: lastRun?.start ?? null,
      lastRunKm: lastRun?.distanceKm ?? null,
      cleanCount: myClean.length,
      calibrating: myClean.length > 0 && myClean.length < 8,
    };
    return { ...base, status: statusOf(base) };
  });
}

/** Dados completos de um atleta (para o perfil individual e o app do atleta). */
export async function getAthleteDetail(userId: string) {
  const rows = await db
    .select({
      name: users.name,
      phone: users.phone,
      city: athleteProfiles.city,
      level: athleteProfiles.level,
      archetype: athleteProfiles.archetype,
      assessoriaId: athleteProfiles.assessoriaId,
      inviteToken: athleteProfiles.inviteToken,
      consentAt: athleteProfiles.consentAt,
    })
    .from(users)
    .leftJoin(athleteProfiles, eq(athleteProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);
  const info = rows[0];
  if (!info) return null;

  const snaps = await db
    .select()
    .from(scoreSnapshots)
    .where(eq(scoreSnapshots.userId, userId))
    .orderBy(desc(scoreSnapshots.computedAt))
    .limit(24);
  const latest = snaps[0] ?? null;
  const prev = snaps.find((s) => s.identityScore !== latest?.identityScore) ?? null;

  const actRows = await db
    .select()
    .from(activities)
    .where(eq(activities.userId, userId))
    .orderBy(desc(activities.start));

  const cleanActs: Activity[] = actRows
    .filter((r) => !r.flaggedReason)
    .map((r) => ({
      id: r.id,
      start: r.start,
      distanceKm: r.distanceKm,
      movingSec: r.movingSec,
      elapsedSec: r.elapsedSec,
      elevGainM: r.elevGainM,
      source: (r.source as Activity["source"]) ?? "gpx",
      finishSplit: r.finishSplit,
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const timeline = identityTimeline(cleanActs);

  return {
    userId,
    name: info.name,
    initials: initialsOf(info.name),
    phone: info.phone,
    city: info.city,
    level: info.level,
    archetype: info.archetype,
    assessoriaId: info.assessoriaId,
    invitePending: info.inviteToken !== null,
    inviteToken: info.inviteToken,
    consentAt: info.consentAt,
    latest,
    delta: latest && prev ? latest.identityScore - prev.identityScore : null,
    activities: actRows,
    cleanCount: cleanActs.length,
    calibrating: cleanActs.length > 0 && cleanActs.length < 8,
    timeline,
  };
}

export type AthleteDetail = NonNullable<Awaited<ReturnType<typeof getAthleteDetail>>>;
