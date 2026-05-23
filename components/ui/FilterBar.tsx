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
