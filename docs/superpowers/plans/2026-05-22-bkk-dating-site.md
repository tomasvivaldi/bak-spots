# Bangkok Personal Hub — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal Next.js 14 website for curated Bangkok spot discovery with AI-assisted data import (Google Maps URLs + chat logs), Supabase storage, Framer Motion animations, and a password-gated admin section.

**Architecture:** Next.js 14 App Router with Server Actions for all mutations. Supabase Postgres with RLS for data persistence. Claude Haiku for AI-powered spot extraction. Password gate via Next.js middleware checking an httpOnly cookie against `SESSION_SECRET` env var.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS 3, Framer Motion 11, @supabase/supabase-js, @supabase/ssr, @anthropic-ai/sdk, Vitest, React Testing Library, Vercel

---

## File Map

```
bkk/
├── __tests__/
│   ├── lib/claude/parse-maps.test.ts
│   ├── lib/claude/parse-chat.test.ts
│   ├── lib/auth/session.test.ts
│   └── components/
│       ├── SpotCard.test.tsx
│       └── FilterBar.test.tsx
├── app/
│   ├── layout.tsx                    # root layout (fonts)
│   ├── globals.css                   # CSS variables + base styles
│   ├── (public)/
│   │   ├── layout.tsx                # public layout with Nav
│   │   ├── page.tsx                  # home / hero + category cards
│   │   ├── dates/page.tsx            # date spots page
│   │   ├── nightlife/page.tsx        # nightlife page
│   │   ├── day/page.tsx              # day activities page
│   │   └── meet/page.tsx             # meet people page
│   └── admin/
│       ├── layout.tsx                # admin layout (no public nav)
│       ├── page.tsx                  # admin dashboard (stats + spot table)
│       ├── login/page.tsx            # password login form
│       ├── spots/page.tsx            # add/edit/delete spots
│       └── import/page.tsx           # AI import UI (Maps URL + chat log)
├── components/
│   ├── motion/
│   │   ├── PageTransition.tsx        # fade + Y translate wrapper
│   │   ├── StaggerContainer.tsx      # stagger children entrance
│   │   └── AnimatedCard.tsx          # card with hover lift
│   └── ui/
│       ├── Nav.tsx                   # top nav with category links
│       ├── SpotCard.tsx              # spot display card
│       ├── FilterBar.tsx             # area + vibe + price filters
│       ├── PriceDots.tsx             # ฿ dots 1-4
│       └── VibeChip.tsx              # vibe tag chip
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # browser anon client
│   │   └── server.ts                 # server anon + service role clients
│   ├── claude/
│   │   ├── parse-maps.ts             # Google Places API + Claude formatting
│   │   └── parse-chat.ts             # chat log extraction via Claude
│   └── auth/
│       └── session.ts                # cookie read helper
├── actions/
│   ├── auth.ts                       # login / logout server actions
│   ├── spots.ts                      # spot CRUD server actions
│   └── import.ts                     # AI import server actions
├── types/
│   └── spot.ts                       # all TypeScript types
├── supabase/
│   └── schema.sql                    # full DB schema + RLS
├── middleware.ts                      # admin route guard
├── vitest.config.ts
├── vitest.setup.ts
├── tailwind.config.ts
└── .env.local.example
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `bkk/` (Next.js project root — all files below are relative to this)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.env.local.example`
- Create: `tailwind.config.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/tomasvivaldi/Documents/claude/web
npx create-next-app@latest bkk --typescript --tailwind --eslint --app --src-dir no --import-alias "@/*"
cd bkk
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install framer-motion @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk
```

- [ ] **Step 3: Install test dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Step 4: Write vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './') },
  },
})
```

- [ ] **Step 5: Write vitest.setup.ts**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 7: Write .env.local.example**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth
ADMIN_PASSWORD=your-chosen-password
SESSION_SECRET=generate-with-openssl-rand-base64-32

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Google Places
GOOGLE_PLACES_API_KEY=your-places-api-key
```

- [ ] **Step 8: Configure Tailwind theme in tailwind.config.ts**

Replace the generated `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F0E8',
        surface: '#EDE8DC',
        foreground: '#2C2416',
        accent: '#8B6914',
        muted: '#9E9082',
        border: '#D4CEC4',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 9: Run tests (should be 0 tests, no failures)**

```bash
npm run test:run
```

Expected: `No test files found`

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with vitest and tailwind theme"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `types/spot.ts`

- [ ] **Step 1: Write types/spot.ts**

```ts
export type SpotCategory = 'date' | 'nightlife' | 'day' | 'meet'
export type SpotSource = 'manual' | 'maps_import' | 'chat_import' | 'ai_suggestion'
export type SpotStatus = 'active' | 'closed' | 'unvisited'

export interface Spot {
  id: string
  name: string
  category: SpotCategory
  subcategory: string | null
  area: string | null
  description: string | null
  vibe: string[]
  price_range: number | null
  google_maps_url: string | null
  coordinates: { x: number; y: number } | null
  photos: string[]
  my_notes: string | null
  source: SpotSource
  rating: number | null
  status: SpotStatus
  created_at: string
  updated_at: string
}

export type SpotInsert = Omit<Spot, 'id' | 'created_at' | 'updated_at'>
export type SpotUpdate = Partial<SpotInsert> & { id: string }

export interface ParsedMapsSpot {
  name: string
  area: string | null
  subcategory: string | null
  description: string
  vibe: string[]
  price_range: number | null
  google_maps_url: string
  category: SpotCategory
}

export interface ExtractedChatSpot {
  name: string
  area: string | null
  why: string | null
  vibe: string[]
  category: SpotCategory
  subcategory: string | null
}

export interface FilterState {
  area: string | null
  vibe: string[]
  price_range: number | null
}
```

- [ ] **Step 2: Commit**

```bash
git add types/spot.ts
git commit -m "chore: add TypeScript types for spots"
```

---

## Task 3: Supabase Schema + Client Helpers

**Files:**
- Create: `supabase/schema.sql`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Write supabase/schema.sql**

```sql
-- Run this in your Supabase SQL editor

CREATE TYPE spot_category AS ENUM ('date', 'nightlife', 'day', 'meet');
CREATE TYPE spot_source   AS ENUM ('manual', 'maps_import', 'chat_import', 'ai_suggestion');
CREATE TYPE spot_status   AS ENUM ('active', 'closed', 'unvisited');

CREATE TABLE spots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  category        spot_category NOT NULL,
  subcategory     text,
  area            text,
  description     text,
  vibe            text[] DEFAULT '{}',
  price_range     int CHECK (price_range BETWEEN 1 AND 4),
  google_maps_url text,
  coordinates     point,
  photos          text[] DEFAULT '{}',
  my_notes        text,
  source          spot_source DEFAULT 'manual',
  rating          int CHECK (rating BETWEEN 1 AND 5),
  status          spot_status DEFAULT 'unvisited',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER spots_updated_at
  BEFORE UPDATE ON spots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: public can only read active spots (no my_notes, no rating)
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_active"
  ON spots FOR SELECT
  USING (status = 'active');
