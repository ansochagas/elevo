import type { DashboardKpis } from "@/lib/types";

export function BrandReach({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="panel marca">
      <div className="ph">
        <h2>Alcance da marca</h2>
      </div>
      <div className="mrow tnum">
        <span className="mk">Cartas compartilhadas</span>
        <span className="mv">
          {kpis.cardsShared}
          <span className="dd">+{kpis.cardsSharedDelta}</span>
        </span>
      </div>
      <div className="mrow tnum">
        <span className="mk">Cliques nos perfis públicos</span>
        <span className="mv">
          {kpis.profileClicks.toLocaleString("pt-BR")}
          <span className="dd">+{kpis.profileClicksDeltaPct}%</span>
        </span>
      </div>
      <div className="mrow tnum">
        <span className="mk">Alunos novos gerados</span>
        <span className="mv">
          {kpis.newAthletesViaBrand}
          <span className="dd">no mês</span>
        </span>
      </div>
    </div>
  );
}
