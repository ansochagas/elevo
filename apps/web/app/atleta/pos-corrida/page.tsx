import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAthleteDetail } from "@/lib/data";
import { ATTR_LABEL, type AthAttrKey } from "@/lib/athlete";
import { BottomNav } from "@/components/athlete/BottomNav";
import { RevealView } from "@/components/athlete/RevealView";

const KEYS: AthAttrKey[] = ["ritmo", "resistencia", "regularidade", "finalizacao", "subida", "evolucao"];

export default async function PosCorridaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const a = await getAthleteDetail(session.user.id);
  if (!a) redirect("/login");

  const lastRun = a.activities.find((r) => !r.flaggedReason) ?? null;

  if (!lastRun || !a.latest) {
    return (
      <main className="ashell">
        <h1 className="sr-only">Corridas</h1>
        <header className="atop">
          <div className="brand"><span className="g">E</span>Elevo</div>
          <span className="set" style={{ fontSize: 14, fontWeight: 600 }}>Corridas</span>
        </header>
        <section className="acard">
          <div className="emptybox" style={{ padding: "28px 8px" }}>
            <div className="big">A análise nasce com a primeira corrida</div>
            <p>Envie suas corridas no Perfil — cada nova corrida ganha a sua revelação aqui.</p>
            <Link href="/atleta" className="btnp" style={{ textDecoration: "none" }}>Enviar corridas</Link>
          </div>
        </section>
        <BottomNav active="corridas" />
      </main>
    );
  }

  const pace = (() => {
    const p = lastRun.movingSec / 60 / lastRun.distanceKm;
    const m = Math.floor(p);
    const s = Math.round((p - m) * 60);
    return `${m}:${String(s === 60 ? 0 : s).padStart(2, "0")}/km`;
  })();
  const runLine = `${lastRun.distanceKm.toFixed(1).replace(".", ",")} km · ${pace} · ${lastRun.start.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;

  const latestAttrs = (a.latest.attributes ?? {}) as Record<string, number | null>;
  const prevAttrs = (a.prev?.attributes ?? {}) as Record<string, number | null>;
  const changed = KEYS.map((k) => {
    const now = latestAttrs[k];
    const before = prevAttrs[k];
    if (now == null || before == null) return null;
    const delta = now - before;
    return delta > 0 ? { label: ATTR_LABEL[k], delta, width: now } : null;
  })
    .filter((x): x is { label: string; delta: number; width: number } => x !== null)
    .sort((x, y) => y.delta - x.delta)
    .slice(0, 3);

  return (
    <>
      <RevealView
        d={{
          runLine,
          scoreFrom: a.prev?.identityScore ?? a.latest.identityScore,
          scoreTo: a.latest.identityScore,
          calibrating: a.calibrating,
          changed,
        }}
      />
      <BottomNav active="corridas" />
    </>
  );
}