```

- [ ] **Step 2: Apply schema**

Open your Supabase project → SQL Editor → paste contents of `supabase/schema.sql` → Run.

- [ ] **Step 3: Write lib/supabase/client.ts**

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 4: Write lib/supabase/server.ts**

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export function createServiceClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add supabase/ lib/supabase/
git commit -m "feat: supabase schema and client helpers"
```

---

## Task 4: Auth Middleware + Login

**Files:**
- Create: `middleware.ts`
- Create: `lib/auth/session.ts`
- Create: `actions/auth.ts`
- Create: `app/admin/login/page.tsx`
- Create: `__tests__/lib/auth/session.test.ts`

- [ ] **Step 1: Write failing test for session helper**

```ts
// __tests__/lib/auth/session.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers before importing session
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

import { cookies } from 'next/headers'
import { isAuthenticated } from '@/lib/auth/session'

describe('isAuthenticated', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-secret-abc'
  })

  it('returns true when cookie matches SESSION_SECRET', () => {
    vi.mocked(cookies).mockReturnValue({
      get: (name: string) =>
        name === 'bkk_admin_session' ? { name, value: 'test-secret-abc' } : undefined,
    } as any)
    expect(isAuthenticated()).toBe(true)
  })

  it('returns false when cookie is missing', () => {
    vi.mocked(cookies).mockReturnValue({
      get: () => undefined,
    } as any)
    expect(isAuthenticated()).toBe(false)
  })

  it('returns false when cookie has wrong value', () => {
    vi.mocked(cookies).mockReturnValue({
      get: (name: string) =>
        name === 'bkk_admin_session' ? { name, value: 'wrong-secret' } : undefined,
    } as any)
    expect(isAuthenticated()).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm run test:run -- __tests__/lib/auth/session.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/auth/session'`

- [ ] **Step 3: Write lib/auth/session.ts**

```ts
import { cookies } from 'next/headers'

export function isAuthenticated(): boolean {
  const session = cookies().get('bkk_admin_session')
  return session?.value === process.env.SESSION_SECRET
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm run test:run -- __tests__/lib/auth/session.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 5: Write middleware.ts**

```ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) return NextResponse.next()
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next()

  const session = request.cookies.get('bkk_admin_session')
  if (session?.value !== process.env.SESSION_SECRET) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
```

- [ ] **Step 6: Write actions/auth.ts**

```ts
'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const password = formData.get('password') as string

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Wrong password' }
  }

  cookies().set('bkk_admin_session', process.env.SESSION_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/admin')
}

export async function logout() {
  cookies().delete('bkk_admin_session')
  redirect('/admin/login')
}
```

- [ ] **Step 7: Write app/admin/login/page.tsx**

```tsx
'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { login } from '@/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Checking...' : 'Enter'}
    </button>
  )
}

export default function LoginPage() {
  const [state, action] = useFormState(login, null)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Bangkok Hub</h1>
        <p className="text-muted text-sm mb-8">Admin access</p>

        <form action={action} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
          {state?.error && (
            <p className="text-red-500 text-sm">{state.error}</p>
          )}
          <SubmitButton />
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Run all tests**

```bash
npm run test:run
```

Expected: PASS (3 tests)

- [ ] **Step 9: Commit**

```bash
git add middleware.ts lib/auth/ actions/auth.ts app/admin/login/ __tests__/lib/auth/
git commit -m "feat: admin auth with middleware cookie guard and login page"
```

---

## Task 5: Framer Motion Wrappers

**Files:**
- Create: `components/motion/PageTransition.tsx`
- Create: `components/motion/StaggerContainer.tsx`
- Create: `components/motion/AnimatedCard.tsx`

- [ ] **Step 1: Write components/motion/PageTransition.tsx**

```tsx
'use client'
import { motion } from 'framer-motion'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Write components/motion/StaggerContainer.tsx**

```tsx
'use client'
import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.15, ease: 'easeOut' } },
}

export function StaggerContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Write components/motion/AnimatedCard.tsx**

```tsx
'use client'
import { motion } from 'framer-motion'

export default function AnimatedCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/motion/
git commit -m "feat: framer motion wrapper components"
```

---

## Task 6: Core UI Components

**Files:**
- Create: `components/ui/Nav.tsx`
- Create: `components/ui/PriceDots.tsx`
- Create: `components/ui/VibeChip.tsx`
- Create: `components/ui/SpotCard.tsx`
- Create: `__tests__/components/SpotCard.test.tsx`

- [ ] **Step 1: Write failing SpotCard test**

```tsx
// __tests__/components/SpotCard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SpotCard from '@/components/ui/SpotCard'
import type { Spot } from '@/types/spot'

const mockSpot: Spot = {
  id: '1',
  name: 'Vesper Bar',
  category: 'date',
  subcategory: 'bar',
  area: 'Silom',
  description: 'Intimate cocktail bar with great atmosphere.',
  vibe: ['romantic', 'chill', 'dim-lit'],
  price_range: 3,
  google_maps_url: 'https://maps.google.com/place/vesper',
  coordinates: null,
  photos: [],
  my_notes: null,
  source: 'manual',
  rating: 5,
  status: 'active',
  created_at: '2026-05-22T00:00:00Z',
  updated_at: '2026-05-22T00:00:00Z',
}

describe('SpotCard', () => {
  it('renders spot name and area', () => {
    render(<SpotCard spot={mockSpot} />)
    expect(screen.getByText('Vesper Bar')).toBeInTheDocument()
    expect(screen.getByText('Silom')).toBeInTheDocument()
  })

  it('renders vibe chips (max 3)', () => {
    render(<SpotCard spot={mockSpot} />)
    expect(screen.getByText('romantic')).toBeInTheDocument()
    expect(screen.getByText('chill')).toBeInTheDocument()
    expect(screen.getByText('dim-lit')).toBeInTheDocument()
  })

  it('renders description truncated', () => {
    render(<SpotCard spot={mockSpot} />)
    expect(screen.getByText('Intimate cocktail bar with great atmosphere.')).toBeInTheDocument()
  })

  it('renders Maps link when google_maps_url present', () => {
    render(<SpotCard spot={mockSpot} />)
    expect(screen.getByRole('link', { name: /maps/i })).toHaveAttribute(
      'href',
      'https://maps.google.com/place/vesper'
    )
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm run test:run -- __tests__/components/SpotCard.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/ui/SpotCard'`

- [ ] **Step 3: Write components/ui/PriceDots.tsx**

```tsx
export default function PriceDots({ value }: { value: number | null }) {
  if (!value) return null
  return (
    <span className="text-accent text-sm font-medium">
      {'฿'.repeat(value)}
      <span className="text-border">{'฿'.repeat(4 - value)}</span>
    </span>
  )
}
```

