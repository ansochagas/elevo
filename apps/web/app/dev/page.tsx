import { notFound, redirect } from "next/navigation";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ingestFiles, type IngestFile } from "@/lib/ingest";

/** Página DEV-ONLY: ingere o export local do fundador para o atleta piloto. */
export default async function DevPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { done } = await searchParams;

  async function ingest() {
    "use server";
    if (process.env.NODE_ENV !== "development") return;
    const dir = "C:\\Users\\ander\\Desktop\\RunnerProfile\\data\\export\\activities";
    const rows = await db.select().from(users).where(eq(users.email, "atleta@elevo.app")).limit(1);
    const target = rows[0];
    if (!target) return;
    const files: IngestFile[] = readdirSync(dir)
      .filter((f) => /\.(gpx|fit)(\.gz)?$/i.test(f))
      .map((f) => ({ name: f, bytes: new Uint8Array(readFileSync(join(dir, f))) }));
    const res = await ingestFiles(target.id, files);
    redirect(`/dev?done=${res.inserted}-${res.duplicates}-${res.skipped.length}-${res.identityScore ?? "x"}`);
  }

  return (
    <main className="app">
      <div className="frame" style={{ maxWidth: 520, padding: 24 }}>
        <h1 style={{ fontSize: 17 }}>Dev · ingestão local</h1>
        {done ? <div className="notice ok">Resultado (novas-repetidas-ignoradas-score): {done}</div> : null}
        <form action={ingest}>
          <button className="btnp" type="submit">Ingerir export local → atleta piloto</button>
        </form>
      </div>
    </main>
  );
}
