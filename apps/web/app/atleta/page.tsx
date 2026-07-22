import Link from "next/link";
import { athlete, ATTR_LABEL, type AthAttrKey } from "@/lib/athlete";
import { AreaChart } from "@/components/charts";
import { BottomNav } from "@/components/athlete/BottomNav";

const ATTR_ORDER: AthAttrKey[] = ["ritmo", "resistencia", "regularidade", "finalizacao", "subida", "evolucao"];

export default function AtletaPage() {
  const a = athlete;
  return (
    <main className="ashell">
      <h1 className="sr-only">Perfil do corredor {a.name}</h1>

      <header className="atop">
        <div className="brand">
          <span className="g">E</span>Elevo
        </div>
        <span className="set" aria-label="Configurações">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </span>
      </header>

      <section className="ahero">
        <div className="who">
          <div className="mono">{a.initials}</div>
          <div>
            <div className="nm">{a.name}</div>
            <div className="loc">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" />
              </svg>
              {a.city}
            </div>
          </div>
          <div className="lvl">{a.level} · {a.archetype}</div>
        </div>
        <div className="scores tnum">
          <div className="sc">
            <div className="lab">Runner Score</div>
            <div className="v">{a.identityScore}</div>
          </div>
          <div className="sc form">
            <div className="lab">Forma atual</div>
            <div className="v">{a.formScore} <span className="up">↑</span></div>
          </div>
        </div>
      </section>

      <section className="acard">
        <h3>Atributos</h3>
        <div className="abars tnum">
          {ATTR_ORDER.map((k) => (
            <div className="ab" key={k}>
              <span className="l">{ATTR_LABEL[k]}</span>
              <span className="t"><span className="f" style={{ width: `${a.attributes[k]}%` }} /></span>
              <span className="val">{a.attributes[k]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="acard aevo">
        <h3>Evolução</h3>
        <div className="big tnum">
          <span className="n">+48</span>
          <span className="lb">no último trimestre · em ascensão</span>
        </div>
        <AreaChart points={a.evolution} color="var(--ac)" label="Evolução do seu Runner Score" />
      </section>

      <section className="acard">
        <div className="avar">
          <span className="ic">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4" /><path d="M5 4h12l-2.5 4L17 12H5" /></svg>
          </span>
          <div>
            <div className="t">Última corrida · {a.lastRun.distanceKm.toFixed(1).replace(".", ",")} km</div>
            <div className="p">{a.lastRun.analysis}</div>
          </div>
        </div>
      </section>

      <Link href="/atleta/pos-corrida" className="ashare">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M12 15V3" /><path d="M8 7l4-4 4 4" /></svg>
        Compartilhar minha carta
      </Link>

      <BottomNav active="perfil" />
    </main>
  );
}
