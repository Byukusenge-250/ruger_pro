# Ruger Photography

A premium photography marketplace connecting clients with vetted professional photographers. Browse by specialty, location, and budget; view real portfolios and reviews; create an account as a client or apply as a photographer.

## Tech stack

- **Vite + React + TypeScript** — frontend
- **Tailwind CSS** — styling and design system
- **React Router** — routing
- **lucide-react** — icons
- **Supabase** — database, auth, and row-level security

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key
npm run dev
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run typecheck` | Run TypeScript checks only |
| `npm run preview` | Preview the production build |

## Environment variables

Copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon (public) key

Never commit `.env`. The anon key is safe for the browser; the service-role key must stay server-side only.

## Project structure

```
src/
  components/   # Shared UI: header/footer, cards, auth aside, primitives
  lib/          # Supabase client, auth context, shared types
  pages/        # Route-level pages (landing, explore, profile, auth, dashboard)
  index.css     # Design tokens and component classes
supabase/
  migrations/   # SQL migrations (schema + RLS policies)
```

## Database

Schema and row-level security live in `supabase/migrations/`. Tables: `profiles`, `photographers`, `reviews`. RLS enforces ownership: clients and photographers can only access their own data; approved photographer listings are publicly readable.

## Roles

- **Client** — browse, book, and review photographers.
- **Photographer** — apply, build a portfolio, and receive bookings (starts in a pending review queue).
- **Admin** — server-side only; cannot be self-registered.
