import { ImageResponse } from "next/og";

const AC = "#74d2ac";
const BG = "#0a0b0d";

export type CartaSkin = "nucleo" | "arena" | "movimento";

const ATTRS: [string, string, string][] = [
  ["Ritmo", "RIT", "ritmo"],
  ["Resistência", "RES", "resistencia"],
  ["Regularidade", "REG", "regularidade"],
  ["Finalização", "FIN", "finalizacao"],
  ["Subida", "SUB", "subida"],
  ["Evolução", "EVO", "evolucao"],
];

export interface CartaImgData {
  firstName: string;
  brand: string;
  /** Runner Score de identidade (mesmo número do topo do app, ex.: 520) */
  score: number;
  level: string | null;
  archetype: string | null;
  city: string | null;
  attrs: Record<string, number | null>;
}

const val = (attrs: Record<string, number | null>, k: string) => {
  const v = attrs[k];
  return typeof v === "number" ? v : 0;
};

/** Skin Núcleo — premium escuro (identidade do app). */
function nucleo(d: CartaImgData) {
  const subtitle = [d.level, d.archetype, d.city].filter(Boolean).join(" · ") || "Corredor";
  return (
    <div style={{ width: "1080px", height: "1350px", display: "flex", flexDirection: "column", background: `radial-gradient(1200px 900px at 50% -10%, #12352b 0%, ${BG} 55%)`, color: "#eef1f4", fontFamily: "sans-serif", padding: "72px 76px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 700 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: AC, color: "#062720", marginRight: 16, fontSize: 38, fontWeight: 800 }}>E</span>
          Elevo
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#9aa4af", fontWeight: 600 }}>{d.brand}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 96 }}>
        <div style={{ display: "flex", fontSize: 30, letterSpacing: "0.28em", textTransform: "uppercase", color: "#9aa4af", fontWeight: 700 }}>Runner Score</div>
        <div style={{ display: "flex", fontSize: 300, fontWeight: 800, color: AC, lineHeight: 1, letterSpacing: "-0.04em", marginTop: 8 }}>{d.score}</div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, marginTop: 24 }}>{d.firstName}</div>
        <div style={{ display: "flex", fontSize: 28, color: "#9aa4af", marginTop: 8 }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 90 }}>
        {ATTRS.map(([label, , key]) => {
          const w = val(d.attrs, key);
          return (
            <div key={key} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", width: 320, fontSize: 30, color: "#c2cad2", fontWeight: 500 }}>{label}</div>
              <div style={{ display: "flex", flex: 1, height: 16, background: "#1b1f24", borderRadius: 10, marginRight: 22 }}>
                <div style={{ display: "flex", width: `${w}%`, height: 16, background: AC, borderRadius: 10 }} />
              </div>
              <div style={{ display: "flex", width: 70, fontSize: 32, fontWeight: 700, justifyContent: "flex-end" }}>{w}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
        <div style={{ display: "flex", fontSize: 30, color: "#eef1f4", fontWeight: 600 }}>Descubra o corredor que você está se tornando.</div>
        <div style={{ display: "flex", fontSize: 24, color: AC, marginTop: 10, fontWeight: 600 }}>elevo-liart.vercel.app</div>
      </div>
    </div>
  );
}

/** Skin Arena — carta metálica estilo colecionável. */
function arena(d: CartaImgData) {
  const initials = d.firstName.slice(0, 2).toUpperCase();
  return (
    <div style={{ width: "1080px", height: "1350px", display: "flex", background: "linear-gradient(150deg,#dfe6ee,#aeb9c6 34%,#e9eff5 52%,#9aa6b4 74%,#c8d1dc)", color: "#141b26", fontFamily: "sans-serif", padding: "60px" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, border: "3px solid rgba(20,27,38,.4)", borderRadius: 28, padding: "56px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 200, fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.04em" }}>{d.score}</div>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: "0.1em", marginTop: 6 }}>SCORE{d.level ? ` · ${d.level.toUpperCase()}` : ""}</div>
            {d.archetype ? <div style={{ display: "flex", fontSize: 26, fontWeight: 600, opacity: 0.72, marginTop: 10, textTransform: "uppercase" }}>{d.archetype}</div> : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 118, height: 118, borderRadius: "50%", border: "4px solid rgba(20,27,38,.5)", fontSize: 46, fontWeight: 800 }}>{initials}</div>
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 800, letterSpacing: "-0.02em", marginTop: "auto", paddingBottom: 28, borderBottom: "3px solid rgba(20,27,38,.32)" }}>{d.firstName.toUpperCase()}</div>
        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 34 }}>
          {ATTRS.map(([, abbr, key]) => (
            <div key={key} style={{ display: "flex", width: "33%", alignItems: "baseline", marginBottom: 26 }}>
              <div style={{ display: "flex", fontSize: 60, fontWeight: 800 }}>{val(d.attrs, key)}</div>
              <div style={{ display: "flex", fontSize: 26, fontWeight: 700, opacity: 0.62, marginLeft: 10 }}>{abbr}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em" }}>ELEVO</div>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, opacity: 0.7 }}>{d.brand}</div>
        </div>
      </div>
    </div>
  );
}

/** Skin Movimento — vibrante, cultural (Nike/Wrapped). */
function movimento(d: CartaImgData) {
  return (
    <div style={{ width: "1080px", height: "1350px", display: "flex", flexDirection: "column", background: "linear-gradient(142deg,#ff2d8e,#ff5230 52%,#ffab1f)", color: "#2a0710", fontFamily: "sans-serif", padding: "80px 76px" }}>
      <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" }}>{d.brand}</div>
      <div style={{ display: "flex", fontSize: 320, fontWeight: 800, color: "#fff6ee", lineHeight: 0.82, letterSpacing: "-0.05em", marginTop: 40 }}>{d.score}</div>
      <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 16 }}>Runner Score</div>
      <div style={{ display: "flex", fontSize: 96, fontWeight: 800, color: "#fff6ee", textTransform: "uppercase", letterSpacing: "-0.03em", marginTop: 40 }}>{d.firstName}</div>
      {d.city ? <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 14, opacity: 0.82 }}>{d.city}</div> : null}
      <div style={{ display: "flex", marginTop: "auto" }}>
        {(["resistencia", "evolucao", "subida"] as const).map((key) => {
          const abbr = key === "resistencia" ? "RES" : key === "evolucao" ? "EVO" : "SUB";
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", background: "rgba(42,7,16,.86)", color: "#ffdca8", fontSize: 32, fontWeight: 700, padding: "14px 24px", borderRadius: 40, marginRight: 16 }}>
              {abbr}
              <span style={{ display: "flex", color: "#fff", fontWeight: 800, marginLeft: 10 }}>{val(d.attrs, key)}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", fontSize: 26, fontWeight: 800, marginTop: 34, letterSpacing: "0.04em" }}>ELEVO · elevo-liart.vercel.app</div>
    </div>
  );
}

/** Card de compartilhamento da carta (PNG 1080x1350) na skin escolhida. */
export function cartaImageResponse(d: CartaImgData, skin: CartaSkin = "nucleo") {
  const tree = skin === "arena" ? arena(d) : skin === "movimento" ? movimento(d) : nucleo(d);
  return new ImageResponse(tree, { width: 1080, height: 1350 });
}
