interface SparklineProps {
  points: number[];
  color: string;
  width?: number;
  height?: number;
  dashed?: boolean;
}

export function Sparkline({ points, color, width = 70, height = 20, dashed = false }: SparklineProps) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const pad = 2;
  const step = width / (points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * step;
      const y = pad + (1 - (p - min) / range) * (height - 2 * pad);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden="true">
      <path
        d={d}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? "2 3" : undefined}
      />
    </svg>
  );
}

const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

interface EvoPoint {
  year: number;
  month: number; // 1-12
  smoothed: number;
}

/**
 * Gráfico de evolução do Runner Score com eixos, meses e ponto final rotulado.
 * Substitui a linha "crua" — agora dá para ler quando e quanto evoluiu.
 */
export function EvolutionChart({ points, label }: { points: EvoPoint[]; label?: string }) {
  if (points.length < 2) return null;
  const W = 320;
  const H = 168;
  const padL = 30; // espaço p/ rótulos do eixo Y
  const padR = 40; // espaço p/ valor final
  const padT = 16;
  const padB = 26; // espaço p/ meses

  const vals = points.map((p) => p.smoothed);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  // margem de respiro no eixo Y, arredondada em múltiplos de 5
  const yMin = Math.max(0, Math.floor((lo - 5) / 5) * 5);
  const yMax = Math.min(1000, Math.ceil((hi + 5) / 5) * 5);
  const yRange = yMax - yMin || 1;

  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const step = plotW / (points.length - 1);
  const xy = points.map((p, i) => {
    const x = padL + i * step;
    const y = padT + (1 - (p.smoothed - yMin) / yRange) * plotH;
    return [x, y] as const;
  });

  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${xy[xy.length - 1]![0].toFixed(1)},${padT + plotH} L${padL},${padT + plotH} Z`;
  const first = points[0]!;
  const lastP = points[points.length - 1]!;
  const last = xy[xy.length - 1]!;
  const firstXY = xy[0]!;
  const gained = lastP.smoothed - first.smoothed;

  const gridYs = [yMax, Math.round((yMax + yMin) / 2), yMin];

  // rótulos de mês: primeiro, meio e último (evita poluição)
  const labelIdx = points.length <= 4
    ? points.map((_, i) => i)
    : [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} fill="none" role="img" aria-label={label ?? "Evolução do Runner Score"} className="evochart">
      {/* linhas de grade + rótulos Y */}
      {gridYs.map((gv) => {
        const gy = padT + (1 - (gv - yMin) / yRange) * plotH;
        return (
          <g key={gv}>
            <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="var(--dv)" strokeWidth={1} strokeDasharray="2 4" />
            <text x={padL - 6} y={gy + 3} textAnchor="end" className="axlbl">{gv}</text>
          </g>
        );
      })}

      {/* área + linha */}
      <path d={area} fill="var(--ac)" opacity={0.1} />
      <path d={line} stroke="var(--ac)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />

      {/* ponto inicial (discreto) e final (destacado + valor) */}
      <circle cx={firstXY[0]} cy={firstXY[1]} r={3} fill="var(--ac)" opacity={0.4} />
      <circle cx={last[0]} cy={last[1]} r={4.5} fill="var(--ac)" />
      <text x={last[0] + 8} y={last[1] + 4} textAnchor="start" className="evoval">{lastP.smoothed}</text>

      {/* rótulos de mês */}
      {labelIdx.map((i) => (
        <text key={i} x={xy[i]![0]} y={H - 8} textAnchor="middle" className="axlbl">
          {MONTHS_PT[points[i]!.month - 1]}/{String(points[i]!.year).slice(2)}
        </text>
      ))}

      {/* variação total no canto */}
      <text x={padL} y={11} textAnchor="start" className="evodelta" fill={gained >= 0 ? "var(--evo)" : "var(--sum)"}>
        {gained >= 0 ? "+" : ""}{gained} pts no período
      </text>
    </svg>
  );
}

interface AreaChartProps {
  points: number[];
  color: string;
  width?: number;
  height?: number;
  label?: string;
}

export function AreaChart({ points, color, width = 260, height = 60, label }: AreaChartProps) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const pad = 6;
  const step = width / (points.length - 1);
  const pts = points.map((p, i) => {
    const x = i * step;
    const y = pad + (1 - (p - min) / range) * (height - 2 * pad);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const last = pts[pts.length - 1]!;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} fill="none" role="img" aria-label={label ?? "gráfico"}>
      <path d={area} fill={color} opacity={0.12} />
      <path d={line} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={3.5} fill={color} />
    </svg>
  );
}
