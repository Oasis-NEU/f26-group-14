// Turns a flat list of messages into conversations for the Messages tab.
// A conversation is one listing plus the other person, so talking to two buyers about the same
// fridge gives two separate conversations.
//
//   messages - rows like { id, listing_id, sender_id, recipient_id, body, created_at }
//   myId     - the signed-in user's id
//
// Returns [{ key, listingId, otherUserId, messages (oldest first), lastMessage }],
// newest conversation first. Doesn't change the input.
export function groupConversations(messages, myId) {
  const byKey = new Map()

  for (const message of messages) {
    const otherUserId = message.sender_id === myId ? message.recipient_id : message.sender_id
    const key = conversationKey(message.listing_id, otherUserId)
    if (!byKey.has(key)) {
      byKey.set(key, { key, listingId: message.listing_id, otherUserId, messages: [] })
    }
    byKey.get(key).messages.push(message)
  }

  const conversations = [...byKey.values()].map((conversation) => {
    const sorted = [...conversation.messages].sort((a, b) => a.created_at.localeCompare(b.created_at))
    return { ...conversation, messages: sorted, lastMessage: sorted[sorted.length - 1] }
  })

  return conversations.sort((a, b) => b.lastMessage.created_at.localeCompare(a.lastMessage.created_at))
}

// The same string for a listing and person every time, so the page can remember which one is open.
export function conversationKey(listingId, otherUserId) {
  return `${listingId}:${otherUserId}`
}
