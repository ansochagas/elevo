# 07 — Runner Score: notas do estudo v0

**Data:** 11/07/2026. Estudo exploratório sobre o **export real do Strava do fundador** (96 corridas válidas, dez/2023–jul/2026, 439 km). Script: `data/study/runner_score_v0.py`. **Não é produção** — o objetivo foi de-riscar o núcleo com dado real antes de especificar a fórmula.

## O que o v0 fez
Leu o `activities.csv`, filtrou corridas, computou atributos v0 (Ritmo, Resistência, Regularidade, Subida, Evolução), um Runner Score geral, e — o mais importante — recalculou o score ao fim de cada mês para medir volatilidade.

## Achados (com dado real) → princípios para a spec

### 1. Volatilidade é o problema nº 1 (confirma o medo do fundador)
O score v0 oscilou de forma inaceitável: **queda de até −196 pontos em um mês** (535→339), com vários saltos de ±50–90. Para um produto de identidade/orgulho, isso é fatal. Ver artifact `volatilidade-score-v0`.

**Princípios obrigatórios da spec:**
- **Inércia/amortecimento:** o score exibido é suavizado (ex.: média móvel / EMA), com limite de variação por semana. Nunca mostrar o valor "cru" instável.
- **Confiança por volume de dados:** com histórico esparso, exibir estado "calibrando" em vez de cravar número baixo com falsa precisão.
- **Nunca punir visivelmente uma boa fase** (princípio de produto já acordado). Toda queda vem com explicação e caminho de recuperação.

### 2. Outliers/lixo distorcem tudo
O histórico real tinha "corrida mais longa: 47 km" e "melhor ritmo: 3:23/km" — quase certamente atividade trocada (pedalada/carro) ou glitch de GPS.

**Princípio:** **limpeza de outliers antes do cálculo** — filtros de sanidade por pace, velocidade, aceleração, coerência distância/tempo; sinalizar/descartar atividades improváveis; não deixar um ponto anômalo definir um atributo.

### 3. Pace da "média burra" é injusto
Ritmo v0 saiu 20 (baixo) porque a média de 7:57/km mistura corridas leves, tiros e trechos caminhados rotulados como "Corrida".

**Princípio:** medir Ritmo pelos **melhores esforços sustentados** (ex.: melhores 5k/10k, ou percentis rápidos do histórico), não pela média de tudo. Considerar pace ajustado à elevação e separar tipos de esforço.

### 4. Histórico esparso no início = instável
Os primeiros meses (poucas corridas) produziram os maiores saltos — amostra pequena, score sem base.

**Princípio:** ponderar por confiança; "amaciar" a entrada de novos usuários com poucas atividades.

## Observações de dado
- O fundador corre com **GPS de celular, sem FC/cadência** (colunas vazias) — cenário "dado mínimo". O score v0 funcionou só com GPS+tempo+elevação, confirmando que o mínimo é viável (dados extras enriquecem, não são pré-requisito).
- CSV do export vem em codificação latina; atividades em GPX (sem FIT/.gz neste export).

## v1 — resultado (11/07/2026, `data/study/runner_score_v1.py`)
As 4 correções foram aplicadas e validadas no dado real:
- **Faxina:** removeu 13 lixos (glitches rápidos + caminhadas/run-walk > 10:30/km). 86 corridas limpas, mais longa 10,2 km (realista).
- **Ritmo justo:** por melhor esforço sustentado (percentil rápido) = 6:23/km → atributo 48 (antes travado em 20 por um bug de interpolação, ver abaixo).
- **Amortecimento (EMA):** maior salto mês-a-mês caiu de 130 → **54 pts** (v0 cru era 196).
- **Confiança:** meses iniciais marcados "calibrando".
- **Lição de rigor:** um bug (âncoras de pace em ordem decrescente alimentando um interpolador que esperava crescente) mantinha Ritmo=20 no v0 e v1 até rodar com dado real. Reforça: testar o score com dado real é obrigatório, e a função de interpolação deve ser robusta a ordem.

## DECISÃO DE DESIGN: modelo de duas camadas (resolve a volatilidade)
Dois números, não um:
1. **RUNNER SCORE (identidade / carreira):** histórico inteiro, amortecido, move devagar. É o que vai na carta. Protege o orgulho — não pode ioiô. (Dado do fundador: 484.)
2. **FORMA ATUAL (janela recente, ex.: 90 dias):** responsiva, rotulada como "momento", pode se mexer. É onde mora o dinamismo. (Dado do fundador: 526 — acima da carreira = "em ascensão".)

Isso mata o medo da "semana boa, nota ruim": uma fase fraca mexe na **forma** (temporário, esperado) e quase não toca na **identidade** (permanente). Camada estável = pertencimento; camada de forma = motivação.

## DECISÃO DE DESIGN: sazonalização (temporadas)
- **Para trás:** o histórico vira temporadas (trimestres/meses) — cada uma com resumo, recorde e narrativa (estilo Wrapped por temporada). Poderoso para retenção e recomeço emocional. Já visível no dado real do fundador (explosão no T3/2025).
- **Para frente:** a "Forma atual" esfria sem uploads → empurrão honesto de volta; recap semanal, streak, metas de temporada incentivam upload diário/semanal. **Cuidado:** incentivo é sobre engajamento, NUNCA sobre inflar o score (evitar gaming). Sync automático (Garmin/API) é o destino; nudge de upload é a ponte.

## Próximos passos técnicos
- Parsear os GPX (não só o CSV) para o atributo **Finalização** (negative split / termina forte) e pacing intra-corrida.
- Calibrar âncoras/pesos contra uma base de vários corredores (normalização real — impossível com 1 usuário).
- Formalizar a spec: fórmula, pesos, versionamento (`runner_score_version`), testes, tratamento de dados esparsos.
