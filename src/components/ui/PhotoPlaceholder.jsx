// SVG that mimics the mountain + sun placeholder in the UI mocks (screens 2,
// 3, and 4). Used when a listing or demo item has no real photo.
export default function PhotoPlaceholder() {
  return (
    <svg viewBox="0 0 160 160" width="100%" height="100%" aria-hidden="true">
      <rect width="160" height="160" fill="#cfe8f4" />
      <circle cx="108" cy="52" r="14" fill="#f0bf3b" />
      <path d="M0 160 L40 90 L72 125 L110 70 L160 140 L160 160 Z" fill="#5a9b4a" />
      <path d="M0 160 L30 110 L58 145 L92 95 L130 150 L160 125 L160 160 Z" fill="#8bc082" opacity="0.85" />
    </svg>
  )
}
