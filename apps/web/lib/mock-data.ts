import type { DashboardData } from "./types";

/**
 * Dados de exemplo do painel. Substituir por consultas reais quando houver
 * assessoria conectada (roster + @elevo/engine para score/forma/atributos).
 */
export const dashboard: DashboardData = {
  assessoria: { name: "Assessoria Fortaleza Run", initials: "F", athleteCount: 24 },
  coach: { name: "Rafael Coelho", initials: "RC" },
  kpis: {
    activePct: 88,
    activeCount: 21,
    totalCount: 24,
    activeDeltaWeek: 2,
    needAttention: 4,
    sumidos: 2,
    emQueda: 2,
    evolvedPct: 87,
    teamAvgScore: 512,
    teamAvgDeltaQuarter: 18,
    cardsShared: 142,
    cardsSharedDelta: 31,
    profileClicks: 1240,
    profileClicksDeltaPct: 18,
    newAthletesViaBrand: 6,
  },
  atRisk: [
    { id: "fn", name: "Fernanda Nunes", initials: "FN", reason: "Sem correr há 12 dias · risco de desistir", kind: "sumido" },
    { id: "lg", name: "Lucas Gomes", initials: "LG", reason: "Sem correr há 9 dias", kind: "sumido" },
    { id: "cs", name: "Carla Souza", initials: "CS", reason: "Forma caiu 14 pts no mês", kind: "queda" },
    { id: "rb", name: "Ricardo Barros", initials: "RB", reason: "Sinais de fadiga acumulada", kind: "queda" },
  ],
  teamEvolution: [478, 483, 489, 492, 497, 503, 507, 512],
  roster: [
    { id: "ma", name: "Marina Alves", initials: "MA", level: "Ouro I · Velocista", score: 814, delta: 29, trend: [780, 786, 792, 798, 806, 810, 814], lastRun: "ontem · 12 km", status: "evoluindo" },
    { id: "ac", name: "Anderson Chagas", initials: "AC", level: "Prata II · Fundista", score: 510, delta: 23, trend: [487, 492, 495, 500, 505, 508, 510], lastRun: "há 2 dias · 8,2 km", status: "evoluindo" },
    { id: "jp", name: "João Pedro Lima", initials: "JP", level: "Prata I · Equilibrado", score: 515, delta: 3, trend: [512, 513, 512, 514, 513, 514, 515], lastRun: "há 3 dias · 6 km", status: "estavel" },
    { id: "cs", name: "Carla Souza", initials: "CS", level: "Bronze II · Iniciante", score: 521, delta: -14, trend: [535, 532, 530, 528, 525, 523, 521], lastRun: "há 4 dias · 5 km", status: "atencao" },
    { id: "fn", name: "Fernanda Nunes", initials: "FN", level: "Bronze III · Iniciante", score: 498, delta: null, trend: [498, 498, 498, 498, 498, 498, 498], lastRun: "há 12 dias", status: "sumido" },
  ],
};
