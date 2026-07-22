# 02 — Opportunity Assessment (Fase 0)

**Data:** 10/07/2026
**Base factual:** [01-market-research.md](01-market-research.md) — este documento é a camada de julgamento sobre aqueles fatos. Onde os fatos são 🟡 (não verificados) ou a análise é opinião, isso está sinalizado.

---

## Recomendação

# PIVOT

**Não GO na arquitetura atual. Não NO-GO na ideia.**

A tese de produto (identidade esportiva + score explicável + artefato compartilhável) segue viva e é sustentada pela evidência de mercado e de mecânica de engajamento. O que morreu na pesquisa foi a **arquitetura de distribuição e dados**: construir a carta compartilhável e a análise por IA **sobre a API do Strava** viola ou tangencia os termos vigentes em pelo menos dois pontos centrais, sob um contrato que permite ao Strava terminar o acesso discricionariamente e que proíbe competir com funcionalidades dele.

Em uma frase:

> **A ideia é boa; o encanamento planejado para ela é contratualmente inviável. Troque o encanamento, não a ideia.**

---

## 1. O veredito fato a fato

### O que a pesquisa CONFIRMOU da tese original

| Hipótese do documento-mestre | Situação |
|---|---|
| O mercado de corrida no Brasil está em expansão forte | ✅ Confirmada (provas +85% em 1 ano; run clubs +109% em 2024; corrida = ~90% dos eventos esportivos) 🟡 |
| Artefatos visuais de identidade geram compartilhamento e aquisição | ✅ Sustentada (Wrapped "wrappification"; cards de streak do Duolingo com 5–10x sharing) |
| Ninguém oferece "carta do corredor" persistente estilo FUT | ✅ Nenhum player identificado; Athlete Intelligence é privado e não compartilhável; Year in Sport é anual/efêmero |
| Score determinístico/explicável diferencia da IA caixa-preta | ✅ Diferencial real vs. Athlete Intelligence (generativo, fechado, só para assinantes) |
| O efeito novidade existe e precisa ser gerenciado | ✅ Confirmado (queda após ~4 semanas; padrão em U com recuperação possível) |

### O que a pesquisa DERRUBOU

| Premissa implícita do documento-mestre | Realidade verificada |
|---|---|
| "Conecta o Strava e compartilha sua carta" | **Proibido.** Dados da API só podem ser exibidos ao próprio usuário — mesmo dados públicos no Strava. A carta pública/compartilhada com dados da API viola o agreement vigente. |
| "IA narra a análise da corrida" (sobre dados da API) | **Proibido ou zona cinzenta.** Uso de dados da API "em modelos de IA ou aplicações similares" é vedado; o Strava não esclareceu se inferência (sem treinar modelo) está incluída. |
| Rankings, rivalidades, batalhas, ligas (Fases 8–9) | **Proibidos** com dados da API (exibição a terceiros). Só sobrevivem com outra fonte de dados ou consentimento explícito par a par. |
| "Complemento, não concorrente — logo estamos seguros" | **Falso conforto.** Cláusula de não-competição ampla + terminação discricionária + Strava lançando MCP de IA próprio e cobrando assinatura de devs. O Strava trata a camada de análise/IA como território dele. |
| Risco Strava = "risco 29.6, mitigável com arquitetura desacoplada" | O risco é **anterior ao MVP**, não futuro: afeta o dia 1 do produto como especificado. |

**A ironia central da Fase 0:** a mecânica de viralização que a evidência valida (identidade → artefato → compartilhamento) é exatamente a mecânica que os termos do Strava bloqueiam quando os dados vêm da API deles.

---

## 2. Respostas às perguntas da seção 36 do documento-mestre

1. **A ideia é realmente diferenciada?** Parcialmente. A carta persistente de identidade + score explicável não tem dono. Mas a análise individual por IA já é feature nativa do Strava (Athlete Intelligence), e "entender seus próprios dados" é o segmento mais commoditizado (Smashrun, Runalyze, Intervals.icu, Athlete Intelligence). O diferencial real e vago é o **artefato de identidade compartilhável** — que exige dados fora da API do Strava.

2. **Existe espaço?** Sim no mercado (demanda crescendo forte no Brasil); não no encanamento proposto (o espaço contratual sobre a API do Strava é estreito e encolhendo — duas mudanças restritivas em 19 meses).

