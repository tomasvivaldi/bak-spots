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
