/**
 * Camada de inteligência — BASE DE CONHECIMENTO (camada 2).
 *
 * Regras de ciência da corrida CURADAS por nós (com fonte/racional), não
 * geradas por IA. É o que impede o "genérico": a IA raciocina ancorada NESTE
 * conjunto + nos números reais do aluno (o snapshot), nunca no vácuo.
 *
 * Regra editorial: cada item tem uma base real e respeita nosso guardrail —
 * descrevemos padrões e possibilidades; NUNCA prescrevemos treino específico
 * nem prevemos lesão. A decisão de treino é sempre do treinador.
 */
import type { AttributeKey } from "@elevo/engine";

export interface RunningRule {
  id: string;
  /** atributo a que a regra se aplica (ou "geral") */
  area: AttributeKey | "geral";
  /** o padrão, em uma frase — o que a IA pode afirmar */
  insight: string;
  /** a base que sustenta (por que é verdade) — curado, verificável */
  evidence: string;
}

export const RUNNING_KNOWLEDGE: RunningRule[] = [
  {
    id: "consistency-unlocks",
    area: "regularidade",
    insight: "Constância é o que mais destrava a evolução geral — subir a frequência semanal tende a puxar os outros atributos junto.",
    evidence: "Volume e frequência estão entre os maiores preditores de melhora em corredores amadores; ganhos costumam aparecer antes na regularidade do que na velocidade pura.",
  },
  {
    id: "volume-performance",
    area: "resistencia",
    insight: "Aumentar o volume semanal de forma gradual acompanha melhora no desempenho de prova.",
    evidence: "Em maratonistas amadores, cada ~1 km/semana a mais de volume associa-se a tempos de prova melhores (ordem de ~0,6 min).",
  },
  {
    id: "pause-cost",
    area: "geral",
    insight: "Pausas de 7+ dias sem correr custam condicionamento e costumam anteceder queda de resultado.",
    evidence: "Interrupções de uma semana ou mais associam-se a perda mensurável de desempenho (~5-8% em tempo de prova).",
  },
  {
    id: "acwr-descriptive",
    area: "geral",
    insight: "Um salto grande de volume numa semana é um dado para OBSERVAR — não um preditor de lesão.",
    evidence: "A razão carga aguda/crônica (ACWR) foi refutada como preditor de lesão: serve como leitura descritiva, nunca como alarme clínico ou base para prescrição.",
  },
  {
    id: "negative-split",
    area: "finalizacao",
    insight: "Terminar mais forte do que começou (negative split) é hábito treinável e sinal de pacing maduro.",
    evidence: "Corredores que fecham os trechos finais mais rápido tendem a gerir melhor o esforço ao longo da corrida.",
  },
  {
    id: "elevation-strength",
    area: "subida",
    insight: "Percursos com mais ganho de elevação desenvolvem a resistência específica de subida.",
    evidence: "Volume de subida acumulado desenvolve força e economia de corrida em terreno inclinado.",
  },
  {
    id: "pace-from-sustained",
    area: "ritmo",
    insight: "O ritmo evolui a partir do melhor esforço sustentado, não de tiros isolados — ganhar velocidade sustentável leva tempo e base.",
    evidence: "Velocidade sustentável reflete capacidade aeróbica e limiar, que respondem a volume consistente ao longo de semanas/meses.",
  },
];

/** Regras relevantes para uma área (inclui as gerais). Seleção determinística. */
export function rulesForArea(area: AttributeKey | "geral"): RunningRule[] {
  return RUNNING_KNOWLEDGE.filter((r) => r.area === area || r.area === "geral");
}
