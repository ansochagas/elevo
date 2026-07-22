import type { AthleteStatus, CoachAthlete } from "@/lib/types";
import { Sparkline } from "./charts";

const STATUS: Record<AthleteStatus, { label: string; cls: string; spark: string; dashed?: boolean }> = {
  evoluindo: { label: "Evoluindo", cls: "c-evo", spark: "var(--evo)" },
  estavel: { label: "Estável", cls: "c-est", spark: "var(--t2)" },
  atencao: { label: "Atenção", cls: "c-att", spark: "var(--att)" },
  sumido: { label: "Sumido", cls: "c-sum", spark: "var(--t3)", dashed: true },
};

function deltaEl(delta: number | null) {
  if (delta === null) return <span className="delta flat">—</span>;
  if (delta > 0) return <span className="delta up">+{delta}</span>;
  if (delta < 0) return <span className="delta down">{delta}</span>;
  return <span className="delta flat">+0</span>;
}

export function Roster({ roster, total }: { roster: CoachAthlete[]; total: number }) {
  return (
    <div className="panel roster">
      <div className="ph">
        <h2>Atletas</h2>
        <span className="lk">Ver todos · {total}</span>
      </div>
      <div className="rosterwrap">
        <table className="tnum">
          <thead>
            <tr>
              <th>Atleta</th>
              <th>Score</th>
              <th>30 dias</th>
              <th>Última corrida</th>
              <th className="r">Situação</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((a) => {
              const s = STATUS[a.status];
              return (
                <tr key={a.id}>
                  <td>
                    <div className="ath">
                      <div className="a">{a.initials}</div>
                      <div>
                        <div className="an">{a.name}</div>
                        <div className="al">{a.level}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="score">{a.score}</span> {deltaEl(a.delta)}
                  </td>
                  <td>
                    <Sparkline points={a.trend} color={s.spark} dashed={s.dashed} />
                  </td>
                  <td style={{ color: "var(--t2)" }}>{a.lastRun}</td>
                  <td className="r">
                    <span className={`chip ${s.cls}`}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
