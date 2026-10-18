import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, money, USE_CASES, CLOSURE_OPTIONS, GENDER_OPTIONS } from '../api/client.js'
import ProductGrid from '../components/ProductGrid.jsx'
import { FilterIcon } from '../components/Icons.jsx'

/**
 * Every filter lives in the URL, so a filtered shelf can be shared as a link,
 * survives a refresh and works with the browser back button.
 */
export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [data, setData]     = useState({ products: [], total: 0, pages: 1 })
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 900 : true))

  const query = useMemo(() => Object.fromEntries(params.entries()), [params])

  useEffect(() => { api.brands().then(setBrands).catch(() => {}) }, [])

  useEffect(() => {
    setLoading(true)
    api.products({ ...query, limit: 12 })
      .then(setData)
      .catch(() => setData({ products: [], total: 0, pages: 1 }))
      .finally(() => setLoading(false))
  }, [params])

  const pageParam = params.get('page')
  useEffect(() => {
    if (pageParam) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pageParam])

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value === '' || value === null || value === false) next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setParams(next)
    if (key === 'page') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const toggleBrand = (slug) => {
    const current = (query.brand || '').split(',').filter(Boolean)
    const next = current.includes(slug) ? current.filter((b) => b !== slug) : [...current, slug]
    update('brand', next.join(','))
  }

  const activeBrands = (query.brand || '').split(',').filter(Boolean)

  const chips = []
  if (query.search)    chips.push(['search', `"${query.search}"`])
  if (query.condition) chips.push(['condition', query.condition === 'used' ? 'Pre-owned' : 'Brand new'])
  if (query.use_case)  chips.push(['use_case', USE_CASES.find((u) => u.value === query.use_case)?.label])
  if (query.closure)   chips.push(['closure', query.closure])
  if (query.gender)    chips.push(['gender', GENDER_OPTIONS.find((g) => g.value === query.gender)?.label || query.gender])
  if (query.offers)    chips.push(['offers', 'On offer'])
  if (query.fast)      chips.push(['fast', 'Trending'])
  if (query.in_stock)  chips.push(['in_stock', 'In stock only'])
  if (query.min)       chips.push(['min', `From ${money(query.min)}`])
  if (query.max)       chips.push(['max', `Up to ${money(query.max)}`])
  activeBrands.forEach((b) => chips.push([`brand:${b}`, brands.find((x) => x.slug === b)?.name || b]))

  const clearChip = (key) => {
    if (key.startsWith('brand:')) return toggleBrand(key.slice(6))
    update(key, '')
  }

  const heading = query.offers ? 'On offer'
    : query.fast ? 'Trending now'
    : query.condition === 'used' ? 'Pre-owned shoes'
    : query.use_case ? USE_CASES.find((u) => u.value === query.use_case)?.label
    : query.search ? `Results for "${query.search}"`
    : 'All shoes'

  return (
    <div className="page section">
      <div className="section-head" style={{ alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2>{heading}</h2>
          <p>Prices include VAT. Stock counts are what's on the shelf right now.</p>
        </div>

        <div className="collection-tabs">
          <button
            type="button"
            className={`tab-link ${!query.offers && !query.fast ? 'active' : ''}`}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.delete('offers')
              next.delete('fast')
              next.delete('page')
              setParams(next)
            }}
          >
            All shoes
          </button>
          <button
            type="button"
            className={`tab-link ${query.offers ? 'active' : ''}`}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('offers', '1')
              next.delete('fast')
              next.delete('page')
              setParams(next)
            }}
          >
            Offers
          </button>
          <button
            type="button"
            className={`tab-link ${query.fast ? 'active' : ''}`}
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('fast', '1')
              next.delete('offers')
              next.delete('page')
              setParams(next)
            }}
          >
            Trending
          </button>
        </div>
      </div>

      <div className={`shop-layout ${filtersOpen ? 'filters-open' : 'filters-closed'}`}>
        <aside className="filters" data-open={filtersOpen || undefined}>
          <div className="filter-block">
            <h4>Brand</h4>
            {brands.map((b) => (
              <label className="check" key={b.id}>
                <input type="checkbox" checked={activeBrands.includes(b.slug)} onChange={() => toggleBrand(b.slug)} />
                {b.name}
                <span className="n">{b.product_count}</span>
              </label>
            ))}
          </div>

          <div className="filter-block">
            <h4>Budget</h4>
            <div className="field-row">
              <label className="field">
                <span>From</span>
                <input type="number" min="0" step="1000" value={query.min || ''}
                       onChange={(e) => update('min', e.target.value)} placeholder="5000" />
              </label>
              <label className="field">
                <span>Up to</span>
                <input type="number" min="0" step="1000" value={query.max || ''}
                       onChange={(e) => update('max', e.target.value)} placeholder="50000" />
              </label>
            </div>
          </div>

          <div className="filter-block">
            <h4>Category</h4>
            {USE_CASES.map((u) => (
              <label className="check" key={u.value}>
                <input type="radio" name="use_case" checked={query.use_case === u.value}
                       onChange={() => update('use_case', u.value)} />
                {u.label}
              </label>
            ))}
            {query.use_case && (
              <button className="link-danger" style={{ marginTop: 6 }} onClick={() => update('use_case', '')}>
                Clear
              </button>
            )}
          </div>

          <div className="filter-block">
            <h4>Closure type</h4>
            {CLOSURE_OPTIONS.map((c) => (
              <label className="check" key={c}>
                <input type="radio" name="closure" checked={query.closure === c} onChange={() => update('closure', c)} />
                {c}
              </label>
            ))}
            {query.closure && (
              <button className="link-danger" style={{ marginTop: 6 }} onClick={() => update('closure', '')}>Clear</button>
            )}
          </div>

          <div className="filter-block">
            <h4>For</h4>
            {GENDER_OPTIONS.map((g) => (
              <label className="check" key={g.value}>
                <input type="radio" name="gender" checked={query.gender === g.value} onChange={() => update('gender', g.value)} />
                {g.label}
              </label>
            ))}
            {query.gender && (
              <button className="link-danger" style={{ marginTop: 6 }} onClick={() => update('gender', '')}>Clear</button>
            )}
          </div>

          <div className="filter-block">
            <h4>Condition</h4>
            <label className="check">
              <input type="radio" name="condition" checked={query.condition === 'new'} onChange={() => update('condition', 'new')} />
              Brand new
            </label>
            <label className="check">
              <input type="radio" name="condition" checked={query.condition === 'used'} onChange={() => update('condition', 'used')} />
              Pre-owned
            </label>
            {query.condition && (
              <button className="link-danger" style={{ marginTop: 6 }} onClick={() => update('condition', '')}>Clear</button>
            )}
          </div>

          <div className="filter-block">
            <h4>Availability</h4>
            <label className="check">
              <input type="checkbox" checked={!!query.in_stock} onChange={(e) => update('in_stock', e.target.checked ? '1' : '')} />
              Hide sold out
            </label>
            <label className="check">
              <input type="checkbox" checked={!!query.offers} onChange={(e) => update('offers', e.target.checked ? '1' : '')} />
              On offer only
            </label>
            <label className="check">
              <input type="checkbox" checked={!!query.fast} onChange={(e) => update('fast', e.target.checked ? '1' : '')} />
              Trending only
            </label>
          </div>

          <button className="btn btn--ghost btn--wide btn--small" onClick={() => setParams(new URLSearchParams())}>
            Reset all filters
          </button>
        </aside>

        <div>
          <div className="shop-bar">
            <div className="shop-bar-start">
              <button
                type="button"
                className="btn btn--ghost btn--small filter-toggle-btn"
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
              >
                <FilterIcon width={15} height={15} />
                <span>{filtersOpen ? 'Hide filters' : 'Show filters'}</span>
              </button>
            </div>
            <select value={query.sort || 'new'} onChange={(e) => update('sort', e.target.value)} aria-label="Sort shoes">
              <option value="new">Newest first</option>
              <option value="price_asc">Price, low to high</option>
              <option value="price_desc">Price, high to low</option>
              <option value="name">Brand name</option>
            </select>
          </div>

          {chips.length > 0 && (
            <div className="pills">
              {chips.map(([key, label]) => (
                <span className="pill" key={key}>
                  {label}
                  <button onClick={() => clearChip(key)} aria-label={`Remove ${label}`}>×</button>
                </span>
              ))}
              <button className="link-danger" onClick={() => setParams(new URLSearchParams())}>Clear all</button>
            </div>
          )}

          {data.pages > 1 && (
            <div className="pager pager--top">
              <button disabled={data.page <= 1} onClick={() => update('page', data.page - 1)}>Back</button>
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === data.page ? 'on' : ''} onClick={() => update('page', n)}>{n}</button>
              ))}
              <button disabled={data.page >= data.pages} onClick={() => update('page', data.page + 1)}>Next</button>
            </div>
          )}

          <ProductGrid
            products={data.products}
            loading={loading}
            emptyTitle="No shoe matches those filters"
            emptyText="Widen the budget or remove a filter to see more."
            action={<button className="btn" onClick={() => setParams(new URLSearchParams())}>Show all shoes</button>}
          />

          {data.pages > 1 && (
            <div className="pager">
              <button disabled={data.page <= 1} onClick={() => update('page', data.page - 1)}>Back</button>
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === data.page ? 'on' : ''} onClick={() => update('page', n)}>{n}</button>
              ))}
              <button disabled={data.page >= data.pages} onClick={() => update('page', data.page + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
