import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'

export default function CompareTray() {
  const { compare, toggleCompare, clearCompare } = useStore()
  const { pathname } = useLocation()

  if (!compare.length || pathname === '/compare') return null

  return (
    <div className="compare-tray">
      <div className="page">
        <strong style={{ fontSize: '0.9rem' }}>Comparing</strong>
        <div className="slots">
          {compare.map((item) => (
            <span className="slot" key={item.id}>
              {item.model}
              <button onClick={() => toggleCompare(item)} aria-label={`Remove ${item.model}`}>×</button>
            </span>
          ))}
        </div>
        <button className="btn btn--ghost btn--small" style={{ color: '#00B8B6', borderColor: 'rgba(0, 184, 182, 0.4)' }} onClick={clearCompare}>
          Clear
        </button>
        <Link className="btn btn--rose btn--small" to="/compare">See the differences</Link>
      </div>
    </div>
  )
}
