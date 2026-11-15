// The glossy blue ribbons in the corners of the Canva landing and HotDeals screens.
// Pure decoration: hidden from screen readers and ignored by clicks.
export default function Ribbons() {
  return (
    <div className="ribbons" aria-hidden="true">
      <svg className="ribbon ribbon-top" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="ribbon-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c9d8ff" />
            <stop offset="0.5" stopColor="#6f8cff" />
            <stop offset="1" stopColor="#2f5bff" />
          </linearGradient>
        </defs>
        <path
          d="M30 20c40 0 60 30 90 40s50-10 60 20-30 60-70 60-40-30-70-40-30-50-10-80z"
          fill="none"
          stroke="url(#ribbon-fill)"
          strokeWidth="38"
          strokeLinecap="round"
        />
      </svg>
      <svg className="ribbon ribbon-left" viewBox="0 0 200 200">
        <path
          d="M20 40c50 10 90 20 110 60s-10 70-60 70"
          fill="none"
          stroke="url(#ribbon-fill)"
          strokeWidth="38"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
