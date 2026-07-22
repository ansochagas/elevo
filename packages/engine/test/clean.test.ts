import { describe, it, expect } from "vitest";
import { cleanActivities, paceMinKm } from "../src/clean.ts";
import { run } from "./helpers.ts";

const D = (s: string) => new Date(s);

describe("cleanActivities", () => {
  it("mantém corridas boas e sinaliza os lixos com motivo", () => {
    const acts = [
      run({ id: "boa1", date: D("2025-01-01"), km: 5, paceMinKm: 6 }),
      run({ id: "boa2", date: D("2025-01-03"), km: 4, paceMinKm: 6.5 }),
      run({ id: "boa3", date: D("2025-01-05"), km: 6, paceMinKm: 5.8 }),
      run({ id: "glitch", date: D("2025-01-07"), km: 5, paceMinKm: 3.0 }), // rápido demais
      run({ id: "walk", date: D("2025-01-09"), km: 5, paceMinKm: 12 }), // caminhada
      run({ id: "trocada", date: D("2025-01-11"), km: 60, paceMinKm: 6 }), // distância absurda
    ];
    const { clean, flagged } = cleanActivities(acts);

    const cleanIds = clean.map((a) => a.id);
    expect(cleanIds).toEqual(["boa1", "boa2", "boa3"]);

    const reasons = Object.fromEntries(flagged.map((f) => [f.activity.id, f.reason]));
    expect(reasons["glitch"]).toMatch(/glitch/i);
    expect(reasons["walk"]).toMatch(/caminhada/i);
    expect(reasons["trocada"]).toMatch(/distância/i);
    expect(flagged).toHaveLength(3);
  });

  it("ordena o conjunto limpo por data", () => {
    const acts = [
      run({ id: "b", date: D("2025-02-10"), km: 5, paceMinKm: 6 }),
      run({ id: "a", date: D("2025-02-01"), km: 5, paceMinKm: 6 }),
      run({ id: "c", date: D("2025-02-20"), km: 5, paceMinKm: 6 }),
    ];
    const { clean } = cleanActivities(acts);
    expect(clean.map((a) => a.id)).toEqual(["a", "b", "c"]);
  });

  it("paceMinKm usa o tempo em movimento", () => {
    const a = run({ date: D("2025-01-01"), km: 10, paceMinKm: 5 });
    expect(paceMinKm(a)).toBeCloseTo(5);
  });
});
