// The "avatar + HELLO {USERNAME}" pill from screen 2.png.
// Pure presentation: the parent passes a name (or defaults to the hardcoded
// placeholder) and an optional avatar URL.
//
//   username  - display name; falls back to '{USERNAME}' placeholder from the mock
//   avatarUrl - optional profile image
export default function UserPill({ username = '{USERNAME}', avatarUrl }) {
  return (
    <div className="user-pill">
      <span className="user-pill__avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" />
        ) : (
          <svg viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="18" r="6" fill="#0a1030" />
            <path d="M8 40c3-7 8-10 14-10s11 3 14 10" fill="#0a1030" />
          </svg>
        )}
      </span>
      <span className="user-pill__label">Hello {username}</span>
    </div>
  )
}
