import { pgTable, uuid, text, timestamp, integer, real, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

/** Papéis do usuário no app único (rota certa por papel no login). */
export type UserRole = "coach" | "athlete";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").$type<UserRole>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const assessorias = pgTable("assessorias", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Vínculo do atleta com a assessoria + dados de exibição do perfil. */
export const athleteProfiles = pgTable("athlete_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  assessoriaId: uuid("assessoria_id").references(() => assessorias.id),
  city: text("city"),
  level: text("level"),
  archetype: text("archetype"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Atividades normalizadas (saída do parser do @elevo/engine). */
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  start: timestamp("start", { withTimezone: true }).notNull(),
  distanceKm: real("distance_km").notNull(),
  movingSec: integer("moving_sec").notNull(),
  elapsedSec: integer("elapsed_sec").notNull(),
  elevGainM: real("elev_gain_m").notNull().default(0),
  source: text("source").notNull().default("gpx"),
  /** motivo da faxina quando descartada; null = atividade limpa */
  flaggedReason: text("flagged_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Snapshot do Runner Score calculado pelo motor (identidade + forma). */
export const scoreSnapshots = pgTable("score_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  identityScore: integer("identity_score").notNull(),
  formScore: integer("form_score"),
  geral: integer("geral").notNull(),
  attributes: jsonb("attributes").notNull(),
  version: text("version").notNull(),
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
});
