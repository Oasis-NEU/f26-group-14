import { describe, expect, it } from 'vitest'
import { conversationKey, groupConversations } from './conversations'

const ME = 'me'
const message = (id, listingId, from, to, minute) => ({
  id,
  listing_id: listingId,
  sender_id: from,
  recipient_id: to,
  body: `message ${id}`,
  created_at: `2026-11-15T12:${String(minute).padStart(2, '0')}:00Z`,
})

describe('groupConversations', () => {
  it('returns no conversations for no messages', () => {
    expect(groupConversations([], ME)).toEqual([])
  })

  it('puts messages both ways between two people about one listing in one conversation', () => {
    const result = groupConversations([message(1, 7, 'ana', ME, 1), message(2, 7, ME, 'ana', 2)], ME)
    expect(result).toHaveLength(1)
    expect(result[0].otherUserId).toBe('ana')
    expect(result[0].messages.map((m) => m.id)).toEqual([1, 2])
  })

  it('keeps different buyers of the same listing apart', () => {
    const result = groupConversations([message(1, 7, 'ana', ME, 1), message(2, 7, 'ben', ME, 2)], ME)
    expect(result.map((c) => c.otherUserId).sort()).toEqual(['ana', 'ben'])
  })

  it('sorts messages oldest first and conversations newest first', () => {
    const result = groupConversations(
      [message(3, 7, 'ana', ME, 9), message(1, 7, ME, 'ana', 1), message(2, 8, 'ben', ME, 5)],
      ME,
    )
    expect(result.map((c) => c.key)).toEqual([conversationKey(7, 'ana'), conversationKey(8, 'ben')])
    expect(result[0].messages.map((m) => m.id)).toEqual([1, 3])
    expect(result[0].lastMessage.id).toBe(3)
  })

  it('does not change the list it was given', () => {
    const input = [message(2, 7, 'ana', ME, 5), message(1, 7, ME, 'ana', 1)]
    const copy = structuredClone(input)
    groupConversations(input, ME)
    expect(input).toEqual(copy)
  })
})