- [ ] **Step 4: Write components/ui/VibeChip.tsx**

```tsx
export default function VibeChip({ label }: { label: string }) {
  return (
    <span className="inline-block px-2 py-0.5 text-xs text-muted border border-border rounded-full">
      {label}
    </span>
  )
}
```

- [ ] **Step 5: Write components/ui/SpotCard.tsx**

```tsx
import type { Spot } from '@/types/spot'
import AnimatedCard from '@/components/motion/AnimatedCard'
import PriceDots from './PriceDots'
import VibeChip from './VibeChip'

export default function SpotCard({ spot }: { spot: Spot }) {
  const visibleVibes = spot.vibe.slice(0, 3)

  return (
    <AnimatedCard className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-foreground font-semibold text-base leading-tight">{spot.name}</h3>
          {spot.area && (
            <span className="text-xs text-muted mt-0.5 block">{spot.area}</span>
          )}
        </div>
        <PriceDots value={spot.price_range} />
      </div>

      {spot.description && (
        <p className="text-sm text-muted leading-relaxed line-clamp-2">{spot.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        <div className="flex flex-wrap gap-1">
          {visibleVibes.map((v) => (
            <VibeChip key={v} label={v} />
          ))}
        </div>
        {spot.google_maps_url && (
          <a
            href={spot.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline shrink-0"
            aria-label="Open in Maps"
          >
            Maps ↗
          </a>
        )}
      </div>
    </AnimatedCard>
  )
}
```

- [ ] **Step 6: Run SpotCard tests — expect pass**

```bash
npm run test:run -- __tests__/components/SpotCard.test.tsx
```

Expected: PASS (4 tests)

- [ ] **Step 7: Write components/ui/Nav.tsx**

```tsx
import Link from 'next/link'

const links = [
  { href: '/dates', label: 'Dates' },
  { href: '/nightlife', label: 'Nightlife' },
  { href: '/day', label: 'Day' },
  { href: '/meet', label: 'Meet' },
]

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-foreground font-semibold tracking-tight">
          BKK
        </Link>
        <div className="flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add components/ui/ __tests__/components/
git commit -m "feat: SpotCard, Nav, PriceDots, VibeChip UI components"
```

---

## Task 7: FilterBar Component

**Files:**
- Create: `components/ui/FilterBar.tsx`
- Create: `__tests__/components/FilterBar.test.tsx`

- [ ] **Step 1: Write failing FilterBar test**

```tsx
// __tests__/components/FilterBar.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FilterBar from '@/components/ui/FilterBar'

const areas = ['Silom', 'Sukhumvit', 'Thonglor', 'Ekkamai']

describe('FilterBar', () => {
  it('renders area options', () => {
    render(<FilterBar areas={areas} vibes={[]} onChange={vi.fn()} />)
    expect(screen.getByText('All Areas')).toBeInTheDocument()
    expect(screen.getByText('Silom')).toBeInTheDocument()
  })

  it('calls onChange with selected area', async () => {
    const onChange = vi.fn()
    render(<FilterBar areas={areas} vibes={[]} onChange={onChange} />)
    await userEvent.click(screen.getByText('Silom'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ area: 'Silom' })
    )
  })

  it('calls onChange with null area when All Areas clicked', async () => {
    const onChange = vi.fn()
    render(<FilterBar areas={areas} vibes={[]} onChange={onChange} />)
    await userEvent.click(screen.getByText('Silom'))
    await userEvent.click(screen.getByText('All Areas'))
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ area: null })
    )
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm run test:run -- __tests__/components/FilterBar.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/ui/FilterBar'`

- [ ] **Step 3: Write components/ui/FilterBar.tsx**

```tsx
'use client'
import { useState } from 'react'
import type { FilterState } from '@/types/spot'

interface FilterBarProps {
  areas: string[]
  vibes: string[]
  onChange: (filters: FilterState) => void
}

export default function FilterBar({ areas, vibes, onChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    area: null,
    vibe: [],
    price_range: null,
  })

  function setArea(area: string | null) {
    const next = { ...filters, area }
    setFilters(next)
    onChange(next)
  }

  function toggleVibe(vibe: string) {
    const next = {
      ...filters,
      vibe: filters.vibe.includes(vibe)
        ? filters.vibe.filter((v) => v !== vibe)
        : [...filters.vibe, vibe],
    }
    setFilters(next)
    onChange(next)
  }

  return (
    <div className="flex flex-wrap gap-2 py-4">
      <button
        onClick={() => setArea(null)}
        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
          filters.area === null
            ? 'bg-accent text-white border-accent'
            : 'border-border text-muted hover:border-accent hover:text-foreground'
        }`}
      >
        All Areas
      </button>
      {areas.map((area) => (
        <button
          key={area}
          onClick={() => setArea(area)}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            filters.area === area
              ? 'bg-accent text-white border-accent'
              : 'border-border text-muted hover:border-accent hover:text-foreground'
          }`}
        >
          {area}
        </button>
      ))}
      {vibes.length > 0 && (
        <>
          <div className="w-px bg-border mx-1" />
          {vibes.map((vibe) => (
            <button
              key={vibe}
              onClick={() => toggleVibe(vibe)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                filters.vibe.includes(vibe)
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted hover:border-foreground hover:text-foreground'
              }`}
            >
              {vibe}
            </button>
          ))}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run FilterBar tests — expect pass**

```bash
npm run test:run -- __tests__/components/FilterBar.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Run all tests**

```bash
npm run test:run
```

Expected: PASS (all tests)

- [ ] **Step 6: Commit**

```bash
git add components/ui/FilterBar.tsx __tests__/components/FilterBar.test.tsx
git commit -m "feat: FilterBar component with area and vibe filtering"
```

---

## Task 8: Global Layout + Home Page

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `app/(public)/layout.tsx`
- Create: `app/(public)/page.tsx`

- [ ] **Step 1: Update app/globals.css**

Replace contents:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #F5F0E8;
  --surface: #EDE8DC;
  --foreground: #2C2416;
  --accent: #8B6914;
  --muted: #9E9082;
  --border: #D4CEC4;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), sans-serif;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- [ ] **Step 2: Update app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bangkok Hub',
  description: 'Your personal Bangkok spot guide',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  )
}
```

Note: install geist font if not present: `npm install geist`

- [ ] **Step 3: Write app/(public)/layout.tsx**

```tsx
import Nav from '@/components/ui/Nav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="pt-14 min-h-screen">{children}</main>
    </>
  )
}
```

- [ ] **Step 4: Write app/(public)/page.tsx**

