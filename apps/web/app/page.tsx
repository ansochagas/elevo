import { dashboard } from "@/lib/mock-data";
import { KpiRow } from "@/components/KpiRow";
import { AttentionCenter } from "@/components/AttentionCenter";
import { TeamEvolution } from "@/components/TeamEvolution";
import { BrandReach } from "@/components/BrandReach";
import { Roster } from "@/components/Roster";

export default function PainelPage() {
  const d = dashboard;
  return (
    <main className="app">
      <h1 className="sr-only">Painel da assessoria {d.assessoria.name}</h1>
      <div className="frame">
        <header className="top">
          <div className="g">{d.assessoria.initials}</div>
          <div>
            <div className="nm">{d.assessoria.name}</div>
            <div className="sub">Painel do treinador · {d.assessoria.athleteCount} atletas</div>
          </div>
          <div className="who">
            <div className="av">{d.coach.initials}</div>
            <div>
              <div className="cn">{d.coach.name}</div>
              <div className="cr">Treinador</div>
            </div>
          </div>
        </header>

        <div className="body">
          <KpiRow kpis={d.kpis} />

          <div className="grid">
            <AttentionCenter atRisk={d.atRisk} />
            <div className="rstack">
              <TeamEvolution data={d} />
              <BrandReach kpis={d.kpis} />
            </div>
          </div>

          <Roster roster={d.roster} total={d.assessoria.athleteCount} />
        </div>
      </div>
      <p className="foot">
        Painel ilustrativo (direção Núcleo, verde menta). Dados de exemplo — o score/forma de cada atleta virá do
        motor @elevo/engine quando ligado a dados reais.
      </p>
    </main>
  );
}
