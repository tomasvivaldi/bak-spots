import { describe, it, expect, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class {
      messages = {
        create: () => Promise.resolve({
          content: [{
            type: 'text',
            text: JSON.stringify({
              category: 'date',
              subcategory: 'bar',
              area: 'Silom',
              description: 'Intimate cocktail bar perfect for dates.',
              vibe: ['romantic', 'dim-lit', 'chill'],
              price_range: 3,
            }),
          }],
        }),
      }
    },
  }
})

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({
    status: 'OK',
    results: [{ place_id: 'ChIJ_test123' }],
    result: {
      name: 'Vesper Bar',
      formatted_address: '10/15 Convent Rd, Silom, Bangkok',
      types: ['bar', 'food', 'establishment'],
      rating: 4.5,
      url: 'https://maps.google.com/?cid=123',
      price_level: 3,
    },
  }),
})

import { parseMapsUrl } from '@/lib/claude/parse-maps'

describe('parseMapsUrl', () => {
  it('extracts place name from Google Maps URL', async () => {
    const result = await parseMapsUrl(
      'https://www.google.com/maps/place/Vesper+Bar/@13.7234,100.5289'
    )
    expect(result.name).toBe('Vesper Bar')
    expect(result.category).toBe('date')
    expect(result.area).toBe('Silom')
    expect(result.vibe).toContain('romantic')
  })

  it('throws on unrecognized URL format', async () => {
    await expect(parseMapsUrl('https://notgooglemaps.com/place')).rejects.toThrow()
  })
})
