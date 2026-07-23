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
import { BRIEF_SYSTEM_PROMPT, BRIEF_TOOL, type AthleteBrief } from "./brief";

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5";

export function isLlmConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export class LlmNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY ausente — camada de IA desligada.");
    this.name = "LlmNotConfiguredError";
  }
}

interface ToolUseBlock { type: string; name?: string; input?: unknown }

/**
 * Gera o briefing via Claude, ancorado no bloco DADOS (grounding) já montado.
 * Retorna o AthleteBrief validado. Lança se não configurado ou se a resposta
 * vier fora do contrato — o orquestrador captura e cai no determinístico.
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
      max_tokens: 900,
      system: BRIEF_SYSTEM_PROMPT,
      tools: [BRIEF_TOOL],
      tool_choice: { type: "tool", name: BRIEF_TOOL.name },
      messages: [{ role: "user", content: `DADOS:\n${userInput}` }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const data = (await res.json()) as { content?: ToolUseBlock[] };
  const block = data.content?.find((b) => b.type === "tool_use" && b.name === BRIEF_TOOL.name);
  const input = block?.input as Record<string, unknown> | undefined;
  if (!input || typeof input.headline !== "string") {
    throw new Error("Resposta da IA fora do contrato.");
  }
  // tolerante: o modelo às vezes devolve listas de 1 item como string
  const toArr = (x: unknown): string[] =>
    Array.isArray(x)
      ? x.filter((s): s is string => typeof s === "string")
      : typeof x === "string" && x.trim()
        ? [x]
        : [];
  const str = (x: unknown, fallback: string): string => (typeof x === "string" && x.trim() ? x : fallback);
  return {
    headline: input.headline,
    focus: str(input.focus, "—"),
    reading: str(input.reading, ""),
    watch: toArr(input.watch),
    evidence: toArr(input.evidence),
    coachNote: str(input.coachNote, "O treino é a sua decisão."),
    source: "ia",
  };
}
