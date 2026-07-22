import { describe, it, expect } from "vitest";
import { parseGpx } from "../src/parse/gpx.ts";
import { finishSplit } from "../src/attributes.ts";
import { makeGpx } from "./helpers.ts";

describe("parseGpx", () => {
  it("converte um GPX em Activity com distância, tempo e série", () => {
    // 251 pontos, 10 m de espaçamento, 5 s de passo → ~2,5 km em ~1250 s
    const gpx = makeGpx(251, 10, 5);
    const a = parseGpx(gpx, { id: "t1" });
    expect(a).not.toBeNull();
    expect(a!.id).toBe("t1");
    expect(a!.distanceKm).toBeGreaterThan(2.3);
    expect(a!.distanceKm).toBeLessThan(2.7);
    expect(a!.series!.length).toBe(251);
    expect(a!.movingSec).toBeGreaterThan(0);
    expect(a!.elevGainM).toBeGreaterThan(0);
  });

  it("finishSplit de ritmo uniforme fica perto de zero", () => {
    const a = parseGpx(makeGpx(251, 10, 5))!;
    const f = finishSplit(a);
    expect(f).not.toBeNull();
    expect(Math.abs(f!)).toBeLessThan(0.05);
  });

  it("retorna null para GPX sem pontos suficientes", () => {
    expect(parseGpx(makeGpx(3))).toBeNull();
  });
});
