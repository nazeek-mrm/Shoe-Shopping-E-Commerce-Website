import { Link } from 'react-router-dom'
import { money, PLACEHOLDER } from '../api/client.js'
import { useStore } from '../context/StoreContext.jsx'
import SpecStrip from './SpecStrip.jsx'
import { ScaleIcon } from './Icons.jsx'

export default function ProductCard({ product }) {
  const { addToCart, toggleCompare, compare } = useStore()

  const comparing  = compare.some((i) => i.id === product.id)
  const onOffer    = product.old_price && product.old_price > product.price
  const soldOut    = product.stock === 0

  return (
    <article className="card">
      <div className="card-media">
        <Link to={`/shoe/${product.id}`}>
          <img src={product.images?.[0] || PLACEHOLDER} alt={`${product.brand} ${product.model}`}
               onError={(e) => { e.currentTarget.src = PLACEHOLDER }} loading="lazy" />
        </Link>

        <div className="badges">
          {onOffer && <span className="badge badge--sale">Save {money(product.old_price - product.price)}</span>}
          {product.condition_type === 'used' && <span className="badge badge--used">Pre-owned</span>}
          {soldOut && <span className="badge badge--out">Sold out</span>}
          {!soldOut && Number(product.is_fast_moving) === 1 && !onOffer && <span className="badge badge--soft">Trending</span>}
        </div>
      </div>

      <div className="card-body">
        <div className="card-brand">{product.brand}</div>
        <h3 className="card-title">
          <Link to={`/shoe/${product.id}`}>{product.model}</Link>
        </h3>

        <SpecStrip product={product} />

        <div className={`stock-line${product.stock > 0 && product.stock <= 2 ? ' low' : ''}`}>
          {soldOut
            ? 'Ask the shop when it returns'
            : product.stock <= 2
              ? `Only ${product.stock} pair${product.stock === 1 ? '' : 's'} left`
              : `${product.stock} pairs in stock`}
        </div>

        <div className="price-row">
          <span className="price">{money(product.price)}</span>
          {onOffer && <span className="price-was">{money(product.old_price)}</span>}
          {onOffer && <span className="price-save">{Math.round(((product.old_price - product.price) / product.old_price) * 100)}% off</span>}
        </div>

        <div className="card-actions">
          <button className="btn btn--rose btn--small" disabled={soldOut} onClick={() => addToCart(product)}>
            {soldOut ? 'Sold out' : 'Add to cart'}
          </button>
          <button
            className="btn btn--ghost btn--small"
            onClick={() => toggleCompare(product)}
            title="Compare shoes side by side"
            style={comparing ? { background: 'var(--surface)', borderColor: 'var(--accent)' } : undefined}
          >
            <ScaleIcon width={16} height={16} />
            {comparing ? 'Added' : 'Compare'}
          </button>
        </div>
      </div>
    </article>
  )
}
