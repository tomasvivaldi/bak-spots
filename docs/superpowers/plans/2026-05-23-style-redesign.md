# Style Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the public-facing BKK site to a surrealist · light academia · Dior · minimalist aesthetic using Cormorant Garamond + DM Sans, a near-white/jet-black/dusty-rose palette, and a new home page with an animated category list and hover image reveal.

**Architecture:** Token-swap approach — update `tailwind.config.ts` palette/fonts, swap fonts in `app/layout.tsx`, then update each UI component's Tailwind classes in place. Home page is fully rewritten with Framer Motion stagger + `AnimatePresence` image transitions. No new abstractions introduced.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Framer Motion, `next/font/google` (Cormorant Garamond + DM Sans)

---

## File Map

| File | Change |
|---|---|
| `tailwind.config.ts` | New palette + font-family tokens |
| `app/layout.tsx` | Swap Geist → Cormorant Garamond + DM Sans |
| `app/globals.css` | Update CSS vars + body font |
| `components/ui/Nav.tsx` | Height, border, typography |
| `components/ui/VibeChip.tsx` | Remove rounded-full, uppercase tracking |
| `components/ui/PriceDots.tsx` | Switch to dot symbols |
| `components/ui/SpotCard.tsx` | No radius, serif name, footer divider |
| `components/ui/FilterBar.tsx` | No radius, new active state |
| `app/(public)/dates/_client.tsx` | Hairline grid, serif h1, opacity-only exit anim |
| `app/(public)/page.tsx` | Full rewrite — hero + animated list + image panel |

---

## Task 1: Palette + Font Tokens

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace tailwind.config.ts**

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
        background: '#FAF8F5',
        surface: '#F0EBE6',
        foreground: '#0D0D0D',
        accent: '#C9A99A',
        muted: '#888884',
        border: '#D8D0C8',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Commit**

```bash
git add tailwind.config.ts
git commit -m "style: update palette and font tokens (Dior-academia)"
```

---

## Task 2: Typography — Layout + Globals

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'BKK',
  description: 'Your personal Bangkok spot guide',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Replace app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #FAF8F5;
  --surface: #F0EBE6;
  --foreground: #0D0D0D;
  --accent: #C9A99A;
  --muted: #888884;
  --border: #D8D0C8;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-dm-sans), system-ui, sans-serif;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- [ ] **Step 3: Verify fonts load**

