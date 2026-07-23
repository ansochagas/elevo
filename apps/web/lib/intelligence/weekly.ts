/**
 * Camada de inteligência — CACHE SEMANAL.
 *
 * A leitura da IA é um artefato SEMANAL (os dois ritmos): gera uma vez por
 * aluno por semana e reusa — controla custo e evita "chicote" de uma corrida
 * ruim virar a leitura de cabeça pra baixo.
 *
 * Sem chave de IA, a leitura determinística é grátis e sempre atual → não
 * cacheia. Com IA ligada, cacheia por (aluno, semana). Defensivo: se a tabela
 * `briefs` ainda não existir em produção, cai para geração na hora sem gravar.
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { briefs } from "@/lib/db/schema";
import type { AthleteDetail } from "@/lib/data";
import { isLlmConfigured } from "./llm";
import { generateAthleteBrief, type AthleteBrief } from "./generate";
import { weekOfMonday } from "./snapshot";

/** Leitura da semana do aluno, com cache semanal quando a IA está ligada. */
export async function getWeeklyBrief(a: AthleteDetail, now: Date): Promise<AthleteBrief> {
  // Determinístico é barato e sempre atual — não vale cachear.
  if (!isLlmConfigured()) return generateAthleteBrief(a, now);

  const weekOf = weekOfMonday(now);

  // 1) já temos a leitura de IA desta semana? (só cache de IA conta — uma
  //    falha eventual da IA nunca "gruda" a leitura base na semana inteira)
  try {
    const rows = await db
      .select({ brief: briefs.brief })
      .from(briefs)
      .where(and(eq(briefs.userId, a.userId), eq(briefs.weekOf, weekOf), eq(briefs.source, "ia")))
      .limit(1);
    if (rows[0]) return rows[0].brief as AthleteBrief;
  } catch {
    // tabela ainda não migrada — segue para gerar sem cache
    return generateAthleteBrief(a, now);
  }

  // 2) gera e guarda SOMENTE se veio da IA (fallback determinístico não cacheia)
  const brief = await generateAthleteBrief(a, now);
  if (brief.source === "ia") {
    try {
      await db
        .insert(briefs)
        .values({ userId: a.userId, weekOf, brief, source: brief.source })
        .onConflictDoNothing({ target: [briefs.userId, briefs.weekOf] });
    } catch {
      // sem tabela: devolve a leitura mesmo sem cachear
    }
  }
  return brief;
}
