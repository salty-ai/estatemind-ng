# Product Requirements Document (PRD): EstateMind Nigeria

## 1. Introduction
**EstateMind** is an AI-first real estate marketplace designed specifically for the Nigerian market. It leverages "Agentic AI" to act as a personal digital broker for users, solving key local challenges like trust deficits, fake listings, and search fatigue.

### 1.1 Goals
*   **Primary Goal:** To become the most trusted and efficient real estate platform in Nigeria.
*   **Secondary Goal:** To reduce the time-to-find for property seekers by 50% via AI automation.
*   **Metric for Success:** 10,000 verified listings and 5,000 active monthly users within 6 months.

---

## 2. User Personas

### 2.1 The Seeker (Chinedu)
*   **Profile:** Young professional in Lagos, tech-savvy, busy.
*   **Pain Point:** Hates calling 20 agents who all say "inspection fee required."
*   **Goal:** Find a serviced apartment in Lekki without hassle.

### 2.2 The Landlord/Agent (Alhaji Musa)
*   **Profile:** Property owner or established agent.
*   **Pain Point:** Dealing with "unserious" clients and repetitive questions.
*   **Goal:** Qualified leads and faster turnaround.

---

## 3. Features & Functional Requirements

### 3.1 AI Agent ("The Digital Broker") ✅ IMPLEMENTED
*   **Natural Language Search:** Users can type "3-bedroom in Ikeja GRA under 5m" and get results.
*   **Conversational Filtering:** The AI asks follow-up questions (e.g., "Do you need a BQ?", "Is 24/7 power mandatory?").
*   **Nigerian Context:** AI understands local areas, prices in Naira, and Nigerian real estate terminology.
*   **Streaming Responses:** Real-time text streaming powered by Google Gemini.
*   ~~Scheduling:~~ AI interfaces with the agent's calendar to book inspections. *(Future phase)*
*   ~~Negotiation Assistant:~~ AI provides price history for the area. *(Future phase)*

### 3.2 "TrueVerify" Trust System ✅ PARTIALLY IMPLEMENTED
*   **Video Walkthroughs:** UI for mandatory timestamped videos for "Verified" badge.
*   ~~Agent KYC:~~ Integration with NIN/BVN verification. *(Future phase)*
*   ~~Report & Ban:~~ Users can report "ghost listings"; 3 strikes = agent ban. *(Future phase)*

### 3.3 Listings Management ✅ IMPLEMENTED
*   **Categories:** Residential (Rent/Sale), Short-let.
*   **Attributes:**
    *   Location (State, City, Area, Address).
    *   Price with Nigerian-specific periods (per annum, per month, per night).
    *   Specs (Bedrooms, Bathrooms, Toilets, Parking).
*   **Form Validation:** Zod schemas with react-hook-form integration.
*   **Database Integration:** Properties stored in Supabase with RLS policies.
*   ~~WhatsApp Integration:~~ Auto-sync listings from WhatsApp Business API. *(Future phase)*

### 3.4 User Dashboard ✅ IMPLEMENTED
*   **Overview Stats:** Listing count, views, leads (placeholders ready for data).
*   **My Listings:** View, edit, delete user's properties.
*   **Quick Actions:** Post new listing, boost listings, verify video, edit profile.
*   ~~Favorites:~~ Saved properties. *(Future phase)*
*   ~~Search History:~~ Recent AI chats. *(Future phase)*
*   ~~Alerts:~~ Notifications for new matches. *(Future phase)*

### 3.5 Authentication System ✅ IMPLEMENTED
*   **Email/Password Auth:** Secure authentication via Supabase Auth.
*   **Role Selection:** Users choose between "Property Seeker" and "Property Agent" on signup.
*   **Protected Routes:** Middleware protects dashboard routes.
*   **Session Management:** SSR-compatible auth with automatic token refresh.

### 3.6 Mobile Navigation ✅ IMPLEMENTED
*   **Landing Page:** Hamburger menu with slide-in drawer for mobile.
*   **Dashboard:** Mobile sidebar with touch-friendly navigation.
*   **Responsive Design:** All pages optimized for mobile-first experience.

