import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, money, PLACEHOLDER } from '../api/client.js'
import { useStore } from '../context/StoreContext.jsx'
import Loader from '../components/Loader.jsx'

/* Rows where a bigger number is better, so the winning cell can be marked. */
const numeric = {
  'Weight': (v) => {
    // lighter is better — negate so Math.max picks the lightest
    const g = parseInt(v) || 0
    return g > 0 ? -g : 0
  },
}

export default function Compare() {
  const { compare, toggleCompare, clearCompare, addToCart } = useStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!compare.length) { setItems([]); setLoading(false); return }
    setLoading(true)
    Promise.all(compare.map((c) => api.product(c.id).then((d) => d.product).catch(() => null)))
      .then((list) => setItems(list.filter(Boolean)))
      .finally(() => setLoading(false))
  }, [compare])

  if (loading) return <div className="page"><Loader text="Loading the comparison" /></div>

  if (!items.length) {
    return (
      <div className="page empty">
        <h3>Nothing to compare yet</h3>
        <p>Add two or three shoes with the Compare button and their specifications line up here.</p>
        <Link className="btn" to="/shop">Browse shoes</Link>
      </div>
    )
  }

  const rows = [
    ['Price',           (p) => money(p.price)],
    ['Upper material',  (p) => p.material],
    ['Closure type',    (p) => p.closure],
    ['Sole',            (p) => p.sole],
    ['Heel height',     (p) => p.heel_height],
    ['Toe shape',       (p) => p.toe_shape],
    ['Gender',          (p) => p.gender ? { men: "Men's", women: "Women's", unisex: 'Unisex', kids: "Kids'" }[p.gender] : null],
    ['Insole',          (p) => p.insole],
    ['Weight',          (p) => p.weight],
    ['Available sizes', (p) => p.available_sizes],
    ['Condition',       (p) => (p.condition_type === 'used' ? 'Pre-owned' : 'Brand new')],
    ['Warranty',        (p) => p.warranty],
    ['In stock',        (p) => (p.stock ? `${p.stock} pair${p.stock === 1 ? '' : 's'}` : 'Sold out')],
  ]

  const bestIndex = (label, values) => {
    if (label === 'Price') {
      const nums = items.map((p) => p.price)
      return nums.indexOf(Math.min(...nums))
    }
    const fn = numeric[label]
    if (!fn) return -1
    const nums = values.map((v) => fn(v || ''))
    const max = Math.max(...nums)
    return max !== 0 && nums.filter((n) => n === max).length === 1 ? nums.indexOf(max) : -1
  }

  return (
    <div className="page section">
      <div className="section-head">
        <div>
          <h2>Side by side</h2>
          <p>The shaded cell is the stronger figure in that row.</p>
        </div>
        <button className="link-danger" onClick={clearCompare}>Clear the comparison</button>
      </div>

      <div className="table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th style={{ background: 'var(--surface)' }}>Shoe</th>
              {items.map((p) => (
                <td key={p.id}>
                  <img src={p.images?.[0] || PLACEHOLDER} alt="" style={{ height: 90, objectFit: 'contain', marginBottom: 10 }}
                       onError={(e) => { e.currentTarget.src = PLACEHOLDER }} />
                  <strong style={{ display: 'block', fontFamily: 'var(--display)' }}>{p.brand} {p.model}</strong>
                  <button className="link-danger" onClick={() => toggleCompare({ id: p.id })}>Remove</button>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, read]) => {
              const values = items.map(read)
              const best = bestIndex(label, values)
              return (
                <tr key={label}>
                  <th>{label}</th>
                  {values.map((v, i) => (
                    <td key={i} className={i === best ? 'best' : ''}>{v || '—'}</td>
                  ))}
                </tr>
              )
            })}
            <tr>
              <th>Order</th>
              {items.map((p) => (
                <td key={p.id}>
                  <button className="btn btn--rose btn--small" disabled={!p.stock} onClick={() => addToCart(p)}>
                    {p.stock ? 'Add to cart' : 'Sold out'}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
