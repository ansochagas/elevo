// TEMP diagnóstico da camada de IA. NÃO expõe a chave — só booleano + status.
// Remover após diagnosticar.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ELEVO_AI_MODEL || "claude-sonnet-5";
  if (!key) {
    return Response.json({ keyPresent: false, model, hint: "ANTHROPIC_API_KEY ausente no runtime da Vercel" });
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 16, messages: [{ role: "user", content: "ping" }] }),
    });
    const body = await res.text();
    return Response.json({
      keyPresent: true,
      keyPrefix: key.slice(0, 7), // ex.: "sk-ant-" — confirma formato, não expõe a chave
      model,
      status: res.status,
      ok: res.ok,
      body: body.slice(0, 400),
    });
  } catch (e) {
    return Response.json({ keyPresent: true, model, error: String(e) });
  }
}
