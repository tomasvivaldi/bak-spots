# Bangkok Personal Hub — Design Spec

**Date:** 2026-05-22  
**Stack:** Next.js 14 App Router · Supabase · Claude API (Haiku) · Framer Motion · Vercel

---

## Purpose

Personal website for quick access to curated Bangkok spots organized around dating and social life. Supports manual entry, AI-assisted import from Google Maps URLs and chat logs, and future external AI suggestions.

---

## Architecture

```
bkk/
├── app/
│   ├── (public)/
│   │   ├── page.tsx           # home / hero
│   │   ├── dates/page.tsx     # date spots
│   │   ├── nightlife/page.tsx # bars, clubs, restaurants
│   │   ├── day/page.tsx       # parks, cafes, day activities
│   │   └── meet/page.tsx      # malls, areas to meet people
│   ├── admin/
│   │   ├── page.tsx           # dashboard: spot table + stats
│   │   ├── login/page.tsx     # password gate
│   │   ├── spots/page.tsx     # add / edit / delete spots
│   │   └── import/page.tsx    # AI import: Maps URL or chat log
│   └── api/                   # reserved for Supabase webhooks
├── components/
│   ├── ui/                    # SpotCard, FilterBar, Nav, Modal, PriceTag, VibeChip
│   └── motion/                # PageTransition, StaggerContainer, AnimatedCard
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # anon client (public pages)
│   │   └── server.ts          # service role client (server actions only)
│   ├── claude/
│   │   ├── parse-maps.ts      # Google Places API fetch + Claude formatting
│   │   └── parse-chat.ts      # chat log extraction prompt + response parser
│   └── auth/
│       └── session.ts         # cookie read/write helpers
└── middleware.ts               # guards all /admin/* routes
```

**Data flow:**
- Public pages → Supabase anon key (read-only, `status = 'active'` filter)
- Admin Server Actions → Supabase service role key (full write access)
- Import page → Server Action → Google Places API + Claude Haiku → pre-filled form → user confirms → Supabase

---

## Data Model

Single `spots` table in Supabase:

```sql
CREATE TYPE spot_category AS ENUM ('date', 'nightlife', 'day', 'meet');
CREATE TYPE spot_source   AS ENUM ('manual', 'maps_import', 'chat_import', 'ai_suggestion');
CREATE TYPE spot_status   AS ENUM ('active', 'closed', 'unvisited');

CREATE TABLE spots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  category        spot_category NOT NULL,
  subcategory     text,                        -- "bar", "club", "park", "mall", "cafe"
  area            text,                        -- "Silom", "Sukhumvit", "Thonglor", etc.
  description     text,
  vibe            text[],                      -- ["rooftop", "chill", "loud", "outdoor"]
  price_range     int CHECK (price_range BETWEEN 1 AND 4),
  google_maps_url text,
  coordinates     point,                       -- (lng, lat) for future map view
  photos          text[],                      -- photo URLs
  my_notes        text,                        -- private, not shown on public pages
  source          spot_source DEFAULT 'manual',
  rating          int CHECK (rating BETWEEN 1 AND 5),
  status          spot_status DEFAULT 'unvisited',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active" ON spots FOR SELECT USING (status = 'active');
```

**Category definitions:**
| category | subcategories | use case |
|---|---|---|
| `date` | restaurant, rooftop, bar, experience | curated 1-on-1 date spots |
| `nightlife` | bar, club, restaurant, rooftop | going out, social nights |
| `day` | park, cafe, market, activity | daytime hangouts |
| `meet` | mall, street, area, event | high foot traffic, easy to meet people |

---

## UI & Visual Design

### Color Palette
```
Background:  #F5F0E8   warm off-white
Surface:     #EDE8DC   card background
Text:        #2C2416   dark brown
Accent:      #8B6914   golden ochre (CTAs, hover states)
Muted:       #9E9082   secondary text
Border:      #D4CEC4   subtle dividers
```

### Typography
Geist Sans (Next.js default). Sizes: hero 72px, section 36px, card title 18px, body 14px.

### Pages

**Home (`/`):**
- Full-viewport hero, city name large type, subtitle "Your Bangkok"
- 4 animated category cards below fold — slide up on scroll
- Minimal nav: logo left, category links right

**Category pages (`/dates`, `/nightlife`, `/day`, `/meet`):**
- Sticky filter bar: area chips + vibe multi-select + price range
- Responsive grid of SpotCards (2 col mobile, 3 col desktop)
- `AnimatePresence` layout — cards reorder/filter smoothly
- Empty state: friendly message if filters return 0 results

