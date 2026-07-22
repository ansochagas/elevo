import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAssessoriaOf, getAthletesOf, type RealAthlete } from "@/lib/data";
import { CoachShell } from "@/components/CoachShell";

const STATUS_LABEL: Record<RealAthlete["status"], { label: string; cls: string }> = {
  evoluindo: { label: "Evoluindo", cls: "c-evo" },
  estavel: { label: "Estável", cls: "c-est" },
  atencao: { label: "Atenção", cls: "c-att" },
  sumido: { label: "Sumido", cls: "c-sum" },
  "sem-dados": { label: "Sem corridas", cls: "c-est" },
};

const daysAgo = (d: Date | null) => {
  if (!d) return "—";
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  return `há ${days} dias`;
};

export default async function AlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ desvinculado?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") redirect("/ir");
  const assessoria = await getAssessoriaOf(session.user.id);
  if (!assessoria) redirect("/ir");
  const athletes = await getAthletesOf(assessoria.id);
  const { desvinculado } = await searchParams;

  return (
    <CoachShell assessoriaName={assessoria.name} coachName={session.user.name ?? ""} active="alunos">
      {desvinculado ? <div className="notice ok">Aluno desvinculado. A conta e o histórico continuam sendo dele.</div> : null}
      <div className="panel roster">
        <div className="ph">
          <h2>Alunos · {athletes.length}</h2>
          <Link href="/alunos/novo" className="btnp" style={{ textDecoration: "none" }}>+ Adicionar aluno</Link>
        </div>
        {athletes.length === 0 ? (
          <div className="emptybox">
            <div className="big">Sua turma começa aqui</div>
            <p>Adicione seu primeiro aluno: você recebe um link de convite para mandar no WhatsApp dele — ele cria a senha, autoriza o acompanhamento e envia as corridas.</p>
            <Link href="/alunos/novo" className="btnp" style={{ textDecoration: "none" }}>Adicionar meu primeiro aluno</Link>
          </div>
        ) : (
          <div className="rosterwrap">
            <table className="tnum">
              <thead>
                <tr><th>Atleta</th><th>Score</th><th>Última corrida</th><th>Convite</th><th className="r">Situação</th></tr>
              </thead>
              <tbody>
                {athletes.map((a) => {
                  const s = STATUS_LABEL[a.status];
                  return (
                    <tr key={a.userId}>
                      <td>
                        <Link href={`/alunos/${a.userId}`} style={{ textDecoration: "none", color: "inherit" }}>
                          <div className="ath">
                            <div className="a">{a.initials}</div>
                            <div>
                              <div className="an">{a.name}</div>
                              <div className="al">{a.cleanCount} corridas{a.calibrating ? " · calibrando" : ""}</div>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td>
                        {a.identityScore !== null ? (
                          <>
                            <span className="score">{a.identityScore}</span>{" "}
                            {a.delta !== null && a.delta !== 0 ? (
                              <span className={`delta ${a.delta > 0 ? "up" : "down"}`}>{a.delta > 0 ? `+${a.delta}` : a.delta}</span>
                            ) : null}
                          </>
                        ) : (
                          <span className="delta flat">—</span>
                        )}
                      </td>
                      <td style={{ color: "var(--t2)" }}>
                        {daysAgo(a.lastRunAt)}
                        {a.lastRunKm ? ` · ${a.lastRunKm.toFixed(1).replace(".", ",")} km` : ""}
                      </td>
                      <td style={{ color: "var(--t2)", fontSize: 12 }}>{a.invitePending ? "pendente" : a.consentAt ? "ativo" : "—"}</td>
                      <td className="r"><span className={`chip ${s.cls}`}>{s.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CoachShell>
  );
}
