# Style Redesign — Surrealist · Light Academia · Dior · Minimalist

**Date:** 2026-05-23
**Approach:** A — Token swap + home page rewrite. Existing component classes updated in place.

---

## 1. Palette

Replace all tokens in `tailwind.config.ts`:

| Token | Value | Role |
|---|---|---|
| `background` | `#FAF8F5` | Near-white ivory — page bg |
| `surface` | `#F0EBE6` | Slightly warmer — card bg |
| `foreground` | `#0D0D0D` | Jet black — text, borders |
| `accent` | `#C9A99A` | Dusty rose — active states, links |
| `muted` | `#888884` | Cool grey — secondary text |
| `border` | `#D8D0C8` | Warm hairline grey |

Also add font family tokens:
```ts
fontFamily: {
  serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
  sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
}
```

---

## 2. Typography

In `app/layout.tsx`, replace Geist fonts with:
- **Cormorant Garamond** (weights 300, 400, 500; italic 300, 400) — headings, spot names, hero title
- **DM Sans** (weights 300, 400, 500) — nav, labels, body text, buttons

CSS variables `--font-cormorant` and `--font-dm-sans` exposed via `next/font/google`.

`globals.css` body: `font-family: var(--font-dm-sans), system-ui, sans-serif;`

---

## 3. Home Page — `app/(public)/page.tsx`

Full rewrite. Layout:

```
┌─────────────────────────────────────────┐
│  Bangkok                  [serif 300]   │
│  YOUR CITY, CURATED       [spaced caps] │
│─────────────────────────────────────────│
│  Dates          →  │  [image fades in]  │
│  Nightlife      →  │                    │
│  Day Out        →  │                    │
│  Meet           →  │                    │
└─────────────────────────────────────────┘
```

**List behaviour (Framer Motion):**
- Items stagger in on mount: `y: 20 → 0`, `opacity: 0 → 1`, `staggerChildren: 0.08s`
- On hover of item: active item stays full opacity, rest dim to `opacity: 0.3` via `AnimatePresence` / `whileHover`
- Active item: dusty rose underline on name (`border-bottom: 1px solid #C9A99A`), arrow turns `#C9A99A`
- Arrow animates `x: 0 → 4px` on hover via `motion.span`

**Image panel (right side):**
- Static images: `/public/img/dates.jpg`, `/public/img/nightlife.jpg`, `/public/img/day.jpg`, `/public/img/meet.jpg`
- On category change: `AnimatePresence` exits old image (`opacity: 0, y: -8`), enters new (`opacity: 0, y: 12 → 0`)
- First category (Dates) active by default on mount

**Images source:** 4 static JPGs committed to `/public/img/`. For initial implementation, use placeholder gradient divs if images not yet sourced.

---

## 4. Nav — `components/ui/Nav.tsx`

- Height: `h-[52px]` (from `h-14`)
- Border: `border-b border-foreground` (solid black, not muted)
- No backdrop blur, solid background
- Logo "BKK": `text-[11px] tracking-[0.22em] uppercase font-medium font-sans`
- Links: `text-[10px] tracking-[0.18em] uppercase font-sans text-muted hover:text-foreground`
- Link gap: `gap-9`

---

## 5. SpotCard — `components/ui/SpotCard.tsx`

- Remove `rounded-2xl` → no border radius (`rounded-none`)
- Remove individual card border — cards sit in a CSS grid with `gap-[1px] bg-border` (hairline grid effect)
- Name: add `font-serif text-xl font-normal` (Cormorant Garamond)
- Area: `text-[9px] tracking-[0.16em] uppercase font-sans`
- Description: `text-xs font-light leading-relaxed`
- Footer: `border-t border-border` divider line above vibe chips + maps link
- Maps link: `text-[9px] tracking-[0.14em] uppercase text-accent`

---

## 6. VibeChip — `components/ui/VibeChip.tsx`

- Remove `rounded-full` → `rounded-none`
- Size: `text-[9px] tracking-[0.14em] uppercase px-[7px] py-[2px]`
- Keep `border border-border text-muted`

---

## 7. FilterBar — `components/ui/FilterBar.tsx`

- Buttons: remove `rounded-full` → `rounded-none`
- Active: `bg-foreground text-background border-foreground`
- Inactive: `border-border text-muted hover:border-foreground hover:text-foreground`
- Size: `text-[9px] tracking-[0.16em] uppercase px-[14px] py-[5px]`

---

## 8. PriceDots — `components/ui/PriceDots.tsx`

No structural change. Ensure filled dots use `bg-foreground`, empty use `bg-border`.

---

## 9. Category/listing pages — `app/(public)/dates|nightlife|day|meet/page.tsx`

- Wrap the spot grid in `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border border border-border">` to produce the hairline-grid effect between cards.
- Cards inherit all other styles automatically from SpotCard + token changes.
- Add `font-serif` to any `<h1>` page titles.

---

## Files Changed

| File | Change |
|---|---|
| `tailwind.config.ts` | Palette + font tokens |
| `app/layout.tsx` | Swap fonts |
| `app/globals.css` | Body font, base styles |
| `app/(public)/page.tsx` | Full rewrite — new hero/list layout |
| `components/ui/Nav.tsx` | Height, border, typography |
| `components/ui/SpotCard.tsx` | No radius, font-serif name, footer divider |
| `components/ui/VibeChip.tsx` | No radius, uppercase tracking |
| `components/ui/FilterBar.tsx` | No radius, new active state |
| `public/img/` | 4 static category images (or gradient placeholders) |

---

## Out of Scope

- Admin pages — intentionally unstyled (internal tool)
- Dark mode — removed (palette is light-only)
- Motion timing beyond what's specified — keep existing Framer Motion config elsewhere
