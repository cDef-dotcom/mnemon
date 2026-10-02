# Mnemon Project Reference

**Mnemon** is an AI-powered adaptive teaching application designed to help users reach ≥80% mastery of arbitrary learning material as quickly as possible, followed by lightweight spaced retention.

## Key Features & Constraints
- **Minimal UX**: Library → Learn → Progress
- **Assessment Rule**: 10 questions per lesson, 8/10 required for mastery
- **Remediation**: Failing a lesson (<8/10) triggers targeted re-teaching and alternate question retakes
- **Sommelier Wine Preset**: Built-in Wine Sommelier training material (1855 Bordeaux Growths, Terroirs, Sparkling Methods, TCA Faults, Food Pairings)
- **AI Extraction & Evaluation**: Vercel AI SDK integration (`gpt-4o` for knowledge graph extraction & question generation, `gpt-4o-mini` for generous semantic grading)

## Project Structure
```
mnemon/
├── drizzle.config.ts        # Drizzle ORM configuration
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with 3-tab navigation
│   │   ├── page.tsx         # Home redirect to /learn
│   │   ├── api/
│   │   │   ├── ingest/      # AI Knowledge extraction & curriculum endpoint
│   │   │   └── evaluate/    # Fast AI semantic grading endpoint
│   │   ├── library/         # Source ingestion and management UI
│   │   ├── learn/           # Core 10-question active recall loop
│   │   └── progress/        # Mastery metrics & spaced retention
│   ├── db/
│   │   ├── schema.ts        # PostgreSQL schema (sources, nodes, questions, mastery)
│   │   └── index.ts         # Neon database client initialization
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts    # OpenAI provider router
│   │   │   ├── extractor.ts # Knowledge Graph & Curriculum extractor (gpt-4o)
│   │   │   ├── question-generator.ts # Grounded question pre-generator
│   │   │   └── evaluator.ts # Semantic typed answer evaluator (gpt-4o-mini)
│   │   ├── sommelier-preset.ts # Built-in Wine Sommelier training dataset
│   │   └── utils.ts         # Styling utilities
│   └── types/
│       └── index.ts         # TypeScript domain definitions
```

## Build & Test Commands
- Build: `npm run build`
- Dev server: `npm run dev`
- Database push: `npx drizzle-kit push`