---

## 4. Technical Architecture

### 4.1 Tech Stack (Current Implementation)
*   **Framework:** Next.js 16 (App Router).
*   **Language:** TypeScript.
*   **Styling:** Tailwind CSS 4.
*   **Database:** Supabase (PostgreSQL).
*   **Auth:** Supabase Auth with SSR (`@supabase/ssr`).
*   **AI:** Vercel AI SDK + Google Gemini (`ai`, `@ai-sdk/google`).
*   **Form Validation:** Zod 4 + React Hook Form.
*   **Icons:** Lucide React.

### 4.2 Data Model (Implemented)

```sql
-- Users
profiles: id, email, full_name, avatar_url, role (seeker/agent/admin), is_verified, created_at

-- Properties
properties: id, owner_id, title, description, price, currency, period, type (rent/sale/short_let),
            status (draft/pending/active/sold/leased), address, area, city, state,
            bedrooms, bathrooms, toilets, parking, images[] (currently external URLs or placeholder/empty values from seed data; no upload flow yet),
            video_url, is_verified_listing, created_at, updated_at

-- Features (Many-to-Many)
features: id, name
property_features: property_id, feature_id
```

### 4.3 Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection, session refresh |
| `lib/supabase/server.ts` | Server-side Supabase client |
| `lib/supabase/client.ts` | Browser-side Supabase client |
| `lib/supabase/middleware.ts` | Middleware Supabase client |
| `lib/prompts/real-estate.ts` | AI system prompt for Nigerian context |
| `lib/validations/listing.ts` | Zod schemas for form validation |
| `components/AIChat.tsx` | Floating chat widget with streaming |
| `components/DashboardSidebar.tsx` | Dashboard navigation with mobile drawer |

---

## 5. Design Guidelines (Nigeria Context)
*   **Mobile First:** 90% of Nigerian traffic is mobile. ✅
*   **Data Saver:** Optimized images for slower networks. *(Partial)*
*   **Trust Signals:** Prominent use of "Verified" badges and green colors (safety). ✅
*   **Local Terminology:** Use terms like "Self-con", "Duplex", "Tenement Rate". *(Future enhancement)*

---

## 6. Implementation Status

### Phase 1: Foundation ✅ COMPLETE
- [x] Project Setup with Next.js 16
- [x] Supabase SSR Authentication
- [x] Database Schema with RLS
- [x] Protected Dashboard Routes
- [x] User Registration with Role Selection
- [x] Login/Logout Flow

### Phase 2: AI Integration ✅ COMPLETE
- [x] Vercel AI SDK Integration
- [x] Google Gemini Model Configuration
- [x] Nigerian Real Estate System Prompt
- [x] Streaming Chat Interface
- [x] Floating Chat Widget

### Phase 3: Listings ✅ COMPLETE
- [x] Form Validation with Zod
- [x] Multi-step Listing Form
- [x] Database Insert for Properties
- [x] Listings Table with Real Data
- [x] Dashboard Stats Integration

### Phase 4: Mobile & Polish ✅ COMPLETE
- [x] Mobile Navigation (Landing Page)
- [x] Mobile Sidebar (Dashboard)
- [x] Responsive Form Layouts
- [x] Loading States & Error Handling

### Phase 5: Future Enhancements
- [ ] Image Upload to Supabase Storage (not implemented; images[] currently populated with external URLs or placeholder/empty values from seed data)
- [ ] Video Upload for TrueVerify
- [ ] Agent KYC Verification
- [ ] Property Search with Filters
- [ ] Favorites/Saved Properties
- [ ] Notification System
- [ ] WhatsApp Integration
- [ ] Calendar Booking System

---

## 7. Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

---

## 8. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | AI chat with streaming response |

---

## 9. Security Considerations

*   **Row Level Security:** All database tables have RLS policies.
*   **Server-side Auth:** User sessions validated on the server.
*   **Protected Routes:** Middleware enforces authentication.
*   **Input Validation:** Zod schemas validate all form inputs.
*   **CSRF Protection:** Built into Supabase Auth.
