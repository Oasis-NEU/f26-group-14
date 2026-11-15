import PageShell from '../components/ui/PageShell'
import TopNav from '../components/ui/TopNav'
import ListingForm from '../components/listings/ListingForm'
import SellTabs from '../components/listings/SellTabs'

// Sell Items (screen 5.png): post a new listing. "My listings" lives on its own
// screen at /sell/listings, reached through the tabs next to the title.
export default function Sell({ session }) {
  return (
    <PageShell variant="deep">
      <TopNav session={session} />
      <div className="page-title-row">
        <h1 className="page-title">Sell Items</h1>
        <SellTabs />
      </div>
      <ListingForm session={session} />
    </PageShell>
  )
}