3. **Existe público?** Sim 🟡 — milhões de corredores ativos no Brasil, run clubs em explosão, Strava com operação dedicada ao país.

4. **Existe viralização?** A mecânica é validada em análogos (Wrapped, Duolingo). Mas **não com dados da API do Strava**. Viralização exige que o dado que alimenta a carta pertença ao usuário na nossa plataforma (upload, export, integração que permita exibição pública).

5. **Existe monetização?** B2C freemium puro: fraca (conversão mediana ~2,2%, LATAM com menor receita/instalação; e o plano gratuito proposto entrega o valor emocional). B2B (assessorias/eventos): plausível e inexplorada — maior lacuna da pesquisa, principal candidata a motor de receita.

6. **Existe risco de ser apenas uma funcionalidade?** Sim, e agora com prova: o Strava já shipou a análise por IA e lançou MCP próprio. A parte "análise" da tese É uma funcionalidade do Strava. A parte "identidade compartilhável" é o que pode ser produto.

7. **O produto é defensável?** Sobre a API do Strava: **não** (terminação discricionária + não-competição + o Strava construindo o mesmo). Sobre dados próprios/consentidos + histórico acumulado + marca: possivelmente, mas isso é o pivot, não o plano original.

8. **Qual deve ser o MVP?** Ver seção 4 — o MVP muda de "conecte seu Strava" para uma arquitetura de dados do usuário.

9. **Qual deve ser o público inicial?** Mantém-se o corredor amador brasileiro (2–5x/semana), mas com hipótese B2B (assessorias) promovida a trilha paralela de validação, não "futuro".

10. **Qual deve ser o posicionamento?** Mantém-se "identidade e evolução do corredor" — reforçado, porque é a única parte da tese que nem o Strava nem os analytics cobrem. Enfraquece o pilar "inteligência/análise" como diferencial (commoditizado e contratualmente arriscado).

---

## 3. As três rotas de pivot (💭 análise)

### Rota A — Mesmos features, dados do usuário (não da API)

A carta e o compartilhamento passam a ser alimentados por dados que **o usuário traz por conta própria**:

- **Upload de arquivos FIT/GPX/TCX** (todo relógio e todo app exporta);
- **Bulk export do Strava feito pelo próprio usuário** (portabilidade de dados — o usuário baixa o ZIP dele e sobe na plataforma; LGPD/GDPR garantem o direito de portabilidade);
- **Garmin Connect Developer API / Apple Health / Coros** — termos a verificar (pendência aberta), mas o ecossistema Garmin historicamente é mais permissivo com apps de treino;
- A API do Strava pode continuar existindo **apenas para o caso permitido**: análise exibida ao próprio usuário, sem IA, sem exibição a terceiros — um "modo espelho" privado.

*Custo:* fricção de onboarding maior (upload vs. OAuth de um clique). *Ganho:* o dado é do usuário na nossa plataforma; carta pública, rankings e ligas ficam juridicamente limpos; dependência do Strava cai de existencial para opcional.

### Rota B — Canal B2B primeiro (assessorias e provas)

A exceção de consentimento explícito coach–atleta (caso Intervals.icu) é a única porta larga que sobrou na API do Strava — e coincide com o canal onde há dinheiro:

- Assessorias pagam por ferramenta de engajamento/retenção de alunos (dashboard + cartas do grupo + relatório mensal com a marca da assessoria);
- O valor central da assessoria é motivacional/social (fala do presidente da ATC 🟡) — a carta é *combustível motivacional*, complementa em vez de competir;
- Organizadores de prova: card oficial de finisher como produto de mídia do evento;
- O corredor chega ao produto **através** da assessoria/prova → distribuição resolvida sem depender de virality fria.

*Custo:* ciclo de venda, produto menos "consumer dream". *Ganho:* receita cedo, distribuição embutida, base consentida que no futuro habilita os features sociais B2C.

### Rota C (recomendada) — Híbrida, sequenciada

1. **MVP:** Rota A (upload/export + modo espelho Strava privado) para validar o Aha da carta com 30–50 corredores;
2. **Em paralelo:** 10–15 entrevistas com assessorias (Rota B) para validar disposição a pagar B2B;
3. A decisão de qual rota vira o negócio principal sai dessas duas validações, não de opinião.

---

## 4. Condições do PIVOT (gates antes de qualquer código)

