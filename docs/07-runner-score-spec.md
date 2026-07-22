# 07 — Runner Score: Especificação (v0.2)

**Status:** rascunho técnico derivado do estudo com dado real (ver `07-runner-score-notes.md` e `data/study/`). Âncoras e pesos são **provisórios** — calibração final exige base de vários corredores. Este documento é a fonte de verdade da lógica do score.

> **`runner_score_version`** identifica cada versão publicada. Toda mudança de fórmula/pesos/âncoras incrementa a versão e é registrada. O score exibido sempre carrega sua versão.

---

## 1. Princípios (inegociáveis)
1. **Determinístico e explicável.** Regras e fórmulas, não IA. Todo número tem uma explicação em linguagem humana. IA só narra o resultado.
2. **Funciona com dado mínimo.** GPS + tempo bastam (validado no estudo). FC/cadência/potência enriquecem, nunca são pré-requisito.
3. **O número certo na hora errada é bug.** Nunca punir visivelmente uma boa fase; toda queda vem com explicação e caminho de recuperação.
4. **Robusto a lixo.** Dado real vem sujo (glitches de GPS, atividades trocadas, caminhadas). Limpar antes de calcular.
5. **Versionado e testável.** Fórmulas com testes; mudanças versionadas.

---

## 2. Arquitetura de dois números + temporadas
Decisão central de design (resolve a volatilidade):

- **Runner Score (identidade / carreira):** histórico inteiro, **amortecido**, move devagar. É o número da carta e do perfil. Protege pertencimento e orgulho.
- **Forma atual (janela recente, ~90 dias):** responsiva, rotulada como "momento", pode subir/cair. É onde vive o dinamismo e a motivação.
- **Temporadas (trimestre/mês):** o histórico é sazonalizado em capítulos, cada um com resumo/recorde/narrativa (estilo Wrapped). Uso: retenção, recomeço emocional, e "forma esfria sem upload" como nudge honesto.

Regra: fase fraca mexe na **forma**, quase não toca na **identidade**.

---

## 3. Pipeline de cálculo
```
Atividades (upload/API)
      ↓
INGESTÃO        — parse FIT/GPX/TCX → distância, tempo, pace, elevação, streams
      ↓
FAXINA          — remove/sinaliza outliers (ver §4)
      ↓
FEATURES        — por corrida: pace, splits, negative split, elev/km, etc.
      ↓
ATRIBUTOS       — 6 atributos 0-99 (ver §5)
      ↓
SCORE           — média ponderada → Geral 0-99 → Runner Score (×10)
      ↓
AMORTECIMENTO   — EMA + gate de confiança (ver §6)
      ↓
APRESENTAÇÃO    — nunca expõe o valor "cru"; mostra identidade + forma
```

---

## 4. Faxina de outliers (regras do estudo)
Descarta/sinaliza uma atividade quando:
- **Ritmo impossível:** pace < 3:45/km (glitch de GPS; amador não sustenta). *(Em produção: usar limiar robusto relativo ao histórico do usuário, não fixo.)*
- **Distância fora do padrão:** distância > max(3× p95, p95+15 km) do próprio histórico (atividade trocada / ultra improvável).
- **Caminhada / run-walk:** pace > 10:30/km — não é corrida, não conta para atributos de corrida.
- (Futuro) coerência distância×tempo×aceleração; GPS pausado (tempo parado excessivo).

No estudo real: 13 de 99 atividades removidas — a faxina é significativa e **precisa ser transparente** (mostrar ao usuário o que foi desconsiderado e por quê).

---

## 5. Atributos (0-99)
Vocabulário PT: **Ritmo, Resistência, Regularidade, Finalização, Subida, Evolução.**

| Atributo | Mede | Entrada v0.2 | Nota |
|---|---|---|---|
| **Ritmo** | Velocidade em bom esforço | **Melhor esforço sustentado** (percentil ~15 rápido entre corridas ≥2 km), NÃO a média | Média burra é injusta (lição do estudo) |
| **Resistência** | Sustentar distância/volume | 0,6·(corrida mais longa) + 0,4·(volume semanal) | |
| **Regularidade** | Constância de treino | Frequência semanal × fator de regularidade de espaçamento | |
| **Finalização** | Terminar forte | Mediana do negative split (pace 2ª metade vs 1ª), via GPX | Requer streams/GPX |
| **Subida** | Desempenho em elevação | Ganho de elevação por km | Ajustar por região (Fortaleza é plana) |
| **Evolução** | Melhora ao longo do tempo | Tendência (regressão) do pace no histórico | |

Cada atributo usa **âncoras de referência** (interpolação linear) — provisórias, a calibrar. A função de interpolação deve ser **robusta à ordem das âncoras** (bug real do estudo: âncoras decrescentes travavam Ritmo em 20).

Atributo sem dado suficiente (ex.: Finalização sem GPX) → exibido como "—", excluído do peso (renormaliza).

---

## 6. Score geral, amortecimento e confiança
- **Geral (0-99)** = média ponderada dos atributos disponíveis. Pesos v0.2: Ritmo .20, Resistência .20, Regularidade .22, Finalização .10, Subida .08, Evolução .20 (renormalizados se faltar atributo).
- **Runner Score** = Geral × 10 (escala 0-990).
- **Amortecimento:** o Runner Score exibido é uma **EMA** do score bruto (α≈0,35 no estudo), com limite de variação por período. No estudo real, isso derrubou o maior salto mensal de **196 → 54 pts**.
- **Confiança:** com histórico esparso (ex.: < 8 corridas), exibir estado **"calibrando"** em vez de cravar um número baixo com falsa precisão.
- **Forma atual:** mesmo cálculo sobre a janela recente (~90 dias), responsiva, sem o amortecimento pesado da identidade.

---

## 7. Tratamento de casos
- **Dados esparsos / usuário novo:** "calibrando"; amaciar entrada.
- **Sem FC/cadência:** funciona só com GPS+tempo (caso mais comum).
- **Anti-fraude / anti-manipulação:** limites de sanidade; incentivo de engajamento nunca infla score (temporadas/streaks premiam constância, não o número).
- **Outliers:** §4.

---

## 8. Estado atual e pendências
**Feito (estudo, `data/study/runner_score_v2.py`, dado real do fundador — 86 corridas limpas):**
Runner Score 487 (identidade) / 528 (forma). Atributos: Ritmo 48, Resistência 50, Regularidade 35, Finalização 52, Subida 55, Evolução 59. Faxina, pace por melhor esforço, amortecimento, duas camadas, temporadas e Finalização via GPX — todos validados.

**Pendências:**
1. **Calibrar âncoras e pesos contra uma base de vários corredores** (normalização real é impossível com 1 usuário).
2. Refinar Finalização (usar streams FIT quando houver; hoje via GPX por metade de distância).
3. Ritmo por distância (melhores 5k/10k separados) e pace ajustado à elevação.
4. Suite de testes por atributo; fixar `runner_score_version = v1` ao publicar.
5. Definir limites de variação por semana e o gate de confiança exatos.
