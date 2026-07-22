import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/data";

const ATTRS: [string, string][] = [
  ["Ritmo", "ritmo"],
  ["Resistência", "resistencia"],
  ["Regularidade", "regularidade"],
  ["Finalização", "finalizacao"],
  ["Subida", "subida"],
  ["Evolução", "evolucao"],
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = await getPublicProfile(id);
  if (!p) return { title: "Carta não encontrada · Elevo", robots: { index: false, follow: false } };
  const title = `${p.firstName} · Runner Score ${p.score} — Elevo`;
  const description = `A carta de corredor de ${p.firstName}${p.brand ? ` (${p.brand})` : ""} na Elevo. Descubra o corredor que você está se tornando.`;
  return {
    title,
    description,
    // link compartilhável funciona, mas não indexável sem opt-in explícito (LGPD)
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      images: [{ url: `/r/${id}/og`, width: 1080, height: 1350 }],
      type: "profile",
    },
    twitter: { card: "summary_large_image", title, description, images: [`/r/${id}/og`] },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPublicProfile(id);
  if (!p) notFound();

  const v = (x: number | null | undefined) => (typeof x === "number" ? x : 0);
  const subtitle = [p.level, p.archetype, p.city].filter(Boolean).join(" · ");

  return (
    <main className="pubwrap">
      <header className="pubtop">
        <div className="brand"><span className="g">E</span>Elevo</div>
        <span className="pubbrand">{p.brand}</span>
      </header>

      <section className="pubcard">
        <div className="publab">Runner Score</div>
        <div className="pubscore tnum">{p.score}</div>
        <div className="pubname">{p.firstName}</div>
        {subtitle ? <div className="pubsub">{subtitle}</div> : null}

        <div className="pubbars tnum">
          {ATTRS.map(([label, key]) => (
            <div className="pubbar" key={key}>
              <span className="l">{label}</span>
              <span className="t"><span className="f" style={{ width: `${v(p.attrs[key])}%` }} /></span>
              <span className="v">{v(p.attrs[key])}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pubcta">
        <div className="t">Sua corrida também tem uma identidade.</div>
        <p>
          A Elevo transforma seu histórico de corridas em um Runner Score e uma carta como esta —
          feita para assessorias e seus atletas.
        </p>
        <Link href="/login" className="btnp" style={{ textDecoration: "none" }}>Conhecer a Elevo</Link>
      </section>

      <footer className="pubfoot">Elevo · Descubra o corredor que você está se tornando.</footer>
    </main>
  );
}