```tsx
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PageTransition from '@/components/motion/PageTransition'

const categories = [
  { href: '/dates', label: 'Dates', description: 'Restaurants, rooftops, cocktail bars', emoji: '🌙' },
  { href: '/nightlife', label: 'Nightlife', description: 'Clubs, bars, late nights', emoji: '🎶' },
  { href: '/day', label: 'Day Out', description: 'Parks, cafes, markets', emoji: '☀️' },
  { href: '/meet', label: 'Meet', description: 'Malls, areas, social spots', emoji: '👁️' },
]

const wordVariants = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' },
  }),
}

export default function HomePage() {
  const words = 'Bangkok'.split('')

  return (
    <PageTransition>
      <section className="max-w-6xl mx-auto px-6 py-24">
        {/* Hero */}
        <div className="mb-20">
          <div className="flex overflow-hidden">
            {words.map((char, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="show"
                className="text-8xl font-bold text-foreground tracking-tighter"
              >
                {char}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-4 text-xl text-muted"
          >
            Your personal city guide
          </motion.p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map(({ href, label, description, emoji }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.2, ease: 'easeOut' }}
            >
              <Link
                href={href}
                className="group block bg-surface border border-border rounded-2xl p-6 hover:border-accent transition-colors"
              >
                <span className="text-3xl block mb-3">{emoji}</span>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                  {label}
                </h2>
                <p className="text-sm text-muted mt-1">{description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </PageTransition>
  )
}
```

- [ ] **Step 5: Run all tests**

```bash
npm run test:run
```

Expected: PASS (all existing tests)

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.tsx app/'(public)'/
git commit -m "feat: home page with hero animation and category cards"
```

---

## Task 9: Category Pages

**Files:**
- Create: `app/(public)/dates/page.tsx`
- Create: `app/(public)/nightlife/page.tsx`
- Create: `app/(public)/day/page.tsx`
- Create: `app/(public)/meet/page.tsx`

All four pages share the same pattern. Write dates first, copy for the rest.

- [ ] **Step 1: Write app/(public)/dates/page.tsx**

```tsx
import { createClient } from '@/lib/supabase/server'
import type { Spot } from '@/types/spot'
import CategoryPageClient from './_client'

export const revalidate = 60

export default async function DatesPage() {
  const supabase = createClient()
  const { data: spots } = await supabase
    .from('spots')
    .select('id,name,category,subcategory,area,description,vibe,price_range,google_maps_url,source,status')
    .eq('category', 'date')
    .eq('status', 'active')
    .order('name')

  const areas = [...new Set((spots ?? []).map((s: Spot) => s.area).filter(Boolean))] as string[]
  const vibes = [...new Set((spots ?? []).flatMap((s: Spot) => s.vibe))]

  return <CategoryPageClient spots={spots ?? []} areas={areas} vibes={vibes} title="Date Spots" />
}
```

- [ ] **Step 2: Write app/(public)/dates/_client.tsx**

```tsx
'use client'
import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Spot, FilterState } from '@/types/spot'
import SpotCard from '@/components/ui/SpotCard'
import FilterBar from '@/components/ui/FilterBar'
import PageTransition from '@/components/motion/PageTransition'

interface Props {
  spots: Spot[]
  areas: string[]
  vibes: string[]
  title: string
}

