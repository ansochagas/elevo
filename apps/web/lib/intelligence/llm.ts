/**
 * Camada de inteligência — CLIENTE LLM (camada 3, parte que fala com a IA).
 *
 * Chama a API de Mensagens da Anthropic (Claude) forçando saída estruturada
 * via ferramenta. Fica DORMENTE até existir ANTHROPIC_API_KEY no ambiente —
 * sem a chave, `isLlmConfigured()` retorna false e o orquestrador usa a versão
 * determinística. Nada quebra na ausência da chave.
 *
 * Importante (LGPD/privacidade): a API da Anthropic não treina no conteúdo
 * enviado. Ainda assim, só mandamos o snapshot (números), nunca dado sensível.
 */
import { BRIEF_SYSTEM_PROMPT, type AthleteBrief } from "./brief";

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5";

/** Remove qualquer tag tipo <...> que o modelo eventualmente vaze num campo. */
const clean = (s: string): string => s.replace(/<[^>]*>/g, "").trim();
/** Coage para lista de strings limpas (o modelo às vezes manda string única). */
const toArr = (x: unknown): string[] =>
  (Array.isArray(x) ? x : typeof x === "string" && x.trim() ? [x] : [])
    .filter((s): s is string => typeof s === "string")
    .map(clean)
    .filter(Boolean);

export function isLlmConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export class LlmNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY ausente — camada de IA desligada.");
    this.name = "LlmNotConfiguredError";
  }
}

interface TextBlock { type: string; text?: string }

/**
 * Gera o briefing via Claude, ancorado no bloco DADOS (grounding) já montado.
 * Usa JSON com prefill "{" (mais robusto que tool-use para este modelo — evita
 * vazamento de sintaxe de ferramenta nos campos) + limpeza defensiva.
 */
export async function generateBriefWithLlm(userInput: string): Promise<AthleteBrief> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new LlmNotConfiguredError();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ELEVO_AI_MODEL || DEFAULT_MODEL,
      max_tokens: 1000,
      system: BRIEF_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `DADOS:\n${userInput}` },
        { role: "assistant", content: "{" }, // prefill: força JSON limpo
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const data = (await res.json()) as { content?: TextBlock[] };
  const text = data.content?.find((b) => b.type === "text")?.text ?? "";
  const raw = "{" + text;
  const jsonStr = raw.slice(0, raw.lastIndexOf("}") + 1);

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    throw new Error("Resposta da IA não é JSON válido.");
  }
  if (typeof parsed.headline !== "string") {
    throw new Error("Resposta da IA fora do contrato.");
  }
  const str = (x: unknown, fallback: string): string => (typeof x === "string" && x.trim() ? clean(x) : fallback);
  return {
    headline: clean(parsed.headline),
    focus: str(parsed.focus, "—"),
    reading: str(parsed.reading, ""),
    watch: toArr(parsed.watch),
    evidence: toArr(parsed.evidence),
    coachNote: str(parsed.coachNote, "O treino é a sua decisão."),
    source: "ia",
  };
}
