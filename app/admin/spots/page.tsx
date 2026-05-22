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
