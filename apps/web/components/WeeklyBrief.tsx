import type { AthleteBrief } from "@/lib/intelligence/generate";

/** Raio-x da semana do aluno (visão do treinador). Leitura ancorada nos dados. */
export function WeeklyBrief({ brief }: { brief: AthleteBrief }) {
  return (
    <div className="panel brief">
      <div className="ph">
        <h2>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>
          Raio-x da semana
        </h2>
        <span className={`briefsrc ${brief.source}`}>{brief.source === "ia" ? "IA ancorada" : "leitura base"}</span>
      </div>

      <p className="brief-hl">{brief.headline}</p>

      {brief.reading ? (
        <>
          <div className="brief-lb">Leitura · foco em {brief.focus}</div>
          <p className="brief-txt">{brief.reading}</p>
        </>
      ) : null}

      {brief.watch.length ? (
        <>
          <div className="brief-lb">Para observar</div>
          <ul className="brief-watch">
            {brief.watch.map((w, i) => (
              <li key={i}><span className="d" />{w}</li>
            ))}
          </ul>
        </>
      ) : null}

      {brief.evidence.length ? (
        <>
          <div className="brief-lb">Base · auditável</div>
          <div className="brief-ev tnum">
            {brief.evidence.map((e, i) => (
              <span key={i}>{e}</span>
            ))}
          </div>
        </>
      ) : null}

      <p className="brief-note">{brief.coachNote}</p>
    </div>
  );
}
