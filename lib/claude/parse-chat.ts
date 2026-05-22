import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedChatSpot } from '@/types/spot'

export async function parseChatLog(chatText: string): Promise<ExtractedChatSpot[]> {
  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Extract all Bangkok place recommendations from this conversation.

For each place, return a JSON object with:
- name: place name
- area: Bangkok neighborhood if mentioned (e.g. "Sukhumvit", "Silom", "Thonglor") — null if unknown
- why: reason it was recommended in 1 sentence — null if not stated
- vibe: array of descriptors mentioned or implied (e.g. ["chill", "romantic", "loud", "outdoor"]) — empty array if none
- category: one of "date", "nightlife", "day", "meet" based on context
- subcategory: e.g. "bar", "cafe", "restaurant", "club", "park", "mall" — null if unclear

Include only actual places (venues, parks, malls, streets, areas). Skip general advice.
Return only a valid JSON array. If no places found, return []. No markdown, no explanation.

Conversation:
${chatText}`,
    }],
  })

  const raw = (message.content[0] as { type: 'text'; text: string }).text.trim()
  try {
    const spots: ExtractedChatSpot[] = JSON.parse(raw)
    return Array.isArray(spots) ? spots : []
  } catch {
    return []
  }
}
