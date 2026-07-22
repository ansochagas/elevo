import { describe, it, expect } from "vitest";
import { lerp, median, percentile, mean, clampScore } from "../src/math.ts";

describe("lerp", () => {
  it("é robusto à ordem das âncoras (regressão do bug do estudo)", () => {
    const asc = [[240, 92], [480, 20]] as const;
    const desc = [[480, 20], [240, 92]] as const;
    // As duas ordens devem dar o MESMO resultado. O bug fazia a ordem
    // decrescente retornar sempre o mínimo.
    expect(lerp(360, desc)).toBeCloseTo(lerp(360, asc));
    expect(lerp(360, desc)).toBeCloseTo(56); // ponto médio
    expect(lerp(360, desc)).not.toBe(20);
  });

  it("clampa fora do intervalo", () => {
    expect(lerp(100, [[240, 92], [480, 20]])).toBe(92);
    expect(lerp(999, [[240, 92], [480, 20]])).toBe(20);
  });
});

describe("estatística", () => {
  it("median", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
  it("mean", () => {
    expect(mean([2, 4, 6])).toBe(4);
  });
  it("percentile", () => {
    expect(percentile([0, 10], 0.5)).toBeCloseTo(5);
    expect(percentile([1, 2, 3, 4, 5], 0)).toBe(1);
    expect(percentile([1, 2, 3, 4, 5], 1)).toBe(5);
  });
  it("clampScore", () => {
    expect(clampScore(150)).toBe(99);
    expect(clampScore(-5)).toBe(1);
    expect(clampScore(48.6)).toBe(49);
  });
});
