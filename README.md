# Elevo

**Data-driven running intelligence, from product discovery to a functional pilot.**

Elevo explores how recreational runners can better understand their performance, consistency, strengths, and evolution without relying only on isolated pace or distance metrics.

The project combines product discovery, market research, data modeling, deterministic scoring, user experience, and technical implementation.

## Live pilot

[elevo-liart.vercel.app](https://elevo-liart.vercel.app)

The current environment is a controlled pilot and may require authentication.

## Product problem

Running platforms generate large amounts of activity data, but recreational athletes often struggle to translate those numbers into a clear and useful understanding of their development.

Raw metrics such as pace, distance, elevation, and frequency are valuable, but they do not always answer questions such as:

- What type of runner am I?
- What are my strongest attributes?
- Am I becoming more consistent?
- Is my recent form improving?
- How should different activities be interpreted together?

## Product hypothesis

A clear, explainable, and data-driven runner profile can make training history easier to understand and more engaging.

The initial hypothesis is based on three principles:

1. Use existing activity data instead of requiring additional manual input.
2. Keep the scoring model deterministic and explainable.
3. Use artificial intelligence to improve explanations and experience, not to arbitrarily calculate the score.

## Current product scope

The current pilot includes:

- activity ingestion and normalization;
- GPX data processing;
- outlier and activity-quality treatment;
- performance attribute calculation;
- deterministic Runner Score;
- runner identity and recent-form layers;
- user profile and historical analysis;
- authenticated web experience;
- product documentation and validation planning.

## Runner Score

The analytical engine converts activity history into a structured runner profile.

The pipeline follows this general flow:

```text
Activity files
    ↓
Parsing and normalization
    ↓
Outlier and quality treatment
    ↓
Attribute calculation
    ↓
Runner Score
    ↓
Runner identity and recent form

```

## Architecture

```text
apps/web/          Web application and authenticated product experience
packages/engine/   Independent analytical and scoring engine
docs/              Product discovery, strategy, research, and specifications
data/study/        Controlled study and validation materials
```

Keeping the analytical engine independent from the interface makes the scoring logic easier to test, explain, and evolve.

## Technology

### Web application

- Next.js
- React
- TypeScript
- PostgreSQL
- Drizzle ORM
- NextAuth
- Vercel

### Analytical engine

- TypeScript
- GPX and FIT processing
- Data normalization
- Outlier treatment
- Deterministic scoring
- Vitest
- Type checking

## Selected product documentation

- [`docs/00-product-vision.md`](docs/00-product-vision.md)
- [`docs/01-market-research.md`](docs/01-market-research.md)
- [`docs/02-opportunity-assessment.md`](docs/02-opportunity-assessment.md)
- [`docs/07-runner-score-spec.md`](docs/07-runner-score-spec.md)
- [`docs/15-kpis-pesquisa-e-spec.md`](docs/15-kpis-pesquisa-e-spec.md)
- [`docs/19-growth-plan.md`](docs/19-growth-plan.md)

## Running the web application

```bash
cd apps/web
npm install
npm run typecheck
npm run build
npm run dev
```

## Running the analytical engine

```bash
cd packages/engine
npm install
npm test
npm run typecheck
```

## Current status

Elevo is currently in a pilot and validation stage.

The core product and technical foundations are implemented. The scoring anchors and weights still require calibration using a broader and more diverse runner dataset.

The project should be interpreted as a functional product pilot rather than a finished commercial platform.

## What this project demonstrates

- Product discovery and opportunity assessment
- Product strategy and MVP definition
- Data-product design
- Explainable scoring systems
- Technical product management
- Product documentation
- Ability to move from hypothesis to functional implementation

## Author

**Anderson Chagas**

Senior Product Manager | Technical Product Manager | Senior Product Owner

- Portfolio: [andersonchagas.online](https://www.andersonchagas.online)
- LinkedIn: [linkedin.com/in/anderson-chagas-oliveira](https://www.linkedin.com/in/anderson-chagas-oliveira)
