// Circular profile avatar button used in the top-right of the nav.
// Falls back to a generic silhouette SVG when the user hasn't uploaded a
// picture, matching the ProfileIcon.png prototype.
//
//   url     - avatar image URL (optional)
//   onClick - optional click handler (clickable circle)
//   as      - render as a Link/anchor by passing a component
export default function ProfileIcon({ url, onClick, as: Tag = 'button', ...rest }) {
  return (
    <Tag className="profile-circle" onClick={onClick} type={Tag === 'button' ? 'button' : undefined} {...rest}>
      {url ? (
        <img src={url} alt="Your profile" />
      ) : (
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="18" fill="#fff" />
          <circle cx="18" cy="14" r="5" fill="#0a1030" />
          <path d="M6 32c2-6 7-9 12-9s10 3 12 9" fill="#0a1030" />
        </svg>
      )}
    </Tag>
  )
}
