"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "./db";
import { assessorias, athleteProfiles, users } from "./db/schema";
import { getAssessoriaOf } from "./data";
import { ingestFiles, type IngestFile } from "./ingest";

const token = () => randomBytes(18).toString("base64url");
const onlyDigits = (s: string) => s.replace(/\D/g, "");

async function requireCoach() {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") throw new Error("Sem permissão");
  const assessoria = await getAssessoriaOf(session.user.id);
  if (!assessoria) throw new Error("Assessoria não encontrada");
  return { session, assessoria };
}

/** Garante que o atleta pertence à assessoria do treinador logado. */
async function requireOwnAthlete(athleteUserId: string) {
  const ctx = await requireCoach();
  const rows = await db
    .select({ userId: athleteProfiles.userId })
    .from(athleteProfiles)
    .where(
      and(
        eq(athleteProfiles.userId, athleteUserId),
        eq(athleteProfiles.assessoriaId, ctx.assessoria.id),
      ),
    )
    .limit(1);
  if (rows.length === 0) throw new Error("Atleta não pertence à sua assessoria");
  return ctx;
}

export async function addAthlete(formData: FormData) {
  const { assessoria } = await requireCoach();
  const name = String(formData.get("name") ?? "").trim();
  const phone = onlyDigits(String(formData.get("phone") ?? ""));
  const emailRaw = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!name) redirect("/alunos/novo?erro=nome");

  const invite = token();
  const email = emailRaw || `convite-${invite.slice(0, 10)}@pendente.elevo`;
  // senha impossível até o atleta ativar pelo convite
  const passwordHash = bcrypt.hashSync(token() + token(), 10);

  let userId: string;
  try {
    const created = await db
      .insert(users)
      .values({ name, email, passwordHash, role: "athlete", phone: phone || null })
      .returning({ id: users.id });
    userId = created[0]!.id;
  } catch {
    redirect("/alunos/novo?erro=email");
  }

  await db.insert(athleteProfiles).values({
    userId,
    assessoriaId: assessoria.id,
    inviteToken: invite,
  });

  revalidatePath("/alunos");
  redirect(`/alunos/${userId}?novo=1`);
}

export async function updateAthlete(formData: FormData) {
  const athleteUserId = String(formData.get("userId"));
  await requireOwnAthlete(athleteUserId);
  const name = String(formData.get("name") ?? "").trim();
  const phone = onlyDigits(String(formData.get("phone") ?? ""));
  if (name) {
    await db.update(users).set({ name, phone: phone || null }).where(eq(users.id, athleteUserId));
  }
  revalidatePath(`/alunos/${athleteUserId}`);
  revalidatePath("/alunos");
  redirect(`/alunos/${athleteUserId}?ok=1`);
}

/** Desvincula da assessoria — a conta e o histórico continuam do atleta. */
export async function unlinkAthlete(formData: FormData) {
  const athleteUserId = String(formData.get("userId"));
  await requireOwnAthlete(athleteUserId);
  await db
    .update(athleteProfiles)
    .set({ assessoriaId: null })
    .where(eq(athleteProfiles.userId, athleteUserId));
  revalidatePath("/alunos");
  redirect("/alunos?desvinculado=1");
}

/** Reenvia o convite (novo token) — também serve de "esqueci a senha" do aluno. */
export async function regenerateInvite(formData: FormData) {
  const athleteUserId = String(formData.get("userId"));
  await requireOwnAthlete(athleteUserId);
  await db
    .update(athleteProfiles)
    .set({ inviteToken: token() })
    .where(eq(athleteProfiles.userId, athleteUserId));
  revalidatePath(`/alunos/${athleteUserId}`);
  redirect(`/alunos/${athleteUserId}?convite=1`);
}

/** Ativação do convite: atleta define senha e dá o consentimento (LGPD). */
export async function activateInvite(formData: FormData) {
  const inviteToken = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const consent = formData.get("consent") === "on";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!inviteToken) redirect("/login");
  if (!consent) redirect(`/convite/${inviteToken}?erro=consentimento`);
  if (password.length < 8) redirect(`/convite/${inviteToken}?erro=senha`);

  const rows = await db
    .select({ userId: athleteProfiles.userId })
    .from(athleteProfiles)
    .where(eq(athleteProfiles.inviteToken, inviteToken))
    .limit(1);
  const prof = rows[0];
  if (!prof) redirect("/convite/invalido");

  const updates: Record<string, unknown> = {
    passwordHash: bcrypt.hashSync(password, 10),
  };
  if (email) updates.email = email;
  try {
    await db.update(users).set(updates).where(eq(users.id, prof.userId));
  } catch {
    redirect(`/convite/${inviteToken}?erro=email`);
  }
  await db
    .update(athleteProfiles)
    .set({ inviteToken: null, consentAt: new Date() })
    .where(eq(athleteProfiles.userId, prof.userId));

  redirect("/login?ativado=1");
}

/** Configurações: nome da assessoria (só o dono). */
export async function updateAssessoria(formData: FormData) {
  const { assessoria } = await requireCoach();
  const name = String(formData.get("name") ?? "").trim();
  if (name) {
    await db.update(assessorias).set({ name }).where(eq(assessorias.id, assessoria.id));
  }
  revalidatePath("/");
  revalidatePath("/config");
  redirect("/config?ok=assessoria");
}

/** Configurações: nome e e-mail da própria conta (qualquer papel logado). */
export async function updateAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const back = session.user.role === "coach" ? "/config" : "/atleta/config";
  const updates: Record<string, unknown> = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (Object.keys(updates).length) {
    try {
      await db.update(users).set(updates).where(eq(users.id, session.user.id));
    } catch {
      redirect(`${back}?erro=email`);
    }
  }
  revalidatePath(back);
  redirect(`${back}?ok=conta`);
}

/** Configurações: trocar a própria senha (exige a atual). */
export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const back = session.user.role === "coach" ? "/config" : "/atleta/config";
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 8) redirect(`${back}?erro=senha-curta`);
  const rows = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  const u = rows[0];
  if (!u || !bcrypt.compareSync(current, u.passwordHash)) redirect(`${back}?erro=senha-atual`);
  await db
    .update(users)
    .set({ passwordHash: bcrypt.hashSync(next, 10) })
    .where(eq(users.id, session.user.id));
  redirect(`${back}?ok=senha`);
}

/** Upload em lote (arquivos já explodidos no cliente). target: o próprio atleta ou aluno do treinador. */
export async function uploadBatch(formData: FormData): Promise<{
  ok: boolean;
  parsed?: number;
  inserted?: number;
  duplicates?: number;
  skipped?: number;
  score?: number | null;
  calibrating?: boolean;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Sem sessão" };

  const target = String(formData.get("targetUserId") ?? session.user.id);
  if (target !== session.user.id) {
    try {
      await requireOwnAthlete(target);
    } catch {
      return { ok: false, error: "Sem permissão para este atleta" };
    }
  }

  const files = formData.getAll("files") as File[];
  if (files.length === 0) return { ok: false, error: "Nenhum arquivo" };

  const ingest: IngestFile[] = [];
  for (const f of files) {
    ingest.push({ name: f.name, bytes: new Uint8Array(await f.arrayBuffer()) });
  }
  const res = await ingestFiles(target, ingest);
  revalidatePath("/");
  revalidatePath("/atleta");
  revalidatePath(`/alunos/${target}`);
  revalidatePath("/alunos");
  return {
    ok: true,
    parsed: res.parsed,
    inserted: res.inserted,
    duplicates: res.duplicates,
    skipped: res.skipped.length,
    score: res.identityScore,
    calibrating: res.calibrating,
  };
}
