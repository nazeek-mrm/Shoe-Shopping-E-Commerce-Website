import { Link } from 'react-router-dom'
import { money, PLACEHOLDER } from '../api/client.js'
import { useStore } from '../context/StoreContext.jsx'

const DELIVERY_FREE_OVER = 5000
const DELIVERY_FEE = 350

export default function Cart() {
  const { cart, cartTotal, setQuantity, removeFromCart, clearCart } = useStore()

  if (!cart.length) {
    return (
      <div className="page empty">
        <h3>Your cart is empty</h3>
        <p>Shoes you add will wait here until you are ready to order.</p>
        <Link className="btn" to="/shop">Browse shoes</Link>
      </div>
    )
  }

  const delivery = cartTotal >= DELIVERY_FREE_OVER ? 0 : DELIVERY_FEE

  return (
    <div className="page section">
      <div className="section-head">
        <div>
          <h2>Your cart</h2>
          <p>{cart.length} shoe{cart.length === 1 ? '' : 's'} ready to order.</p>
        </div>
        <button className="link-danger" onClick={clearCart}>Empty the cart</button>
      </div>

      <div className="cart-layout">
        <div>
          {cart.map((item) => (
            <div className="cart-line" key={item.id}>
              <img src={item.image || PLACEHOLDER} alt=""
                   onError={(e) => { e.currentTarget.src = PLACEHOLDER }} />
              <div>
                <h4><Link to={`/shoe/${item.id}`}>{item.model}</Link></h4>
                <div className="meta">{money(item.price)} each</div>
                <div className="qty" style={{ marginTop: 10 }}>
                  <button onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label="Reduce quantity">−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => setQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">+</button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="price">{money(item.price * item.quantity)}</div>
                <button className="link-danger" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <aside className="summary">
          <h3>Order summary</h3>
          <div className="row"><span>Shoes</span><span>{money(cartTotal)}</span></div>
          <div className="row">
            <span>Delivery</span>
            <span>{delivery === 0 ? 'Free' : money(delivery)}</span>
          </div>
          {delivery > 0 && (
            <p className="field-note" style={{ margin: '4px 0 0' }}>
              Spend {money(DELIVERY_FREE_OVER - cartTotal)} more for free delivery.
            </p>
          )}
          <div className="row total"><span>Total</span><span>{money(cartTotal + delivery)}</span></div>
          <Link className="btn btn--wide" to="/checkout" style={{ marginTop: 16 }}>Continue to checkout</Link>
          <Link className="btn btn--ghost btn--wide" to="/shop" style={{ marginTop: 8 }}>Keep browsing</Link>
        </aside>
      </div>
    </div>
  )
}
