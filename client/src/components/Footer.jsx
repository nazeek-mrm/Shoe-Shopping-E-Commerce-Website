import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ShoeIcon } from './Icons.jsx'

export default function Footer() {
  const { admin } = useAuth()
  const location = useLocation()
  const isAdminDashboard = Boolean(admin && location.pathname.startsWith('/admin'))

  return (
    <footer className="footer">
      <div className="page">
        <div className="footer-cols">
          <div>
            <Link
              to={isAdminDashboard ? '/admin/dashboard' : '/'}
              className="wordmark"
              style={{ marginBottom: 16 }}
              title={isAdminDashboard ? 'Shoe Mart Admin Dashboard' : 'Shoe Mart Home'}
            >
              <span className="wordmark-icon">
                <ShoeIcon />
              </span>
              <strong>SHOE MART</strong>
              {isAdminDashboard && <em>ADMIN</em>}
            </Link>
            <p>
              A curated shoe store with genuine footwear from the world's top brands.
              Every pair is checked before it leaves the counter.
            </p>
          </div>

          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/shop">All shoes</Link></li>
              <li><Link to="/shop?offers=1">Offers</Link></li>
              <li><Link to="/shop?fast=1">Trending now</Link></li>
              <li><Link to="/shop?condition=used">Pre-owned</Link></li>
              <li><Link to="/compare">Compare</Link></li>
            </ul>
          </div>

          <div>
            <h4>Help</h4>
            <ul>
              <li><Link to="/contact">Contact & About</Link></li>
              <li><Link to="/contact">Returns and warranty</Link></li>
              <li><Link to="/admin">Staff sign in</Link></li>
            </ul>
          </div>

          <div>
            <h4>Visit</h4>
            <ul>
              <li>142 Peradeniya Road, Kandy</li>
              <li>Monday to Saturday, 9am to 7pm</li>
              <li><a href="tel:+94771234567">077 123 4567</a></li>
              <li><a href="mailto:hello@shoemart.lk">hello@shoemart.lk</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} SHOE MART. All rights reserved.</span>
          <span>Cash on delivery and bank transfer accepted.</span>
        </div>
      </div>
    </footer>
  )
}
