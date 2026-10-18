import { Link, useParams } from 'react-router-dom'
import { CheckIcon } from '../components/Icons.jsx'

export default function OrderPlaced() {
  const { code } = useParams()
  return (
    <div className="page section">
      <div className="receipt">
        <CheckIcon width={40} height={40} style={{ color: 'var(--accent-text)', margin: '0 auto 10px' }} />
        <h2>Your order is in</h2>
        <p style={{ color: 'var(--muted)', margin: '0 auto' }}>
          Keep this number. Quote it when you call or message the shop.
        </p>
        <div className="code">{code}</div>
        <p style={{ margin: '0 auto 22px' }}>
          Someone from the shop will call within a few hours to confirm the address and
          the delivery day. Nothing is charged until then.
        </p>
        <Link className="btn" to="/shop">Keep browsing</Link>
      </div>
    </div>
  )
}
