import { attributeTier, type RunnerMetrics, type FocusArea, type AttrChange } from "@elevo/engine";
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
        <div className="v">{m.activeWeekStreak}<span className="u">sem</span></div>
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

/** Faixa (tier) → cor da barra, para o número ganhar significado visual. */
const TIER_CLASS: Record<string, string> = {
  Iniciante: "t-ini",
  "Em desenvolvimento": "t-dev",
  Bom: "t-bom",
  Forte: "t-forte",
  Avançado: "t-adv",
};

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
      <p className="scalenote">
        Cada atributo é uma nota de <strong>0 a 100</strong>, calculada a partir das suas próprias corridas —
        não é comparação com outras pessoas. As faixas: 0–39 Iniciante · 40–54 Em desenvolvimento ·
        55–69 Bom · 70–82 Forte · 83–100 Avançado.
      </p>
      {ATTR_ORDER.map((k) => {
        const v = attrs[k];
        const tier = typeof v === "number" ? attributeTier(v) : null;
        return (
          <div className="abx" key={k}>
            <div className="row tnum">
              <span className="l">{ATTR_LABEL[k]}</span>
              <span className="t"><span className={`f ${tier ? TIER_CLASS[tier] : ""}`} style={{ width: `${v ?? 0}%` }} /></span>
              <span className="v">{v ?? "—"}</span>
            </div>
            <div className="abmeta">
              {tier ? <span className={`tier ${TIER_CLASS[tier]}`}>{tier}</span> : null}
              {explanations[k] ? <p className="why">{explanations[k]}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Bloco de FOCO — o que melhorou, o que caiu e onde mirar agora.
 * Responsabilidade científica: sugere direção genérica e SEMPRE remete ao treinador,
 * nunca prescreve ritmo/volume específico nem promete resultado.
 */
export function FocusBlock({
  focus,
  changes,
  coachView = false,
  firstName,
}: {
  focus: FocusArea | null;
  changes: { improved: AttrChange[]; declined: AttrChange[] };
  coachView?: boolean;
  firstName?: string;
}) {
  const { improved, declined } = changes;
  const hasCompare = improved.length > 0 || declined.length > 0;
  const who = coachView ? (firstName ?? "O aluno") : "Você";
  if (!focus && !hasCompare) return null;

  return (
    <div className="focus">
      {hasCompare ? (
        <div className="fcompare">
          {improved.length > 0 ? (
            <div className="fcol">
              <div className="fh up">▲ Melhorou desde a última leitura</div>
              <ul>
                {improved.slice(0, 3).map((c) => (
                  <li key={c.key}>
                    <span className="a">{ATTR_LABEL[c.key as AthAttrKey]}</span>
                    <span className="d up tnum">+{c.delta}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {declined.length > 0 ? (
            <div className="fcol">
              <div className="fh down">▼ Recuou desde a última leitura</div>
              <ul>
                {declined.slice(0, 3).map((c) => (
                  <li key={c.key}>
                    <span className="a">{ATTR_LABEL[c.key as AthAttrKey]}</span>
                    <span className="d down tnum">{c.delta}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="uplmsg" style={{ margin: "0 0 12px" }}>
          Quando houver uma leitura anterior para comparar, o que melhorou e o que recuou aparece aqui.
        </p>
      )}

      {focus ? (
        <div className="ftarget">
          <div className="k">Onde focar agora</div>
          <div className="v">
            {ATTR_LABEL[focus.key as AthAttrKey]} <span className="tag">{focus.score} · {focus.tier}</span>
          </div>
          <p className="hint">
            É {coachView ? "o atributo mais baixo do aluno" : "seu atributo mais baixo"} hoje — o de maior espaço para crescer. {focus.hint}
          </p>
          <p className="coachnote">
            {coachView
              ? "Use como ponto de partida da conversa de treino — o número mostra onde, você define o como."
              : "Converse com seu treinador sobre isso: ele traduz esse número no treino certo para você."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
