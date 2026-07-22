import type { DashboardData } from "@/lib/types";
import { AreaChart } from "./charts";

export function TeamEvolution({ data }: { data: DashboardData }) {
  const { kpis, teamEvolution } = data;
  return (
    <div className="panel evo">
      <div className="ph">
        <h2>Evolução da turma</h2>
      </div>
      <div className="big tnum">
        <span className="n">{kpis.evolvedPct}%</span>
        <span className="lb">evoluíram este mês</span>
      </div>
      <div className="subm tnum">
        Score médio da turma: <b>{kpis.teamAvgScore}</b>{" "}
        <span className="up">+{kpis.teamAvgDeltaQuarter} no trimestre</span>
      </div>
      <AreaChart points={teamEvolution} color="var(--evo)" label="Evolução do score médio da turma" />
    </div>
  );
}
