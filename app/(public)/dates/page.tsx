import { createClient } from '@/lib/supabase/server'
import type { Spot } from '@/types/spot'
import CategoryPageClient from './_client'

export const revalidate = 60

export default async function DatesPage() {
  const supabase = await createClient()
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('category', 'date')
    .eq('status', 'active')
    .order('name')

  const areas = [...new Set((spots ?? []).map((s: Spot) => s.area).filter(Boolean))] as string[]
  const vibes = [...new Set((spots ?? []).flatMap((s: Spot) => s.vibe))]

  return <CategoryPageClient spots={spots ?? []} areas={areas} vibes={vibes} title="Date Spots" />
}
