import { Fragment, useEffect, useMemo, useState } from 'react'
import { api, money } from '../api/client.js'
import AdminShell from '../components/AdminShell.jsx'
import Loader from '../components/Loader.jsx'
import { useStore } from '../context/StoreContext.jsx'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(null)
  const { toast } = useStore()

  const load = () => {
    setLoading(true)
    api.orders(filter ? { status: filter } : {})
      .then(setOrders)
      .catch((e) => toast(e.message, 'err'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter])

  const change = async (order, status, customMessage) => {
    try {
      await api.setOrderStatus({ id: order.id, status })
      toast(customMessage || `Order ${order.order_code} status updated to ${status}.`)
      load()
    } catch (e) {
      toast(e.message, 'err')
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

  // Filtered list by search term
  const displayedOrders = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase()
    return orders.filter(
      (o) =>
        o.order_code?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q)
    )
  }, [orders, search])

  // Finalized summary statistics
  const stats = useMemo(() => {
    const totalCount = orders.length
    const delivered = orders.filter((o) => o.status === 'delivered')
    const deliveredValue = delivered.reduce((acc, o) => acc + (Number(o.total) || 0), 0)
    const confirmedCount = orders.filter((o) => o.status === 'confirmed').length
    const pendingCount = orders.filter((o) => o.status === 'pending').length
    const cancelledCount = orders.filter((o) => o.status === 'cancelled').length

    return {
      totalCount,
      deliveredCount: delivered.length,
      deliveredValue,
      confirmedCount,
      pendingCount,
      cancelledCount,
    }
  }, [orders])

  return (
    <AdminShell
      title={
        <div className="orders-title-group">
          <h2>All Orders</h2>
          <span className="pill-total-badge">{orders.length} total</span>
        </div>
      }
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            className="order-filter-pill-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Orders</option>
            <option value="delivered">Delivered (Finalized)</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled / Rejected</option>
          </select>
        </div>
      }
    >
      {/* FINALIZED RESULTS METRIC SUMMARY CARDS */}
      <div className="stat-grid" style={{ marginBottom: 26 }}>
        <div className="stat" style={{ borderLeft: '4px solid #0284C7' }}>
          <b style={{ color: '#0284C7' }}>{stats.deliveredCount}</b>
          <span>Finalized & Delivered</span>
          <small style={{ display: 'block', marginTop: 4, color: 'var(--muted)', fontWeight: 600 }}>
            {money(stats.deliveredValue)} collected
          </small>
        </div>

        <div className="stat" style={{ borderLeft: '4px solid #10B981' }}>
          <b style={{ color: '#065F46' }}>{stats.confirmedCount}</b>
          <span>Confirmed & In Delivery</span>
        </div>

        <div className="stat" style={{ borderLeft: '4px solid #D97706' }}>
          <b style={{ color: '#92400E' }}>{stats.pendingCount}</b>
          <span>Pending Confirmation</span>
        </div>

        <div className="stat" style={{ borderLeft: '4px solid #EF4444' }}>
          <b style={{ color: '#991B1B' }}>{stats.cancelledCount}</b>
          <span>Cancelled / Rejected</span>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, maxWidth: 380, minWidth: 240 }}>
          <input
            type="text"
            placeholder="Search by order ID, customer or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px',
              border: '1.5px solid var(--line)',
              borderRadius: 'var(--r-md)',
              fontSize: '0.88rem',
              background: 'var(--paper)',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          Showing <strong>{displayedOrders.length}</strong> of <strong>{orders.length}</strong> orders
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
          Cancelled & rejected orders are archived here. You can retrieve them anytime back to active status if needed.
        </div>
      )}

      {loading ? (
        <Loader text="Loading orders ledger..." />
      ) : displayedOrders.length === 0 ? (
        <div className="empty" style={{ background: 'var(--paper)', border: '1.5px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '48px 24px' }}>
          <h3>No orders found</h3>
          <p>{search ? 'No orders match your search criteria.' : 'No orders recorded yet.'}</p>
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
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: 24 }}>Order Summary</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((o) => {
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

                        {/* 7. VIEW SUMMARY ACTION */}
                        <td style={{ textAlign: 'right', paddingRight: 24 }}>
                          <div className="booking-actions-group" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="chip-action-btn chip-view"
                              onClick={() => setOpen(open === o.id ? null : o.id)}
                            >
                              {open === o.id ? 'Close' : 'View Summary'}
                            </button>

                            {o.status === 'cancelled' && (
                              <button
                                type="button"
                                className="chip-action-btn chip-retrieve"
                                onClick={() => handleRetrieve(o)}
                                title="Retrieve order back to pending"
                              >
                                Retrieve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDED FINALIZED SUMMARY CARD */}
                      {open === o.id && (
                        <tr>
                          <td colSpan="7" style={{ background: '#F8FBFC', padding: '22px 24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                              {/* Left Card: Customer & Delivery Record */}
                              <div style={{ background: 'var(--paper)', border: '1.5px solid var(--line-soft)', borderRadius: 'var(--r-md)', padding: '18px' }}>
                                <strong style={{ display: 'block', marginBottom: 10, color: 'var(--ink)', fontSize: '0.96rem' }}>
                                  Customer & Delivery Details
                                </strong>
                                <div style={{ fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.5 }}>
                                  <strong>Address:</strong> {o.address}{o.city ? `, ${o.city}` : ''}
                                </div>
                                <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--muted)' }}>
                                  <strong>Contact Phone:</strong> {o.phone}
                                </div>
                                {o.email && (
                                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                                    <strong>Email:</strong> {o.email}
                                  </div>
                                )}
                                {o.note && (
                                  <div style={{ marginTop: 8, fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--muted)' }}>
                                    <strong>Customer Note:</strong> {o.note}
                                  </div>
                                )}

                                {/* Payment Verification */}
                                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line-soft)', fontSize: '0.85rem' }}>
                                  <strong style={{ display: 'block', color: 'var(--accent-text)', marginBottom: 4 }}>
                                    Payment Method: {o.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Bank Transfer'}
                                  </strong>
                                  {o.payment_reference && (
                                    <div style={{ color: 'var(--ink)' }}>
                                      <strong>Txn Reference:</strong> {o.payment_reference}
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
                                        View Attached Payment Receipt
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right Card: Finalized Items Summary */}
                              <div style={{ background: 'var(--paper)', border: '1.5px solid var(--line-soft)', borderRadius: 'var(--r-md)', padding: '18px' }}>
                                <strong style={{ display: 'block', marginBottom: 10, color: 'var(--ink)', fontSize: '0.96rem' }}>
                                  Ordered Items Breakdown ({o.items?.length || 0})
                                </strong>
                                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.88rem' }}>
                                  {o.items?.map((item) => (
                                    <li key={item.id} style={{ marginBottom: 6 }}>
                                      <strong>{item.model}</strong> × {item.quantity} {item.size ? `(Size ${item.size})` : ''} — <span style={{ fontFamily: 'var(--font-num)', fontWeight: 700 }}>{money(item.unit_price * item.quantity)}</span>
                                    </li>
                                  ))}
                                </ul>

                                <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 800 }}>Total Finalized Amount:</span>
                                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-num)', fontSize: '1.15rem', fontWeight: 800 }}>
                                    {money(o.total)}
                                  </span>
                                </div>

                                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)' }}>
                                  <span>Final Status:</span>
                                  <span style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--ink)' }}>{o.status}</span>
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
    </AdminShell>
  )
}

