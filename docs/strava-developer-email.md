# E-mail para o Strava Developer Relations

**Objetivo:** obter resposta ESCRITA sobre as duas ambiguidades que travam decisões de arquitetura (IA por inferência; consentimento treinador–atleta) e três confirmações de menor risco.

**Para onde enviar:** `developers@strava.com` (canal oficial de suporte a desenvolvedores). Alternativas/reforço: formulário em https://developers.strava.com e post no Strava Community Hub (seção Developers & API — respostas públicas de staff já serviram de orientação para outros devs).

**Pré-requisito:** criar a conta de desenvolvedor / registrar a aplicação em https://developers.strava.com (o e-mail ganha peso vindo de um developer registrado). Enviar do e-mail associado à conta.

**Dica de tom:** perguntas objetivas e numeradas, mostrando que já lemos o agreement — aumenta muito a chance de resposta útil. Não pedir exceção; pedir interpretação.

---

## Versão em inglês (para envio)

**Subject:** API Agreement clarification — coach-athlete consent scope and inference-only AI use

Hello Strava Developer Relations,

I'm a developer based in Brazil planning an application for amateur runners and running coaching businesses ("assessorias de corrida"). Before building anything, I want to make sure our design fully complies with the current API Agreement (effective June 1, 2026). I've read the Agreement and the API Policy, and I have five specific questions where I'd appreciate written guidance.

Planned use case, in short: our app computes a deterministic "runner score" and attribute breakdown from an athlete's own activities, shows it to that athlete, and — in a coaching context — to their coach, with the athlete's explicit consent.

**1. Inference-only AI use.** The Agreement prohibits using Strava API data "in artificial intelligence models or similar applications." Does this prohibition cover *inference-only* use — i.e., sending an individual athlete's own activity data to a hosted LLM at request time, solely to generate a natural-language summary of that athlete's own performance, displayed only to that athlete (or their consented coach)? No model training, fine-tuning, or data retention by the AI provider would occur. If inference-only use is also prohibited, we will use rule-based text generation instead — we just need to know which side of the line this falls on.

**2. Coach–athlete consent.** We understand consented coach–athlete data sharing is permitted (as implemented by existing coaching platforms). Can you confirm that displaying an athlete's Strava-sourced data to their coach inside our application is compliant when the athlete gives explicit, revocable, in-app consent? Is there any required form or wording for that consent?

**3. Data obtained outside the API.** If a user personally downloads their own Strava bulk export (account data export) and uploads those files to our platform themselves, is that data outside the scope of the API Agreement's display restrictions (since it was not "obtained via the API")? We would never automate, script, or assist that export beyond instructions.

**4. User-generated share images.** Our app can render an image summarizing the user's own aggregated stats (their "runner card"). If the user themselves chooses to download that image and post it on their own social media, is that compliant? To be clear: we would not publish public profile pages or expose any user's API-sourced data to other users on our surfaces.

**5. Athlete capacity for coaching apps.** Under the current Developer Program, what is the recommended path for a coaching-oriented application to increase its connected-athlete capacity beyond the initial self-service limit as legitimate coaching businesses onboard their athletes?

Thank you — we'd rather design this correctly from day one than ask forgiveness later. Written guidance on these five points will directly determine our architecture.

Best regards,
Max [sobrenome]
[e-mail da conta de desenvolvedor] · [cidade, Brasil]

---

## O que cada pergunta destrava (mapa de decisão)

| # | Pergunta | Se a resposta for SIM | Se for NÃO (ou silêncio em ~3 semanas) |
|---|---|---|---|
| 1 | IA por inferência permitida? | "VAR da Corrida" narrado por LLM sobre dados da API | Narração por templates/regras (sem LLM) sobre dados da API; LLM só sobre dados enviados pelo usuário |
| 2 | Consentimento coach–atleta ok? | Fluxo B2B com conexão Strava automática confirmado | Reprojetar B2B sobre upload/Garmin (improvável — Intervals.icu opera assim) |
| 3 | Bulk export fora do agreement? | Carta pública 100% limpa via export do usuário | Carta pública só com FIT/GPX de outras origens |
| 4 | Imagem baixada pelo usuário ok? | Compartilhamento no story sem risco | Carta compartilhável apenas com dados fora da API |
| 5 | Caminho para escalar atletas? | Previsibilidade de custo/aprovação B2B | Fator de risco a precificar no plano B2B |

**Regra combinada:** sem resposta em ~3 semanas, assumimos o pior caso em 1, 3 e 4 (arquitetura sem LLM e sem exibição pública sobre dados da API) e seguimos — o pivot já foi desenhado para sobreviver a isso.
