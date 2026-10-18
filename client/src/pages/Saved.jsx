import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useStore } from '../context/StoreContext.jsx'
import ProductGrid from '../components/ProductGrid.jsx'

export default function Saved() {
  const { wishlist } = useStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!wishlist.length) { setItems([]); setLoading(false); return }
    setLoading(true)
    Promise.all(wishlist.map((w) => api.product(w.id).then((d) => d.product).catch(() => null)))
      .then((list) => setItems(list.filter(Boolean)))
      .finally(() => setLoading(false))
  }, [wishlist])

  return (
    <div className="page section">
      <div className="section-head">
        <div>
          <h2>Saved shoes</h2>
          <p>Kept on this device so you can come back to them.</p>
        </div>
        <Link to="/shop">Browse more</Link>
      </div>
      <ProductGrid
        products={items}
        loading={loading}
        emptyTitle="You haven't saved anything yet"
        emptyText="Tap the heart on any shoe and it waits for you here."
        action={<Link className="btn" to="/shop">Browse shoes</Link>}
      />
    </div>
  )
}
