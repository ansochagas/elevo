import type { RunnerMetrics } from "@elevo/engine";
import { ATTR_LABEL, type AthAttrKey } from "@/lib/athlete";

const ATTR_ORDER: AthAttrKey[] = ["ritmo", "resistencia", "regularidade", "finalizacao", "subida", "evolucao"];

const km = (n: number) => n.toFixed(n >= 100 ? 0 : 1).replace(".", ",");
const paceStr = (p?: number) => {
  if (p == null) return "—";
  const m = Math.floor(p);
  const s = Math.round((p - m) * 60);
  return `${m}:${String(s === 60 ? 0 : s).padStart(2, "0")}`;
};
const timeStr = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  return h > 0
    ? `${h}h${String(m).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
};

/** Bloco "Seus números" — volume, consistência, comparação mês a mês. */
export function NumbersBlock({ m }: { m: RunnerMetrics }) {
  const deltaMonth = m.kmThisMonth - m.kmLastMonth;
  return (
    <div className="numgrid tnum">
      <div className="numtile">
        <div className="k">Este mês</div>
        <div className="v">{km(m.kmThisMonth)}<span className="u">km</span></div>
        {m.kmLastMonth > 0 ? (
          <div className={`d ${deltaMonth >= 0 ? "up" : "down"}`}>
            {deltaMonth >= 0 ? "+" : ""}{km(deltaMonth)} km vs. mês passado
          </div>
        ) : null}
      </div>
      <div className="numtile">
        <div className="k">Total acumulado</div>
        <div className="v">{km(m.totalKm)}<span className="u">km</span></div>
        <div className="d flat" style={{ color: "var(--t3)" }}>{m.totalRuns} corridas</div>
      </div>
      <div className="numtile">
        <div className="k">Sequência ativa</div>
        <div className="v">{m.activeWeekStreak}<span className="u">{m.activeWeekStreak === 1 ? "sem" : "sem"}</span></div>
        <div className="d flat" style={{ color: "var(--t3)" }}>semanas seguidas correndo</div>
      </div>
      <div className="numtile">
        <div className="k">Corrida mais longa</div>
        <div className="v">{km(m.longestKm)}<span className="u">km</span></div>
      </div>
    </div>
  );
}

/** Recordes pessoais (melhor 5k/10k, mais longa). */
export function RecordsBlock({ m }: { m: RunnerMetrics }) {
  return (
    <div className="recs tnum">
      {m.records.map((r) => (
        <div className="rec" key={r.label}>
          <div className="k">Melhor {r.label}</div>
          <div className="v">
            {r.paceMinKm != null ? `${paceStr(r.paceMinKm)}/km` : `${km(r.distanceKm ?? 0)} km`}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Previsão de tempo de prova (estimativa, fórmula de Riegel). */
export function PredictionsBlock({
  predictions,
}: {
  predictions: { label: string; distanceKm: number; timeSec: number }[];
}) {
  if (predictions.length === 0) return null;
  return (
    <div className="preds tnum">
      {predictions.map((p) => (
        <div className="pred" key={p.label}>
          <span className="d">{p.label}</span>
          <span className="t">{timeStr(p.timeSec)}</span>
        </div>
      ))}
      <p className="uplmsg" style={{ marginTop: 4 }}>
        Estimativa a partir do seu melhor ritmo — não é uma promessa, é uma referência de onde você está.
      </p>
    </div>
  );
}

/** Atributos com a EXPLICAÇÃO do porquê de cada número (o diferencial). */
export function ExplainedAttributes({
  attrs,
  explanations,
}: {
  attrs: Record<string, number | null>;
  explanations: Record<string, string>;
}) {
  return (
    <div>
      {ATTR_ORDER.map((k) => {
        const v = attrs[k];
        return (
          <div className="abx" key={k}>
            <div className="row tnum">
              <span className="l">{ATTR_LABEL[k]}</span>
              <span className="t"><span className="f" style={{ width: `${v ?? 0}%` }} /></span>
              <span className="v">{v ?? "—"}</span>
            </div>
            {explanations[k] ? <p className="why">{explanations[k]}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
