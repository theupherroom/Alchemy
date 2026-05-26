# alchemy

A bias-blind strategic partnership platform. A tool of The UpHer Room Inc.

Users create anonymous profiles, browse mission-first profiles, and request to connect. When two users mutually accept, the platform auto-books a meeting on both their calendars. Identity is revealed at the meeting itself — never before.

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth + Row Level Security)
- Anthropic Claude
- Resend
- Google Calendar API

## Local development

```bash
pnpm install
cp .env.example .env.local   # fill in your keys
pnpm dev
```

Open http://localhost:3000.
