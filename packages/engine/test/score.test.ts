import { describe, it, expect } from "vitest";
import { finishSplit, computeAttributes } from "../src/attributes.ts";
import { buildScore, buildProfile, computeGeral, identityTimeline } from "../src/score.ts";
import { run, uniformSeries } from "./helpers.ts";
import type { Attributes } from "../src/types.ts";

/** 12 corridas semanais, 5 km a 6:00/km, começando em `start`. */
function weekly(start: Date, n: number, km = 5, pace = 6) {
  return Array.from({ length: n }, (_, i) =>
    run({ id: `w${i}`, date: new Date(start.getTime() + i * 7 * 86_400_000), km, paceMinKm: pace }),
  );
}

describe("finishSplit", () => {
  it("detecta negative split (terminou mais rápido)", () => {
    // 1ª metade 6:00/km, 2ª metade 4:00/km → finish +0.333
    const series = [
      { distM: 0, sec: 0 },
      { distM: 2000, sec: 720 },
      { distM: 4000, sec: 1200 },
    ];
    const a = run({ date: new Date("2025-01-01"), km: 4, paceMinKm: 5, series });
    expect(finishSplit(a)).toBeCloseTo(1 / 3, 2);
  });

  it("retorna null sem série", () => {
    expect(finishSplit(run({ date: new Date("2025-01-01"), km: 5, paceMinKm: 6 }))).toBeNull();
  });
});

describe("buildScore", () => {
  it("produz score e atributos em faixa válida", () => {
    const s = buildScore(weekly(new Date("2025-01-01"), 12));
    expect(s.score).toBeGreaterThan(0);
    expect(s.score).toBeLessThanOrEqual(990);
    expect(s.geral).toBeGreaterThanOrEqual(1);
    expect(s.geral).toBeLessThanOrEqual(99);
    expect(s.version).toBe("v0.2");
    // sem série → Finalização ausente
    expect(s.attributes.finalizacao).toBeNull();
    // com série → Finalização presente
    const withSeries = weekly(new Date("2025-01-01"), 12).map((a) => ({
      ...a,
      series: uniformSeries(a.distanceKm, 6),
    }));
    expect(buildScore(withSeries).attributes.finalizacao).not.toBeNull();
  });

  it("marca calibrando com poucos dados", () => {
    expect(buildScore(weekly(new Date("2025-01-01"), 5)).calibrating).toBe(true);
    expect(buildScore(weekly(new Date("2025-01-01"), 12)).calibrating).toBe(false);
  });

  it("conjunto vazio não quebra", () => {
    const s = buildScore([]);
    expect(s.score).toBe(0);
    expect(s.calibrating).toBe(true);
  });
});

describe("computeGeral", () => {
  it("renormaliza quando um atributo está ausente (sem NaN)", () => {
    const attrs: Attributes = {
      ritmo: 50, resistencia: 50, regularidade: 50,
      finalizacao: null, subida: 50, evolucao: 50,
    };
    const g = computeGeral(attrs);
    expect(g).toBe(50);
    expect(Number.isNaN(g)).toBe(false);
  });
});

describe("buildProfile (duas camadas)", () => {
  it("retorna identidade e forma", () => {
    const p = buildProfile(weekly(new Date("2025-01-01"), 12));
    expect(p.identity.score).toBeGreaterThan(0);
    expect(p.form).not.toBeNull();
    expect(p.form!.score).toBeGreaterThan(0);
  });
});

describe("identityTimeline", () => {
  it("amortece: o salto do suavizado é menor que o do cru", () => {
    // histórico irregular para gerar oscilação
    const acts = [
      ...weekly(new Date("2024-01-01"), 6, 3, 8),
      ...weekly(new Date("2024-06-01"), 8, 8, 5),
    ];
    const tl = identityTimeline(acts);
    expect(tl.length).toBeGreaterThan(2);
    const maxJump = (get: (p: (typeof tl)[number]) => number) =>
      Math.max(...tl.slice(1).map((p, i) => Math.abs(get(p) - get(tl[i]!))));
    expect(maxJump((p) => p.smoothed)).toBeLessThanOrEqual(maxJump((p) => p.raw));
  });
});
