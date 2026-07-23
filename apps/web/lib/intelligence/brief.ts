/**
 * Camada de inteligência — CONTRATO DO BRIEFING (camada 3, parte determinística).
 *
 * Define o que é uma "leitura da semana" de um aluno (AthleteBrief), o
 * prompt-sistema com os guardrails, o formato de saída estruturado que a IA
 * DEVE seguir, e uma versão DETERMINÍSTICA que já roda sem IA nenhuma.
 *
 * A versão determinística existe por dois motivos: (1) o raio-x funciona desde
 * o dia 1, antes da chave de IA; (2) é o fallback — a leitura nunca falha.
 */
import type { DiagnosticSnapshot } from "./snapshot";
import type { RunningRule } from "./knowledge";

export interface AthleteBrief {
  /** uma linha: o estado do aluno nesta semana */
  headline: string;
  /** área de foco sugerida (nome do atributo) */
  focus: string;
  /** 2-4 frases: o que os números dizem, sempre citando-os */
  reading: string;
  /** pontos para o treinador OBSERVAR (nunca prescrição de treino) */
  watch: string[];
  /** os números-base usados — torna a leitura auditável */
  evidence: string[];
  /** devolve a decisão de treino ao treinador */
  coachNote: string;
  /** proveniência: gerado por IA ancorada ou pela regra determinística */
  source: "ia" | "deterministico";
}

/** Prompt-sistema: encoda função, grounding e guardrails. Não muda por aluno. */
export const BRIEF_SYSTEM_PROMPT = `Você é o co-piloto de análise da Elevo para TREINADORES de corrida. Seu público é o TREINADOR (nunca o atleta). Sua função é ler os dados de UM aluno e entregar uma leitura curta e útil que ajude o treinador a DECIDIR — jamais substituí-lo.

REGRAS INEGOCIÁVEIS:
1. Use SOMENTE os números do bloco DADOS. Cada afirmação deve se apoiar num número de lá. Se um dado não existir, diga que não há dado — nunca invente números nem tendências.
2. NUNCA prescreva treino específico (séries, distâncias, ritmos, volumes). NUNCA afirme, sugira ou insinue risco de lesão. Você descreve padrões e possibilidades; a decisão de treino é do treinador.
3. Fundamente as interpretações nas REGRAS fornecidas (ciência curada). Não traga conhecimento geral que vá além ou contradiga essas regras.
4. Português do Brasil, tom objetivo e conciso, direto ao treinador. Sem floreio, sem discurso motivacional.

Responda EXCLUSIVAMENTE com um objeto JSON válido — sem texto antes ou depois, sem blocos de código — com exatamente estas chaves:
- "headline" (string): uma linha sobre o estado do aluno nesta semana.
- "focus" (string): área de foco sugerida (nome do atributo).
- "reading" (string): 2-4 frases interpretando os números, citando-os.
- "watch" (lista de strings): 2-3 pontos para o treinador observar. Nunca prescrição.
- "evidence" (lista de strings): os números-base usados na leitura.
- "coachNote" (string): frase que devolve a decisão de treino ao treinador.`;

/** Monta o bloco DADOS (grounding legível) a partir do snapshot + regras. */
export function buildBriefInput(snap: DiagnosticSnapshot, rules: RunningRule[]): string {
  const attrs = snap.attributes
    .map((a) => {
      const d = a.deltaVsPrev == null ? "" : ` (${a.deltaVsPrev >= 0 ? "+" : ""}${a.deltaVsPrev} vs. leitura anterior)`;
      const base = a.explanation ? ` — ${a.explanation}` : "";
      return `- ${a.label}: ${a.value ?? "sem dado"}${a.tier ? ` [${a.tier}]` : ""}${d}${base}`;
    })
    .join("\n");
  const changes = [
    snap.improved.length ? `Melhorou: ${snap.improved.map((c) => `${c.label} (+${c.delta})`).join(", ")}.` : "",
    snap.declined.length ? `Recuou: ${snap.declined.map((c) => `${c.label} (${c.delta})`).join(", ")}.` : "",
  ].filter(Boolean).join(" ");
  const t = snap.training;
  const ruleTxt = rules.map((r) => `- ${r.insight} (base: ${r.evidence})`).join("\n");

  return [
    `ALUNO: ${snap.athlete.firstName} · ${snap.athlete.brand}`,
    `Semana de referência: ${snap.weekOf}`,
    snap.athlete.level ? `Nível: ${snap.athlete.level}${snap.athlete.archetype ? ` · ${snap.athlete.archetype}` : ""}` : "",
    ``,
    `Runner Score: ${snap.score.runnerScore ?? "calibrando"}${snap.score.deltaVsPrev != null ? ` (${snap.score.deltaVsPrev >= 0 ? "+" : ""}${snap.score.deltaVsPrev} vs. anterior)` : ""}${snap.score.form != null ? ` · Forma: ${snap.score.form}` : ""}`,
    `Foco sugerido: ${snap.focus ? `${snap.focus.label} (${snap.focus.tier})` : "sem base ainda"}`,
    changes ? `Mudanças: ${changes}` : "",
    ``,
    `ATRIBUTOS (0-100):`,
    attrs,
    ``,
    `TREINO:`,
    `- Corridas válidas: ${t.validRuns}${t.calibrating ? " (calibrando, <8)" : ""}`,
    `- Dias desde a última corrida: ${t.daysSinceLastRun ?? "sem dado"}`,
    `- Carga: ${t.loadNote}`,
    `- Sequência ativa: ${t.streakWeeks} semana(s)`,
    `- Volume: ${t.kmThisMonth.toFixed(0)} km neste mês vs. ${t.kmLastMonth.toFixed(0)} km no anterior`,
    ``,
    `REGRAS (ciência curada — fundamente-se nelas):`,
    ruleTxt,
  ].filter((l) => l !== "").join("\n");
}

