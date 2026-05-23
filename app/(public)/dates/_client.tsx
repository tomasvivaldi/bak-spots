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
