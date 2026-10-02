# EstateMind Nigeria

An AI-first real estate marketplace designed specifically for the Nigerian market. EstateMind leverages "Agentic AI" to act as a personal digital broker, solving key local challenges like trust deficits, fake listings, and search fatigue.

## Features

- **AI Personal Broker (Chinedu)** - Chat with an AI assistant powered by Google Gemini that understands Nigerian real estate, local areas, and pricing in Naira
- **TrueVerify Listings** - Video walkthrough verification system to eliminate fake listings
- **Role-based Authentication** - Separate experiences for property seekers and agents
- **Mobile-first Design** - Responsive UI optimized for Nigerian mobile users
- **Real-time Chat** - Streaming AI responses for natural conversations

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with SSR
- **AI:** Vercel AI SDK + Google Gemini
- **Form Validation:** Zod + React Hook Form
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Google AI (Gemini) API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd estatemind-ng
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini API (for AI chat)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

### 3. Database Setup

Run the SQL schema in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and run the contents of `supabase/schema.sql`

This creates:
- `profiles` table with user roles (seeker, agent, admin)
- `properties` table with Nigerian-specific fields
- `features` table for property amenities
- Row Level Security (RLS) policies
- Automatic profile creation trigger on signup

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
estatemind-ng/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── api/chat/         # AI chat API route
│   ├── dashboard/        # Protected dashboard pages
│   ├── properties/       # Property detail pages
│   ├── search/           # Property search page
│   └── page.tsx          # Landing page
├── components/
│   ├── AIChat.tsx        # Floating AI chat widget
│   └── DashboardSidebar.tsx
├── lib/
│   ├── supabase/         # Supabase clients (browser, server, middleware)
│   ├── prompts/          # AI system prompts
│   ├── validations/      # Zod schemas
│   └── database.types.ts # TypeScript types
├── supabase/
│   └── schema.sql        # Database schema
└── middleware.ts         # Auth middleware
```

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | User login |
| `/signup` | User registration with role selection |
| `/search` | Property search results |
| `/properties/[id]` | Property detail page |
| `/dashboard` | User dashboard (protected) |
| `/dashboard/listings` | Agent's property listings |
| `/dashboard/listings/new` | Create new listing form |

## Authentication Flow

1. Users sign up choosing their role (seeker or agent)
2. Middleware protects `/dashboard/*` routes
3. Unauthenticated users are redirected to `/login`
4. Already authenticated users on auth pages are redirected to `/dashboard`

## AI Chat

The AI assistant "Chinedu" is configured with Nigerian real estate expertise:
- Understands local areas (Lekki, Ikoyi, VI, Ikeja, etc.)
- Prices in Naira with appropriate periods (per annum, per month, per night)
- Knows about Nigerian real estate concerns (C of O, inspection fees, etc.)
- Mentions TrueVerify system when relevant

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build the production version:

```bash
npm run build
npm start
```

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Private - All rights reserved.
