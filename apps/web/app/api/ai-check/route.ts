// TEMP diagnóstico — despeja a resposta crua da tool-use. Remover depois.
import { BRIEF_SYSTEM_PROMPT, BRIEF_TOOL } from "@/lib/intelligence/brief";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ keyPresent: false });
  const model = process.env.ELEVO_AI_MODEL || "claude-sonnet-5";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: 900,
        system: BRIEF_SYSTEM_PROMPT,
        tools: [BRIEF_TOOL],
        tool_choice: { type: "tool", name: BRIEF_TOOL.name },
        messages: [{ role: "user", content: "DADOS:\nALUNO: Anderson · Team Leo\nRunner Score: 520 (+20)\nFoco: Regularidade (35, Iniciante)\nATRIBUTOS:\n- Regularidade: 35 [Iniciante]\nTREINO:\n- Corridas válidas: 87\nREGRAS:\n- Constância destrava a evolução geral." }],
      }),
    });
    const data = await res.json();
    return Response.json({
      status: res.status,
      stop_reason: data?.stop_reason,
      contentTypes: Array.isArray(data?.content) ? data.content.map((b: { type?: string; name?: string }) => `${b.type}${b.name ? ":" + b.name : ""}`) : null,
      firstBlock: Array.isArray(data?.content) ? data.content[0] : data,
    });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) });
  }
}
