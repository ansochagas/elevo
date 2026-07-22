# @elevo/engine

Motor analítico da Elevo — **independente da interface** (regra do documento-mestre). Transforma corridas em Runner Score e atributos, de forma **determinística e explicável** (sem IA nos cálculos).

## Pipeline
```
parse (GPX/…) → normaliza (Activity) → faxina (outliers) → atributos → Runner Score
```

## Módulos (`src/`)
- `types.ts` — `Activity`, `Attributes`, `ScoreResult`, `RunnerProfile`.
- `parse/gpx.ts` — GPX → `Activity` (distância, tempo, elevação, série interna).
- `clean.ts` — faxina de outliers (glitches, caminhadas, atividades trocadas), em 2 passadas.
- `attributes.ts` — 6 atributos 0-99 + âncoras provisórias (`ANCHORS`).
- `score.ts` — Geral, Runner Score, **duas camadas** (identidade/forma) e `identityTimeline` (amortecimento EMA).
- `math.ts` — `lerp` robusto à ordem (regressão do bug do estudo), estatística.

## Uso
```ts
import { parseGpx, cleanActivities, buildProfile } from "@elevo/engine";

const acts = files.map((c) => parseGpx(c)).filter(Boolean);
const { clean } = cleanActivities(acts);
const profile = buildProfile(clean); // { identity, form }
```

## Scripts
- `npm test` — suíte (Vitest).
- `npm run typecheck` — `tsc --noEmit`.
- `node --experimental-strip-types scripts/analyze-real.ts` — roda no export real (dados locais, não versionados).

## Estado (v0.2)
Validado no dado real do fundador (85 corridas limpas). **Pendente:** calibrar âncoras/pesos contra base de vários corredores; suavizar elevação (hoje o ganho por deltas crus de GPS tende a inflar Subida); Ritmo por distância; suavização de elevação. Ver `docs/07-runner-score-spec.md`.
