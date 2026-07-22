import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAssessoriaOf, getAthleteDetail } from "@/lib/data";
import { regenerateInvite, unlinkAthlete, updateAthlete } from "@/lib/actions";
import { CoachShell } from "@/components/CoachShell";
import { UploadButton } from "@/components/UploadButton";
import { EvolutionChart } from "@/components/charts";
import { NumbersBlock, RecordsBlock, ExplainedAttributes, FocusBlock } from "@/components/Kpis";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
const paceStr = (movingSec: number, km: number) => {
  if (km <= 0) return "—";
  const p = movingSec / 60 / km;
  const m = Math.floor(p);
  const s = Math.round((p - m) * 60);
  return `${m}:${String(s === 60 ? 0 : s).padStart(2, "0")}/km`;
};

export default async function AlunoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ novo?: string; ok?: string; convite?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "coach") redirect("/ir");
  const assessoria = await getAssessoriaOf(session.user.id);
  if (!assessoria) redirect("/ir");
  const { id } = await params;
  const flags = await searchParams;

  const a = await getAthleteDetail(id);
  if (!a || a.assessoriaId !== assessoria.id) notFound();

  const attrs = (a.latest?.attributes ?? null) as Record<string, number | null> | null;
  const inviteUrl = a.inviteToken ? `/convite/${a.inviteToken}` : null;
  const waHref = a.phone
    ? `https://wa.me/${a.phone.startsWith("55") ? a.phone : `55${a.phone}`}`
    : null;

  return (
    <CoachShell assessoriaName={assessoria.name} coachName={session.user.name ?? ""} logoUrl={assessoria.logoUrl} active="alunos">
      {flags.novo ? <div className="notice ok">Aluno criado! Mande o link de convite abaixo para ele ativar a conta.</div> : null}
      {flags.ok ? <div className="notice ok">Dados atualizados.</div> : null}
      {flags.convite ? <div className="notice ok">Novo convite gerado — o link antigo deixou de valer.</div> : null}

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="ph">
          <h2>
            <span className="ath" style={{ gap: 12 }}>
              <span className="a">{a.initials}</span>
              {a.name}
            </span>
          </h2>
          <span style={{ display: "flex", gap: 10 }}>
            {waHref ? (
              <a className="btns" href={waHref} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
            ) : null}
            <Link className="btns" href="/alunos">← Alunos</Link>
          </span>
        </div>

        {inviteUrl ? (
          <div className="invitebox">
            <div className="t">Convite pendente — mande este link para o aluno</div>
            <code>https://elevo-liart.vercel.app{inviteUrl}</code>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {waHref ? (
                <a
                  className="btns"
                  href={`${waHref}?text=${encodeURIComponent(`Oi, ${a.name.split(" ")[0]}! Te adicionei na Elevo, o app de evolução da ${assessoria.name}. Ativa tua conta aqui: https://elevo-liart.vercel.app${inviteUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enviar no WhatsApp
                </a>
              ) : null}
              <form action={regenerateInvite}>
                <input type="hidden" name="userId" value={a.userId} />
                <button className="btns" type="submit">Gerar novo link</button>
              </form>
            </div>
          </div>
        ) : null}

        {a.latest ? (
          <div className="scores tnum" style={{ display: "flex", gap: 26, alignItems: "flex-end", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--t3)", fontWeight: 600 }}>Runner Score</div>
              <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1 }}>
                {a.calibrating ? <span style={{ color: "var(--t2)" }}>calibrando…</span> : a.latest.identityScore}
              </div>
            </div>
            {a.latest.formScore !== null && !a.calibrating ? (
              <div style={{ paddingBottom: 4 }}>
                <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--t3)", fontWeight: 600 }}>Forma</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: "var(--ac)" }}>{a.latest.formScore}</div>
              </div>
            ) : null}
            <div style={{ paddingBottom: 6, color: "var(--t2)", fontSize: 12.5 }}>
              {a.cleanCount} corridas válidas{a.calibrating ? ` · faltam ${Math.max(0, 8 - a.cleanCount)} para o score` : ""}
            </div>
          </div>
        ) : (
          <div className="emptybox" style={{ padding: "24px 10px" }}>
            <div className="big">Aguardando as primeiras corridas</div>
            <p>Envie o export do Strava (ZIP) ou arquivos .gpx/.fit — ou peça ao aluno para enviar pelo app dele.</p>
          </div>
        )}
        <UploadButton targetUserId={a.userId} label="Enviar corridas por ele" />
      </div>

      {a.cleanCount > 0 ? (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="ph"><h2>Números de {a.name.split(" ")[0]}</h2></div>
          {a.load.status !== "sem-dados" ? (
            <div className={`loadline ${a.load.status}`}>
              <span className="dot" />
              <span className="lb">Carga de treino</span>
              {a.load.note}
            </div>
          ) : null}
          <NumbersBlock m={a.metrics} />
          {a.metrics.records.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              <div className="ph"><h2>Recordes</h2></div>
              <RecordsBlock m={a.metrics} />
            </div>
          ) : null}
        </div>
      ) : null}

      {attrs && !a.calibrating ? (
        <div className="grid" style={{ marginBottom: 14 }}>
          <div className="panel">
            <div className="ph"><h2>Atributos — e o porquê de cada um</h2></div>
            <ExplainedAttributes attrs={attrs} explanations={a.explanations} />
          </div>
          <div className="panel evo">
            <div className="ph"><h2>Evolução do Runner Score</h2></div>
            {a.timeline.length >= 2 ? (
              <EvolutionChart points={a.timeline} label={`Evolução do Runner Score de ${a.name}`} />
            ) : (
              <p className="uplmsg">Com mais alguns meses de corridas, a linha de evolução aparece aqui.</p>
            )}
          </div>
        </div>
      ) : null}

      {attrs && !a.calibrating && (a.focus || a.changes.improved.length > 0 || a.changes.declined.length > 0) ? (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="ph"><h2>Leitura de treino · onde mirar</h2></div>
          <FocusBlock focus={a.focus} changes={a.changes} coachView firstName={a.name.split(" ")[0]} />
        </div>
      ) : null}

      <div className="panel roster" style={{ marginBottom: 14 }}>
        <div className="ph"><h2>Corridas · {a.activities.length}</h2></div>
        {a.activities.length === 0 ? (
          <p className="uplmsg">Nenhuma corrida ainda.</p>
        ) : (
          <div className="rosterwrap">
            <table className="tnum">
              <thead><tr><th>Data</th><th>Distância</th><th>Ritmo</th><th className="r">Situação</th></tr></thead>
              <tbody>
                {a.activities.slice(0, 25).map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: "var(--t2)" }}>{fmtDate(r.start)}</td>
                    <td>{r.distanceKm.toFixed(1).replace(".", ",")} km</td>
                    <td>{paceStr(r.movingSec, r.distanceKm)}</td>
                    <td className="r">
                      {r.flaggedReason ? (
                        <span className="chip c-att">{r.flaggedReason}</span>
                      ) : (
                        <span className="chip c-evo">válida</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid">
        <div className="panel">
          <div className="ph"><h2>Editar dados</h2></div>
          <form action={updateAthlete}>
            <input type="hidden" name="userId" value={a.userId} />
            <div className="field">
              <label htmlFor="name">Nome</label>
              <input id="name" name="name" defaultValue={a.name} required />
            </div>
            <div className="field">
              <label htmlFor="phone">WhatsApp</label>
              <input id="phone" name="phone" defaultValue={a.phone ?? ""} placeholder="85 99999-9999" />
            </div>
            <button className="btnp" type="submit">Salvar</button>
          </form>
        </div>
        <div className="panel">
          <div className="ph"><h2>Desvincular da assessoria</h2></div>
          <p className="uplmsg" style={{ marginBottom: 14 }}>
            O aluno sai da sua turma, mas a conta e o histórico continuam sendo dele — a identidade pertence ao corredor.
          </p>
          <form action={unlinkAthlete}>
            <input type="hidden" name="userId" value={a.userId} />
            <button className="btnd" type="submit">Desvincular aluno</button>
          </form>
        </div>
      </div>
    </CoachShell>
  );
}