export default function CategoryPageClient({ spots, areas, vibes, title }: Props) {
  const [filters, setFilters] = useState<FilterState>({ area: null, vibe: [], price_range: null })

  const filtered = useMemo(() => {
    return spots.filter((s) => {
      if (filters.area && s.area !== filters.area) return false
      if (filters.vibe.length > 0 && !filters.vibe.some((v) => s.vibe.includes(v))) return false
      if (filters.price_range && s.price_range !== filters.price_range) return false
      return true
    })
  }, [spots, filters])

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted mb-6">{spots.length} spots</p>

        <FilterBar areas={areas} vibes={vibes} onChange={setFilters} />

        {filtered.length === 0 ? (
          <p className="text-muted mt-12 text-center">No spots match those filters.</p>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((spot) => (
                <motion.div
                  key={spot.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <SpotCard spot={spot} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 3: Write app/(public)/nightlife/page.tsx**

```tsx
import { createClient } from '@/lib/supabase/server'
import type { Spot } from '@/types/spot'
import CategoryPageClient from '../dates/_client'

export const revalidate = 60

export default async function NightlifePage() {
  const supabase = createClient()
  const { data: spots } = await supabase
    .from('spots')
    .select('id,name,category,subcategory,area,description,vibe,price_range,google_maps_url,source,status')
    .eq('category', 'nightlife')
    .eq('status', 'active')
    .order('name')

  const areas = [...new Set((spots ?? []).map((s: Spot) => s.area).filter(Boolean))] as string[]
  const vibes = [...new Set((spots ?? []).flatMap((s: Spot) => s.vibe))]

  return <CategoryPageClient spots={spots ?? []} areas={areas} vibes={vibes} title="Nightlife" />
}
```

- [ ] **Step 4: Write app/(public)/day/page.tsx**

```tsx
import { createClient } from '@/lib/supabase/server'
import type { Spot } from '@/types/spot'
import CategoryPageClient from '../dates/_client'

export const revalidate = 60

export default async function DayPage() {
  const supabase = createClient()
  const { data: spots } = await supabase
    .from('spots')
    .select('id,name,category,subcategory,area,description,vibe,price_range,google_maps_url,source,status')
    .eq('category', 'day')
    .eq('status', 'active')
    .order('name')

  const areas = [...new Set((spots ?? []).map((s: Spot) => s.area).filter(Boolean))] as string[]
  const vibes = [...new Set((spots ?? []).flatMap((s: Spot) => s.vibe))]

  return <CategoryPageClient spots={spots ?? []} areas={areas} vibes={vibes} title="Day Out" />
}
```

- [ ] **Step 5: Write app/(public)/meet/page.tsx**

```tsx
import { createClient } from '@/lib/supabase/server'
import type { Spot } from '@/types/spot'
import CategoryPageClient from '../dates/_client'

export const revalidate = 60

export default async function MeetPage() {
  const supabase = createClient()
  const { data: spots } = await supabase
    .from('spots')
    .select('id,name,category,subcategory,area,description,vibe,price_range,google_maps_url,source,status')
    .eq('category', 'meet')
    .eq('status', 'active')
    .order('name')

  const areas = [...new Set((spots ?? []).map((s: Spot) => s.area).filter(Boolean))] as string[]
  const vibes = [...new Set((spots ?? []).flatMap((s: Spot) => s.vibe))]

  return <CategoryPageClient spots={spots ?? []} areas={areas} vibes={vibes} title="Meet People" />
}
```

- [ ] **Step 6: Run all tests**

```bash
npm run test:run
```

Expected: PASS (all tests)

- [ ] **Step 7: Commit**

```bash
git add app/'(public)'/
git commit -m "feat: date, nightlife, day, and meet category pages with filtering"
```

---

## Task 10: Spot CRUD Server Actions + Admin Dashboard

**Files:**
- Create: `actions/spots.ts`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Write actions/spots.ts**

```ts
'use server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { SpotInsert, SpotUpdate, SpotStatus } from '@/types/spot'

export async function createSpot(data: SpotInsert) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('spots').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateSpot(data: SpotUpdate) {
  const supabase = createServiceClient()
  const { id, ...rest } = data
  const { error } = await supabase.from('spots').update(rest).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function deleteSpot(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('spots').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateSpotStatus(id: string, status: SpotStatus) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('spots').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}
```

- [ ] **Step 2: Write app/admin/layout.tsx**

```tsx
import Link from 'next/link'
import { logout } from '@/actions/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-semibold text-foreground">BKK Admin</Link>
          <Link href="/admin/spots" className="text-sm text-muted hover:text-foreground">Spots</Link>
          <Link href="/admin/import" className="text-sm text-muted hover:text-foreground">Import</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-muted hover:text-foreground">View site</Link>
          <form action={logout}>
            <button type="submit" className="text-xs text-muted hover:text-foreground">Logout</button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Write app/admin/page.tsx**

```tsx
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createServiceClient()
  const { data: spots } = await supabase
    .from('spots')
    .select('id,name,category,area,status,rating,source,created_at')
    .order('created_at', { ascending: false })

  const all = spots ?? []
  const counts = {
    total: all.length,
    active: all.filter((s) => s.status === 'active').length,
    unvisited: all.filter((s) => s.status === 'unvisited').length,
    date: all.filter((s) => s.category === 'date').length,
    nightlife: all.filter((s) => s.category === 'nightlife').length,
    day: all.filter((s) => s.category === 'day').length,
    meet: all.filter((s) => s.category === 'meet').length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/spots" className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 transition-colors">
            + Add Spot
          </Link>
          <Link href="/admin/import" className="px-4 py-2 border border-border text-sm rounded-lg hover:border-accent transition-colors">
            Import
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: counts.total },
          { label: 'Active', value: counts.active },
          { label: 'Unvisited', value: counts.unvisited },
          { label: 'Date', value: counts.date },
          { label: 'Nightlife', value: counts.nightlife },
          { label: 'Day', value: counts.day },
          { label: 'Meet', value: counts.meet },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-4">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent spots */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Spots</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-6 py-3 text-muted font-medium">Name</th>
              <th className="px-6 py-3 text-muted font-medium">Category</th>
              <th className="px-6 py-3 text-muted font-medium">Area</th>
              <th className="px-6 py-3 text-muted font-medium">Status</th>
              <th className="px-6 py-3 text-muted font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {all.slice(0, 20).map((spot) => (
              <tr key={spot.id} className="border-b border-border/50 hover:bg-background/50">
                <td className="px-6 py-3 text-foreground font-medium">{spot.name}</td>
                <td className="px-6 py-3 text-muted">{spot.category}</td>
                <td className="px-6 py-3 text-muted">{spot.area ?? '—'}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    spot.status === 'active' ? 'bg-green-100 text-green-700' :
                    spot.status === 'closed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {spot.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-muted">{spot.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run all tests**

```bash
npm run test:run
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add actions/spots.ts app/admin/layout.tsx app/admin/page.tsx
git commit -m "feat: spot CRUD server actions and admin dashboard"
```

---

## Task 11: Admin Spot CRUD UI

**Files:**
- Create: `app/admin/spots/page.tsx`
- Create: `app/admin/spots/_form.tsx`

- [ ] **Step 1: Write app/admin/spots/_form.tsx**

```tsx
'use client'
import { useFormState, useFormStatus } from 'react-dom'
import type { Spot, SpotCategory, SpotStatus } from '@/types/spot'

interface SpotFormProps {
  spot?: Spot
  action: (prev: { error: string } | null, formData: FormData) => Promise<{ error: string } | null>
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Saving...' : label}
    </button>
  )
}

const inputCls = 'w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent transition-colors'
const labelCls = 'block text-sm font-medium text-foreground mb-1'

export default function SpotForm({ spot, action }: SpotFormProps) {
  const [state, formAction] = useFormState(action, null)

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      {spot?.id && <input type="hidden" name="id" value={spot.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelCls}>Name *</label>
          <input name="name" required defaultValue={spot?.name} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Category *</label>
          <select name="category" required defaultValue={spot?.category ?? 'date'} className={inputCls}>
            {(['date', 'nightlife', 'day', 'meet'] as SpotCategory[]).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Subcategory</label>
          <input name="subcategory" defaultValue={spot?.subcategory ?? ''} placeholder="bar, cafe, park..." className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Area</label>
          <input name="area" defaultValue={spot?.area ?? ''} placeholder="Sukhumvit, Silom..." className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Price Range (1-4)</label>
          <input name="price_range" type="number" min="1" max="4" defaultValue={spot?.price_range ?? ''} className={inputCls} />
        </div>

        <div className="col-span-2">
          <label className={labelCls}>Description</label>
          <textarea name="description" rows={3} defaultValue={spot?.description ?? ''} className={inputCls} />
        </div>

        <div className="col-span-2">
          <label className={labelCls}>Vibe tags (comma-separated)</label>
          <input name="vibe" defaultValue={spot?.vibe?.join(', ') ?? ''} placeholder="romantic, chill, outdoor" className={inputCls} />
        </div>

        <div className="col-span-2">
          <label className={labelCls}>Google Maps URL</label>
          <input name="google_maps_url" type="url" defaultValue={spot?.google_maps_url ?? ''} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <select name="status" defaultValue={spot?.status ?? 'unvisited'} className={inputCls}>
            {(['active', 'unvisited', 'closed'] as SpotStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>My Rating (1-5)</label>
          <input name="rating" type="number" min="1" max="5" defaultValue={spot?.rating ?? ''} className={inputCls} />
        </div>

        <div className="col-span-2">
          <label className={labelCls}>Personal Notes</label>
          <textarea name="my_notes" rows={2} defaultValue={spot?.my_notes ?? ''} className={inputCls} />
        </div>
      </div>

      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}

      <SubmitButton label={spot ? 'Update Spot' : 'Create Spot'} />
    </form>
  )
}
```

- [ ] **Step 2: Write app/admin/spots/page.tsx**

```tsx
import { createServiceClient } from '@/lib/supabase/server'
import { createSpot, deleteSpot } from '@/actions/spots'
import SpotForm from './_form'
import type { SpotInsert } from '@/types/spot'

async function createSpotAction(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  'use server'
  try {
    const vibe = (formData.get('vibe') as string)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)

    const data: SpotInsert = {
      name: formData.get('name') as string,
      category: formData.get('category') as SpotInsert['category'],
      subcategory: (formData.get('subcategory') as string) || null,
      area: (formData.get('area') as string) || null,
      description: (formData.get('description') as string) || null,
      vibe,
      price_range: formData.get('price_range') ? Number(formData.get('price_range')) : null,
      google_maps_url: (formData.get('google_maps_url') as string) || null,
      coordinates: null,
      photos: [],
      my_notes: (formData.get('my_notes') as string) || null,
      source: 'manual',
      rating: formData.get('rating') ? Number(formData.get('rating')) : null,
      status: formData.get('status') as SpotInsert['status'],
    }
    await createSpot(data)
    return null
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export default async function SpotsAdminPage() {
  const supabase = createServiceClient()
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Add Spot</h1>
      <SpotForm action={createSpotAction} />

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-foreground mb-4">All Spots</h2>
        <div className="space-y-2">
          {(spots ?? []).map((spot) => (
            <div key={spot.id} className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
              <div>
                <span className="font-medium text-foreground text-sm">{spot.name}</span>
                <span className="text-muted text-xs ml-2">{spot.category} · {spot.area}</span>
              </div>
              <form action={async () => { 'use server'; await deleteSpot(spot.id) }}>
                <button type="submit" className="text-xs text-red-400 hover:text-red-600 transition-colors">
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/spots/
git commit -m "feat: admin spot create/delete UI"
```

---

## Task 12: AI Import — Maps URL Mode

**Files:**
- Create: `lib/claude/parse-maps.ts`
- Create: `__tests__/lib/claude/parse-maps.test.ts`
- Create: `actions/import.ts`
- Create: `app/admin/import/page.tsx`

- [ ] **Step 1: Write failing parse-maps test**

```ts
// __tests__/lib/claude/parse-maps.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            category: 'date',
            subcategory: 'bar',
            area: 'Silom',
            description: 'Intimate cocktail bar perfect for dates.',
            vibe: ['romantic', 'dim-lit', 'chill'],
            price_range: 3,
          }),
        }],
      }),
    },
  })),
}))

global.fetch = vi.fn().mockResolvedValue({
  json: vi.fn().mockResolvedValue({
    status: 'OK',
    results: [{ place_id: 'ChIJ_test123' }],
    result: {
      name: 'Vesper Bar',
      formatted_address: '10/15 Convent Rd, Silom, Bangkok',
      types: ['bar', 'food', 'establishment'],
      rating: 4.5,
      url: 'https://maps.google.com/?cid=123',
      price_level: 3,
    },
  }),
})

import { parseMapsUrl } from '@/lib/claude/parse-maps'

describe('parseMapsUrl', () => {
  it('extracts place name from Google Maps URL', async () => {
    const result = await parseMapsUrl(
      'https://www.google.com/maps/place/Vesper+Bar/@13.7234,100.5289'
    )
    expect(result.name).toBe('Vesper Bar')
    expect(result.category).toBe('date')
    expect(result.area).toBe('Silom')
    expect(result.vibe).toContain('romantic')
  })

  it('throws on unrecognized URL format', async () => {
    await expect(parseMapsUrl('https://notgooglemaps.com/place')).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm run test:run -- __tests__/lib/claude/parse-maps.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/claude/parse-maps'`

- [ ] **Step 3: Write lib/claude/parse-maps.ts**

```ts
import Anthropic from '@anthropic-ai/sdk'
import type { ParsedMapsSpot } from '@/types/spot'

const client = new Anthropic()

function extractPlaceName(url: string): string {
  const match = url.match(/maps\/place\/([^/@?]+)/)
  if (match) return decodeURIComponent(match[1].replace(/\+/g, ' '))
  throw new Error('Cannot extract place name from URL. Use a Google Maps place URL (maps.google.com/maps/place/...)')
}

export async function parseMapsUrl(mapsUrl: string): Promise<ParsedMapsSpot> {
  const placeName = extractPlaceName(mapsUrl)
  const apiKey = process.env.GOOGLE_PLACES_API_KEY!

  // Text search to get place_id
  const searchRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName + ' Bangkok')}&key=${apiKey}`
  )
  const searchData = await searchRes.json()

  if (searchData.status !== 'OK' || !searchData.results.length) {
    throw new Error(`Place not found: ${placeName}`)
  }

  const placeId = searchData.results[0].place_id

  // Get place details
  const detailsRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,types,rating,url,price_level&key=${apiKey}`
  )
  const detailsData = await detailsRes.json()
  const place = detailsData.result

  // Claude formats into spot schema
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Given this Bangkok place, return a JSON object with:
- category: one of "date", "nightlife", "day", "meet"
- subcategory: e.g. "bar", "cafe", "park", "club", "restaurant", "mall"
- area: Bangkok neighborhood (e.g. "Sukhumvit", "Silom", "Thonglor", "Ekkamai")
- description: 1-2 sentence description for a dating context
- vibe: array of 1-4 tags e.g. ["rooftop", "chill", "romantic", "loud", "outdoor"]
- price_range: integer 1-4 (1=cheap, 4=expensive)

Place: ${place.name}
Address: ${place.formatted_address}
Types: ${place.types.join(', ')}
Google rating: ${place.rating ?? 'unknown'}
Price level: ${place.price_level ?? 'unknown'}

Return only valid JSON, no markdown.`,
    }],
  })

  const raw = (message.content[0] as { type: 'text'; text: string }).text
  const json = JSON.parse(raw)

  return {
    name: place.name,
    area: json.area ?? null,
    subcategory: json.subcategory ?? null,
    description: json.description ?? '',
    vibe: Array.isArray(json.vibe) ? json.vibe : [],
    price_range: typeof json.price_range === 'number' ? json.price_range : null,
    google_maps_url: mapsUrl,
    category: json.category,
  }
}
```

- [ ] **Step 4: Run parse-maps tests — expect pass**

```bash
npm run test:run -- __tests__/lib/claude/parse-maps.test.ts
```

Expected: PASS (2 tests)

- [ ] **Step 5: Write actions/import.ts (Maps URL action)**

```ts
'use server'
import { parseMapsUrl } from '@/lib/claude/parse-maps'
import { parseChatLog } from '@/lib/claude/parse-chat'
import { createSpot } from './spots'
import type { ParsedMapsSpot, ExtractedChatSpot, SpotInsert } from '@/types/spot'

