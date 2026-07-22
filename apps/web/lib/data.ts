import { desc, eq, inArray } from "drizzle-orm";
import {
  identityTimeline,
  computeMetrics,
  predictRaces,
  explainAttributes,
  focusArea,
  attributeChanges,
  teamWeeklyVolume,
  runnerLevel,
  runnerArchetype,
  type Activity,
  type AttributeKey,
  type WeekVolume,
} from "@elevo/engine";
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
    const scored = latest !== null && myClean.length >= 8;
    const base = {
      userId: p.userId,
      name: p.name,
      initials: initialsOf(p.name),
      phone: p.phone,
      level: p.level ?? (scored ? runnerLevel(latest!.identityScore).label : null),
      archetype: p.archetype ?? (scored ? runnerArchetype((latest!.attributes as Record<string, number | null>) ?? {}) : null),
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

export interface TeamVolume {
  weeks: WeekVolume[];
  kmThisWeek: number;
  kmLastWeek: number;
  runsThisWeek: number;
  runnersThisWeek: number;
  activeAthletes: number;
  hasData: boolean;
}

/** Volume de treino AGREGADO da turma — carga da assessoria semana a semana. */
export async function getTeamVolume(assessoriaId: string, weeks = 8): Promise<TeamVolume> {
  const empty: TeamVolume = {
    weeks: [], kmThisWeek: 0, kmLastWeek: 0, runsThisWeek: 0,
    runnersThisWeek: 0, activeAthletes: 0, hasData: false,
  };
  const profs = await db
    .select({ userId: athleteProfiles.userId })
    .from(athleteProfiles)
    .where(eq(athleteProfiles.assessoriaId, assessoriaId));
  if (profs.length === 0) return empty;
  const ids = profs.map((p) => p.userId);

  const since = new Date(Date.now() - (weeks + 1) * 7 * DAY);
  const acts = await db
    .select({
      userId: activities.userId,
      start: activities.start,
      distanceKm: activities.distanceKm,
      flaggedReason: activities.flaggedReason,
    })
    .from(activities)
    .where(inArray(activities.userId, ids));

  const clean = acts
    .filter((a) => !a.flaggedReason && a.start >= since)
    .map((a) => ({ start: a.start, distanceKm: a.distanceKm, userId: a.userId }));
  if (clean.length === 0) return { ...empty };

  const buckets = teamWeeklyVolume(clean, new Date(), weeks);
  const cur = buckets[buckets.length - 1] ?? null;
  const prev = buckets[buckets.length - 2] ?? null;
  return {
    weeks: buckets,
    kmThisWeek: cur?.km ?? 0,
    kmLastWeek: prev?.km ?? 0,
    runsThisWeek: cur?.runs ?? 0,
    runnersThisWeek: cur?.runners ?? 0,
    activeAthletes: new Set(clean.map((a) => a.userId)).size,
    hasData: true,
  };
}

export interface PublicProfile {
  firstName: string;
  initials: string;
  brand: string;
  level: string | null;
  archetype: string | null;
  city: string | null;
  /** Runner Score de identidade (mesmo do topo do app) */
  score: number;
  attrs: Record<string, number | null>;
}

/**
 * Subconjunto SEGURO do perfil para a página pública (link compartilhável).
 * Nunca expõe telefone, e-mail, lista de corridas ou nome completo — só a
 * vitrine de identidade que o atleta escolhe mostrar. Null se ainda não há
 * score confiável (calibrando) ou o usuário não existe.
 */
export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  const rows = await db
    .select({
      name: users.name,
      role: users.role,
      city: athleteProfiles.city,
      level: athleteProfiles.level,
      archetype: athleteProfiles.archetype,
      brand: assessorias.name,
    })
    .from(users)
    .leftJoin(athleteProfiles, eq(athleteProfiles.userId, users.id))
    .leftJoin(assessorias, eq(assessorias.id, athleteProfiles.assessoriaId))
    .where(eq(users.id, userId))
    .limit(1);
  const info = rows[0];
  if (!info || info.role !== "athlete") return null;

  const snap = await db
    .select({ identityScore: scoreSnapshots.identityScore, attributes: scoreSnapshots.attributes })
    .from(scoreSnapshots)
    .where(eq(scoreSnapshots.userId, userId))
    .orderBy(desc(scoreSnapshots.computedAt))
    .limit(1);
  const latest = snap[0];
  if (!latest) return null; // sem snapshot = ainda calibrando, não expõe

  const attrs = (latest.attributes as Record<string, number | null>) ?? {};
  return {
    firstName: info.name.split(/\s+/)[0] ?? info.name,
    initials: initialsOf(info.name),
    brand: info.brand ?? "Elevo",
    level: info.level ?? runnerLevel(latest.identityScore).label,
    archetype: info.archetype ?? runnerArchetype(attrs),
    city: info.city,
    score: latest.identityScore,
    attrs,
  };
}

/** Dados completos de um atleta (para o perfil individual e o app do atleta). */
export async function getAthleteDetail(userId: string) {
  const rows = await db
    .select({
      name: users.name,
      email: users.email,
      phone: users.phone,
      city: athleteProfiles.city,
      level: athleteProfiles.level,
      archetype: athleteProfiles.archetype,
      assessoriaId: athleteProfiles.assessoriaId,
      assessoriaName: assessorias.name,
      inviteToken: athleteProfiles.inviteToken,
      consentAt: athleteProfiles.consentAt,
    })
    .from(users)
    .leftJoin(athleteProfiles, eq(athleteProfiles.userId, users.id))
    .leftJoin(assessorias, eq(assessorias.id, athleteProfiles.assessoriaId))
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
  const now = new Date();
  const metrics = computeMetrics(cleanActs, now);
  const predictions = predictRaces(metrics.bestPaceMinKm);
  const explanations = explainAttributes(cleanActs, now);

  const latestAttrs = (latest?.attributes as Partial<Record<AttributeKey, number | null>>) ?? {};
  const prevAttrs = (prev?.attributes as Partial<Record<AttributeKey, number | null>>) ?? null;
  const focus = focusArea(latestAttrs);
  const changes = attributeChanges(latestAttrs, prevAttrs);

  // nível e arquétipo derivados do score (colunas do DB são fallback/override manual)
  const derivedLevel = latest ? runnerLevel(latest.identityScore).label : null;
  const derivedArchetype = latest ? runnerArchetype(latestAttrs) : null;

  return {
    userId,
    name: info.name,
    email: info.email,
    initials: initialsOf(info.name),
    phone: info.phone,
    city: info.city,
    level: info.level ?? derivedLevel,
    archetype: info.archetype ?? derivedArchetype,
    assessoriaId: info.assessoriaId,
    assessoriaName: info.assessoriaName,
    invitePending: info.inviteToken !== null,
    inviteToken: info.inviteToken,
    consentAt: info.consentAt,
    latest,
    prev,
    delta: latest && prev ? latest.identityScore - prev.identityScore : null,
    activities: actRows,
    cleanCount: cleanActs.length,
    calibrating: cleanActs.length > 0 && cleanActs.length < 8,
    timeline,
    metrics,
    predictions,
    explanations,
    focus,
    changes,
  };
}

export type AthleteDetail = NonNullable<Awaited<ReturnType<typeof getAthleteDetail>>>;
