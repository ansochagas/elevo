// TEMP diagnóstico da camada de IA — chama a funcao real de briefing. Remover depois.
import { generateBriefWithLlm } from "@/lib/intelligence/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAMPLE = [
  "ALUNO: Anderson · Team Leo",
  "Runner Score: 520 (+20)",
  "Foco sugerido: Regularidade (Iniciante)",
  "ATRIBUTOS (0-100):",
  "- Regularidade: 35 [Iniciante] — correu ~2,3 vezes por semana.",
  "- Subida: 74 [Forte]",
  "TREINO:",
  "- Corridas válidas: 87",
  "- Carga: volume 40% abaixo da média.",
  "REGRAS (ciência curada):",
  "- Constância é o que mais destrava a evolução geral.",
].join("\n");

export async function GET() {
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ keyPresent: false });
  try {
    const brief = await generateBriefWithLlm(SAMPLE);
    return Response.json({ keyPresent: true, ok: true, brief });
  } catch (e) {
    return Response.json({ keyPresent: true, ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}
