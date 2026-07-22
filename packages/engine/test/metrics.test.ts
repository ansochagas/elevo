import { describe, it, expect } from "vitest";
import { computeMetrics, predictRaces, explainAttributes, attributeTier, focusArea, attributeChanges } from "../src/metrics.ts";
import { run } from "./helpers.ts";

const D = (s: string) => new Date(`${s}T12:00:00`);
const NOW = D("2025-03-31");

describe("computeMetrics", () => {
  it("agrega volume, recordes e mês a mês", () => {
    const acts = [
      run({ date: D("2025-03-01"), km: 5, paceMinKm: 6 }),
      run({ date: D("2025-03-10"), km: 10, paceMinKm: 5.5 }),
      run({ date: D("2025-03-20"), km: 8, paceMinKm: 6.2 }),
      run({ date: D("2025-02-15"), km: 6, paceMinKm: 6.5 }),
    ];
    const m = computeMetrics(acts, NOW);
    expect(m.totalRuns).toBe(4);
    expect(m.totalKm).toBeCloseTo(29);
    expect(m.longestKm).toBe(10);
    expect(m.kmThisMonth).toBeCloseTo(23); // março
    expect(m.kmLastMonth).toBeCloseTo(6); // fevereiro
    expect(m.records.find((r) => r.label === "10 km")?.paceMinKm).toBeCloseTo(5.5);
    expect(m.records.find((r) => r.label === "Mais longa")?.distanceKm).toBe(10);
    expect(m.monthly).toHaveLength(12);
  });

  it("conta streak de semanas consecutivas ativas", () => {
    // 3 semanas seguidas antes de NOW (31/03 = seg)
    const acts = [
      run({ date: D("2025-03-11"), km: 5, paceMinKm: 6 }),
      run({ date: D("2025-03-18"), km: 5, paceMinKm: 6 }),
      run({ date: D("2025-03-25"), km: 5, paceMinKm: 6 }),
    ];
    const m = computeMetrics(acts, NOW);
    expect(m.activeWeekStreak).toBeGreaterThanOrEqual(3);
  });

  it("conjunto vazio não quebra", () => {
    const m = computeMetrics([], NOW);
    expect(m.totalKm).toBe(0);
    expect(m.records).toHaveLength(0);
    expect(m.daysSinceLast).toBeNull();
  });
});

describe("predictRaces (Riegel)", () => {
  it("prevê tempos crescentes com a distância", () => {
    const preds = predictRaces(5); // 5:00/km
    const t5 = preds.find((p) => p.label === "5 km")!.timeSec;
    const t10 = preds.find((p) => p.label === "10 km")!.timeSec;
    const t21 = preds.find((p) => p.label === "21 km")!.timeSec;
    expect(t5).toBeCloseTo(1500, -1); // 5km a 5:00 = 25min = 1500s
    expect(t10).toBeGreaterThan(t5 * 2 * 0.98); // ~2x + fadiga
    expect(t21).toBeGreaterThan(t10);
  });
  it("sem pace retorna vazio", () => {
    expect(predictRaces(null)).toEqual([]);
  });
});

describe("tier / foco / mudanças", () => {
  it("tier dá significado à nota", () => {
    expect(attributeTier(35)).toBe("Iniciante");
    expect(attributeTier(49)).toBe("Em desenvolvimento");
    expect(attributeTier(60)).toBe("Bom");
    expect(attributeTier(72)).toBe("Forte");
    expect(attributeTier(90)).toBe("Avançado");
  });
  it("foco = atributo mais fraco (exceto evolução)", () => {
    const f = focusArea({ ritmo: 49, resistencia: 60, regularidade: 35, finalizacao: 51, subida: 60, evolucao: 20 });
    expect(f?.key).toBe("regularidade"); // 35 é o menor, evolução é ignorada
    expect(f?.hint).toMatch(/onstância/);
  });
  it("mudanças separam melhora de piora e ordenam", () => {
    const c = attributeChanges(
      { ritmo: 50, resistencia: 62, regularidade: 30 },
      { ritmo: 45, resistencia: 60, regularidade: 40 },
    );
    expect(c.improved.map((x) => x.key)).toEqual(["ritmo", "resistencia"]); // +5, +2
    expect(c.declined[0]?.key).toBe("regularidade"); // -10
  });
  it("sem snapshot anterior, nada muda", () => {
    expect(attributeChanges({ ritmo: 50 }, null).improved).toHaveLength(0);
  });
});

describe("explainAttributes", () => {
  it("gera explicações com números reais para cada atributo", () => {
    const acts = [
      run({ date: D("2025-03-01"), km: 5, paceMinKm: 6, elevGainM: 40 }),
      run({ date: D("2025-03-10"), km: 10, paceMinKm: 5.5, elevGainM: 100 }),
      run({ date: D("2025-02-15"), km: 6, paceMinKm: 6.5, elevGainM: 50 }),
    ];
    const ex = explainAttributes(acts, NOW);
    expect(ex.ritmo).toMatch(/\/km/);
    expect(ex.resistencia).toMatch(/km/);
    expect(ex.regularidade).toMatch(/vez/);
    expect(ex.subida).toMatch(/m por km/);
    expect(ex.evolucao).toMatch(/mês/);
  });
});
