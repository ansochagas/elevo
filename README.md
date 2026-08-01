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
