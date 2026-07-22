/** Camada social do app do aluno — dados de exemplo (liga interna da assessoria). */

export interface RankRow {
  pos: number;
  name: string;
  initials: string;
  score: number;
  me?: boolean;
}

export const leagueName = "Fortaleza Run";

export const rivalry = {
  me: { name: "Você", initials: "AC", score: 510 },
  rival: { name: "Rafael S.", initials: "RS", score: 519 },
  gap: 9,
};

export const ranking: RankRow[] = [
  { pos: 3, name: "Rafael Santos", initials: "RS", score: 519 },
  { pos: 4, name: "João Pedro", initials: "JP", score: 515 },
  { pos: 5, name: "Você", initials: "AC", score: 510, me: true },
  { pos: 6, name: "Marcos B.", initials: "MB", score: 502 },
];
