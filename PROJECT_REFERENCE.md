# Mnemon Project Reference

**Mnemon** is an AI-powered adaptive teaching application designed to help users reach ≥80% mastery of arbitrary learning material as quickly as possible, followed by lightweight spaced retention.

## Key Features & Constraints
- **Minimal UX**: Library → Learn → Progress
- **Assessment Rule**: 10 questions per lesson, 8/10 required for mastery
- **Remediation**: Failing a lesson (<8/10) triggers targeted re-teaching and alternate question retakes
- **Sommelier Wine Preset**: Built-in Wine Sommelier training material (1855 Bordeaux Growths, Terroirs, Sparkling Methods, TCA Faults, Food Pairings)

## Project Structure
```
mnemon/
├── drizzle.config.ts        # Drizzle ORM configuration
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with 3-tab navigation
│   │   ├── page.tsx         # Home redirect to /learn
│   │   ├── library/         # Source ingestion and management
│   │   ├── learn/           # Core 10-question active recall loop
│   │   └── progress/        # Mastery metrics & spaced retention
│   ├── db/
│   │   ├── schema.ts        # PostgreSQL schema (sources, nodes, questions, mastery)
│   │   └── index.ts         # Neon database client initialization
│   ├── lib/
│   │   ├── sommelier-preset.ts # Built-in Wine Sommelier training dataset
│   │   └── utils.ts         # Styling utilities
│   └── types/
│       └── index.ts         # TypeScript domain definitions
```

## Build & Test Commands
- Build: `npm run build`
- Dev server: `npm run dev`
- Database push: `npx drizzle-kit push`