**SpotCard:**
- Name, area chip, vibe tags (max 3 shown), price dots (฿–฿฿฿฿)
- Short description (2 lines, truncated)
- Hover: slight scale + shadow lift, "Open in Maps" link appears

**Admin Dashboard (`/admin`):**
- Stats row: total spots, by category, unvisited count
- Full table: sortable by name/area/rating/date, inline status toggle
- Add button → modal form. Import button → `/admin/import`

### Framer Motion Animations
| Element | Animation |
|---|---|
| Page transitions | fade + Y:20→0, 150ms ease-out |
| Card entrance | staggered, 50ms delay per card |
| Filter changes | `AnimatePresence` layout, spring physics |
| Hero text | word-by-word reveal, 30ms stagger |
| Admin import states | crossfade between parsing/reviewing/saved |

---

## AI Import Flow

### Mode 1 — Google Maps URL

```
1. User pastes Maps URL into import form
2. Server Action: fetch place details via Google Places API
   Fields: name, formatted_address, types, rating, photos, url
3. Server Action: send to Claude Haiku
   Prompt: format into spot schema, suggest category/subcategory/vibe tags
4. Return pre-filled form to user
5. User reviews, edits if needed, confirms
6. Save to Supabase (source: 'maps_import')
```

Google Places API key required. Free tier: 28,000 requests/month.

### Mode 2 — Chat Log Paste

```
1. User pastes raw DM text (Line, WhatsApp, iMessage — any format)
2. Server Action: send to Claude Haiku with extraction prompt:
   "Extract all Bangkok place recommendations from this conversation.
    For each place return: name, area of Bangkok, why it was recommended,
    any vibe descriptors mentioned. Return as JSON array."
3. Claude returns structured JSON array
4. UI renders checklist — user selects which spots to keep, edits names/categories
5. Bulk save to Supabase (source: 'chat_import')
```

### Future — Phase 2 AI Suggestions
External scraping (Bangkok expat forums, Reddit r/ThailandTourism) → same Claude extraction pipeline → stored with `source: 'ai_suggestion'`, surfaced as "suggested, unvisited" section on each category page.

---

## Auth & Security

### Password Gate
```
ADMIN_PASSWORD env var → set in Vercel dashboard

Flow:
1. middleware.ts: all /admin/* routes check cookie `bkk_admin_session`
2. Invalid/missing → redirect to /admin/login
3. Login: POST Server Action, compare against ADMIN_PASSWORD
4. Match → set httpOnly cookie (7-day expiry) → redirect /admin
5. No match → error state on login page
```

### Supabase Security
- Public pages: anon key, RLS enforces `status = 'active'` read-only
- Admin Server Actions: service role key, server-only (never shipped to client bundle)
- `my_notes` and `rating` fields: excluded from public Supabase queries at query level

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
ADMIN_PASSWORD=

# AI
ANTHROPIC_API_KEY=

# Google Places
GOOGLE_PLACES_API_KEY=
```

All set in `.env.local` locally and Vercel dashboard for production.

---

## Data Import Guide

### Step 1 — Initial Google Maps Data Collection
Since Maps data export method is TBD, two paths:
- **Takeout:** Download from myaccount.google.com/data-and-privacy → Google Maps → Saved Places → JSON. Parse with a one-time script into Supabase bulk insert.
- **Manual + AI:** Use the Maps URL import in `/admin/import` one spot at a time.

### Step 2 — Chat Log Import
Copy DM text from Line/WhatsApp/iMessage. Paste into import form. Review Claude's extracted spots. Confirm. Repeat per conversation.

### Step 3 — Manual Curation
After bulk import, use admin table to:
- Set status `active` / `unvisited` / `closed`
- Add personal `rating` and `my_notes`
- Assign correct `category` if AI got it wrong
- Add/edit `vibe` tags

### Step 4 — Ongoing Use
New spot discovered → open `/admin/import` on phone → paste Maps URL → 3 taps to save.

---

## Build Sequence (for implementation plan)

1. Project scaffold: Next.js 14 + Tailwind + Framer Motion + Supabase SDK
2. Supabase schema + RLS setup
3. Auth middleware + login page
4. Public layout + design system (colors, typography, motion wrappers)
5. SpotCard component + FilterBar component
6. Home page + 4 category pages (static/read from Supabase)
7. Admin dashboard + spot CRUD
8. AI import — Maps URL mode
9. AI import — chat log mode
10. Vercel deployment + env var configuration
11. Initial data import (Maps + chat logs)
12. Phase 2: external AI suggestions (future)
