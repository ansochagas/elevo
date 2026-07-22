import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAthleteDetail } from "@/lib/data";
import { AreaChart } from "@/components/charts";
import { BottomNav } from "@/components/athlete/BottomNav";
import { UploadButton } from "@/components/UploadButton";
import { NumbersBlock, RecordsBlock, PredictionsBlock, ExplainedAttributes } from "@/components/Kpis";

export default async function AtletaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const a = await getAthleteDetail(session.user.id);
  if (!a) redirect("/login");

  const attrs = (a.latest?.attributes ?? null) as Record<string, number | null> | null;
  const lastRun = a.activities.find((r) => !r.flaggedReason) ?? null;
  const lastPace = lastRun
    ? (() => {
        const p = lastRun.movingSec / 60 / lastRun.distanceKm;
        const m = Math.floor(p);
        const s = Math.round((p - m) * 60);
        return `${m}:${String(s === 60 ? 0 : s).padStart(2, "0")}/km`;
      })()
    : null;

  return (
    <main className="ashell">
      <h1 className="sr-only">Perfil do corredor {a.name}</h1>

      <header className="atop">
        <div className="brand"><span className="g">E</span>Elevo</div>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Link className="sairlink" href="/atleta/config">Configurações</Link>
          <a className="sairlink" href="/sair">Sair</a>
        </span>
      </header>

      <section className="ahero">
        <div className="who">
          <div className="mono">{a.initials}</div>
          <div>
            <div className="nm">{a.name}</div>
            {a.city ? <div className="loc">{a.city}</div> : null}
          </div>
          {a.level ? <div className="lvl">{a.level}{a.archetype ? ` · ${a.archetype}` : ""}</div> : null}
        </div>

        {a.latest && !a.calibrating ? (
          <div className="scores tnum">
            <div className="sc">
              <div className="lab">Runner Score</div>
              <div className="v">{a.latest.identityScore}</div>
            </div>
            {a.latest.formScore !== null ? (
              <div className="sc form">
                <div className="lab">Forma atual</div>
                <div className="v">
                  {a.latest.formScore}{" "}
                  {a.latest.formScore > a.latest.identityScore ? <span className="up">↑</span> : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {a.cleanCount === 0 ? (
        <section className="acard">
          <div className="emptybox" style={{ padding: "26px 8px" }}>
            <div className="big">Sua identidade nasce da primeira corrida</div>
            <p>Envie o export do Strava (o ZIP inteiro, sem descompactar) ou arquivos .gpx/.fit do seu relógio. A gente cuida do resto.</p>
            <UploadButton label="Enviar minhas corridas" />
          </div>
        </section>
      ) : (
        <>
          {a.calibrating ? (
            <section className="acard">
              <h3>Calibrando seu score</h3>
              <p className="uplmsg" style={{ marginTop: 0 }}>
                {a.cleanCount} corridas recebidas — faltam {Math.max(0, 8 - a.cleanCount)} para o seu Runner Score
                ficar confiável. Continue enviando!
              </p>
              <div style={{ marginTop: 12 }}>
                <UploadButton label="Enviar mais corridas" />
              </div>
            </section>
          ) : null}

          <section className="acard">
            <h3>Seus números</h3>
            <NumbersBlock m={a.metrics} />
            {a.metrics.records.length > 0 ? (
              <div style={{ marginTop: 16 }}>
                <h3>Recordes</h3>
                <RecordsBlock m={a.metrics} />
              </div>
            ) : null}
          </section>

          {attrs && !a.calibrating ? (
            <section className="acard">
              <h3>Atributos — e o porquê de cada um</h3>
              <ExplainedAttributes attrs={attrs} explanations={a.explanations} />
            </section>
          ) : null}

          {a.predictions.length > 0 && !a.calibrating ? (
            <section className="acard">
              <h3>Se você fosse correr uma prova hoje</h3>
              <PredictionsBlock predictions={a.predictions} />
            </section>
          ) : null}

          {a.timeline.length >= 2 && !a.calibrating ? (
            <section className="acard aevo">
              <h3>Evolução do score</h3>
              <AreaChart points={a.timeline.map((t) => t.smoothed)} color="var(--ac)" label="Evolução do seu Runner Score" />
            </section>
          ) : null}

          {lastRun ? (
            <section className="acard">
              <div className="avar">
                <span className="ic">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4" /><path d="M5 4h12l-2.5 4L17 12H5" /></svg>
                </span>
                <div>
                  <div className="t">Última corrida · {lastRun.distanceKm.toFixed(1).replace(".", ",")} km · {lastPace}</div>
                  <div className="p">
                    {lastRun.finishSplit !== null && lastRun.finishSplit > 0.02
                      ? "Você terminou mais rápido do que começou — finalização forte."
                      : lastRun.finishSplit !== null && lastRun.finishSplit < -0.05
                        ? "Você desacelerou no fim — tente guardar energia para fechar forte."
                        : "Ritmo consistente do começo ao fim."}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {!a.calibrating ? (
            <section className="acard">
              <h3>Enviar corridas</h3>
              <UploadButton label="Enviar novas corridas" />
            </section>
          ) : null}

          <Link href="/atleta/carta" className="ashare">
            Ver minha carta
          </Link>
        </>
      )}

      <BottomNav active="perfil" />
    </main>
  );
}
