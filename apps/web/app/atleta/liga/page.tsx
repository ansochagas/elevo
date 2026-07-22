import { rivalry, ranking, leagueName } from "@/lib/social";
import { BottomNav } from "@/components/athlete/BottomNav";

export default function LigaPage() {
  return (
    <main className="ashell">
      <h1 className="sr-only">Liga da {leagueName}</h1>
      <header className="atop">
        <div className="brand"><span className="g">E</span>Elevo</div>
        <span className="set" style={{ fontSize: 14, fontWeight: 600 }}>Liga · {leagueName}</span>
      </header>

      <div className="rival tnum">
        <div className="rh">Sua rivalidade</div>
        <div className="vs">
          <div className="p me"><div className="av">{rivalry.me.initials}</div><div className="pn">{rivalry.me.name}</div><div className="ps">{rivalry.me.score}</div></div>
          <div className="mid">VS</div>
          <div className="p"><div className="av">{rivalry.rival.initials}</div><div className="pn">{rivalry.rival.name}</div><div className="ps">{rivalry.rival.score}</div></div>
        </div>
        <div className="gap">{rivalry.rival.name} está {rivalry.gap} pontos à sua frente</div>
        <button className="rev" type="button">Aceitar revanche na próxima corrida</button>
      </div>

      <div className="rank tnum">
        <div className="rkh"><span className="tt">Ranking da turma</span></div>
        {ranking.map((r) => (
          <div className={"rrow" + (r.me ? " me" : "")} key={r.pos}>
            <span className="pos">{r.pos}</span>
            <span className="rn"><span className="av">{r.initials}</span><span className="rnm">{r.name}</span></span>
            <span className="sc">{r.score}</span>
          </div>
        ))}
      </div>

      <button className="challenge" type="button">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.3 2.6-5 5.5-5s5.5 1.7 5.5 5" /><path d="M18 8v6M15 11h6" /></svg>
        Desafiar um amigo
      </button>

      <BottomNav active="liga" />
    </main>
  );
}
