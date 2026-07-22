/**
 * Modelo de domínio da visão do treinador (painel da assessoria).
 * Hoje alimentado por dados de exemplo (`mock-data.ts`); quando ligado a dados
 * reais, `score`/`delta`/`trend` vêm do @elevo/engine (Runner Score + forma) e
 * `status`/`atRisk` são derivados das regras de engajamento.
 */

export type AthleteStatus = "evoluindo" | "estavel" | "atencao" | "sumido";

export interface CoachAthlete {
  id: string;
  name: string;
  initials: string;
  level: string;
  score: number;
  delta: number | null;
  /** pontos para o sparkline de 30 dias */
  trend: number[];
  lastRun: string;
  status: AthleteStatus;
}

export interface AtRiskAthlete {
  id: string;
  name: string;
  initials: string;
  reason: string;
  kind: "sumido" | "queda";
}

export interface DashboardKpis {
  activePct: number;
  activeCount: number;
  totalCount: number;
  activeDeltaWeek: number;
  needAttention: number;
  sumidos: number;
  emQueda: number;
  evolvedPct: number;
  teamAvgScore: number;
  teamAvgDeltaQuarter: number;
  cardsShared: number;
  cardsSharedDelta: number;
  profileClicks: number;
  profileClicksDeltaPct: number;
  newAthletesViaBrand: number;
}

export interface DashboardData {
  assessoria: { name: string; initials: string; athleteCount: number };
  coach: { name: string; initials: string };
  kpis: DashboardKpis;
  atRisk: AtRiskAthlete[];
  /** série do score médio da turma (área) */
  teamEvolution: number[];
  roster: CoachAthlete[];
}
