import type { AtRiskAthlete } from "@/lib/types";

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--att)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}

function WhatsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20l1.4-4A8 8 0 1 1 9 19.6L4 20z" />
    </svg>
  );
}

export function AttentionCenter({ atRisk }: { atRisk: AtRiskAthlete[] }) {
  return (
    <div className="panel">
      <div className="ph">
        <h2>
          <AlertIcon />
          Precisam de atenção · aja agora
        </h2>
        <span className="cnt">{atRisk.length}</span>
      </div>
      {atRisk.map((a) => (
        <div className="arow" key={a.id}>
          <div className="av">{a.initials}</div>
          <div className="info">
            <div className="an">{a.name}</div>
            <div className={`rz ${a.kind}`}>
              <span className="dot" />
              {a.reason}
            </div>
          </div>
          <button className="act" type="button">
            <WhatsIcon />
            Falar
          </button>
        </div>
      ))}
    </div>
  );
}
