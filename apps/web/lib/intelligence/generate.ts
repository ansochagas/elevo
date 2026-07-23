/**
 * Camada de inteligência — ORQUESTRADOR.
 *
 * Junta tudo: detalhe do aluno → snapshot (grounding) → regras relevantes →
 * briefing. Usa a IA ancorada quando há chave; senão, cai na versão
 * determinística. A leitura NUNCA falha — se a IA der erro, também cai no
 * determinístico.
 */
import type { AthleteDetail } from "@/lib/data";
import type { AttributeKey } from "@elevo/engine";
import { buildDiagnosticSnapshot } from "./snapshot";
import { rulesForArea } from "./knowledge";
import { buildBriefInput, deterministicBrief, type AthleteBrief } from "./brief";
import { generateBriefWithLlm, isLlmConfigured } from "./llm";

export type { AthleteBrief } from "./brief";

/** Gera a leitura da semana de um aluno (IA ancorada ou determinística). */
export async function generateAthleteBrief(a: AthleteDetail, now: Date): Promise<AthleteBrief> {
  const snap = buildDiagnosticSnapshot(a, now);
  const area: AttributeKey | "geral" = snap.focus ? (snap.focus.key as AttributeKey) : "geral";
  const rules = rulesForArea(area);

  if (isLlmConfigured()) {
    try {
      return await generateBriefWithLlm(buildBriefInput(snap, rules));
    } catch {
      // qualquer falha da IA cai na versão determinística — a leitura não pode faltar
      return deterministicBrief(snap, rules);
    }
  }
  return deterministicBrief(snap, rules);
}
