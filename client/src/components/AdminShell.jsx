import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminShell({ title, action, children }) {
  const { admin } = useAuth()

  return (
    <div className="page admin">
      <div className="admin-header-row">
        {/* Left: Heading of the active section */}
        <div className="admin-header-left">
          {typeof title === 'string' ? (
            <div>
              <h2>{title}</h2>
              <p className="admin-signed-in">Signed in as {admin?.full_name || admin?.username}</p>
            </div>
          ) : (
            <div>
              {title}
              <p className="admin-signed-in">Signed in as {admin?.full_name || admin?.username}</p>
            </div>
          )}
        </div>

        {/* Central: Navigation container horizontally positioned */}
        <nav className="admin-nav-horizontal">
          <NavLink to="/admin/dashboard" end>Dashboard</NavLink>
          <NavLink to="/admin/products" end>Shoes</NavLink>
          <NavLink to="/admin/products/new" end>Add Shoes</NavLink>
          <NavLink to="/admin/orders" end>Orders</NavLink>
          <NavLink to="/admin/messages" end>Messages</NavLink>
        </nav>

        {/* Right: Actions */}
        {action && (
          <div className="admin-header-right">
            {action}
          </div>
        )}
      </div>

      <div className="admin-content">
        {children}
      </div>
    </div>
  )
}
