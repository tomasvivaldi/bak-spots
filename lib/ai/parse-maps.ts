import OpenAI from 'openai'
import type { ParsedMapsSpot } from '@/types/spot'

function extractPlaceName(url: string): string {
  const match = url.match(/maps\/place\/([^/@?]+)/)
  if (match) return decodeURIComponent(match[1].replace(/\+/g, ' '))
  throw new Error('Cannot extract place name from URL. Use a Google Maps place URL (maps.google.com/maps/place/...)')
}

export async function parseMapsUrl(mapsUrl: string): Promise<ParsedMapsSpot> {
  const placeName = extractPlaceName(mapsUrl)
  const apiKey = process.env.GOOGLE_PLACES_API_KEY!

  const searchRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName + ' Bangkok')}&key=${apiKey}`
  )
  const searchData = await searchRes.json()

  if (searchData.status !== 'OK' || !searchData.results.length) {
    throw new Error(`Place not found: ${placeName}`)
  }

  const placeId = searchData.results[0].place_id

  const detailsRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,types,rating,url,price_level&key=${apiKey}`
  )
  const detailsData = await detailsRes.json()
  if (!detailsRes.ok || !detailsData.result) {
    throw new Error(`Failed to fetch place details for ${placeId}`)
  }
  const place = detailsData.result

  const client = new OpenAI({ apiKey: process.env.CODEX_API_KEY })
  const response = await client.chat.completions.create({
    model: 'gpt-4.5-mini',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Given this Bangkok place, return a JSON object with:
- category: one of "date", "nightlife", "day", "meet"
- subcategory: e.g. "bar", "cafe", "park", "club", "restaurant", "mall"
- area: Bangkok neighborhood (e.g. "Sukhumvit", "Silom", "Thonglor", "Ekkamai")
- description: 1-2 sentence description for a dating context
- vibe: array of 1-4 tags e.g. ["rooftop", "chill", "romantic", "loud", "outdoor"]
- price_range: integer 1-4 (1=cheap, 4=expensive)

Place: ${place.name}
Address: ${place.formatted_address}
Types: ${place.types.join(', ')}
Google rating: ${place.rating ?? 'unknown'}
Price level: ${place.price_level ?? 'unknown'}

Return only valid JSON, no markdown.`,
    }],
  })

  const raw = response.choices[0].message.content ?? ''
  const json = JSON.parse(raw)

  return {
    name: place.name,
    area: json.area ?? null,
    subcategory: json.subcategory ?? null,
    description: json.description ?? '',
    vibe: Array.isArray(json.vibe) ? json.vibe : [],
    price_range: typeof json.price_range === 'number' ? json.price_range : null,
    google_maps_url: mapsUrl,
    category: json.category,
  }
}
