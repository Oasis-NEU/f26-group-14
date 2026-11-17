import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { conversationKey, groupConversations } from '../lib/conversations'
import Avatar from '../components/ui/Avatar'

const MAX_MESSAGE_LENGTH = 1000

// Messages tab: conversations on the left, the open conversation on the right.
// Opening /messages?listing=12&to=<seller id> (the "Message seller" button on a listing)
// starts a new conversation about that listing if there isn't one yet.
//
// The real database doesn't have a messages table yet (MSG-* tasks), so outside `npm run demo`
// this page shows a "coming soon" note instead of an error.
export default function Messages({ session }) {
  const myId = session.user.id
  const [searchParams] = useSearchParams()
  const startListingId = searchParams.get('listing')
  const startWithUserId = searchParams.get('to')

  const [messages, setMessages] = useState([])
  const [listings, setListings] = useState({}) // id -> { id, title, photo_url }
  const [people, setPeople] = useState({}) // id -> { id, first_name, last_name, avatar_url }
  const [openKey, setOpenKey] = useState(
    startListingId && startWithUserId ? conversationKey(Number(startListingId), startWithUserId) : null,
  )
  const [loading, setLoading] = useState(true)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let ignore = false

    async function load() {
      const { data: rows, error } = await supabase
        .from('messages')
        .select('id, listing_id, sender_id, recipient_id, body, created_at')
        .or(`sender_id.eq.${myId},recipient_id.eq.${myId}`)
        .order('created_at', { ascending: true })

      if (ignore) return
      if (error) {
        setUnavailable(true)
        setLoading(false)
        return
      }

      // Look up the listings and people these conversations are about, in one query each.
      const listingIds = new Set(rows.map((m) => m.listing_id))
      const personIds = new Set(rows.flatMap((m) => [m.sender_id, m.recipient_id]))
      if (startListingId) listingIds.add(Number(startListingId))
      if (startWithUserId) personIds.add(startWithUserId)
      personIds.delete(myId)

      const [listingResult, peopleResult] = await Promise.all([
        supabase.from('listings').select('id, title, photo_url').in('id', [...listingIds]),
        supabase.from('profiles').select('id, first_name, last_name, avatar_url').in('id', [...personIds]),
      ])
      if (ignore) return

      setMessages(rows)
      setListings(Object.fromEntries((listingResult.data ?? []).map((l) => [l.id, l])))
      setPeople(Object.fromEntries((peopleResult.data ?? []).map((p) => [p.id, p])))
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [myId, startListingId, startWithUserId])

  const conversations = useMemo(() => {
    const grouped = groupConversations(messages, myId)
    // A conversation started from a listing page has no messages yet, so add an empty one at the top.
    if (startListingId && startWithUserId && startWithUserId !== myId) {
      const key = conversationKey(Number(startListingId), startWithUserId)
      if (!grouped.some((c) => c.key === key)) {
        grouped.unshift({ key, listingId: Number(startListingId), otherUserId: startWithUserId, messages: [], lastMessage: null })
      }
    }
    return grouped
  }, [messages, myId, startListingId, startWithUserId])

  // On a wide screen, open the newest conversation if none is picked.
  const open = conversations.find((c) => c.key === openKey) ?? conversations[0] ?? null

  async function handleSend(text) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ listing_id: open.listingId, sender_id: myId, recipient_id: open.otherUserId, body: text })
      .select('id, listing_id, sender_id, recipient_id, body, created_at')
      .single()
    if (error) return error.message
    setMessages((current) => [...current, data])
    setOpenKey(open.key)
    return ''
  }

  if (loading) return <p className="status-text">Loading messages...</p>

  if (unavailable) {
    return (
      <div>
        <h1 className="page-title page-title-bold">Messages</h1>
        <div className="glass empty-state">
          <p>Messaging is coming soon. For now, use "Email seller" on a listing.</p>
          <Link to="/feed" className="btn btn-primary">Browse listings</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title page-title-bold">Messages</h1>

      {conversations.length === 0 ? (
        <div className="glass empty-state">
          <p>No messages yet. Find something you like and message the seller.</p>
          <Link to="/feed" className="btn btn-primary">Browse listings</Link>
        </div>
      ) : (
        <div className="messages-layout">
          <ul className="glass conversation-list" aria-label="Conversations">
            {conversations.map((conversation) => {
              const person = people[conversation.otherUserId]
              const listing = listings[conversation.listingId]
              return (
                <li key={conversation.key}>
                  <button
                    type="button"
                    className="conversation-item"
                    aria-current={conversation.key === open?.key ? 'true' : undefined}
                    onClick={() => setOpenKey(conversation.key)}
                  >
                    <Avatar url={person?.avatar_url} name={person?.first_name ?? '?'} size={40} />
                    <span className="conversation-text">
                      <strong>{person?.first_name ?? 'Student'}</strong>
                      <span className="conversation-listing">{listing?.title ?? 'Listing'}</span>
                      <span className="conversation-preview">
                        {conversation.lastMessage ? conversation.lastMessage.body : 'New conversation'}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {open && (
            <Thread
              key={open.key}
              conversation={open}
              myId={myId}
              person={people[open.otherUserId]}
              listing={listings[open.listingId]}
              onSend={handleSend}
            />
          )}
        </div>
      )}
    </div>
  )
}

// One open conversation: who it's with, which listing, the messages, and a box to reply.
function Thread({ conversation, myId, person, listing, onSend }) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [conversation.messages.length])

  async function handleSubmit(event) {
    event.preventDefault()
    const text = draft.trim()
    if (text === '') return
    setSending(true)
    const problem = await onSend(text)
    setSending(false)
    setError(problem)
    if (!problem) setDraft('')
  }

  return (
    <section className="glass thread" aria-label={`Conversation with ${person?.first_name ?? 'student'}`}>
      <header className="thread-header">
        <div>
          <strong>{person ? [person.first_name, person.last_name].filter(Boolean).join(' ') : 'Student'}</strong>
          {listing && (
            <Link to={`/listing/${listing.id}`} className="thread-listing">
              {listing.title}
            </Link>
          )}
        </div>
      </header>

      <ol className="thread-messages">
        {conversation.messages.length === 0 && (
          <li className="thread-empty">Say hi and ask about the item. Agree on a campus spot to meet.</li>
        )}
        {conversation.messages.map((message) => (
          <li key={message.id} className={message.sender_id === myId ? 'bubble bubble-mine' : 'bubble'}>
            <p>{message.body}</p>
            <time dateTime={message.created_at}>
              {new Date(message.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </time>
          </li>
        ))}
        <li ref={endRef} aria-hidden="true" />
      </ol>

      <form className="thread-reply" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="reply">Message</label>
        <input
          id="reply"
          type="text"
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Write a message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={sending || draft.trim() === ''}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>
  )
}
