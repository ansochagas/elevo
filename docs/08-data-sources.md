# 08 — Fontes de Dados (pesquisa técnica)

**Data:** 10/07/2026
**Método:** pesquisa profunda multiagente — 6 frentes, 22 fontes lidas, 83 alegações extraídas, 25 verificadas adversarialmente (21 confirmadas, 4 refutadas). Fontes primárias incluem os **PDFs do contrato oficial da Garmin** (lidos verbatim) e o portal de desenvolvedores da Garmin.

**Legenda:** ✅ verificado 3-0 em fonte primária · 🟡 extraído, não verificado · ❌ refutado na verificação (não usar) · 💭 opinião/síntese.

---

## Resumo de uma linha

> **A Garmin resolve exatamente os dois bloqueios do Strava.** O contrato da Garmin **permite** exibir os dados de um usuário a um terceiro (treinador vê aluno) com consentimento, e **permite** processar dados com IA/LLM (com transparência e consentimento). É a integração automática certa para o fluxo B2B. O upload de FIT/GPX é um plano B técnico sólido e barato para o MVP.

---

## FRENTE 1 — Garmin Connect Developer API

### 1.1 Exibir dados a terceiros: PERMITIDO ✅ (o achado central)

O contrato da Garmin (§4.1(b), lido verbatim no PDF oficial) autoriza usar os dados da API para formatar e exibir "**in a third party application or on Licensee's or a third party's website**", desde que em conformidade com **o consentimento de cada End User**.

**Consequência:** o fluxo B2B que desenhamos — treinador/assessoria vê os dados do aluno, com o aluno consentindo — é **explicitamente permitido pela Garmin**. Isto é o oposto do Strava, que proíbe mostrar o dado de um usuário a qualquer outra pessoa.