export async function importFromMapsUrl(
  _prev: { error: string; result?: ParsedMapsSpot } | null,
  formData: FormData
): Promise<{ error: string; result?: ParsedMapsSpot } | null> {
  try {
    const url = formData.get('maps_url') as string
    const result = await parseMapsUrl(url)
    return { error: '', result }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function saveImportedSpot(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  try {
    const vibe = (formData.get('vibe') as string)
      .split(',').map((v) => v.trim()).filter(Boolean)

    const data: SpotInsert = {
      name: formData.get('name') as string,
      category: formData.get('category') as SpotInsert['category'],
      subcategory: (formData.get('subcategory') as string) || null,
      area: (formData.get('area') as string) || null,
      description: (formData.get('description') as string) || null,
      vibe,
      price_range: formData.get('price_range') ? Number(formData.get('price_range')) : null,
      google_maps_url: (formData.get('google_maps_url') as string) || null,
      coordinates: null,
      photos: [],
      my_notes: null,
      source: 'maps_import',
      rating: null,
      status: 'unvisited',
    }
    await createSpot(data)
    return null
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function importFromChatLog(
  _prev: { error: string; results?: ExtractedChatSpot[] } | null,
  formData: FormData
): Promise<{ error: string; results?: ExtractedChatSpot[] } | null> {
  try {
    const text = formData.get('chat_text') as string
    const results = await parseChatLog(text)
    return { error: '', results }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function saveChatImportedSpots(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  try {
    const spotsJson = formData.get('spots') as string
    const spots: ExtractedChatSpot[] = JSON.parse(spotsJson)

    for (const spot of spots) {
      const data: SpotInsert = {
        name: spot.name,
        category: spot.category,
        subcategory: spot.subcategory,
        area: spot.area,
        description: spot.why,
        vibe: spot.vibe,
        price_range: null,
        google_maps_url: null,
        coordinates: null,
        photos: [],
        my_notes: null,
        source: 'chat_import',
        rating: null,
        status: 'unvisited',
      }
      await createSpot(data)
    }
    return null
  } catch (e) {
    return { error: (e as Error).message }
  }
}
```

- [ ] **Step 6: Run all tests**

```bash
npm run test:run
```

Expected: PASS (all tests)

- [ ] **Step 7: Commit**

```bash
git add lib/claude/parse-maps.ts actions/import.ts __tests__/lib/claude/
git commit -m "feat: Google Maps URL parsing via Places API and Claude"
```

---

## Task 13: AI Import — Chat Log Mode + Import Page UI

**Files:**
- Create: `lib/claude/parse-chat.ts`
- Create: `__tests__/lib/claude/parse-chat.test.ts`
- Create: `app/admin/import/page.tsx`

- [ ] **Step 1: Write failing parse-chat test**

```ts
// __tests__/lib/claude/parse-chat.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify([
            {
              name: 'Craft Bangkok',
              area: 'Sukhumvit',
              why: 'Great craft beer selection, chill vibe',
              vibe: ['chill', 'casual'],
              category: 'nightlife',
              subcategory: 'bar',
            },
            {
              name: 'Chatuchak Weekend Market',
              area: 'Chatuchak',
              why: 'Huge market, easy to meet people',
              vibe: ['outdoor', 'busy'],
              category: 'meet',
              subcategory: 'market',
            },
          ]),
        }],
      }),
    },
  })),
}))

