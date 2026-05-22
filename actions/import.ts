'use server'
import { parseMapsUrl } from '@/lib/claude/parse-maps'
import { parseChatLog } from '@/lib/claude/parse-chat'
import { createSpot } from './spots'
import { isAuthenticated } from '@/lib/auth/session'
import type { ParsedMapsSpot, ExtractedChatSpot, SpotInsert } from '@/types/spot'

export async function importFromMapsUrl(
  _prev: { error: string; result?: ParsedMapsSpot } | null,
  formData: FormData
): Promise<{ error: string; result?: ParsedMapsSpot } | null> {
  try {
    if (!isAuthenticated()) throw new Error('Unauthorized')
    const url = formData.get('maps_url') as string
    const result = await parseMapsUrl(url)
    return { error: '', result }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function saveImportedSpot(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  try {
    if (!isAuthenticated()) throw new Error('Unauthorized')
    const vibe = (formData.get('vibe') as string)
      .split(',').map((v) => v.trim()).filter(Boolean)

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
      my_notes: null,
      source: 'maps_import',
      rating: null,
      status: 'unvisited',
    }
    await createSpot(data)
    return { error: '' }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function importFromChatLog(
  _prev: { error: string; results?: ExtractedChatSpot[] } | null,
  formData: FormData
): Promise<{ error: string; results?: ExtractedChatSpot[] } | null> {
  try {
    if (!isAuthenticated()) throw new Error('Unauthorized')
    const text = formData.get('chat_text') as string
    const results = await parseChatLog(text)
    return { error: '', results }
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function saveChatImportedSpots(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  try {
    if (!isAuthenticated()) throw new Error('Unauthorized')
    const spotsJson = formData.get('spots') as string
    const spots: ExtractedChatSpot[] = JSON.parse(spotsJson)

    for (const spot of spots) {
      const data: SpotInsert = {
        name: spot.name,
        category: spot.category,
        subcategory: spot.subcategory,
        area: spot.area,
        description: spot.why,
        vibe: spot.vibe,
        price_range: null,
        google_maps_url: null,
        coordinates: null,
        photos: [],
        my_notes: null,
        source: 'chat_import',
        rating: null,
        status: 'unvisited',
      }
      await createSpot(data)
    }
    return { error: '' }
  } catch (e) {
    return { error: (e as Error).message }
  }
}