Fonte: [Garmin Connect Developer Program Agreement (PDF)](https://www8.garmin.com/en-US/GARMINCONNECTDEVELOPERPROGRAMAGREEMENT/GARMINCONNECTDEVELOPERPROGRAMAGREEMENT_EN.pdf) §4.1(b).

### 1.2 IA/LLM: PERMITIDO ✅ (com condições)

O contrato (§15.10, verbatim) **permite** processar/treinar com dados do usuário via IA, condicionado a: (i) declaração de transparência de IA na política de privacidade; (ii) consentimento explícito prévio de cada usuário; (iii) mecanismo fácil de retirada do consentimento. A varredura das 19 páginas **não encontrou proibição de IA/ML** — a cláusula é condicional (SE usar IA, ENTÃO divulgar), portanto permissiva.

**Consequência:** o "VAR da Corrida" narrado por IA é viável sobre dados da Garmin — de novo, o oposto do Strava, que proíbe IA sobre dados da API dele.

### 1.3 Qual API usar: Activity API ✅

- **Activity API** — atividade completa (30+ tipos), com streams segundo-a-segundo de GPS, pace, velocidade, FC, cadência, potência, distância, elevação, entregues como arquivos **FIT/GPX/TCX**. **É esta que importa corridas.**
- **Health API** — métricas de bem-estar do dia todo (passos, sono, estresse, FC de repouso, pulse-ox) em JSON. Não serve para análise de corrida.

Entrega por **push** (payload completo no callback) **ou ping/pull** (avisa e você busca) — à sua escolha. Fonte: [Activity API](https://developer.garmin.com/gc-developer-program/activity-api/) · [matriz de comparação oficial](https://developer.garmin.com/downloads/connect-api/comparison-matrix.pdf).

### 1.4 Acesso, custo e as ressalvas

- **Enterprise-only** ✅ — exige pessoa jurídica (CNPJ). Uso pessoal é rejeitado. *(Você já tem empresa, então ok.)*
- **Sem taxa** de licenciamento/manutenção para o acesso ao programa ✅ (algumas métricas premium podem ter custo/pedido mínimo de dispositivos).
- **Aprovação a critério da Garmin** ✅ — o "status confirmado em até 2 dias úteis" é só o aceite da *inscrição*; a aprovação do *seu app* é discricionária (§4.2) e **sem prazo garantido**. Não assuma go-live rápido.
- **Não-competição** ✅ (§5.2(t)) — não usar a API para competir com a Garmin nem anunciar concorrentes dela. **Mais estreita que a do Strava**: assessoria/coaching não compete com produtos Garmin, então não somos atingidos.
- **Não redistribuir dados via API própria** ✅ — não podemos construir uma API nossa que entregue dados de atletas a produtos de terceiros **não aprovados por escrito** pela Garmin. Nuance importante: **dentro do nosso app aprovado, treinador e aluno são ambos "End Users" e coach-vê-aluno é permitido**; a trava é alimentar sistemas externos.

### 1.5 Ressalvas de disponibilidade e lacunas (honestidade)

- 🟡 **O programa pode estar suspenso / em lista de espera.** Várias fontes indicam isso. Não muda os termos, mas afeta *se você entra agora*. **Confirmar status atual é a primeira ação.**
- ❌ **Refutados na verificação (NÃO usar como fato):** latência de push "1–5 min"; prazo "dias a semanas"; backfill "só 30 dias" do Intervals.icu; "aprovação em 2 dias úteis" citada por terceiros.
- **Em aberto (não respondido):** se a Garmin permite backfill do histórico completo ou só a partir da conexão (crítico para a carta, que depende de histórico); e relatos concretos de TrainingPeaks/Intervals.icu sobre facilidade real de aprovação. **A viabilidade do coach-vê-aluno é do contrato, não de depoimentos.**

---

## FRENTE 2 — FIT/GPX como fonte universal (plano B)

### 2.1 Riqueza dos formatos ✅

**FIT > TCX > GPX.** FIT (nativo Garmin/Wahoo/Coros) carrega por ponto: GPS, altitude, timestamp, FC, cadência, velocidade, potência, temperatura. TCX tem FC/cadência/laps mas perde a maioria dos sensores. GPX puro só tem posição/tempo/elevação (FC e cadência apenas via extensões não-padrão). **Priorizar FIT; aceitar GPX/TCX como fallback.**

### 2.2 Bibliotecas Node/TypeScript maduras ✅

- **`@garmin/fitsdk`** — SDK **oficial da Garmin**, mantido (v21.208.0 em jun/2026), ESM, funde HR nos record messages. Primeira escolha para FIT.
- **`fit-file-parser`** — MIT, parsing de FIT direto em JS, tipos TS. Alternativa leve.
- **`@we-gold/gpxjs`** — MIT, 94% TypeScript, converte GPX→GeoJSON. Para GPX.

Todas permissivas (MIT/oficial) — sem dor de licença.

### 2.3 Bulk export do Strava (portabilidade / LGPD-GDPR) ✅

O usuário baixa o próprio ZIP em Configurações → Minha Conta. Cada atividade vem **no formato original de upload** (frequentemente FIT, às vezes TCX/GPX), **parte gzipada** (`.fit.gz`, `.gpx.gz`) e parte não, mais um `activities.csv` de índice. **Não é normalizado** — o pipeline precisa lidar com formatos mistos e descompactar `.gz`.

**Nuance jurídica:** são dados do *próprio usuário* (direito de portabilidade), o que reduz o atrito de restrições — mas a pesquisa **não confirmou** que não exista nenhuma cláusula sobre reuso desses arquivos exportados. É uma das perguntas do e-mail ao Strava.

### 2.4 Viabilidade para usuário leigo 💭

Upload manual tem fricção real (baixar ZIP → esperar e-mail do Strava → subir). Aceitável para um alpha de corredores motivados e para o fluxo onde a assessoria ajuda o aluno a subir. Não é o fluxo de menor atrito para B2C em massa — por isso é plano B, não plano A.

---

## Recomendação prática (💭 síntese)

### Para o MVP B2B com assessorias
**Fonte primária: Garmin Activity API** (quando o programa estiver aberto e o app aprovado). É automática, permite coach-vê-aluno e permite IA — casa perfeitamente com o modelo de negócio. **Fallback imediato enquanto a aprovação Garmin não sai: upload de FIT/GPX** (o aluno, ou a assessoria pelo aluno, sobe os arquivos). Assim o MVP não fica refém do timing de aprovação da Garmin.

### Para a carta compartilhável pública
**Nunca sobre a API do Strava.** Duas opções limpas:
1. Dados que o **usuário trouxe** (bulk export ou FIT/GPX) — dele, na nossa plataforma, sem a trava de "exibir a terceiros".
2. Dados da **Garmin** — mas atenção: o card público na web é "exibir a terceiros"; a Garmin permite isso *com consentimento*, o que na verdade é mais favorável que o Strava. Confirmar no processo de aprovação do app.

### Hierarquia de fontes proposta
1. **Garmin Activity API** — automática, permite tudo que precisamos (B2B + IA + terceiros com consentimento). Melhor casa para o produto.
2. **Upload FIT/GPX** — universal, barato, sem aprovação de ninguém, funciona no dia 1. Plano B que vira ponte até a Garmin.
3. **Strava** — apenas "modo espelho" privado (dado do usuário para ele mesmo, sem IA, sem terceiros) OU bulk export trazido pelo usuário. Rebaixado de fonte principal para opcional.

### Impacto no risco do projeto
A dependência existencial do Strava **cai drasticamente**. A Garmin — que domina o relógio do corredor sério, o público das assessorias — tem termos alinhados com o nosso modelo de negócio. O Strava vira "mais uma fonte", não a fundação. **Isto valida o PIVOT: a mesma tese, agora com um encanamento de dados que é legalmente sólido.**

---

## Cobertura de dispositivos (não ficamos presos a marcas)

**Conclusão:** o mercado não é "quem tem Garmin/Strava" — é praticamente qualquer pessoa que corre com um smartphone. Motivo: o Strava é um **hub universal** que agrega quase todas as marcas, e é grátis.

- **Formatos são padrões abertos** (FIT/GPX/TCX) — o motor lê o dado independentemente da marca que gerou.
- **Quase tudo sincroniza no Strava:** Garmin, Apple Watch, Coros, Polar, Suunto, Amazfit/Xiaomi (app Zepp), Huawei, Wahoo, etc. → se chega ao Strava, a gente alcança (conexão com consentimento no B2B, ou export do usuário).
- **Piso de entrada = celular:** o app do Strava grava por GPS do telefone. Requisito mínimo para ser usuário é ter smartphone, não relógio.
- **Ressalva 1 — Apple:** o app nativo de treino do Apple Watch não sincroniza automaticamente no Strava (ecossistema fechado). Impacto pequeno: a maioria dos corredores de Apple Watch usa Strava/Nike Run Club, que sincronizam. Só quem usa exclusivamente o app nativo Apple precisa de ponte (HealthFit/RunGap) ou grava pelo celular.
- **Ressalva 2 — relógios "no-name":** ultra baratos com app fechado que não conecta a nada e não exporta arquivo ficam de fora. Fatia minúscula, e a pessoa pode gravar pelo Strava no celular.
- **Marca afeta riqueza, não inclusão:** celular traz GPS+tempo; Garmin+cinta traz FC/cadência/potência. O Runner Score deve funcionar com o mínimo e ficar mais preciso com mais sensores (já previsto na visão). Ninguém fica de fora; quem tem mais dado ganha mais profundidade.

## Perguntas ainda abertas (para resolver antes do build)
1. O Garmin Developer Program está aberto a inscrições agora? Qual o prazo real de aprovação do app?
2. Garmin permite backfill do histórico completo (crítico para a carta) ou só a partir da conexão?
3. Há cláusula do Strava sobre reuso dos arquivos do bulk export do próprio usuário? *(está no e-mail ao Strava)*
4. Limites de rate/volume da Garmin para um app de coaching com muitos atletas.

## Fontes principais
[Garmin Program FAQ](https://developer.garmin.com/gc-developer-program/program-faq/) · [Agreement PDF](https://www8.garmin.com/en-US/GARMINCONNECTDEVELOPERPROGRAMAGREEMENT/GARMINCONNECTDEVELOPERPROGRAMAGREEMENT_EN.pdf) · [Activity API](https://developer.garmin.com/gc-developer-program/activity-api/) · [Health API](https://developer.garmin.com/gc-developer-program/health-api/) · [matriz de comparação](https://developer.garmin.com/downloads/connect-api/comparison-matrix.pdf) · [@garmin/fitsdk](https://www.npmjs.com/package/@garmin/fitsdk) · [fit-file-parser](https://www.npmjs.com/package/fit-file-parser) · [@we-gold/gpxjs](https://github.com/We-Gold/gpxjs) · [Strava bulk export](https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export).
