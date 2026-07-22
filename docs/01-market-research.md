# 01 — Market Research (Fase 0)

**Data da pesquisa:** 10/07/2026
**Método:** pesquisa profunda multiagente — 5 frentes de busca paralelas, 22 fontes lidas na íntegra, 106 alegações extraídas, das quais as 25 mais críticas passaram por verificação adversarial independente (3 verificadores por alegação; era preciso 2/3 refutações para derrubar uma alegação). **Resultado: 25 confirmadas, 0 refutadas.**

**Legenda de confiança:**
- ✅ **Verificado** — alegação confirmada por verificação adversarial 3-0, com citação literal da fonte primária.
- 🟡 **Extraído, não verificado** — dado coletado de fonte identificada, mas que não passou pela rodada de verificação adversarial (o lote de verificação priorizou as questões de viabilidade legal). Tratar como provável, não como certo.
- 💭 **Opinião/síntese** — julgamento derivado dos fatos, não fato citável.

---

## 1. Termos da API do Strava (a questão decisiva)

Esta era a pergunta prioritária da Fase 0 e é onde a pesquisa produziu o resultado mais consequente. **Todos os achados abaixo são ✅ verificados em fonte primária (o texto legal vigente e comunicados oficiais do Strava), consultados em 10/07/2026.**

### 1.1 Proibição de exibir dados a terceiros

O Strava API Agreement vigente (efetivo em 01/06/2026, consolidando a mudança de novembro/2024) proíbe exibir dados obtidos via API de um usuário **a qualquer pessoa que não o próprio usuário** — mesmo dados publicamente visíveis na plataforma Strava.

Texto vigente, verbatim:

> "Strava Data provided by a specific user can only be displayed or disclosed in your Developer Application to that user."

> "Strava Data related to other users, even if such data is publicly viewable on the Strava Platform, may not be displayed or disclosed."

Press release oficial (nov/2024): "Third-party apps may now only display a user's Strava activity data to that specific user." O FAQ oficial cita explicitamente feeds públicos como caso vedado.

**Consequência direta para o produto:** na forma padrão da API, são inviáveis — comparações entre usuários, rankings, leaderboards, rivalidades, batalhas, ligas **e a carta do corredor visível a terceiros** (perfil público, story compartilhado com dados da API). A única margem é uma exceção estreita de compartilhamento com consentimento explícito (ex.: relação coach–atleta, caso Intervals.icu), que não cobre features sociais/virais públicas.

