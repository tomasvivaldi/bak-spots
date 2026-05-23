import { describe, it, expect, vi } from 'vitest'

vi.mock('openai', () => {
  return {
    default: class {
      chat = {
        completions: {
          create: () => Promise.resolve({
            choices: [{
              message: {
                content: JSON.stringify([
                  {
                    name: 'Craft Bangkok',
                    area: 'Sukhumvit',
                    why: 'Great craft beer selection, chill vibe',
                    vibe: ['chill', 'casual'],
                    category: 'nightlife',
                    subcategory: 'bar',
                  },
                  {
                    name: 'Chatuchak Weekend Market',
                    area: 'Chatuchak',
                    why: 'Huge market, easy to meet people',
                    vibe: ['outdoor', 'busy'],
                    category: 'meet',
                    subcategory: 'market',
                  },
                ]),
              },
            }],
          }),
        },
      }
    },
  }
})

import { parseChatLog } from '@/lib/ai/parse-chat'

describe('parseChatLog', () => {
  it('extracts multiple spots from chat text', async () => {
    const chatText = `
      Hey! You should check out Craft Bangkok in Sukhumvit, amazing craft beers.
      Also Chatuchak market is great to meet people on weekends.
    `
    const result = await parseChatLog(chatText)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Craft Bangkok')
    expect(result[0].category).toBe('nightlife')
    expect(result[1].name).toBe('Chatuchak Weekend Market')
  })

  it('returns empty array when no spots found', async () => {
    const result = await parseChatLog('Hey how are you doing today?')
    expect(Array.isArray(result)).toBe(true)
  })
})
