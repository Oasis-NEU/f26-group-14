import ListingForm from '../components/listings/ListingForm'

// Post a new listing. The form itself lives in components/ListingForm.jsx,
// because the Edit page uses the same form.
export default function Sell({ session }) {
  return (
    <div>
      <h1 className="page-title page-title-bold">Sell Items</h1>
      <div className="glass form-panel">
        <ListingForm session={session} />
      </div>
    </div>
  )
}