Fontes: [strava.com/legal/api](https://www.strava.com/legal/api) · [press.strava.com](https://press.strava.com/articles/updates-to-stravas-api-agreement) · [support.strava.com](https://support.strava.com/hc/en-us/articles/31798729397773-API-Agreement-Update-How-Data-Appears-on-3rd-Party-Apps) · corroborado por DC Rainmaker.

### 1.2 Proibição de IA sobre dados da API

O acordo proíbe explicitamente o uso de dados obtidos via API em modelos de inteligência artificial "ou aplicações similares":

> "explicitly prohibit third parties from using any data obtained via Strava's API in artificial intelligence models or similar applications"

O Strava declarou a evolução da IA como motivação central do aperto. **Permanece publicamente não resolvido** se inferência (passar dados do próprio usuário a um LLM para gerar narração, sem treinar modelo) está proibida — desenvolvedores tratam isso como risco de compliance na ausência de orientação escrita do Strava.

**Consequência direta:** a feature "VAR da Corrida" narrada por IA sobre dados da API do Strava opera, na melhor hipótese, em zona cinzenta contratual.

### 1.3 O que permanece permitido

O núcleo exibido ao próprio corredor permanece permitido. Do press release oficial:

> A grande maioria dos casos de uso existentes continua permitida, "incluindo plataformas de coaching que dão feedback ao usuário e ferramentas que ajudam o usuário a entender seus próprios dados e desempenho".

Ou seja: Runner Score, atributos e análises **exibidos apenas ao próprio usuário** são compatíveis com os termos. Essa permissão não cobre a carta vista por terceiros nem, com segurança, o processamento por IA.

### 1.4 Risco de plataforma estrutural

- **Cláusula de não-competição:** "You may not create applications that compete with or replicate Strava functionality" — e o Strava se reserva o direito de lançar produtos similares aos dos desenvolvedores.
- **Terminação discricionária:** terminação imediata por "any activity that may expose Strava to risk or liability of any kind" ou se o Strava "otherwise reasonably object", com obrigação de **deletar permanentemente todos os dados Strava**. A API pode ser modificada/descontinuada "with or without notice... without any form of compensation".
- **Histórico de enforcement:** a mudança de nov/2024 entrou em vigor no dia do anúncio, com ~30 dias para adequação, quebrando features de apps estabelecidos (ex.: Intervals.icu declarou que os novos termos "quebram todas as features de coaching").

### 1.5 Aperto adicional em 2026

Em 01/06/2026 o Strava publicou novo API Agreement e nova API Policy com datas escalonadas (01/06/2026, 30/06/2026, 01/09/2026, 01/06/2027):

- Acesso Standard Tier passou a **exigir assinatura paga do Strava** (~US$ 11,99/mês; 3 meses grátis para devs ativos; limite inicial de 10 atletas via self-upgrade).
- Apps que roteiam dados por plataformas intermediárias (camadas de IA/no-code) foram **banidos** (integrações diretas não afetadas).
- O Strava lançou **MCP oficial "AI-native"** incluído na assinatura, para o usuário analisar os próprios dados com IA — ocupando exatamente o caso de uso "IA sobre os próprios dados" de terceiros.
- Justificativa declarada: scraping agressivo por empresas de IA (aplicações de desenvolvedor +448% no ano). Cobertura da imprensa: "Strava declares war on scrapers ahead of IPO" (TechCrunch).

Fontes: [Strava Community Hub — An update to our Developer Program](https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428) · strava.com/legal/api.

---

## 2. Autópsia competitiva

### 2.1 Smashrun (✅ verificado)

A tese de posicionamento do Smashrun é quase idêntica à deste produto. Da cofundadora Jacklyn (Knowledge Base oficial, dez/2018):

> "Smashrun focuses on long-term training and positive reinforcement. Strava concentrates more on weekly training and competition."

> "Strava has teams of engineers and Smashrun is built by 3 people."

O Smashrun existe desde ~2012, opera com **3 pessoas** (a página de equipe ainda lista 3), sem funding relevante, e permaneceu nicho por ~14 anos.

**Ressalva dos verificadores:** o Smashrun oferece badges e analytics, não um score determinístico único nem carta compartilhável — a semelhança é de **eixo de posicionamento**, não de feature exata. E a subcapitalização é fator confundidor: não dá para separar "tese fraca" de "execução sem capital". É evidência sugestiva de teto de nicho, não conclusiva.

### 2.2 Strava Athlete Intelligence (✅ verificado)

O Strava já cobre nativamente a análise narrada por IA: o Athlete Intelligence usa IA generativa sobre pace, FC, zonas e Grade Adjusted Pace, saiu de beta em fev/2025 e segue em expansão (insights de potência, análise de segmentos). Duas características importantes (fonte primária oficial):

- **Restrito a assinantes pagos** — "Limited to Strava subscribers and athletes with a free trial". Usuário free não tem análise por IA.
- **Privado e não compartilhável** — "Athlete Intelligence insights and summaries are only visible to the owner of the Strava account and are not shared more widely."

**Leitura estratégica (💭):** o Strava NÃO cobre identidade esportiva compartilhável persistente — o Year in Sport é sobreposição apenas parcial (anual, efêmera). Existe lacuna real em (a) análise para o free tier e (b) identidade compartilhável. Mas explorar (a) esbarra na cláusula de não-competição, e explorar (b) esbarra na proibição de exibição a terceiros. As lacunas existem porque o Strava as **cercou contratualmente**.

### 2.3 Carta de corredor compartilhável — alguém faz?

Nenhum player identificado nesta rodada faz carta persistente estilo FIFA Ultimate Team baseada no histórico. O mais próximo encontrado: **StatShot** (app iOS) sobrepõe estatísticas da atividade em fotos/vídeos — overlay de uma corrida, não score/atributos/carta de identidade (🟡). A varredura não foi exaustiva para concorrentes emergentes (ver Lacunas).

### 2.4 Não coberto nesta rodada

Runalyze, Elevate, Intervals.icu (em detalhe), Stryd, Runna, VDOT, Strafforts e Garmin Connect **não tiveram alegações verificadas** nesta rodada — a verificação priorizou a viabilidade legal. O que se sabe de forma incidental: Intervals.icu opera coaching via exceção de consentimento explícito do Strava. Análise detalhada desses players fica como pendência (baixa prioridade: nenhum deles muda o veredito, que é determinado pelos termos da API).

---

## 3. Mercado brasileiro de corrida de rua

**Todos os itens desta seção são 🟡 extraídos de fontes identificadas, mas não passaram pela verificação adversarial.** São consistentes entre si e com fontes de imprensa, mas devem ser reconfirmados antes de uso em material de investimento.

- **Provas oficiais de corrida de rua cresceram 85% em um ano:** de 2.827 (2024) para 5.241 (2025), segundo dados da ABRACEO apresentados no 4º Summit ABRACEO/CBAt. (fitnessbrasil.com.br)
- Em 2025 foram realizados 11.706 eventos esportivos no Brasil (na base considerada), e a corrida de rua representou **89,8%** do total. (fitnessbrasil.com.br)
- **Run clubs cresceram 109% no Brasil em 2024** segundo o Strava Year in Sport — muito acima da média global de 59%. (CNN Brasil)
- O Strava tem operação e liderança dedicadas ao Brasil (country leader Rosana Fortes); corrida é descrita como a "grande paixão" dos brasileiros na plataforma. (CNN Brasil)
- Mercado de inscrições de provas: +45% em 2024, +25% em 2025, projeção de +15% orgânico para 2026 — desaceleração, mas crescimento contínuo (CEO da Ticket Sports).
- O setor estaria entrando em fase de maturidade, com foco deslocando-se de volume para "valor, relacionamento e inteligência de dados". (fitnessbrasil.com.br)

**Leitura (💭):** o vento de cauda de mercado que a tese assumia é real e forte. O problema do produto não é demanda.

---

## 4. B2B — assessorias e organizadores de prova

**Cobertura fraca nesta rodada (🟡, com dados datados).** O que foi encontrado:

- Assessorias de corrida existem em todo o território nacional pelo menos desde 2014, com planos mensais e anuais.
- Preços de 2014 (levantamento Webrun, amostra informal de 8 assessorias): mensalidades de R$ 80–90 (Cuiabá, Santos) a R$ 220–224 (Brasília, São Paulo capital). **Valores de 12 anos atrás, sem correção inflacionária — servem apenas como piso histórico.**
- O modelo de acompanhamento 100% remoto ("planilha via internet") já existia em 2014 — treino online não é novidade no mercado brasileiro.
- Segundo o presidente da Associação de Treinadores de Corrida de São Paulo (ATC), **o principal valor percebido da assessoria é motivacional/social (grupo + treinador esperando), não a análise de dados** — sinal relevante: uma ferramenta de score/identidade *complementa* (dá ao treinador um artefato de engajamento) mais do que *compete* com o valor central da assessoria.

**Não encontrado nesta rodada:** número de assessorias ativas em 2026, ferramentas que usam hoje, disposição a pagar por dashboard/cards, interesse de organizadores de prova em "cards oficiais de finisher". **Esta é a maior lacuna da pesquisa e é pré-condição do pivot B2B (ver 02-opportunity-assessment).**

---

## 5. Monetização — benchmarks (✅ verificado)

Fonte primária: RevenueCat State of Subscription Apps 2025 (dados transacionais de 100k+ apps), reafirmado pela edição 2026:

- Conversão mediana download→pagante de apps **freemium: ~2,2%** no D35 (edição 2026: 2,1%) vs. **12,1%** com hard paywall (2026: 10,7%).
- **América Latina tem a menor receita por instalação:** D14 ~US$ 0,06–0,09 vs. US$ 0,39 na América do Norte; D60 ~US$ 0,10 vs. US$ 0,66. Trial-to-paid mediano de 25% e o maior crescimento de receita entre regiões (17,2%).
- Receita de novos apps de assinatura é extremamente concentrada: top 5% fatura US$ 8.880 no 1º ano vs. ≤US$ 19 do bottom 25% — gap dobrou de 200x para 400x em um ano.

**Ressalvas dos verificadores:** dados globais de apps mobile (não Brasil-específicos, não web apps); a baixa receita LATAM reflete parcialmente preços locais menores (poder de compra) — "menor monetização por usuário hoje" é mais preciso que "menor disposição a pagar" em absoluto.

**Leitura (💭):** B2C freemium puro, no Brasil, com o valor emocional no plano gratuito, tem teto baixo. Não é fatal, mas exige que o freemium seja canal de aquisição para outra coisa (B2B, eventos), não o negócio em si.

---

## 6. Retenção de produtos de score/identidade

### 6.1 Efeito novidade da gamificação (✅ verificado, transferibilidade média)

Estudo longitudinal peer-reviewed (Rodrigues et al. 2022, 756 universitários brasileiros, 14 semanas, comportamento real medido em 7 pontos no tempo): o efeito da gamificação sobre engajamento **caiu após 4 semanas** (efeito novidade, queda de 2–6 semanas), mas **voltou a subir entre 6–10 semanas** (efeito familiarização) — padrão em U, não declínio permanente.

Ressalvas: contexto educacional (não fitness), desenho quase-experimental, e existe ao menos um estudo posterior com resultado contrastante. A queda pós-semana-4 deve ser **esperada e planejada** no produto; a recuperação não é garantida.

### 6.2 Spotify Wrapped (✅ verificado como mecânica, evidência qualitativa)

Estudo em New Media & Society (2025): o efeito Wrapped é deliberadamente projetado — botão de compartilhar em cada slide, levando o usuário a "performar sua identidade algorítmica" fora da plataforma ("wrappification"), com ressonância identitária em muitos participantes. Estudo qualitativo pequeno e ambivalente (documenta também crítica e rejeição).

### 6.3 Duolingo (🟡 extraído, fonte de blog de análise de produto)

- 32 milhões de usuários ativos diários mantêm streak de 7+ dias — mecânica de hábito/identidade sustentando engajamento em escala massiva.
- Cards compartilháveis de marco de streak, desenhados como artefatos premium em formatos Instagram/Twitter, teriam gerado aumento de 5–10x no compartilhamento orgânico e 6M+ compartilhamentos diários.

**Leitura (💭):** a evidência sustenta a mecânica central da tese — artefato visual de identidade → compartilhamento → aquisição. A ironia da Fase 0: **a mecânica funciona, e é exatamente a mecânica que os termos do Strava bloqueiam quando os dados vêm da API deles.**

---

## 7. Fontes

**Primárias (fonte oficial/texto legal/estudo peer-reviewed):**
1. [Strava API Agreement (texto vigente)](https://www.strava.com/legal/api)
2. [Strava Press — Updates to Strava's API Agreement](https://press.strava.com/articles/updates-to-stravas-api-agreement)
3. [Strava Support — API Agreement Update FAQ](https://support.strava.com/hc/en-us/articles/31798729397773-API-Agreement-Update-How-Data-Appears-on-3rd-Party-Apps)
4. [Strava Community Hub — An update to our Developer Program (jun/2026)](https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428)
5. [Strava Support — Athlete Intelligence](https://support.strava.com/hc/en-us/articles/26786795557005-Athlete-Intelligence-on-Strava)
6. [Smashrun Forum — What's the difference between Smashrun and Strava?](https://discuss.smashrun.com/t/whats-the-difference-between-smashrun-and-strava/301)
7. [RevenueCat — State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/)
8. [Rodrigues et al. 2022 — Gamification novelty/familiarization (IJETHE)](https://link.springer.com/article/10.1186/s41239-021-00314-6)
9. [Annabell & Rasmussen 2025 — Wrappification (New Media & Society)](https://journals.sagepub.com/doi/10.1177/14614448251391301)
10. Strava Developers — Segment changes · Strava Community Hub (thread de devs)

**Secundárias/imprensa/blogs:** DC Rainmaker (análise nov/2024) · TechCrunch ("Strava declares war on scrapers ahead of IPO") · endurance.biz · fitnessbrasil.com.br (dados ABRACEO) · CNN Brasil (Year in Sport / run clubs) · Webrun (preços de assessorias, 2014) · Deconstructor of Fun (Duolingo streaks) · tryterra.co · ncartron.org (reviews Smashrun).

---

## 8. Lacunas e ressalvas desta pesquisa

1. **Cobertura assimétrica:** as 25 alegações verificadas concentram-se em viabilidade legal (Strava), Smashrun/Athlete Intelligence, benchmarks de conversão e evidência de engajamento. Mercado brasileiro (seção 3) e B2B (seção 4) têm apenas dados extraídos, não verificados.
2. **Sensibilidade temporal alta:** os termos do Strava mudaram duas vezes em 19 meses (nov/2024 e jun/2026) e há datas efetivas futuras (01/09/2026, 01/06/2027). **Reverificar strava.com/legal/api na data de qualquer decisão.**
3. **Ambiguidade inference vs. training** na proibição de IA não foi resolvida pelo próprio Strava. Um e-mail direto ao developer relations do Strava vale mais que pesquisa adicional.
4. Benchmarks RevenueCat são de apps mobile globais, não de web apps brasileiros.
5. A evidência de gamificação vem de contexto educacional; o estudo do Wrapped é qualitativo pequeno.
6. O caso Smashrun não separa "tese fraca" de "execução subcapitalizada".
7. Não há evidência verificada de enforcement individual (revogação de app específico) além do episódio coletivo de nov/2024.
8. A varredura de "carta de corredor compartilhável" não cobriu exaustivamente concorrentes emergentes nem apps de medalha digital de prova.
