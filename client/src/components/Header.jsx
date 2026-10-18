import { useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { CartIcon, MenuIcon, SearchIcon, ShoeIcon, UserIcon, LogoutIcon } from './Icons.jsx'

export default function Header() {
  const { cartCount } = useStore()
  const { admin, requestSignOut } = useAuth()
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isAdminDashboard = Boolean(admin && location.pathname.startsWith('/admin'))

  const search = (e) => {
    e.preventDefault()
    if (isAdminDashboard) {
      navigate(`/admin/products?search=${encodeURIComponent(term.trim())}`)
    } else {
      navigate(`/shop?search=${encodeURIComponent(term.trim())}`)
    }
    setOpen(false)
  }

  const handleLogoClick = (e) => {
    if (isAdminDashboard) {
      e.preventDefault()
      navigate('/admin/dashboard')
    }
  }

  return (
    <header className="header">
      <div className="page">
        {/* On public pages: goes to home '/'. On admin dashboard: stays in '/admin/dashboard' */}
        <Link
          to={isAdminDashboard ? '/admin/dashboard' : '/'}
          className="wordmark"
          onClick={handleLogoClick}
          title={isAdminDashboard ? 'Shoe Mart Admin Dashboard' : 'Shoe Mart Home'}
        >
          <span className="wordmark-icon">
            <ShoeIcon />
          </span>
          <strong>SHOE MART</strong>
          {isAdminDashboard && <em>ADMIN</em>}
        </Link>

        {isAdminDashboard ? (
          <>
            <form className="search" onSubmit={search} role="search">
              <SearchIcon width={17} height={17} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search inventory by brand or model"
                aria-label="Search shoes inventory"
              />
              <button type="submit">Search</button>
            </form>

            <button
              type="button"
              className="btn-admin-signout"
              onClick={requestSignOut}
              title="Sign out of Admin Dashboard"
            >
              <LogoutIcon width={16} height={16} />
              <span>Sign out</span>
            </button>
          </>
        ) : (
          <>
            <form className="search" onSubmit={search} role="search">
              <SearchIcon width={17} height={17} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search by style, brand or size"
                aria-label="Search shoes"
              />
              <button type="submit">Search</button>
            </form>

            <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
              <MenuIcon />
            </button>

            <nav className="nav" data-open={open} onClick={() => setOpen(false)}>
              <NavLink to="/shop">All Shoes</NavLink>
              <NavLink to="/contact">Contact</NavLink>

              <span className="header-icons">
                <Link to="/cart" className="icon-link" aria-label="Cart">
                  <CartIcon />
                  {cartCount > 0 && <span className="count">{cartCount}</span>}
                </Link>
                <Link to={admin ? '/admin/dashboard' : '/admin'} className="icon-link" aria-label="Admin panel">
                  <UserIcon />
                </Link>
              </span>
            </nav>
          </>
        )}
      </div>
    </header>
  )
}
