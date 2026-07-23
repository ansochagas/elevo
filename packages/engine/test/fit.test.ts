import { describe, it, expect } from "vitest";
import { Encoder, Profile } from "@garmin/fitsdk";
import { parseFit } from "../src/parse/fit.ts";
import { cleanActivities } from "../src/clean.ts";
import { buildScore } from "../src/score.ts";

/**
 * Gera um arquivo .FIT REAL (binário compatível com a especificação, escrito
 * pelo Encoder oficial da Garmin) simulando uma corrida de ~5 km, e valida que
 * a NOSSA ingestão o lê corretamente de ponta a ponta.
 */
function makeFit(): Uint8Array {
  const enc = new Encoder();
  const start = new Date("2025-06-01T09:00:00Z");
  enc.onMesg(Profile.MesgNum.FILE_ID!, {
    type: "activity",
    manufacturer: "garmin",
    product: 1,
    timeCreated: start,
    serialNumber: 42,
  } as Record<string, unknown>);
  let dist = 0; // metros cumulativos
  let alt = 20; // metros
  for (let i = 0; i <= 330; i++) {
    const t = new Date(start.getTime() + i * 5000); // um registro a cada 5 s
    dist += 15; // ~3 m/s ≈ 5:33/km
    alt += Math.sin(i / 18) * 2.2; // sobe e desce ao longo do percurso
    enc.onMesg(Profile.MesgNum.RECORD!, {
      timestamp: t,
      distance: dist,
      altitude: alt,
      enhancedAltitude: alt,
    } as Record<string, unknown>);
  }
  return enc.close();
}

describe("ingestão de FIT real (round-trip com o SDK oficial)", () => {
  it("lê um .fit de ~5 km e produz uma corrida coerente", async () => {
    const bytes = makeFit();
    const act = await parseFit(bytes, { id: "garmin-teste.fit", source: "fit" });

    expect(act).not.toBeNull();
    expect(act!.source).toBe("fit");
    expect(act!.distanceKm).toBeGreaterThan(4.5);
    expect(act!.distanceKm).toBeLessThan(5.5);
    expect(act!.elapsedSec).toBeGreaterThan(1500);
    expect(act!.elevGainM).toBeGreaterThan(0);

    // números para inspeção (aparecem no output do teste)
    console.log("FIT parseado:", {
      distanceKm: +act!.distanceKm.toFixed(2),
      elapsedMin: +(act!.elapsedSec / 60).toFixed(1),
      movingMin: +(act!.movingSec / 60).toFixed(1),
      elevGainM: Math.round(act!.elevGainM),
      paceMinKm: +(act!.movingSec / 60 / act!.distanceKm).toFixed(2),
    });

    // alimenta a faxina + o score sem quebrar
    const { clean, flagged } = cleanActivities([act!]);
    expect(clean.length + flagged.length).toBe(1);
    expect(() => buildScore(clean)).not.toThrow();
  });
});
