import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAthleteDetail } from "@/lib/data";
import { BottomNav } from "@/components/athlete/BottomNav";
import { CartaView, type CartaData } from "@/components/athlete/CartaView";

export default async function CartaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const a = await getAthleteDetail(session.user.id);
  if (!a) redirect("/login");

  const ready = a.latest !== null && !a.calibrating;
  const attrs = (a.latest?.attributes ?? {}) as CartaData["attrs"];

  return (
    <main className="ashell">
      <h1 className="sr-only">Sua carta</h1>
      <header className="atop">
        <div className="brand"><span className="g">E</span>Elevo</div>
        <span className="set" style={{ fontSize: 14, fontWeight: 600 }}>Sua carta</span>
      </header>

      {ready && a.latest ? (
        <CartaView
          d={{
            name: a.name,
            firstName: a.name.split(" ")[0] ?? a.name,
            initials: a.initials,
            city: a.city,
            level: a.level,
            archetype: a.archetype,
            brand: a.assessoriaName ?? "Elevo",
            geral: a.latest.geral,
            attrs: {
              ritmo: attrs.ritmo ?? null,
              resistencia: attrs.resistencia ?? null,
              regularidade: attrs.regularidade ?? null,
              finalizacao: attrs.finalizacao ?? null,
              subida: attrs.subida ?? null,
              evolucao: attrs.evolucao ?? null,
            },
          }}
        />
      ) : (
        <section className="acard">
          <div className="emptybox" style={{ padding: "28px 8px" }}>
            <div className="big">Sua carta nasce das suas corridas</div>
            <p>
              {a.cleanCount === 0
                ? "Envie suas corridas no Perfil — quando o seu score calibrar, a carta aparece aqui pronta para mostrar."
                : `Já recebemos ${a.cleanCount} corridas — faltam ${Math.max(0, 8 - a.cleanCount)} para calibrar seu score e liberar a carta.`}
            </p>
            <Link href="/atleta" className="btnp" style={{ textDecoration: "none" }}>Enviar corridas</Link>
          </div>
        </section>
      )}

      <BottomNav active="carta" />
    </main>
  );
}
