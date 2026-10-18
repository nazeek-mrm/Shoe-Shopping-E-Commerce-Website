import ProductCard from './ProductCard.jsx'
import Loader from './Loader.jsx'

export default function ProductGrid({ products, loading, emptyTitle, emptyText, action }) {
  if (loading) return <Loader />
  if (!products?.length) {
    return (
      <div className="empty">
        <h3>{emptyTitle || 'Nothing here yet'}</h3>
        <p>{emptyText || 'Try a wider price range or clear a filter.'}</p>
        {action}
      </div>
    )
  }
  return (
    <div className="grid">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