O PIVOT só vira GO quando **todas** as condições abaixo forem satisfeitas:

1. **Resposta escrita do Strava developer relations** sobre (a) inferência LLM em dados do próprio usuário e (b) exibição da carta a terceiros quando o dado veio de bulk export feito pelo usuário (fora da API). Sem resposta em ~3 semanas, assumir o pior caso e projetar sem API do Strava nos fluxos público/IA.
2. **Verificação dos termos da Garmin Connect Developer API** (e Apple Health / Coros) para exibição pública e processamento — a Rota A depende de pelo menos uma integração permissiva ou do upload manual ser aceitável para o usuário.
3. **Teste concierge da carta (4 semanas, sem código):** 15–20 corredores de grupos locais de Fortaleza; cartas geradas manualmente (export do usuário + planilha + Figma); medir quem **pede** a atualização sem provocação após novas corridas e quem posta a carta espontaneamente. Gate sugerido: ≥40% pedem atualização; ≥25% compartilham sem incentivo.
4. **10–15 entrevistas com assessorias** (mix Fortaleza + remoto): quanto pagariam, por quê, e o que já usam. Gate: ≥3 assessorias declarando intenção de pagar valor concreto (carta de intenção ou pré-venda simbólica).
5. **Reverificar strava.com/legal/api na data da decisão** (mudanças de 01/09/2026 e 01/06/2027 já anunciadas).

**Critério de saída:** condições 3 e 4 medem coisas independentes (desejo B2C pelo artefato; dinheiro B2B). Uma delas passando já sustenta GO na rota correspondente. As duas falhando = NO-GO honesto, com custo total de ~4–6 semanas e zero código.

---

## 5. O que muda no documento-mestre (proposta de revisão)

1. **Seção 20 (Integração com Strava):** rebaixar de "primeira integração recomendada" para "integração opcional em modo privado"; promover upload FIT/GPX + bulk export a caminho primário de dados. Novo doc `08-data-sources.md` no lugar de `08-strava-integration.md`.
2. **Seção 29 (Riscos):** risco 29.6 (dependência do Strava) vira **29.1**, reclassificado de "dependência" para "viabilidade contratual", com os fatos do 01-market-research.
3. **Seção 30 (Monetização):** B2B sai de "futuro" e vira trilha de validação paralela na Fase 1. Rediscutir o que fica no plano gratuito (hoje ele entrega o valor emocional inteiro).
4. **Seção 10 (VAR da Corrida):** a narração por IA só roda sobre dados trazidos pelo usuário; sobre dados da API do Strava, apenas cálculo determinístico + templates (sem LLM) até resposta escrita do Strava.
5. **Seções 14–17 (rivalidades, batalhas, rankings, ligas):** anotar que exigem dados fora da API do Strava ou consentimento par a par — não são apenas "depois", são "depois E com outra fonte".
6. **Fase 7 (Alpha):** adotar os gates quantitativos da seção 4 acima.
7. **Novo princípio de produto** (derivado da discussão de score): *o número certo na hora errada é um bug de experiência* — regras de apresentação do score (nunca punir visivelmente uma semana boa; incerteza comunicada; queda de score sempre acompanhada de explicação e caminho de recuperação) fazem parte da spec do Runner Score, não do polish.

---

## 6. Resumo executivo

- **Mercado:** confirmado e aquecido (Brasil é possivelmente o melhor lugar do mundo para lançar isso agora). 🟡
- **Mecânica de produto (identidade → artefato → share):** validada em análogos fortes.
- **Diferencial (carta persistente + score explicável):** real, sem dono, mas só existe legalmente fora da API do Strava.
- **Arquitetura proposta no documento-mestre:** inviável como escrita — a API do Strava não permite carta pública nem (com segurança) IA, e o contrato permite terminação discricionária.
- **Concorrência:** Strava cercou a "análise" (Athlete Intelligence + MCP + termos); ninguém cercou a "identidade compartilhável".
- **Monetização:** B2C freemium fraco como negócio principal; B2B (assessorias/provas) é a hipótese de receita mais promissora e a menos pesquisada.
- **Decisão:** **PIVOT** — mesma tese, novo encanamento de dados (upload/export/Garmin + Strava só em modo privado), validação dupla B2C concierge + entrevistas B2B, gates quantitativos, ~4–6 semanas, zero código até os gates passarem.
