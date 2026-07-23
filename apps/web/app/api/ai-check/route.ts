// TEMP diagnóstico — confirma o briefing real após o fix. Remover depois.
import { generateBriefWithLlm } from "@/lib/intelligence/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAMPLE = [
  "ALUNO: Anderson · Team Leo",
  "Runner Score: 520 (+20)",
  "Foco sugerido: Regularidade (Iniciante)",
  "ATRIBUTOS (0-100):",
  "- Regularidade: 35 [Iniciante] — correu ~2,3 vezes por semana.",
  "TREINO:",
  "- Corridas válidas: 87",
  "REGRAS (ciência curada):",
  "- Constância é o que mais destrava a evolução geral.",
].join("\n");

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ keyPresent: false });
  try {
    const brief = await generateBriefWithLlm(SAMPLE);
    return Response.json({ ok: true, brief });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}
