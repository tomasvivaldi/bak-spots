'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
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
  const [state, formAction] = useActionState(action, null)

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
