import ListingForm from '../components/ListingForm'

// Post a new listing. The form itself lives in components/ListingForm.jsx,
// because the Edit page uses the same form.
export default function Sell({ session }) {
  return (
    <div>
      <h1>Sell an item</h1>
      <ListingForm session={session} />
    </div>
  )
}
