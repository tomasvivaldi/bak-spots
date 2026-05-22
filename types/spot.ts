export type SpotCategory = 'date' | 'nightlife' | 'day' | 'meet'
export type SpotSource = 'manual' | 'maps_import' | 'chat_import' | 'ai_suggestion'
export type SpotStatus = 'active' | 'closed' | 'unvisited'

export interface Spot {
  id: string
  name: string
  category: SpotCategory
  subcategory: string | null
  area: string | null
  description: string | null
  vibe: string[]
  price_range: number | null
  google_maps_url: string | null
  coordinates: { x: number; y: number } | null
  photos: string[]
  my_notes: string | null
  source: SpotSource
  rating: number | null
  status: SpotStatus
  created_at: string
  updated_at: string
}

export type SpotInsert = Omit<Spot, 'id' | 'created_at' | 'updated_at'>
export type SpotUpdate = Partial<SpotInsert> & { id: string }

export interface ParsedMapsSpot {
  name: string
  area: string | null
  subcategory: string | null
  description: string
  vibe: string[]
  price_range: number | null
  google_maps_url: string
  category: SpotCategory
}

export interface ExtractedChatSpot {
  name: string
  area: string | null
  why: string | null
  vibe: string[]
  category: SpotCategory
  subcategory: string | null
}

export interface FilterState {
  area: string | null
  vibe: string[]
  price_range: number | null
}
