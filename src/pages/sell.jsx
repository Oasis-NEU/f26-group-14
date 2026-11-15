import PageShell from '../components/ui/PageShell'
import TopNav from '../components/ui/TopNav'
import ListingForm from '../components/listings/ListingForm'





export default function Sell({ session }) {
  return (
    <PageShell variant="deep">
      <TopNav profileHref={`/profile/${session.user.id}`} />
      <h1 className="page-title">Sell Items</h1>
      <div style={{ marginTop: 24, maxWidth: 560 }}>
        <ListingForm session={session} />
      </div>
    </PageShell>
  )
}
