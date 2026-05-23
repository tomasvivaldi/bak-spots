import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers before importing session
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

import { cookies } from 'next/headers'
import { isAuthenticated } from '@/lib/auth/session'

describe('isAuthenticated', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-secret-abc'
  })

  it('returns true when cookie matches SESSION_SECRET', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === 'bkk_admin_session' ? { name, value: 'test-secret-abc' } : undefined,
    } as any)
    expect(await isAuthenticated()).toBe(true)
  })

  it('returns false when cookie is missing', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as any)
    expect(await isAuthenticated()).toBe(false)
  })

  it('returns false when cookie has wrong value', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === 'bkk_admin_session' ? { name, value: 'wrong-secret' } : undefined,
    } as any)
    expect(await isAuthenticated()).toBe(false)
  })
})
