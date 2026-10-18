import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, money, PLACEHOLDER } from '../api/client.js'
import AdminShell from '../components/AdminShell.jsx'
import Loader from '../components/Loader.jsx'
import { useStore } from '../context/StoreContext.jsx'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [term, setTerm]         = useState('')
  const [filter, setFilter]     = useState('')
  const { toast } = useStore()
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    api.products({ limit: 48, search: term })
      .then((d) => setProducts(d.products || []))
      .catch((e) => toast(e.message, 'err'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const remove = async (p) => {
    if (!window.confirm(`Remove ${p.brand} ${p.model} from the site? This cannot be undone.`)) return
    try {
      await api.removeProduct(p.id)
      toast('Shoe removed successfully.')
      load()
    } catch (e) {
      toast(e.message, 'err')
    }
  }

  const displayedProducts = useMemo(() => {
    if (!filter) return products
    if (filter === 'in_stock') return products.filter((p) => p.stock > 0)
    if (filter === 'low_stock') return products.filter((p) => p.stock > 0 && p.stock <= 2)
    if (filter === 'sold_out') return products.filter((p) => p.stock === 0)
    if (filter === 'offers') return products.filter((p) => p.old_price > p.price)
    if (filter === 'trending') return products.filter((p) => Number(p.is_fast_moving) === 1)
    if (filter === 'featured') return products.filter((p) => Number(p.is_featured) === 1)
    return products
  }, [products, filter])

  return (
    <AdminShell
      title={
        <div className="orders-title-group">
          <h2>Shoes Inventory</h2>
          <span className="pill-total-badge">{products.length} shoes</span>
        </div>
      }
      action={
        <button
          type="button"
          className="btn btn--rose btn--small"
          onClick={() => navigate('/admin/products/new')}
          style={{ borderRadius: 'var(--r-full)', padding: '9px 20px', fontWeight: 700 }}
        >
          + Add Shoe
        </button>
      }
    >
      {/* SEARCH AND FILTER BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <form
          onSubmit={(e) => { e.preventDefault(); load() }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 440 }}
        >
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1.5px solid var(--line)',
              borderRadius: 'var(--r-md)',
              fontSize: '0.88rem',
              background: 'var(--paper)',
              outline: 'none',
            }}
          />
          <button type="submit" className="btn btn--small" style={{ padding: '10px 18px', fontWeight: 700 }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            className="order-filter-pill-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Inventory</option>
            <option value="in_stock">In Stock ({products.filter((p) => p.stock > 0).length})</option>
            <option value="low_stock">Low Stock (≤ 2)</option>
            <option value="sold_out">Sold Out ({products.filter((p) => p.stock === 0).length})</option>
            <option value="offers">On Sale ({products.filter((p) => p.old_price > p.price).length})</option>
            <option value="trending">Trending ({products.filter((p) => Number(p.is_fast_moving) === 1).length})</option>
            <option value="featured">Featured ({products.filter((p) => Number(p.is_featured) === 1).length})</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading shoes inventory..." />
      ) : displayedProducts.length === 0 ? (
        <div className="empty" style={{ background: 'var(--paper)', border: '1.5px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '48px 24px' }}>
          <h3>No shoes found</h3>
          <p>{term ? 'No shoes match your search query.' : 'No shoes listed under this filter.'}</p>
        </div>
      ) : (
        <div className="order-table-card">
          <div className="table-wrap">
            <table className="booking-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 320 }}>Shoe</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Collections</th>
                  <th style={{ textAlign: 'right', paddingRight: 24 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((p) => {
                  const discountPct = p.old_price > p.price
                    ? Math.round(((p.old_price - p.price) / p.old_price) * 100)
                    : 0

                  return (
                    <tr key={p.id}>
                      {/* SHOE CELL */}
                      <td>
                        <div className="inventory-shoe-cell">
                          <div className="inventory-thumb-box">
                            <img
                              src={p.images?.[0] || PLACEHOLDER}
                              alt={p.model}
                              className="inventory-thumb"
                              onError={(e) => { e.currentTarget.src = PLACEHOLDER }}
                            />
                          </div>
                          <div className="inventory-shoe-info">
                            <span className="inventory-brand-tag">{p.brand}</span>
                            <strong className="inventory-model-title">{p.model}</strong>
                            <div className="inventory-specs">
                              {[p.material, p.closure, p.available_sizes ? `Sizes: ${p.available_sizes}` : null]
                                .filter(Boolean)
                                .join(' · ')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* PRICE */}
                      <td>
                        <div className="inventory-price-curr">{money(p.price)}</div>
                        {p.old_price > p.price && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span className="inventory-price-old">{money(p.old_price)}</span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              color: 'var(--accent-text)',
                              background: 'var(--surface-strong)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}>
                              -{discountPct}%
                            </span>
                          </div>
                        )}
                      </td>

                      {/* STOCK STATUS */}
                      <td>
                        {p.stock === 0 ? (
                          <span className="stock-pill stock-out">
                            <span className="status-dot-circle" />
                            Sold out
                          </span>
                        ) : p.stock <= 2 ? (
                          <span className="stock-pill stock-low">
                            <span className="status-dot-circle" />
                            {p.stock} left
                          </span>
                        ) : (
                          <span className="stock-pill stock-in">
                            <span className="status-dot-circle" />
                            {p.stock} in stock
                          </span>
                        )}
                      </td>

                      {/* COLLECTIONS BADGES */}
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {p.old_price > p.price && (
                            <span className="col-badge col-badge--sale">Sale</span>
                          )}
                          {Number(p.is_fast_moving) === 1 && (
                            <span className="col-badge col-badge--hot">Trending</span>
                          )}
                          {Number(p.is_featured) === 1 && (
                            <span className="col-badge col-badge--pick">Featured</span>
                          )}
                          {!(p.old_price > p.price) && !Number(p.is_fast_moving) && !Number(p.is_featured) && (
                            <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Standard</span>
                          )}
                        </div>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td style={{ textAlign: 'right', paddingRight: 24 }}>
                        <div className="booking-actions-group" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="chip-action-btn chip-edit"
                            onClick={() => navigate(`/admin/products/${p.id}`)}
                            title="Edit shoe details and inventory"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="chip-action-btn chip-delete"
                            onClick={() => remove(p)}
                            title="Delete shoe from inventory"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

