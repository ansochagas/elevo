/**
 * Modelo de exibição do app do atleta. Dados de exemplo (números reais do
 * fundador). Quando ligado a dados reais, `identityScore`/`formScore`/
 * `attributes` vêm do @elevo/engine (RunnerProfile / ScoreResult / Attributes).
 */

export type AthAttrKey = "ritmo" | "resistencia" | "regularidade" | "finalizacao" | "subida" | "evolucao";

export const ATTR_LABEL: Record<AthAttrKey, string> = {
  ritmo: "Ritmo",
  resistencia: "Resistência",
  regularidade: "Regularidade",
  finalizacao: "Finalização",
  subida: "Subida",
  evolucao: "Evolução",
};

export interface LastRun {
  distanceKm: number;
  timeStr: string;
  paceStr: string;
  scoreFrom: number;
  scoreTo: number;
  changed: { key: AthAttrKey; delta: number }[];
  achievement: string;
  analysis: string;
}

export interface AthleteProfile {
  name: string;
  initials: string;
  city: string;
  level: string;
  archetype: string;
  identityScore: number;
  formScore: number;
  attributes: Record<AthAttrKey, number>;
  evolution: number[];
  lastRun: LastRun;
}

export const athlete: AthleteProfile = {
  name: "Anderson Chagas",
  initials: "AC",
  city: "Fortaleza, CE",
  level: "Prata II",
  archetype: "Fundista",
  identityScore: 510,
  formScore: 540,
  attributes: {
    ritmo: 48,
    resistencia: 60,
    regularidade: 35,
    finalizacao: 47,
    subida: 60,
    evolucao: 61,
  },
  evolution: [462, 470, 478, 486, 492, 499, 505, 510],
  lastRun: {
    distanceKm: 8.2,
    timeStr: "48:12",
    paceStr: "5:52 /km",
    scoreFrom: 487,
    scoreTo: 510,
    changed: [
      { key: "regularidade", delta: 4 },
      { key: "finalizacao", delta: 3 },
      { key: "ritmo", delta: 2 },
    ],
    achievement: "Sequência de 11 dias",
    analysis:
      "Você terminou forte: seu último km ficou entre os 15% mais rápidos do seu histórico.",
  },
};
