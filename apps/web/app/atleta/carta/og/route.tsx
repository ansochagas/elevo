import { auth } from "@/auth";
import { getAthleteDetail } from "@/lib/data";
import { cartaImageResponse } from "@/lib/carta-og";

export const runtime = "nodejs";

/** Gera a IMAGEM da carta (PNG) do atleta logado para compartilhar. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Não autenticado", { status: 401 });
  const a = await getAthleteDetail(session.user.id);
  if (!a || !a.latest || a.calibrating) {
    return new Response("Carta ainda não disponível", { status: 404 });
  }
  return cartaImageResponse({
    firstName: a.name.split(" ")[0] ?? a.name,
    brand: a.assessoriaName ?? "Elevo",
    score: a.latest.identityScore,
    level: a.level,
    archetype: a.archetype,
    city: a.city,
    attrs: (a.latest.attributes ?? {}) as Record<string, number | null>,
  });
}