const paceOrNull = (n: number | null) => (n == null ? null : n);

/**
 * Leitura DETERMINÍSTICA — sem IA. Monta um briefing honesto a partir do
 * snapshot + regras. Serve como conteúdo do dia 1 e como fallback.
 */
export function deterministicBrief(snap: DiagnosticSnapshot, rules: RunningRule[]): AthleteBrief {
  const nm = snap.athlete.firstName;
  const t = snap.training;

  if (t.calibrating || snap.score.runnerScore == null) {
    return {
      headline: `${nm} ainda está calibrando (${t.validRuns} de 8 corridas).`,
      focus: "—",
      reading: `Faltam corridas para uma leitura confiável de ${nm}. Com 8+ corridas válidas, o score e os atributos ficam estáveis.`,
      watch: [`Incentivar ${nm} a subir mais corridas para calibrar.`],
      evidence: [`${t.validRuns} corridas válidas`],
      coachNote: "Assim que calibrar, a leitura semanal fica completa.",
      source: "deterministico",
    };
  }

  const parado = t.daysSinceLastRun != null && t.daysSinceLastRun >= 7;
  const deltaScore = snap.score.deltaVsPrev;
  const headline = parado
    ? `${nm} está sem correr há ${t.daysSinceLastRun} dias — vale um contato.`
    : deltaScore != null && deltaScore > 0
      ? `${nm} evoluiu: Runner Score subiu ${deltaScore} pts.`
      : deltaScore != null && deltaScore < 0
        ? `${nm} recuou ${Math.abs(deltaScore)} pts no Runner Score.`
        : `${nm} está estável esta semana.`;

  const focusAttr = snap.focus ? snap.attributes.find((a) => a.key === (snap.focus!.key as typeof a.key)) : null;
  const focusRule = rules.find((r) => snap.focus && r.area === snap.focus.key) ?? rules.find((r) => r.area === "geral");
  const reading = snap.focus && focusAttr
    ? `O maior espaço de ${nm} hoje é ${snap.focus.label} (${focusAttr.value}, ${snap.focus.tier}). ${focusRule ? focusRule.insight : ""}`.trim()
    : `${nm} tem um perfil equilibrado — nenhum atributo se destaca muito abaixo dos outros.`;

  const watch: string[] = [];
  if (parado) watch.push(`Sem corridas há ${t.daysSinceLastRun} dias (${t.loadNote}).`);
  if (t.loadStatus === "subindo-rapido") watch.push(t.loadNote);
  if (t.loadStatus === "caindo") watch.push(t.loadNote);
  for (const d of snap.declined.slice(0, 2)) watch.push(`${d.label} recuou ${d.delta} desde a última leitura.`);
  if (watch.length === 0) watch.push("Nada fora do padrão esta semana — carga e evolução em linha.");

  const evidence: string[] = [
    `Runner Score ${snap.score.runnerScore}${deltaScore != null ? ` (${deltaScore >= 0 ? "+" : ""}${deltaScore})` : ""}`,
    ...(focusAttr ? [`${focusAttr.label} ${focusAttr.value} [${focusAttr.tier}]`] : []),
    `${t.kmThisMonth.toFixed(0)} km no mês (vs. ${t.kmLastMonth.toFixed(0)})`,
  ];
  void paceOrNull;

  return {
    headline,
    focus: snap.focus ? snap.focus.label : "Equilibrado",
    reading,
    watch,
    evidence,
    coachNote: "O treino para isso é a sua decisão — os números apontam onde olhar.",
    source: "deterministico",
  };
}
