import { getPublicProfile } from "@/lib/data";
import { cartaImageResponse } from "@/lib/carta-og";

export const runtime = "nodejs";

/** Imagem (PNG) da carta pública — usada no unfurl do link (WhatsApp/redes). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPublicProfile(id);
  if (!p) return new Response("Perfil não disponível", { status: 404 });
  return cartaImageResponse({
    firstName: p.firstName,
    brand: p.brand,
    score: p.score,
    level: p.level,
    archetype: p.archetype,
    city: p.city,
    attrs: p.attrs,
  });
}
