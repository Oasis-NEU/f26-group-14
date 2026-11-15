// Rounded blue search field with a filter-sliders icon on the right, from
// screen 3.png. Fully controlled: parent owns the text state.
//
//   value          - current query string
//   onChange       - called with the new query string
//   onFilterClick  - optional: opens a filter drawer
//   placeholder    - optional hint text
export default function SearchBar({
  value = '',
  onChange = () => {},
  onFilterClick,
  placeholder = '',
}) {
  return (
    <div className="searchbar">
      <div className="searchbar__field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="20" y1="20" x2="16.5" y2="16.5" />
        </svg>
        <input
          type="search"
          className="searchbar__input"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {onFilterClick && (
        <button type="button" className="searchbar__filter" onClick={onFilterClick} aria-label="Open filters">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="4" y1="7" x2="22" y2="7" />
            <line x1="4" y1="13" x2="22" y2="13" />
            <line x1="4" y1="19" x2="22" y2="19" />
            <circle cx="17" cy="7" r="2.3" fill="#0a1030" />
            <circle cx="9" cy="13" r="2.3" fill="#0a1030" />
            <circle cx="19" cy="19" r="2.3" fill="#0a1030" />
          </svg>
        </button>
      )}
    </div>
  )
}
