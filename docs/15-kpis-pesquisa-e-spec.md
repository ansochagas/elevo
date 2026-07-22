# 15 — KPIs: pesquisa verificada + especificação

**Data:** 22/07/2026. Pesquisa profunda (105 agentes, 25 alegações verificadas adversarialmente: 21 confirmadas, 4 refutadas). Objetivo: definir os KPIs da Elevo com base no que corredores amadores e treinadores realmente valorizam — não em achismo.

**Legenda:** ✅ verificado em fonte primária · ❌ refutado (não usar) · 💭 opinião/decisão de produto.

---

## A tese que a pesquisa entregou

> **O corredor amador usa o app para DOCUMENTAR e para perseguir DUAS metas ao mesmo tempo: performance (ficar mais rápido) e hábito/consistência (não parar).** ✅ (21 de 22 corredores usam tracker para documentar, não para "refletir"; 19 de 22 gerenciam objetivos concorrentes — Sensors 2021, n=22.) O produto não precisa de análise profunda; precisa de **números claros que alimentem essas duas metas**, com reconhecimento social por cima (o que comprovadamente causa mais corrida).

Isso valida o nosso rumo e refina o foco: menos "gráfico complexo", mais **volume, recordes, consistência e comparação temporal** — bem apresentados e explicados.

---

## Fatos verificados que fundamentam cada KPI

1. **Volume (semanal/mensal) tem base científica dupla** ✅ — preditor de performance (Boston 2022, n=917: cada +1 km/semana ≈ 0,6 min mais rápido na maratona; p<0,001) E de risco quando a progressão é brusca. 100% calculável com GPS+tempo.
2. **Progressão de volume:** ✅ novatos que sobem a distância semanal >30% em 2 semanas se lesionam mais que os que sobem <10% (Nielsen/JOSPT, n=874; HR 1,59, p=0,07 — **sugestivo, não significativo**). Usar como **alerta educativo suave**, não alarme.
3. **Consistência/streak importa de verdade** ✅ — pausas ≥7 dias custam **5–8% no tempo de prova** (15,6 mi de atividades, 292 mil corredores; comparação intra-corredor). Medível só com presença/ausência de corridas.
4. **Reconhecimento social CAUSA mais corrida** ✅ — receber kudos fez corredores correrem mais e com mais frequência (Social Networks 2023, modelos SIENA, 329 atletas). Comparação e feedback social são motor de engajamento real.
5. **Previsão de tempo de prova (5K→maratona) é viável só com pace** ✅ — fórmula de Riegel (só distância+tempo); o SmashRun já faz. Acurácia ~80%, melhor a partir de esforço forte. **Enquadrar como estimativa, não promessa.**
6. **GAP (ritmo ajustado pela elevação) é calculável só com pace+gradiente** ✅ — não exige FC do usuário (Strava Engineering). Permite comparar corridas em terrenos diferentes com os nossos dados.
7. **ACWR (carga aguda:crônica) é calculável só com distância** ✅ — MAS sua **validade preditiva de lesão é cientificamente contestada** (crítica de acoplamento matemático). Usar como **sinal descritivo/educativo**, jamais como "previsor de lesão".
8. **Lacuna de mercado concreta e recente** ✅ — em **dez/2025 o Strava colocou o Year in Sport e os cartões de estatística mensal (comparações mês a mês) atrás do paywall**, deixando grátis só o social. Há demanda paga por estatística detalhada (gente paga SmashRun Pro ~€45/ano só por isso). **É exatamente a brecha da Elevo:** comparação temporal e insight explicável, de graça para o aluno.

### Refutado — NÃO usar como argumento
- ❌ "Sweet spot" de ACWR 0,80–1,30 e picos de risco (RR 8,41 etc.) — refutados 0-3.
- ❌ Números de retenção por streak/gamificação da plataforma Trophy (5,7 vs 4,3 dias; 74% vs 32%) — refutados.

### Ressalvas honestas
- **Zero evidência de corredores brasileiros** — tudo veio de amostras europeias pequenas. Validade para o BR é suposição; confirmar no piloto do Leo.
- Correlação uso-de-tech ↔ mais volume provavelmente tem causalidade reversa.

---

## Os KPIs da Elevo — ranqueados por engajamento × viabilidade

### Grupo A — Atleta amador (construir já; alto valor, factível com GPS+tempo+elevação)
| KPI | Por que engaja / base | Viabilidade |
|---|---|---|
| **Volume do mês + total acumulado** | Meta nº1 do amador; ciência forte (perf. + carga) | Trivial (soma de distância) |
| **Recordes pessoais (melhor 5k, 10k, mais longa, melhor pace)** | PRs são o que o amador mais celebra e compartilha | Fácil (melhores esforços do histórico) |
| **Consistência / sequência de semanas ativas** | Pausas custam 5–8%; hábito é meta central | Fácil (presença de corridas) |
| **Comparação mês a mês** (km, ritmo, nº de corridas) | Exatamente o que o Strava trancou no pago em dez/2025 | Fácil (agregação temporal) |
| **Previsão de tempo de prova (5k/10k/21k)** | "Quanto eu faria numa prova?" — altíssimo apelo | Média (Riegel; rotular como estimativa) |
| **Atributos EXPLICADOS** (o porquê de cada nota) | Nosso diferencial vs. caixa-preta; ataca a lacuna | Fácil (o motor já tem os números-base) |
| **Volume mensal em gráfico (12 meses)** | O gráfico que todo corredor espera ver | Fácil |

### Grupo B — Painel do treinador (construir já)
| KPI | Por que importa | Viabilidade |
|---|---|---|
| **Volume da turma (semana/mês)** | Pulso do grupo; o que coach acompanha | Fácil |
| **Consistência/aderência por aluno** | Prediz churn E performance | Fácil |
| **Progressão de carga por aluno (alerta de salto brusco)** | Prevenção educativa; treinador age | Média (regra <30%/sem, tom suave) |
| **Quem bateu recorde / evoluiu na semana** | Munição de motivação e reconhecimento | Fácil |
| **ACWR como sinal descritivo** (opcional, rotulado) | Treinadores conhecem; NÃO vender como previsor | Fácil calcular, cuidado no texto |

### Grupo C — Desejáveis, exigem mais dados (depois)
- Parciais por km / negative split detalhado, zonas de intensidade, cadência → exigem persistir a série por-km ou FC.
- VO₂max / training load fisiológico → exige FC.
- **Decisão 💭:** não prometer nada disso ao Leo agora; entra quando ligarmos parciais/FC.

---

## Como isso muda o produto e o pitch

1. **O grande diferencial não é "mais gráfico que o Strava"** (nesse jogo, com mapa e parciais, o Strava ganha no por-corrida). É: **(a) atributos explicados** (o porquê), **(b) comparação temporal grátis** (o que o Strava trancou), **(c) o painel do treinador** (que o Strava não tem). Vender por aí.
2. **Frase de posicionamento honesta:** "O Strava te mostra a corrida; a Elevo te mostra o corredor — a evolução, o porquê de cada número, e a turma inteira."
3. **Tom científico responsável:** alertas de carga e ACWR como *educativos e suaves*, nunca como previsão de lesão (a ciência não sustenta). Previsão de prova como *estimativa*.

## Próximo passo
Construir os KPIs do Grupo A (perfil do atleta + detalhe visto pelo treinador) e do Grupo B (painel). Tudo computável com o schema atual (activities + score_snapshots) — sem migração. Ver implementação a partir de `lib/data.ts` e `lib/engine`.