Run: `npm run dev`
Open http://localhost:3000 — body text should switch to DM Sans (more geometric, clean). No console font errors.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "style: swap Geist for Cormorant Garamond + DM Sans"
```

---

## Task 3: Nav

**Files:**
- Modify: `components/ui/Nav.tsx`

- [ ] **Step 1: Replace Nav.tsx**

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-foreground">
      <div className="max-w-5xl mx-auto px-6 h-[52px] flex items-center justify-between">
        <Link
          href="/"
          className="text-[11px] tracking-[0.22em] uppercase font-medium font-sans text-foreground"
        >
          BKK
        </Link>
        <div className="flex items-center gap-9">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[10px] tracking-[0.18em] uppercase font-sans text-muted hover:text-foreground transition-colors"
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

- [ ] **Step 2: Commit**

```bash
git add components/ui/Nav.tsx
git commit -m "style: refine Nav — hairline border, small-caps, DM Sans"
```

---

## Task 4: VibeChip + PriceDots

**Files:**
- Modify: `components/ui/VibeChip.tsx`
- Modify: `components/ui/PriceDots.tsx`

- [ ] **Step 1: Replace VibeChip.tsx**

```tsx
export default function VibeChip({ label }: { label: string }) {
  return (
    <span className="inline-block px-[7px] py-[2px] text-[9px] tracking-[0.14em] uppercase font-sans text-muted border border-border">
      {label}
    </span>
  )
}
```

- [ ] **Step 2: Replace PriceDots.tsx**

Switch from ฿ symbols to filled/empty dot marks for cleaner minimalism:

```tsx
export default function PriceDots({ value }: { value: number | null }) {
  if (!value) return null
  return (
    <span className="flex gap-[3px] items-center">
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block w-[5px] h-[5px] rounded-full ${
            i < value ? 'bg-foreground' : 'bg-border'
          }`}
        />
      ))}
    </span>
  )
}
```

- [ ] **Step 3: Run existing tests**

Run: `npm test -- --reporter=verbose`
Expected: All SpotCard and FilterBar tests pass (tests check text/behavior, not classes).

- [ ] **Step 4: Commit**

```bash
git add components/ui/VibeChip.tsx components/ui/PriceDots.tsx
git commit -m "style: VibeChip rectangular + PriceDots minimal dots"
```

---

## Task 5: SpotCard

**Files:**
- Modify: `components/ui/SpotCard.tsx`

- [ ] **Step 1: Replace SpotCard.tsx**

```tsx
import type { Spot } from '@/types/spot'
import AnimatedCard from '@/components/motion/AnimatedCard'
import PriceDots from './PriceDots'
import VibeChip from './VibeChip'

export default function SpotCard({ spot }: { spot: Spot }) {
  const visibleVibes = spot.vibe.slice(0, 3)

  return (
    <AnimatedCard className="bg-surface p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-serif text-xl font-normal text-foreground leading-tight">
            {spot.name}
          </h3>
          {spot.area && (
            <span className="text-[9px] tracking-[0.16em] uppercase font-sans text-muted mt-1 block">
              {spot.area}
            </span>
          )}
        </div>
        <PriceDots value={spot.price_range} />
      </div>

      {spot.description && (
        <p className="text-xs font-light text-muted leading-relaxed line-clamp-2">
          {spot.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border">
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
            className="text-[9px] tracking-[0.14em] uppercase font-sans text-accent hover:underline shrink-0"
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

- [ ] **Step 2: Run existing tests**

Run: `npm test -- --reporter=verbose`
Expected: All SpotCard tests pass.

- [ ] **Step 3: Commit**

```bash
git add components/ui/SpotCard.tsx
git commit -m "style: SpotCard — serif name, no radius, footer divider"
```

---

## Task 6: FilterBar

**Files:**
- Modify: `components/ui/FilterBar.tsx`

- [ ] **Step 1: Replace FilterBar.tsx**

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

  const activeBtn = 'bg-foreground text-background border-foreground'
  const inactiveBtn = 'border-border text-muted hover:border-foreground hover:text-foreground'
  const btnBase = 'text-[9px] tracking-[0.16em] uppercase font-sans px-[14px] py-[5px] border transition-colors'

  return (
    <div className="flex flex-wrap gap-2 py-4">
      <button
        onClick={() => setArea(null)}
        className={`${btnBase} ${filters.area === null ? activeBtn : inactiveBtn}`}
      >
        All Areas
      </button>
      {areas.map((area) => (
        <button
          key={area}
          onClick={() => setArea(area)}
          className={`${btnBase} ${filters.area === area ? activeBtn : inactiveBtn}`}
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
              className={`${btnBase} ${filters.vibe.includes(vibe) ? activeBtn : inactiveBtn}`}
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

- [ ] **Step 2: Run existing tests**

Run: `npm test -- --reporter=verbose`
Expected: All FilterBar tests pass (behavior unchanged, only classes differ).

- [ ] **Step 3: Commit**

```bash
git add components/ui/FilterBar.tsx
git commit -m "style: FilterBar — rectangular buttons, foreground active state"
```

---

## Task 7: Category Listing Pages

**Files:**
- Modify: `app/(public)/dates/_client.tsx`

All 4 category pages (dates, nightlife, day, meet) share this one component.

- [ ] **Step 1: Replace _client.tsx**

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
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-serif text-5xl font-light text-foreground mb-2">{title}</h1>
        <p className="text-[10px] tracking-[0.16em] uppercase font-sans text-muted mb-8">
          {spots.length} spots
        </p>

        <FilterBar areas={areas} vibes={vibes} onChange={setFilters} />

        {filtered.length === 0 ? (
          <p className="text-muted mt-12 text-center text-sm font-sans">
            No spots match those filters.
          </p>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border border border-border mt-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((spot) => (
                <motion.div
                  key={spot.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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

- [ ] **Step 2: Commit**

```bash
git add app/\(public\)/dates/_client.tsx
git commit -m "style: category pages — serif h1, hairline grid, opacity-only exit"
```

---

## Task 8: Home Page Rewrite

**Files:**
- Modify: `app/(public)/page.tsx`

- [ ] **Step 1: Replace page.tsx**

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import PageTransition from '@/components/motion/PageTransition'

const categories = [
  {
    href: '/dates',
    label: 'Dates',
    description: 'Restaurants · Rooftops · Bars',
    gradient: 'linear-gradient(160deg, #2C1810 0%, #8B5A4A 60%, #C9A99A 100%)',
  },
  {
    href: '/nightlife',
    label: 'Nightlife',
    description: 'Clubs · Bars · Late nights',
    gradient: 'linear-gradient(160deg, #0D0D14 0%, #2A1A3A 60%, #6B4A8A 100%)',
  },
  {
    href: '/day',
    label: 'Day Out',
    description: 'Parks · Cafes · Markets',
    gradient: 'linear-gradient(160deg, #1A2410 0%, #4A6B3A 60%, #A8C99A 100%)',
  },
  {
    href: '/meet',
    label: 'Meet',
    description: 'Malls · Areas · Social spots',
    gradient: 'linear-gradient(160deg, #1A1A14 0%, #4A4A3A 60%, #C8C0A8 100%)',
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export default function HomePage() {
  const [active, setActive] = useState(0)

  return (
    <PageTransition>
      <section className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
          className="font-serif text-[clamp(60px,10vw,96px)] font-light leading-none tracking-tight text-foreground"
        >
          Bangkok
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-3 text-[10px] tracking-[0.22em] uppercase font-sans text-muted"
        >
          Your city, curated
        </motion.p>
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' as const }}
          className="border-t border-foreground mt-5 mb-8"
        />

        {/* Split: list + image */}
        <div className="grid grid-cols-[1fr_1.5fr] gap-0 min-h-[320px]">
          {/* List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="border-r border-border pr-10 flex flex-col justify-center"
          >
            {categories.map((cat, i) => (
              <motion.div
                key={cat.href}
                variants={itemVariants}
                className="flex items-center justify-between py-5 border-b border-border first:border-t first:border-border cursor-pointer"
                style={{ opacity: active !== i ? 0.3 : 1, transition: 'opacity 0.2s' }}
                onHoverStart={() => setActive(i)}
              >
                <div>
                  <Link
                    href={cat.href}
                    className={`font-serif text-2xl font-light text-foreground hover:no-underline ${
                      active === i ? 'border-b border-accent pb-px' : ''
                    }`}
                    tabIndex={-1}
                  >
                    {cat.label}
                  </Link>
                  <p className="text-[10px] tracking-[0.12em] uppercase font-sans text-muted mt-1">
                    {cat.description}
                  </p>
                </div>
                <motion.span
                  animate={{
                    x: active === i ? 4 : 0,
                    color: active === i ? '#C9A99A' : '#D8D0C8',
                  }}
                  transition={{ duration: 0.15 }}
                  className="text-sm"
                >
                  →
                </motion.span>
              </motion.div>
            ))}
          </motion.div>

          {/* Image panel */}
          <div className="pl-10 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' as const }}
                className="w-full aspect-[4/3] relative overflow-hidden"
                style={{ background: categories[active].gradient }}
              >
                <p className="absolute bottom-3 left-4 text-[9px] tracking-[0.18em] uppercase font-sans text-background/80">
                  {categories[active].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`
Open http://localhost:3000

Check:
- "Bangkok" animates in as large serif headline
- Subtitle fades in, divider line sweeps across
- 4 category items stagger in from below
- Hovering an item: other items dim to 30%, active shows dusty rose underline, arrow shifts right + turns rose
- Right panel: gradient image crossfades when switching category
- Nav: hairline black border, spaced uppercase links

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/page.tsx
git commit -m "feat: new home page — hero + animated list + hover image panel"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass. No regressions in SpotCard or FilterBar tests.

- [ ] **Step 2: Check listing pages**

Open http://localhost:3000/dates

Check:
- Page title renders in Cormorant Garamond, light weight
- Spot count renders as small uppercase label
- FilterBar buttons are rectangular, solid black when active
- SpotCard names in serif, area in small uppercase, vibe chips rectangular, footer divider visible
- PriceDots show as filled/empty circles

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "style: complete Dior-academia redesign — all public pages"
```
