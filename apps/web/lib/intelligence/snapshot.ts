/**
 * Camada de inteligência — GROUNDING (fundação).
 *
 * Monta um retrato ESTRUTURADO e AUDITÁVEL do aluno a partir do diagnóstico
 * determinístico do motor. É este objeto — e só ele — que alimenta a IA:
 * cada afirmação que a IA fizer terá que apontar para um número daqui. Nada de
 * prompt em branco; nada de conselho solto. É o que separa "conversar com os
 * dados da turma" de "conversar com um chatbot genérico".
 *
 * Função pura: não chama IA, não acessa rede. Só reorganiza o que o motor já
 * calculou num formato pronto para raciocínio.
 */
import type { AthleteDetail } from "@/lib/data";
import { ATTR_LABEL, type AthAttrKey } from "@/lib/athlete";
import { attributeTier, type AttributeKey } from "@elevo/engine";

const ATTR_ORDER: AttributeKey[] = ["ritmo", "resistencia", "regularidade", "finalizacao", "subida", "evolucao"];

export interface SnapshotAttribute {
  key: AttributeKey;
  label: string;
  value: number | null;
  tier: string | null;
  /** variação vs. a leitura anterior (null se não há base) */
  deltaVsPrev: number | null;
  /** o porquê do número, em linguagem — o dado-base real */
  explanation: string | null;
}

export interface DiagnosticSnapshot {
  /** segunda-feira (ISO) da semana de referência da leitura */
  weekOf: string;
  athlete: { firstName: string; brand: string; level: string | null; archetype: string | null };
  score: { runnerScore: number | null; form: number | null; deltaVsPrev: number | null };
  attributes: SnapshotAttribute[];
  /** atributo de maior espaço para crescer (foco sugerido) */
  focus: { key: string; label: string; tier: string } | null;
  improved: { label: string; delta: number }[];
  declined: { label: string; delta: number }[];
  training: {
    validRuns: number;
    calibrating: boolean;
    daysSinceLastRun: number | null;
    loadStatus: string;
    loadNote: string;
    streakWeeks: number;
    kmThisMonth: number;
    kmLastMonth: number;
  };
}

/** Segunda-feira (UTC) da semana de `now`, em ISO curto (YYYY-MM-DD). */
export function weekOfMonday(now: Date): string {
  return mondayOf(now);
}
function mondayOf(now: Date): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dow = (d.getUTCDay() + 6) % 7; // 0 = segunda
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

/**
 * Monta o retrato de grounding de um atleta para a camada de IA.
 * `now` é injetado para ser determinístico/testável.
 */
export function buildDiagnosticSnapshot(a: AthleteDetail, now: Date): DiagnosticSnapshot {
  const latestAttrs = (a.latest?.attributes ?? {}) as Partial<Record<AttributeKey, number | null>>;
  const prevAttrs = (a.prev?.attributes ?? null) as Partial<Record<AttributeKey, number | null>> | null;

  const attributes: SnapshotAttribute[] = ATTR_ORDER.map((k) => {
    const v = latestAttrs[k];
    const pv = prevAttrs ? prevAttrs[k] : null;
    return {
      key: k,
      label: ATTR_LABEL[k as AthAttrKey],
      value: typeof v === "number" ? v : null,
      tier: typeof v === "number" ? attributeTier(v) : null,
      deltaVsPrev: typeof v === "number" && typeof pv === "number" ? v - pv : null,
      explanation: a.explanations[k] ?? null,
    };
  });

  return {
    weekOf: mondayOf(now),
    athlete: {
      firstName: a.name.split(" ")[0] ?? a.name,
      brand: a.assessoriaName ?? "Elevo",
      level: a.level,
      archetype: a.archetype,
    },
    score: {
      runnerScore: a.latest?.identityScore ?? null,
      form: a.latest?.formScore ?? null,
      deltaVsPrev: a.delta,
    },
    attributes,
    focus: a.focus ? { key: a.focus.key, label: ATTR_LABEL[a.focus.key as AthAttrKey], tier: a.focus.tier } : null,
    improved: a.changes.improved.map((c) => ({ label: ATTR_LABEL[c.key as AthAttrKey], delta: c.delta })),
    declined: a.changes.declined.map((c) => ({ label: ATTR_LABEL[c.key as AthAttrKey], delta: c.delta })),
    training: {
      validRuns: a.cleanCount,
      calibrating: a.calibrating,
      daysSinceLastRun: a.load.daysSinceLast,
      loadStatus: a.load.status,
      loadNote: a.load.note,
      streakWeeks: a.metrics.activeWeekStreak,
      kmThisMonth: a.metrics.kmThisMonth,
      kmLastMonth: a.metrics.kmLastMonth,
    },
  };
}
