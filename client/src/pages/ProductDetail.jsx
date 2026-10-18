import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, money, PLACEHOLDER } from '../api/client.js'
import { useStore } from '../context/StoreContext.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import Loader from '../components/Loader.jsx'
import { ScaleIcon } from '../components/Icons.jsx'

const WHATSAPP = '94771234567'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, toggleCompare, compare, toast } = useStore()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [image, setImage]     = useState(0)
  const [qty, setQty]         = useState(1)
  const [tab, setTab]         = useState('specs')
  const [ask, setAsk]         = useState({ customer_name: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)

  useEffect(() => {
    setLoading(true)
    setImage(0)
    setQty(1)
    api.product(id)
      .then((d) => { setProduct(d.product); setRelated(d.related) })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page"><Loader text="Loading this shoe" /></div>

  if (!product) {
    return (
      <div className="page empty">
        <h3>That shoe is no longer listed</h3>
        <p>It may have sold out. Have a look at what's on the shelf now.</p>
        <Link className="btn" to="/shop">Browse shoes</Link>
      </div>
    )
  }

  const onOffer  = product.old_price > product.price
  const soldOut  = product.stock === 0
  const comparing = compare.some((i) => i.id === product.id)
  const images   = product.images?.length ? product.images : [PLACEHOLDER]

  const specs = [
    ['Upper material', product.material],
    ['Closure type',   product.closure],
    ['Sole',           product.sole],
    ['Heel height',    product.heel_height],
    ['Toe shape',      product.toe_shape],
    ['Gender',         product.gender ? { men: "Men's", women: "Women's", unisex: 'Unisex', kids: "Kids'" }[product.gender] : null],
    ['Insole',         product.insole],
    ['Weight',         product.weight],
    ['Available sizes',product.available_sizes],
    ['Condition',      product.condition_type === 'used' ? 'Pre-owned, checked by the shop' : 'Brand new'],
    ['Warranty',       product.warranty],
  ].filter(([, v]) => v)

  const buyNow = () => {
    addToCart(product, qty)
    navigate('/cart')
  }

  const sendAsk = async (e) => {
    e.preventDefault()
    const cleanPhone = ask.phone.replace(/\D/g, '')
    if (!/^07\d{8}$/.test(cleanPhone)) {
      toast('Phone number is compulsory and must be exactly 10 digits starting with 07 (e.g. 0712345678).', 'err')
      return
    }
    setSending(true)
    try {
      await api.sendInquiry({ ...ask, phone: cleanPhone, product_id: product.id })
      toast('Message sent. The shop replies within a day.')
      setAsk({ customer_name: '', phone: '', message: '' })
    } catch (err) {
      toast(err.message, 'err')
    } finally {
      setSending(false)
    }
  }

  const whatsappText = encodeURIComponent(
    `Hello SHOE MART, I would like to ask about the ${product.brand} ${product.model} listed at ${money(product.price)}.`
  )

  return (
    <div className="page">
      <nav className="crumbs">
        <Link to="/">Home</Link><span>/</span>
        <Link to="/shop">Shoes</Link><span>/</span>
        <Link to={`/shop?brand=${product.brand_slug}`}>{product.brand}</Link><span>/</span>
        {product.model}
      </nav>

      <div className="detail">
        <div>
          <div className="gallery-main">
            <img src={images[image]} alt={`${product.brand} ${product.model}`}
                 onError={(e) => { e.currentTarget.src = PLACEHOLDER }} />
          </div>
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((src, i) => (
                <button key={src + i} className={i === image ? 'on' : ''} onClick={() => setImage(i)}
                        aria-label={`Photo ${i + 1}`}>
                  <img src={src} alt="" onError={(e) => { e.currentTarget.src = PLACEHOLDER }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="card-brand">{product.brand}</div>
          <h1>{product.model}</h1>

          <div className="badges" style={{ position: 'static', flexDirection: 'row', display: 'flex', gap: 8, marginBottom: 14 }}>
            {onOffer && <span className="badge badge--sale">Save {money(product.old_price - product.price)}</span>}
            {product.condition_type === 'used' && <span className="badge badge--used">Pre-owned</span>}
            {Number(product.is_fast_moving) === 1 && <span className="badge badge--soft">Trending</span>}
          </div>

          <p style={{ color: 'var(--muted)' }}>{product.description}</p>

          <div className="detail-price">
            <span className="price">{money(product.price)}</span>
            {onOffer && (
              <>
                <span className="price-was">{money(product.old_price)}</span>
                <span className="price-save">
                  {Math.round(((product.old_price - product.price) / product.old_price) * 100)}% off
                </span>
              </>
            )}
          </div>

          <div className="buy-box">
            <div className={`stock-line${product.stock > 0 && product.stock <= 2 ? ' low' : ''}`}>
              {soldOut
                ? 'Out of stock right now'
                : `${product.stock} pair${product.stock === 1 ? '' : 's'} available`}
            </div>

            <div className="buy-row">
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Reduce quantity">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))} aria-label="Increase quantity">+</button>
              </div>
              <button className="btn btn--rose" disabled={soldOut} onClick={() => addToCart(product, qty)}>
                Add to cart
              </button>
              <button className="btn" disabled={soldOut} onClick={buyNow}>Buy now</button>
            </div>

            <div className="buy-row" style={{ marginBottom: 0 }}>
              <button className="btn btn--ghost btn--small" onClick={() => toggleCompare(product)}>
                <ScaleIcon width={16} height={16} />
                {comparing ? 'In compare' : 'Compare'}
              </button>
              <a className="btn btn--ghost btn--small"
                 href={`https://wa.me/${WHATSAPP}?text=${whatsappText}`}
                 target="_blank" rel="noreferrer">
                Ask on WhatsApp
              </a>
            </div>
          </div>

          <table className="spec-table">
            <tbody>
              {specs.slice(0, 5).map(([k, v]) => (
                <tr key={k}><th>{k}</th><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- tabs ---------- */}
      <div className="tabs">
        <button className={tab === 'specs' ? 'on' : ''} onClick={() => setTab('specs')}>Full specifications</button>
        <button className={tab === 'delivery' ? 'on' : ''} onClick={() => setTab('delivery')}>Delivery &amp; returns</button>
        <button className={tab === 'ask' ? 'on' : ''} onClick={() => setTab('ask')}>Ask about this shoe</button>
      </div>

      {tab === 'specs' && (
        <table className="spec-table" style={{ maxWidth: 720 }}>
          <tbody>
            {specs.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}
          </tbody>
        </table>
      )}

      {tab === 'delivery' && (
        <div style={{ maxWidth: 680 }}>
          <p>
            Orders placed before 2pm are packed the same day. Colombo and Kandy deliveries
            arrive within one working day, other districts within two to three.
            Delivery is free over {money(5000)}, otherwise {money(350)}.
          </p>
          <p>
            {product.warranty} is included on every pair. Bring the shoes and the invoice to the
            shop and we handle any claim. If there's a manufacturing defect, we replace the pair
            or issue a full refund.
          </p>
          <p>
            If the size or style isn't what you expected, return the unworn pair in its original
            box within seven days for an exchange or a full refund.
          </p>
        </div>
      )}

      {tab === 'ask' && (
        <form onSubmit={sendAsk} style={{ maxWidth: 520 }}>
          <div className="field-row">
            <label className="field">
              <span>Your name</span>
              <input required value={ask.customer_name}
                     onChange={(e) => setAsk({ ...ask, customer_name: e.target.value })} />
            </label>
            <label className="field">
              <span>Phone number *</span>
              <input
                type="tel"
                required
                pattern="07[0-9]{8}"
                maxLength={10}
                value={ask.phone}
                onChange={(e) => setAsk({ ...ask, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                onBlur={() => setPhoneTouched(true)}
                placeholder="07XXXXXXXX"
                title="Phone number must be exactly 10 digits starting with 07 (e.g. 0712345678)"
              />
              {(() => {
                const p = ask.phone.replace(/\D/g, '')
                let mistake = ''
                if (p.length > 0) {
                  if (!p.startsWith('07') && (p.length >= 2 || p[0] !== '0')) {
                    mistake = 'Must start with 07 and have 10 digits (e.g. 0712345678)'
                  } else if (phoneTouched && p.length < 10) {
                    mistake = 'Must be 10 digits starting with 07 (e.g. 0712345678)'
                  }
                } else if (phoneTouched) {
                  mistake = 'Phone number is required (10 digits starting with 07)'
                }
                return mistake ? (
                  <small style={{ color: '#a23b2b', fontSize: '0.78rem', display: 'block', marginTop: 4 }}>
                    {mistake}
                  </small>
                ) : null
              })()}
            </label>
          </div>
          <label className="field">
            <span>What would you like to know?</span>
            <textarea required value={ask.message}
                      onChange={(e) => setAsk({ ...ask, message: e.target.value })}
                      placeholder="Is this available in size UK 9? Can I try them in store?" />
          </label>
          <button className="btn" disabled={sending}>{sending ? 'Sending' : 'Send the question'}</button>
        </form>
      )}

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Similar shoes</h2>
              <p>Same style, close to this price.</p>
            </div>
          </div>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