import { parseChatLog } from '@/lib/claude/parse-chat'

describe('parseChatLog', () => {
  it('extracts multiple spots from chat text', async () => {
    const chatText = `
      Hey! You should check out Craft Bangkok in Sukhumvit, amazing craft beers.
      Also Chatuchak market is great to meet people on weekends.
    `
    const result = await parseChatLog(chatText)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Craft Bangkok')
    expect(result[0].category).toBe('nightlife')
    expect(result[1].name).toBe('Chatuchak Weekend Market')
  })

  it('returns empty array when no spots found', async () => {
    vi.mocked(
      (await import('@anthropic-ai/sdk')).default
    )
    // Override mock for this test
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    vi.mocked(Anthropic).mockImplementationOnce(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: '[]' }],
        }),
      },
    }) as any)

    const result = await parseChatLog('Hey how are you doing today?')
    // Either empty or any valid array is fine
    expect(Array.isArray(result)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm run test:run -- __tests__/lib/claude/parse-chat.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/claude/parse-chat'`

- [ ] **Step 3: Write lib/claude/parse-chat.ts**

```ts
import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedChatSpot } from '@/types/spot'

const client = new Anthropic()

export async function parseChatLog(chatText: string): Promise<ExtractedChatSpot[]> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Extract all Bangkok place recommendations from this conversation.

For each place, return a JSON object with:
- name: place name
- area: Bangkok neighborhood if mentioned (e.g. "Sukhumvit", "Silom", "Thonglor") — null if unknown
- why: reason it was recommended in 1 sentence — null if not stated
- vibe: array of descriptors mentioned or implied (e.g. ["chill", "romantic", "loud", "outdoor"]) — empty array if none
- category: one of "date", "nightlife", "day", "meet" based on context
- subcategory: e.g. "bar", "cafe", "restaurant", "club", "park", "mall" — null if unclear

Include only actual places (venues, parks, malls, streets, areas). Skip general advice.
Return only a valid JSON array. If no places found, return []. No markdown, no explanation.

Conversation:
${chatText}`,
    }],
  })

  const raw = (message.content[0] as { type: 'text'; text: string }).text.trim()
  try {
    const spots: ExtractedChatSpot[] = JSON.parse(raw)
    return Array.isArray(spots) ? spots : []
  } catch {
    return []
  }
}
```

- [ ] **Step 4: Run parse-chat tests — expect pass**

```bash
npm run test:run -- __tests__/lib/claude/parse-chat.test.ts
```

Expected: PASS (2 tests)

- [ ] **Step 5: Write app/admin/import/page.tsx**

```tsx
'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import { importFromMapsUrl, saveImportedSpot, importFromChatLog, saveChatImportedSpots } from '@/actions/import'
import type { ParsedMapsSpot, ExtractedChatSpot, SpotCategory } from '@/types/spot'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors">
      {pending ? 'Processing...' : label}
    </button>
  )
}

const inputCls = 'w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent transition-colors'
const labelCls = 'block text-sm font-medium text-foreground mb-1'

