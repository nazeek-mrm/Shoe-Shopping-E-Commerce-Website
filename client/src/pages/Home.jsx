import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, USE_CASES } from '../api/client.js'
import { CheckIcon } from '../components/Icons.jsx'

export default function Home() {
  const [brands, setBrands] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.brands()
      .then((b) => setBrands(b.filter((x) => Number(x.product_count) > 0)))
      .catch(() => {})
  }, [])

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="hero">
        <div className="page">
          <div>
            <h1>
              Shoes for every step,{' '}
              <span className="quiet">every style, every occasion.</span>
            </h1>
            <p>
              Genuine footwear from the world's top brands. New arrivals and carefully
              checked pre-owned pairs — with real specifications on every listing.
              Tell us what you need and we'll find the perfect fit.
            </p>

            <div className="chooser-label">Shop by category</div>
            <div className="chooser">
              {USE_CASES.map((u) => (
                <button key={u.value} className="chip" onClick={() => navigate(`/shop?use_case=${u.value}`)}>
                  {u.label}
                </button>
              ))}
              <button className="chip" onClick={() => navigate('/shop')}>See everything</button>
            </div>
          </div>

          <div className="hero-shoe-wrap">
            <img
              src="/hero-shoe.png"
              alt="Featured Converse Chuck Taylor All Star"
              className="hero-shoe-img"
            />
          </div>
        </div>
      </section>

      {/* ---------- trust strip ---------- */}
      <section className="trust">
        <div className="page">
          <div><strong>100% Genuine</strong><span>Every pair sourced directly from authorised distributors.</span></div>
          <div><strong>Free Returns</strong><span>Return within 7 days if the fit isn't right, no questions asked.</span></div>
          <div><strong>Warranty Included</strong><span>6 months on all pairs. Manufacturing defects covered.</span></div>
          <div><strong>Pay on Delivery</strong><span>Cash on delivery island-wide, or bank transfer.</span></div>
        </div>
      </section>

      {/* ---------- browse collections CTA ---------- */}
      <section className="section" style={{ textAlign: 'center', padding: '70px 20px', background: 'var(--surface)' }}>
        <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <h2 style={{ fontSize: '2.1rem', margin: 0 }}>Explore Our Complete Range</h2>
          <p style={{ color: 'var(--muted)', maxWidth: '52ch', margin: 0, fontSize: '1.05rem', lineHeight: 1.6 }}>
            Browse genuine sneakers, running shoes, and lifestyle footwear from the world's most iconic brands.
          </p>
          <Link
            to="/shop"
            className="btn btn--rose"
            style={{
              padding: '16px 38px',
              fontSize: '1.05rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              borderRadius: 'var(--r-md)',
              marginTop: 10
            }}
          >
            BROWSE ALL COLLECTIONS
          </Link>
        </div>
      </section>

      {/* ---------- brands ---------- */}
      <section className="section section--tight">
        <div className="page">
          <div className="section-head">
            <div>
              <h2>Brands in the store</h2>
              <p>Every pair comes through an authorised supplier.</p>
            </div>
          </div>
          <div className="brand-strip">
            {brands.map((b) => (
              <Link key={b.id} to={`/shop?brand=${b.slug}`}>{b.name}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- help block ---------- */}
      <section className="section">
        <div className="page split">
          <div>
            <h2>Not sure which pair to choose?</h2>
            <p>
              Tell us the occasion — whether it's daily wear, sport, a formal event or a
              weekend trail — and we'll suggest two or three pairs that fit your budget
              and style. No pressure to buy on the same day.
            </p>
            <ul className="info-list" style={{ marginBottom: 26 }}>
              {[
                'We explain what makes one shoe worth more than another, in plain language.',
                'We will tell you when a simpler option is the better fit for your needs.',
                'Bring your old pair and we will take it off the price of the new one.',
              ].map((line) => (
                <li key={line} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <CheckIcon width={18} height={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 3 }} />
                  {line}
                </li>
              ))}
            </ul>
            <Link className="btn" to="/contact">Ask the shop a question</Link>
          </div>

          <div className="panel">
            <h3>Visit the shop</h3>
            <ul className="info-list">
              <li><strong>Address</strong>142 Peradeniya Road</li>
              <li><strong>Open</strong>Monday to Saturday, 9am to 7pm</li>
              <li><strong>Phone or WhatsApp</strong>077 123 4567</li>
              <li><strong>Email</strong>hello@shoemart.lk</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
