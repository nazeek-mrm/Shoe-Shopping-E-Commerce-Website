import { Fragment, useEffect, useState } from 'react'
import { api, money } from '../api/client.js'
import AdminShell from '../components/AdminShell.jsx'
import Loader from '../components/Loader.jsx'
import { useStore } from '../context/StoreContext.jsx'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(null)
  const { toast } = useStore()

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      api.stats().catch(() => null),
      api.orders(filter ? { status: filter } : {}).catch((e) => {
        toast(e.message, 'err')
        return []
      }),
    ])
      .then(([statsRes, ordersRes]) => {
        if (statsRes) setStats(statsRes)
        if (ordersRes) setOrders(ordersRes)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
  }, [filter])

  const change = async (order, status, customMessage) => {
    try {
      await api.setOrderStatus({ id: order.id, status })
      toast(customMessage || `Order ${order.order_code} marked ${status}.`)
      loadAll()
    } catch (e) {
      toast(e.message, 'err')
    }
  }

  const handleConfirm = (order) => {
    change(order, 'confirmed', `Order ${order.order_code} confirmed.`)
  }

  const handleDeliver = (order) => {
    change(order, 'delivered', `Order ${order.order_code} marked as delivered.`)
  }

  const handleReject = (order) => {
    if (window.confirm(`Reject / Cancel order ${order.order_code}?\n\n(You can retrieve it anytime if rejected by mistake).`)) {
      change(order, 'cancelled', `Order ${order.order_code} rejected and marked as cancelled.`)
    }
  }

  const handleCancel = (order) => {
    if (window.confirm(`Cancel order ${order.order_code}?\n\n(You can retrieve it anytime if cancelled by mistake).`)) {
      change(order, 'cancelled', `Order ${order.order_code} cancelled.`)
    }
  }

  const handleRetrieve = (order) => {
    change(order, 'pending', `Order ${order.order_code} retrieved and restored to Pending.`)
  }

  const formatDateDayMonth = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }

  const formatDateYear = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.getFullYear()
  }

  return (
    <AdminShell title="Dashboard">
      {loading && !stats && <Loader text="Loading dashboard..." />}

      {stats && (
        <div className="stat-grid">
          <div className="stat"><b>{stats.products}</b><span>Shoes listed</span></div>
          <div className={`stat${stats.out_of_stock ? ' warn' : ''}`}><b>{stats.out_of_stock}</b><span>Sold out</span></div>
          <div className={`stat${stats.low_stock ? ' warn' : ''}`}><b>{stats.low_stock}</b><span>Two or fewer left</span></div>
          <div className="stat" style={{ borderLeft: '4px solid #D97706' }}>
            <b style={{ color: '#D97706' }}>{stats.pending_orders}</b>
            <span>Orders to confirm</span>
          </div>
          <div className="stat"><b>{stats.new_messages}</b><span>Unread messages</span></div>
          <div className="stat" style={{ borderLeft: '4px solid var(--accent)' }}>
            <b style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>{money(stats.revenue)}</b>
            <span>Total ordered value</span>
          </div>
        </div>
      )}

      {/* ORDERS CONTROL SECTION */}
      <div style={{ marginTop: 28 }}>
        <div className="orders-top-bar" style={{ marginBottom: 16 }}>
          <div className="orders-title-group">
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>Orders Control</h3>
            <span className="pill-total-badge">{orders.length} orders</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              className="order-filter-pill-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All Orders</option>
              <option value="pending">Pending (Needs Action)</option>
              <option value="confirmed">Confirmed (Ready to Deliver)</option>
              <option value="delivered">Delivered Orders</option>
              <option value="cancelled">Cancelled / Rejected</option>
            </select>
          </div>
        </div>

        {filter === 'cancelled' && (
          <div style={{
            marginBottom: 16,
            background: '#FEF3C7',
            color: '#92400E',
            border: '1.5px solid #FDE68A',
            padding: '10px 16px',
            borderRadius: 'var(--r-md)',
            fontSize: '0.86rem',
            fontWeight: 500,
          }}>
            Cancelled & rejected orders are safely kept here. Click <strong>"Retrieve"</strong> on any row to restore it back to active.
          </div>
        )}

        {loading && orders.length === 0 ? (
          <Loader text="Loading orders..." />
        ) : orders.length === 0 ? (
          <div className="empty" style={{ background: 'var(--paper)', border: '1.5px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '48px 24px' }}>
            <h3>No orders found</h3>
            <p>Orders will appear here as soon as customers place them.</p>
          </div>
        ) : (
          <div className="order-table-card">
            <div className="table-wrap">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Package / Shoes</th>
                    <th>Advance / Total</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', paddingRight: 24 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const firstItem = o.items?.[0]
                    const extraCount = (o.items?.length || 0) - 1

                    return (
                      <Fragment key={o.id}>
                        <tr>
                          {/* 1. REFERENCE */}
                          <td>
                            <div className="ref-title">{o.order_code}</div>
                            <div className="ref-subtitle">{formatDateDayMonth(o.created_at)}</div>
                          </td>

                          {/* 2. CUSTOMER */}
                          <td>
                            <div className="cust-title">{o.customer_name}</div>
                            <div className="cust-subtitle">{o.email || o.phone}</div>
                          </td>

                          {/* 3. DATE */}
                          <td>
                            <div className="date-title">{formatDateDayMonth(o.created_at)}</div>
                            <div className="date-subtitle">{formatDateYear(o.created_at)}</div>
                          </td>

                          {/* 4. PACKAGE / SHOES */}
                          <td>
                            <div className="item-title" title={firstItem?.model || 'Shoe order'}>
                              {firstItem ? firstItem.model : 'Shoe item'}
                            </div>
                            <div className="item-subtitle">
                              {extraCount > 0 ? `+${extraCount} more pair${extraCount > 1 ? 's' : ''}` : `${o.items?.length || 1} pair`}
                            </div>
                          </td>

                          {/* 5. TOTAL */}
                          <td>
                            <div className="total-title">{money(o.total)}</div>
                            <div className="total-subtitle">
                              {o.payment_method === 'cod' ? 'Cash on delivery' : 'Bank transfer'}
                            </div>
                          </td>

                          {/* 6. STATUS */}
                          <td>
                            <span className={`booking-status-pill status-${o.status}`}>
                              <span className="status-dot-circle" />
                              {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                            </span>
                          </td>

                          {/* 7. ACTIONS CHIPS */}
                          <td style={{ textAlign: 'right', paddingRight: 24 }}>
                            <div className="booking-actions-group" style={{ justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="chip-action-btn chip-view"
                                onClick={() => setOpen(open === o.id ? null : o.id)}
                              >
                                {open === o.id ? 'Close' : 'View'}
                              </button>

                              {o.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    className="chip-action-btn chip-confirm"
                                    onClick={() => handleConfirm(o)}
                                    title="Confirm order"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    className="chip-action-btn chip-reject"
                                    onClick={() => handleReject(o)}
                                    title="Reject / Cancel fake order"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {o.status === 'confirmed' && (
                                <>
                                  <button
                                    type="button"
                                    className="chip-action-btn chip-deliver"
                                    onClick={() => handleDeliver(o)}
                                    title="Mark as delivered"
                                  >
                                    Deliver
                                  </button>
                                  <button
                                    type="button"
                                    className="chip-action-btn chip-cancel"
                                    onClick={() => handleCancel(o)}
                                    title="Cancel order"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {o.status === 'cancelled' && (
                                <button
                                  type="button"
                                  className="chip-action-btn chip-retrieve"
                                  onClick={() => handleRetrieve(o)}
                                  title="Mistakenly cancelled? Retrieve order back to pending"
                                >
                                  Retrieve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED VIEW DETAILS & ORDER SUMMARY */}
                        {open === o.id && (
                          <tr>
                            <td colSpan="7" style={{ background: '#F8FBFC', padding: '20px 24px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                                <div style={{ background: 'var(--paper)', border: '1.5px solid var(--line-soft)', borderRadius: 'var(--r-md)', padding: '16px' }}>
                                  <strong style={{ display: 'block', marginBottom: 8, color: 'var(--ink)' }}>Delivery Address</strong>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.5 }}>
                                    {o.address}{o.city ? `, ${o.city}` : ''}
                                  </div>
                                  <div style={{ marginTop: 8, fontSize: '0.84rem', color: 'var(--muted)' }}>
                                    <strong>Phone:</strong> {o.phone}
                                  </div>
                                  {o.email && (
                                    <div style={{ fontSize: '0.84rem', color: 'var(--muted)' }}>
                                      <strong>Email:</strong> {o.email}
                                    </div>
                                  )}
                                  {o.note && (
                                    <div style={{ marginTop: 8, fontStyle: 'italic', fontSize: '0.84rem', color: 'var(--muted)' }}>
                                      <strong>Customer Note:</strong> {o.note}
                                    </div>
                                  )}
                                  {o.payment_method === 'bank' && (
                                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line-soft)', fontSize: '0.84rem' }}>
                                      <strong style={{ display: 'block', color: 'var(--accent-text)', marginBottom: 4 }}>Payment Details (Bank Transfer)</strong>
                                      {o.payment_reference && (
                                        <div style={{ color: 'var(--ink)' }}>
                                          <strong>Ref:</strong> {o.payment_reference}
                                        </div>
                                      )}
                                      {o.payment_receipt && (
                                        <div style={{ marginTop: 6 }}>
                                          <a
                                            href={`http://localhost:8080/shoe-mart/server/${o.payment_receipt}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline' }}
                                          >
                                            View Bank Receipt
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div style={{ background: 'var(--paper)', border: '1.5px solid var(--line-soft)', borderRadius: 'var(--r-md)', padding: '16px' }}>
                                  <strong style={{ display: 'block', marginBottom: 8, color: 'var(--ink)' }}>Shoes Ordered ({o.items?.length || 0})</strong>
                                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.88rem' }}>
                                    {o.items?.map((item) => (
                                      <li key={item.id} style={{ marginBottom: 6 }}>
                                        <strong>{item.model}</strong> × {item.quantity} {item.size ? `(Size ${item.size})` : ''} — <span style={{ fontFamily: 'var(--font-num)', fontWeight: 700 }}>{money(item.unit_price * item.quantity)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                                    <span>Total Amount:</span>
                                    <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-num)' }}>{money(o.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}