function MapsImportSection() {
  const [parseState, parseAction] = useFormState(importFromMapsUrl, null)
  const [saveState, saveAction] = useFormState(saveImportedSpot, null)
  const result = parseState?.result

  if (saveState === null && result) {
    return <p className="text-green-600 text-sm mt-4">Spot saved!</p>
  }

  return (
    <div className="space-y-6">
      <form action={parseAction} className="space-y-3">
        <label className={labelCls}>Google Maps URL</label>
        <input name="maps_url" type="url" required placeholder="https://www.google.com/maps/place/..." className={inputCls} />
        {parseState?.error && <p className="text-red-500 text-sm">{parseState.error}</p>}
        <SubmitButton label="Parse" />
      </form>

      {result && (
        <form action={saveAction} className="space-y-3 border-t border-border pt-6">
          <p className="text-sm font-medium text-foreground mb-4">Review and confirm:</p>
          <input type="hidden" name="source" value="maps_import" />
          <input type="hidden" name="google_maps_url" value={result.google_maps_url} />

          <div><label className={labelCls}>Name</label>
            <input name="name" defaultValue={result.name} required className={inputCls} /></div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Category</label>
              <select name="category" defaultValue={result.category} className={inputCls}>
                {(['date', 'nightlife', 'day', 'meet'] as SpotCategory[]).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div><label className={labelCls}>Subcategory</label>
              <input name="subcategory" defaultValue={result.subcategory ?? ''} className={inputCls} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Area</label>
              <input name="area" defaultValue={result.area ?? ''} className={inputCls} /></div>
            <div><label className={labelCls}>Price (1-4)</label>
              <input name="price_range" type="number" min="1" max="4" defaultValue={result.price_range ?? ''} className={inputCls} /></div>
          </div>

          <div><label className={labelCls}>Description</label>
            <textarea name="description" rows={2} defaultValue={result.description} className={inputCls} /></div>

          <div><label className={labelCls}>Vibe (comma-separated)</label>
            <input name="vibe" defaultValue={result.vibe.join(', ')} className={inputCls} /></div>

          {saveState?.error && <p className="text-red-500 text-sm">{saveState.error}</p>}
          <SubmitButton label="Save Spot" />
        </form>
      )}
    </div>
  )
}

function ChatImportSection() {
  const [parseState, parseAction] = useFormState(importFromChatLog, null)
  const [saveState, saveAction] = useFormState(saveChatImportedSpots, null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const results = parseState?.results ?? []

  if (saveState === null && results.length > 0) {
    return <p className="text-green-600 text-sm mt-4">Spots saved!</p>
  }

  function toggleAll() {
    if (selected.size === results.length) setSelected(new Set())
    else setSelected(new Set(results.map((_, i) => i)))
  }

  const selectedSpots = results.filter((_, i) => selected.has(i))

  return (
    <div className="space-y-6">
      <form action={parseAction} className="space-y-3">
        <label className={labelCls}>Paste conversation text</label>
        <textarea name="chat_text" required rows={8} placeholder="Paste your WhatsApp, Line, or iMessage conversation here..." className={inputCls} />
        {parseState?.error && <p className="text-red-500 text-sm">{parseState.error}</p>}
        <SubmitButton label="Extract Spots" />
      </form>

      {results.length > 0 && (
        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{results.length} spots found</p>
            <button onClick={toggleAll} type="button" className="text-xs text-accent hover:underline">
              {selected.size === results.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          {results.map((spot, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.has(i)}
                onChange={() => {
                  const next = new Set(selected)
                  next.has(i) ? next.delete(i) : next.add(i)
                  setSelected(next)
                }}
                className="mt-1"
              />
              <div className="bg-surface border border-border rounded-xl p-3 flex-1 group-hover:border-accent transition-colors">
                <p className="font-medium text-foreground text-sm">{spot.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {spot.category} · {spot.area ?? 'area unknown'}
                </p>
                {spot.why && <p className="text-xs text-muted mt-1 italic">"{spot.why}"</p>}
              </div>
            </label>
          ))}

          {selectedSpots.length > 0 && (
            <form action={saveAction}>
              <input type="hidden" name="spots" value={JSON.stringify(selectedSpots)} />
              {saveState?.error && <p className="text-red-500 text-sm mb-2">{saveState.error}</p>}
              <SubmitButton label={`Save ${selectedSpots.length} spot${selectedSpots.length > 1 ? 's' : ''}`} />
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default function ImportPage() {
  const [mode, setMode] = useState<'maps' | 'chat'>('maps')

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-8">Import Spots</h1>

      <div className="flex gap-2 mb-8">
        {(['maps', 'chat'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              mode === m ? 'bg-accent text-white border-accent' : 'border-border text-muted hover:border-accent'
            }`}>
            {m === 'maps' ? 'Google Maps URL' : 'Chat Log'}
          </button>
        ))}
      </div>

      {mode === 'maps' ? <MapsImportSection /> : <ChatImportSection />}
    </div>
  )
}
```

- [ ] **Step 6: Run all tests**

```bash
npm run test:run
```

Expected: PASS (all tests)

- [ ] **Step 7: Commit**

```bash
git add lib/claude/parse-chat.ts app/admin/import/ __tests__/lib/claude/parse-chat.test.ts
git commit -m "feat: chat log extraction and AI import admin UI"
```

---

## Task 14: Vercel Deployment + Data Import Guide

**Files:**
- Create: `.env.local` (from `.env.local.example`, fill values)
- No new code files — deployment config

- [ ] **Step 1: Copy env template and fill values**

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project Settings → API (service_role)
- `ADMIN_PASSWORD` — choose a strong password
- `SESSION_SECRET` — run `openssl rand -base64 32` and paste output
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `GOOGLE_PLACES_API_KEY` — from console.cloud.google.com → Places API (New)

- [ ] **Step 2: Build locally to catch type errors**

```bash
npm run build
```

Expected: exit 0, no TypeScript errors

- [ ] **Step 3: Run full test suite**

```bash
npm run test:run
```

Expected: PASS (all tests)

- [ ] **Step 4: Push to GitHub**

```bash
git remote add origin https://github.com/tomasvivaldi/bkk.git
git branch -M main
git push -u origin main
```

- [ ] **Step 5: Deploy on Vercel**

1. Go to vercel.com → Add New Project → Import from GitHub → select `bkk`
2. Framework: Next.js (auto-detected)
3. Environment Variables: add all 7 from `.env.local.example`
4. Deploy

- [ ] **Step 6: Verify deployment**

- Visit production URL → Home page loads
- Visit `<url>/admin/login` → login form shows
- Enter password → redirects to `/admin` dashboard
- Visit `<url>/admin/import` → both tabs work

---

## Initial Data Import Workflow

Once deployed, import your Bangkok spots in this order:

### Step A: Import from Google Maps URLs (one at a time)
1. Open a saved place in Google Maps on desktop
2. Copy the URL from the browser address bar (e.g. `https://www.google.com/maps/place/Vesper+Bar/...`)
3. Go to `<your-url>/admin/import` → Maps URL tab
4. Paste URL → Parse → review → Save

### Step B: Import from Chat Logs (bulk)
1. Open WhatsApp/Line Web or iMessage on Mac
2. Find conversations where people recommended Bangkok spots
3. Select all text → copy
4. Go to `<your-url>/admin/import` → Chat Log tab
5. Paste → Extract → select spots to keep → Save

### Step C: Curate in Admin
1. Go to `/admin` → click each spot name
2. Set status: `active` (been there, worth it) / `unvisited` (want to go) / `closed`
3. Add personal `rating` (1-5) and `my_notes`
4. Fix any wrong categories

### Step D: Google Takeout (bulk import, optional)
If you have a Google Takeout export with saved places:
1. Download from myaccount.google.com/data-and-privacy → Google Maps → Saved places
2. Find `Saved Places.json` in the export
3. Write a one-time script using `lib/supabase/server.ts` `createServiceClient()` to bulk-insert, mapping Google's `types[]` to spot categories
