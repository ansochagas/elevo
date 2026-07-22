import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAssessoriaOf, getAthletesOf, type RealAthlete } from "@/lib/data";
import { CoachShell } from "@/components/CoachShell";

const DAY = 86_400_000;

const STATUS_LABEL: Record<RealAthlete["status"], { label: string; cls: string }> = {
  evoluindo: { label: "Evoluindo", cls: "c-evo" },
  estavel: { label: "Estável", cls: "c-est" },
  atencao: { label: "Atenção", cls: "c-att" },
  sumido: { label: "Sumido", cls: "c-sum" },
  "sem-dados": { label: "Sem corridas", cls: "c-est" },
};

const daysAgo = (d: Date | null) => {
  if (!d) return "—";
  const days = Math.floor((Date.now() - d.getTime()) / DAY);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  return `há ${days} dias`;
};

function riskReason(a: RealAthlete): string | null {
  if (a.status === "sumido" && a.lastRunAt) {
    const days = Math.floor((Date.now() - a.lastRunAt.getTime()) / DAY);
    return `Sem correr há ${days} dias · risco de desistir`;
  }
  if (a.status === "atencao" && a.delta !== null) {
    return `Score caiu ${Math.abs(a.delta)} pts`;
  }
  return null;
}

export default async function PainelPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "coach") redirect("/atleta");
  const assessoria = await getAssessoriaOf(session.user.id);
  if (!assessoria) redirect("/login");

  const athletes = await getAthletesOf(assessoria.id);
  const withData = athletes.filter((a) => a.cleanCount > 0);
  const ativos = athletes.filter(
    (a) => a.lastRunAt && Date.now() - a.lastRunAt.getTime() <= 7 * DAY,
  );
  const atRisk = athletes.filter((a) => a.status === "sumido" || a.status === "atencao");
  const scored = athletes.filter((a) => a.identityScore !== null && !a.calibrating);
  const evolving = scored.filter((a) => (a.delta ?? 0) > 0);
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, a) => s + (a.identityScore ?? 0), 0) / scored.length)
    : null;

  return (
    <CoachShell assessoriaName={assessoria.name} coachName={session.user.name ?? ""} active="painel">
      {athletes.length === 0 ? (
        <div className="panel">
          <div className="emptybox">
            <div className="big">Bem-vindo à Elevo, {session.user.name?.split(" ")[0]}!</div>
            <p>
              Seu painel ganha vida quando a turma entra. Adicione seu primeiro aluno — você recebe um link de
              convite para mandar no WhatsApp dele, e as corridas dele viram score, evolução e alertas aqui.
            </p>
            <Link href="/alunos/novo" className="btnp" style={{ textDecoration: "none" }}>
              Adicionar meu primeiro aluno
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="kpis tnum">
            <div className="kpi">
              <div className="k">Alunos ativos (7 dias)</div>
              <div className="v">
                {ativos.length}
                <span className="u">/{athletes.length}</span>
              </div>
              <div className="d flat">{withData.length} com corridas</div>
            </div>
            <div className={`kpi${atRisk.length ? " alert" : ""}`}>
              <div className="k">Precisam de atenção</div>
              <div className="v">{atRisk.length}</div>
              <div className={`d ${atRisk.length ? "warn" : "flat"}`}>
                {atRisk.filter((a) => a.status === "sumido").length} sumidos ·{" "}
                {atRisk.filter((a) => a.status === "atencao").length} em queda
              </div>
            </div>
            {scored.length > 0 ? (
              <div className="kpi">
                <div className="k">Evoluindo</div>
                <div className="v">
                  {evolving.length}
                  <span className="u">/{scored.length}</span>
                </div>
                <div className="d up">com score subindo</div>
              </div>
            ) : null}
            {avgScore !== null ? (
              <div className="kpi">
                <div className="k">Score médio da turma</div>
                <div className="v">{avgScore}</div>
                <div className="d flat">{scored.length} com score</div>
              </div>
            ) : null}
          </div>

          <div className="grid">
            <div className="panel">
              <div className="ph">
                <h2>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--att)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 9v4M12 17h.01" />
                    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                  </svg>
                  Precisam de atenção · aja agora
                </h2>
                {atRisk.length ? <span className="cnt">{atRisk.length}</span> : null}
              </div>
              {atRisk.length === 0 ? (
                <p className="uplmsg">Ninguém em risco agora — turma em dia. 👏</p>
              ) : (
                atRisk.map((a) => (
                  <div className="arow" key={a.userId}>
                    <div className="av">{a.initials}</div>
                    <div className="info">
                      <div className="an">{a.name}</div>
                      <div className={`rz ${a.status === "sumido" ? "sumido" : "queda"}`}>
                        <span className="dot" />
                        {riskReason(a)}
                      </div>
                    </div>
                    {a.phone ? (
                      <a
                        className="act"
                        href={`https://wa.me/${a.phone.startsWith("55") ? a.phone : `55${a.phone}`}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l1.4-4A8 8 0 1 1 9 19.6L4 20z" /></svg>
                        Falar
                      </a>
                    ) : (
                      <Link className="act" href={`/alunos/${a.userId}`}>Ver</Link>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="rstack">
              <div className="panel evo">
                <div className="ph"><h2>Pulso da turma</h2></div>
                {scored.length === 0 ? (
                  <p className="uplmsg">
                    Os scores aparecem quando os alunos tiverem 8+ corridas válidas. Envie os históricos para
                    acelerar a calibração.
                  </p>
                ) : (
                  <>
                    <div className="big tnum">
                      <span className="n">{evolving.length}</span>
                      <span className="lb">de {scored.length} evoluindo agora</span>
                    </div>
                    <div className="subm tnum">
                      Score médio: <b>{avgScore}</b>
                    </div>
                  </>
                )}
              </div>
              <div className="panel">
                <div className="ph"><h2>Ações rápidas</h2></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link className="btns" href="/alunos/novo">+ Adicionar aluno</Link>
                  <Link className="btns" href="/alunos">Ver todos os alunos</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="panel roster" style={{ marginTop: 14 }}>
            <div className="ph">
              <h2>Atletas</h2>
              <Link className="lk" href="/alunos" style={{ textDecoration: "none" }}>
                Ver todos · {athletes.length}
              </Link>
            </div>
            <div className="rosterwrap">
              <table className="tnum">
                <thead>
                  <tr><th>Atleta</th><th>Score</th><th>Última corrida</th><th className="r">Situação</th></tr>
                </thead>
                <tbody>
                  {athletes.slice(0, 8).map((a) => {
                    const s = STATUS_LABEL[a.status];
                    return (
                      <tr key={a.userId}>
                        <td>
                          <Link href={`/alunos/${a.userId}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <div className="ath">
                              <div className="a">{a.initials}</div>
                              <div>
                                <div className="an">{a.name}</div>
                                <div className="al">
                                  {a.cleanCount} corridas{a.calibrating ? " · calibrando" : ""}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td>
                          {a.identityScore !== null && !a.calibrating ? (
                            <>
                              <span className="score">{a.identityScore}</span>{" "}
                              {a.delta !== null && a.delta !== 0 ? (
                                <span className={`delta ${a.delta > 0 ? "up" : "down"}`}>
                                  {a.delta > 0 ? `+${a.delta}` : a.delta}
                                </span>
                              ) : null}
                            </>
                          ) : (
                            <span className="delta flat">{a.calibrating ? "calibrando" : "—"}</span>
                          )}
                        </td>
                        <td style={{ color: "var(--t2)" }}>
                          {daysAgo(a.lastRunAt)}
                          {a.lastRunKm ? ` · ${a.lastRunKm.toFixed(1).replace(".", ",")} km` : ""}
                        </td>
                        <td className="r"><span className={`chip ${s.cls}`}>{s.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </CoachShell>
  );
}
