// Price filter: a slider with two handles (min and max) plus number boxes for exact amounts.
// minPrice / maxPrice are text, and '' means "no limit" on that side.
//   onMinChange / onMaxChange - called with the new text value

const SLIDER_MAX = 500 // the slider's right end means "$500 and up"
const STEP = 5

export default function PriceRangeFilter({ minPrice, maxPrice, onMinChange, onMaxChange }) {
  // Where each handle sits. Typed amounts above the slider's range just park the handle at the end.
  const minValue = minPrice === '' ? 0 : Math.min(Number(minPrice), SLIDER_MAX)
  const maxValue = maxPrice === '' ? SLIDER_MAX : Math.min(Number(maxPrice), SLIDER_MAX)

  function handleMinSlider(event) {
    const value = Math.min(Number(event.target.value), maxValue) // can't slide past the max handle
    onMinChange(value === 0 ? '' : String(value))
  }

  function handleMaxSlider(event) {
    const value = Math.max(Number(event.target.value), minValue) // can't slide past the min handle
    onMaxChange(value === SLIDER_MAX ? '' : String(value))
  }

  // The two sliders sit on top of each other. If both handles end up in the same spot,
  // the one on top is the only one you can grab, so put the one that can still move on top.
  const minOnTop = minValue > SLIDER_MAX / 2

  return (
    <fieldset className="price-filter">
      <legend>Price</legend>

      <div className="price-slider">
        <div className="price-slider-rail">
          <div
            className="price-slider-fill"
            style={{ left: `${(minValue / SLIDER_MAX) * 100}%`, right: `${100 - (maxValue / SLIDER_MAX) * 100}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max={SLIDER_MAX}
          step={STEP}
          value={minValue}
          onChange={handleMinSlider}
          style={{ zIndex: minOnTop ? 2 : 1 }}
          aria-label="Minimum price"
        />
        <input
          type="range"
          min="0"
          max={SLIDER_MAX}
          step={STEP}
          value={maxValue}
          onChange={handleMaxSlider}
          aria-label="Maximum price"
        />
      </div>

      <div className="price-inputs">
        <label>
          Min $
          <input
            type="number"
            min="0"
            placeholder="0"
            value={minPrice}
            onChange={(e) => onMinChange(e.target.value)}
          />
        </label>
        <label>
          Max $
          <input
            type="number"
            min="0"
            placeholder={`${SLIDER_MAX}+`}
            value={maxPrice}
            onChange={(e) => onMaxChange(e.target.value)}
          />
        </label>
      </div>
    </fieldset>
  )
}
