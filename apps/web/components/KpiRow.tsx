import type { DashboardKpis } from "@/lib/types";

export function KpiRow({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="kpis tnum">
      <div className="kpi">
        <div className="k">Alunos ativos</div>
        <div className="v">
          {kpis.activePct}
          <span className="u">%</span>
        </div>
        <div className="d up">
          {kpis.activeCount} de {kpis.totalCount} · +{kpis.activeDeltaWeek} na semana
        </div>
      </div>

      <div className="kpi alert">
        <div className="k">Precisam de atenção</div>
        <div className="v">{kpis.needAttention}</div>
        <div className="d warn">
          {kpis.sumidos} sumidos · {kpis.emQueda} em queda
        </div>
      </div>

      <div className="kpi">
        <div className="k">Evolução da turma</div>
        <div className="v">
          {kpis.evolvedPct}
          <span className="u">%</span>
        </div>
        <div className="d up">evoluíram no mês</div>
      </div>

      <div className="kpi">
        <div className="k">Cartas compartilhadas</div>
        <div className="v">{kpis.cardsShared}</div>
        <div className="d up">+{kpis.cardsSharedDelta} no mês</div>
      </div>

      <div className="kpi">
        <div className="k">Alunos novos via marca</div>
        <div className="v">{kpis.newAthletesViaBrand}</div>
        <div className="d up">pelos perfis públicos</div>
      </div>
    </div>
  );
}
