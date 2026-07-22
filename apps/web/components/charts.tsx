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
