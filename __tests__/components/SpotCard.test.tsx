import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SpotCard from '@/components/ui/SpotCard'
import type { Spot } from '@/types/spot'

const mockSpot: Spot = {
  id: '1',
  name: 'Vesper Bar',
  category: 'date',
  subcategory: 'bar',
  area: 'Silom',
  description: 'Intimate cocktail bar with great atmosphere.',
  vibe: ['romantic', 'chill', 'dim-lit'],
  price_range: 3,
  google_maps_url: 'https://maps.google.com/place/vesper',
  coordinates: null,
  photos: [],
  my_notes: null,
  source: 'manual',
  rating: 5,
  status: 'active',
  created_at: '2026-05-22T00:00:00Z',
  updated_at: '2026-05-22T00:00:00Z',
}

describe('SpotCard', () => {
  it('renders spot name and area', () => {
    render(<SpotCard spot={mockSpot} />)
    expect(screen.getByText('Vesper Bar')).toBeInTheDocument()
    expect(screen.getByText('Silom')).toBeInTheDocument()
  })

  it('renders vibe chips (max 3)', () => {
    render(<SpotCard spot={mockSpot} />)
    expect(screen.getByText('romantic')).toBeInTheDocument()
    expect(screen.getByText('chill')).toBeInTheDocument()
    expect(screen.getByText('dim-lit')).toBeInTheDocument()
  })

  it('renders description truncated', () => {
    render(<SpotCard spot={mockSpot} />)
    expect(screen.getByText('Intimate cocktail bar with great atmosphere.')).toBeInTheDocument()
  })

  it('renders Maps link when google_maps_url present', () => {
    render(<SpotCard spot={mockSpot} />)
    expect(screen.getByRole('link', { name: /maps/i })).toHaveAttribute(
      'href',
      'https://maps.google.com/place/vesper'
    )
  })
})
