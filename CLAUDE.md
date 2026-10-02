# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

This is an AI-powered Nigerian real estate marketplace built with Next.js 16 App Router.

### Supabase Integration

Three separate Supabase clients for different contexts:
- `lib/supabase/client.ts` - Browser client (use in Client Components)
- `lib/supabase/server.ts` - Server client (use in Server Components, Server Actions)
- `lib/supabase/middleware.ts` - Middleware client (handles session refresh and route protection)

The middleware (`middleware.ts`) protects `/dashboard/*` routes and redirects auth flows.

### AI Chat

Uses Vercel AI SDK with Google Gemini (`gemini-2.0-flash`). The chat API route (`app/api/chat/route.ts`) streams responses using the system prompt from `lib/prompts/real-estate.ts`.

### Database Schema

Located in `supabase/schema.sql`. Key tables:
- `profiles` - Users with roles: seeker, agent, admin
- `properties` - Listings with Nigerian-specific fields (price in NGN, period for rent/short-let)
- `features` / `property_features` - Many-to-many for amenities

RLS policies enforce that only active properties are publicly viewable, and agents can only modify their own listings.

### Path Alias

Use `@/*` for imports from project root (e.g., `@/lib/supabase/server`).

### Form Validation

Zod schemas in `lib/validations/` with React Hook Form integration.
