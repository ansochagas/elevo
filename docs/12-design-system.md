# 12 — Sistema de Design

**Status:** fundação definida em 10/07/2026. Evolui, mas as decisões de base abaixo estão travadas.

## Nome e marca

**Nome do produto: Elevo.** Palavra inventada, de "eu elevo" (elevar/evoluir) — nomeia a transformação, não o esporte. Coined = ownable (verificado livre em INPI/domínio/@ em 07/2026). Casa com o momento-chave do produto (o score subindo).

- **Monograma / ícone (app, PWA, canais):** "E" em verde menta sobre grafite.
- **Wordmark:** "Elevo" em peso 700, tracking -.02em (mesma tipografia do sistema).
- **Tagline em uso:** "Descubra o corredor que você está se tornando."
- **Atenção competitiva:** "Elevate for Strava" (extensão de análise de nicho) é o vizinho fonético/conceitual — não é conflito de marca, mas vigiar no tom de comunicação.

## Princípio central de produto: social/identidade é o produto

**O Strava privatiza o dado; a Elevo o torna público, social e movido a ego.** Essa é a diferenciação (o Strava não brigará com o próprio modelo de consumidor para fazer isso). Consequência para o design: **engajamento e dinâmicas sociais NÃO são camada cosmética — são o core da engenharia.** ~80-100% do valor está na camada social/identidade. A viralização é embutida no produto (o usuário compartilha por orgulho), não comprada em mídia.

Dois guardrails inegociáveis:
1. **Substância sustenta o social.** A camada social é o motor; a identidade crível (Runner Score que a pessoa sente ser verdade sobre si) é o combustível. Sem substância, vira gimmick de novidade (efeito Wrapped: compartilha uma vez e some). Todo o rigor do motor do score existe para o social durar.
2. **Público = escolha orgulhosa, nunca imposição.** Ego/social forte nasce da segurança: controle de privacidade e consentimento (LGPD) são o que dá conforto para a pessoa se expor por vontade própria. Nunca expor sem opt-in.

Amarração B2C↔B2B: o motor social que retém o corredor é o mesmo que a assessoria paga para reter alunos. Mesma alma nos dois lados.

## Direção de marca

**Direção "Núcleo"** — instrumento premium, sério, atemporal. Referências: Whoop, Oura. O produto se parece com um instrumento de precisão, não com um brinquedo. Prioriza credibilidade e sofisticação (fala com corredores adultos e com donos de assessoria), e envelhece bem.

Ver exploração das 3 direções no artifact "tres-direcoes-v1" (Arena / Núcleo / Movimento). Núcleo venceu como identidade do app.

## Sistema de cartas compartilháveis ("skins")

A carta de compartilhamento **não** segue a identidade única do app — é uma **galeria de skins** que o usuário escolhe por perfil no momento de compartilhar:
- **Arena** — colecionável estilo FIFA/EA Sports FC (perfil gamer, máximo engajamento no story).
- **Movimento** — cultural, tipografia gigante, estilo Nike Run Club × Spotify Wrapped (perfil jovem/viral).
- Núcleo também pode ter sua skin sóbria (perfil profissional).

Racional: desacopla o visual do dia a dia (credibilidade, atemporal) do visual viral (chamativo, descartável). Skins são também alavanca de retenção/monetização (desbloqueáveis por nível, premium, sazonais). Não misturar a identidade do app com as skins de compartilhamento.

## Modo

**Escuro é o padrão** (assinatura da marca). Modo claro é opção obrigatória (parte dos usuários prefere, e corrida acontece no sol). Toda cor precisa funcionar nos dois modos.

## Cores (tokens — modo escuro)

| Token | Hex | Uso |
|---|---|---|
| `--bg-0` | `#0a0b0d` | Fundo da página / app |
| `--surface-1` | `#101317` | Cards, painéis, blocos |
| `--border` | `#22262c` | Bordas de destaque |
| `--divider` | `#191d22` | Divisórias sutis |
| `--text-primary` | `#eef1f4` | Texto principal |
| `--text-secondary` | `#9aa4af` | Texto de apoio |
| `--text-muted` | `#6b7280` | Legendas, hints |
| **`--accent`** | **`#74d2ac`** | **Acento da marca (verde menta)** — score, gráficos, barras, nível, navegação ativa |
| `--accent-deep` | `#0c352a` | Fundo de pílulas/realces do acento |
| `--accent-ink` | `#062720` | Texto sobre preenchimento do acento |

**Cores semânticas** (status — separadas do acento, não contam como cor de marca):
| Estado | Texto | Fundo | Significado |
|---|---|---|---|
| Evoluindo | `#56c98a` | `#0e2a1c` | Score subindo / recorde |
| Atenção | `#e0a83a` | `#2c2410` | Queda ou fadiga |
| Estável | `#9aa4af` | `#1a1e23` | Sem mudança relevante |
| Sumido | `#e06a5c` | `#2c1512` | Parou de correr |

> Regra: o acento (menta) carrega a personalidade e marca ações/dados do próprio usuário. Cores semânticas comunicam estado (bom/atenção/crítico) e nunca substituem o acento.

## Tipografia

- **Display/números:** peso 600, tracking negativo (`-.02em` a `-.03em`), grande. Números sempre com `font-variant-numeric: tabular-nums` (Runner Score, atributos, tempos).
- **Corpo:** peso 400–500, `line-height` ~1.6.
- **Rótulos/eyebrows:** 10–12px, `letter-spacing` ~.2em, maiúsculas, cor secundária.
- **Regra:** dois pesos apenas (400 e 600). Evitar 700+ (fica pesado no visual premium).
- Fonte base: stack de sistema por enquanto (Segoe/system-ui). Fonte própria fica para a fase de produção (via @font-face inline — CSP bloqueia CDN de fontes).

## Vocabulário de atributos (em português — decisão de marca)

Ritmo · Resistência · Regularidade · Subida · Finalização · Evolução.
Códigos curtos: RIT · RES · REG · SUB · FIN · EVO.
Reforça que é produto brasileiro.

## Princípios de layout

- Muito respiro (negative space) — o premium vem do que se tira, não do que se põe.
- Cards com `border-radius` 12–16px, fundo `--surface-1`, sem sombra pesada.
- Barras finas (3–4px) para atributos; anel para o score.
- Gráfico de evolução com área sutil (~12% de opacidade do acento) e ponto final destacado.
- Listas densas (dashboard) = linhas com borda, não cards arredondados.
- Estado sempre visível por forma + cor (pílula/chip), não só por número.

## Princípio de produto (ligado ao score)

"O número certo na hora errada é um bug de experiência." Regras de apresentação do Runner Score: nunca punir visivelmente uma semana que o corredor sentiu como boa; comunicar incerteza quando há poucos dados; toda queda de score vem acompanhada de explicação e caminho de recuperação. Isso é parte da spec do score, não polish.

## Artifacts de referência
- `tres-direcoes-v1` — exploração das 3 direções de carta.
- `nucleo-acento-oceano-vs-menta` — comparação de acento (menta venceu).
- Dashboard da assessoria — peça comercial (Núcleo + menta + escuro).
