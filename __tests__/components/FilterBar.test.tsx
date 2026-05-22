import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FilterBar from '@/components/ui/FilterBar'

const areas = ['Silom', 'Sukhumvit', 'Thonglor', 'Ekkamai']

describe('FilterBar', () => {
  it('renders area options', () => {
    render(<FilterBar areas={areas} vibes={[]} onChange={vi.fn()} />)
    expect(screen.getByText('All Areas')).toBeInTheDocument()
    expect(screen.getByText('Silom')).toBeInTheDocument()
  })

  it('calls onChange with selected area', async () => {
    const onChange = vi.fn()
    render(<FilterBar areas={areas} vibes={[]} onChange={onChange} />)
    await userEvent.click(screen.getByText('Silom'))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ area: 'Silom' })
    )
  })

  it('calls onChange with null area when All Areas clicked', async () => {
    const onChange = vi.fn()
    render(<FilterBar areas={areas} vibes={[]} onChange={onChange} />)
    await userEvent.click(screen.getByText('Silom'))
    await userEvent.click(screen.getByText('All Areas'))
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ area: null })
    )
  })
})
