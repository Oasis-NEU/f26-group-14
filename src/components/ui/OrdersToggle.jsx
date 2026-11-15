import Button from './Button'

// The OUTGOING / INCOMING pair of buttons from screen 4.png.
// Controlled: parent owns which tab is active.
//
//   value    - 'outgoing' | 'incoming'
//   onChange - called with the new value
export default function OrdersToggle({ value = 'outgoing', onChange = () => {} }) {
  return (
    <div className="orders-toggle">
      <Button variant={value === 'outgoing' ? 'primary' : 'outline'} onClick={() => onChange('outgoing')}>
        Outgoing
      </Button>
      <Button variant={value === 'incoming' ? 'primary' : 'outline'} onClick={() => onChange('incoming')}>
        Incoming
      </Button>
    </div>
  )
}
