import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAthleteDetail, getAthletesOf } from "@/lib/data";
import { BottomNav } from "@/components/athlete/BottomNav";

export default async function LigaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const me = await getAthleteDetail(session.user.id);
  if (!me) redirect("/login");

  const scored = me.assessoriaId
    ? (await getAthletesOf(me.assessoriaId))
        .filter((a) => a.identityScore !== null && !a.calibrating)
        .sort((a, b) => (b.identityScore ?? 0) - (a.identityScore ?? 0))
    : [];
  const myPos = scored.findIndex((a) => a.userId === me.userId);
  const rival = myPos > 0 ? scored[myPos - 1]! : myPos === 0 && scored.length > 1 ? scored[1]! : null;
  const myScore = myPos >= 0 ? scored[myPos]!.identityScore! : null;

  return (
    <main className="ashell">
      <h1 className="sr-only">Liga da turma</h1>
      <header className="atop">
        <div className="brand"><span className="g">E</span>Elevo</div>
        <span className="set" style={{ fontSize: 14, fontWeight: 600 }}>
          Liga{me.assessoriaName ? ` · ${me.assessoriaName}` : ""}
        </span>
      </header>

      {!me.assessoriaId ? (
        <section className="acard">
          <div className="emptybox" style={{ padding: "28px 8px" }}>
            <div className="big">A liga vive dentro da sua assessoria</div>
            <p>Quando você fizer parte de uma assessoria na Elevo, o ranking da turma aparece aqui.</p>
          </div>
        </section>
      ) : scored.length < 2 ? (
        <section className="acard">
          <div className="emptybox" style={{ padding: "28px 8px" }}>
            <div className="big">A liga abre quando a turma entrar</div>
            <p>
              O ranking aparece quando pelo menos dois atletas da {me.assessoriaName ?? "assessoria"} tiverem o
              score calibrado. Chame os colegas — e garanta o seu lugar enviando suas corridas.
            </p>
            <Link href="/atleta" className="btnp" style={{ textDecoration: "none" }}>Enviar minhas corridas</Link>
          </div>
        </section>
      ) : (
        <>
          {rival && myScore !== null ? (
            <div className="rival tnum">
              <div className="rh">{myPos === 0 ? "Na sua cola" : "Sua rivalidade"}</div>
              <div className="vs">
                <div className="p me"><div className="av">{me.initials}</div><div className="pn">Você</div><div className="ps">{myScore}</div></div>
                <div className="mid">VS</div>
                <div className="p"><div className="av">{rival.initials}</div><div className="pn">{rival.name.split(" ")[0]}</div><div className="ps">{rival.identityScore}</div></div>
              </div>
              <div className="gap">
                {myPos === 0
                  ? `Você lidera — ${rival.name.split(" ")[0]} está ${myScore - (rival.identityScore ?? 0)} pontos atrás`
                  : `${rival.name.split(" ")[0]} está ${(rival.identityScore ?? 0) - myScore} pontos à sua frente`}
              </div>
            </div>
          ) : null}

          <div className="rank tnum">
            <div className="rkh"><span className="tt">Ranking da turma</span></div>
            {scored.map((a, i) => (
              <div className={"rrow" + (a.userId === me.userId ? " me" : "")} key={a.userId}>
                <span className="pos">{i + 1}</span>
                <span className="rn">
                  <span className="av">{a.initials}</span>
                  <span className="rnm">{a.userId === me.userId ? "Você" : a.name}</span>
                </span>
                <span className="sc">{a.identityScore}</span>
              </div>
            ))}
          </div>

          {myPos < 0 ? (
            <section className="acard">
              <p className="uplmsg" style={{ margin: 0 }}>
                Você ainda não está no ranking — envie suas corridas para calibrar seu score e entrar na disputa.
              </p>
            </section>
          ) : null}
        </>
      )}

      <BottomNav active="liga" />
    </main>
  );
}
