import { ImageResponse } from "next/og";
import { auth } from "@/auth";
import { getAthleteDetail } from "@/lib/data";

export const runtime = "nodejs";

const AC = "#74d2ac";
const BG = "#0a0b0d";
const ATTRS: [string, string][] = [
  ["Ritmo", "ritmo"],
  ["Resistência", "resistencia"],
  ["Regularidade", "regularidade"],
  ["Finalização", "finalizacao"],
  ["Subida", "subida"],
  ["Evolução", "evolucao"],
];

/** Gera a IMAGEM da carta (PNG) para compartilhar em Stories/WhatsApp. */
export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Não autenticado", { status: 401 });
  const a = await getAthleteDetail(session.user.id);
  if (!a || !a.latest || a.calibrating) {
    return new Response("Carta ainda não disponível", { status: 404 });
  }

  const attrs = (a.latest.attributes ?? {}) as Record<string, number | null>;
  const geral = a.latest.geral;
  const firstName = a.name.split(" ")[0] ?? a.name;
  const brand = a.assessoriaName ?? "Elevo";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1350px",
          display: "flex",
          flexDirection: "column",
          background: `radial-gradient(1200px 900px at 50% -10%, #12352b 0%, ${BG} 55%)`,
          color: "#eef1f4",
          fontFamily: "sans-serif",
          padding: "72px 76px",
        }}
      >
        {/* topo: marca */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em" }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 16,
                background: AC,
                color: "#062720",
                marginRight: 16,
                fontSize: 38,
                fontWeight: 800,
              }}
            >
              E
            </span>
            Elevo
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#9aa4af", fontWeight: 600 }}>{brand}</div>
        </div>

        {/* score central */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 96 }}>
          <div style={{ display: "flex", fontSize: 30, letterSpacing: "0.28em", textTransform: "uppercase", color: "#9aa4af", fontWeight: 700 }}>
            Runner Score
          </div>
          <div style={{ display: "flex", fontSize: 340, fontWeight: 800, color: AC, lineHeight: 1, letterSpacing: "-0.04em", marginTop: 8 }}>
            {geral}
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, marginTop: 24 }}>{firstName}</div>
          <div style={{ display: "flex", fontSize: 28, color: "#9aa4af", marginTop: 8 }}>
            {[a.level, a.archetype, a.city].filter(Boolean).join(" · ") || "Corredor"}
          </div>
        </div>

        {/* atributos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 90 }}>
          {ATTRS.map(([label, key]) => {
            const val = attrs[key];
            const w = typeof val === "number" ? Math.max(0, Math.min(100, val)) : 0;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", width: 320, fontSize: 30, color: "#c2cad2", fontWeight: 500 }}>{label}</div>
                <div style={{ display: "flex", flex: 1, height: 16, background: "#1b1f24", borderRadius: 10, marginRight: 22 }}>
                  <div style={{ display: "flex", width: `${w}%`, height: 16, background: AC, borderRadius: 10 }} />
                </div>
                <div style={{ display: "flex", width: 70, fontSize: 32, fontWeight: 700, justifyContent: "flex-end" }}>
                  {typeof val === "number" ? val : "—"}
                </div>
              </div>
            );
          })}
        </div>

        {/* rodapé */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ display: "flex", fontSize: 30, color: "#eef1f4", fontWeight: 600 }}>
            Descubra o corredor que você está se tornando.
          </div>
          <div style={{ display: "flex", fontSize: 24, color: AC, marginTop: 10, fontWeight: 600 }}>elevo-liart.vercel.app</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 },
  );
}
