// A group of clickable "chips" for picking any number of options (like categories).
// Each chip is really a checkbox, styled as a pill, so keyboards and screen readers still work.
//   legend   - heading for the group
//   options  - every choice, e.g. ['Textbooks', 'Electronics']
//   selected - the choices currently picked (empty means "no filter")
//   onChange - called with the new list of picked choices
export default function ChipFilter({ legend, options, selected, onChange }) {
  function toggle(option) {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <fieldset className="chip-filter">
      <legend>{legend}</legend>
      {options.map((option) => (
        <label key={option} className={selected.includes(option) ? 'chip chip-selected' : 'chip'}>
          <input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} />
          {option}
        </label>
      ))}
    </fieldset>
  )
}
