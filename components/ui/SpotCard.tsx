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
