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
