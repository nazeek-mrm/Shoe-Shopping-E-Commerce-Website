import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import AdminShell from '../components/AdminShell.jsx'
import Loader from '../components/Loader.jsx'
import { useStore } from '../context/StoreContext.jsx'

const STATUSES = ['new', 'contacted', 'closed']

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useStore()

  const load = () => {
    setLoading(true)
    api.inquiries()
      .then(setMessages)
      .catch((e) => toast(e.message, 'err'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const change = async (m, status) => {
    try {
      await api.setInquiryStatus({ id: m.id, status })
      load()
    } catch (e) {
      toast(e.message, 'err')
    }
  }

  return (
    <AdminShell title="Messages">
      {loading ? <Loader text="Loading messages" /> : messages.length === 0 ? (
        <div className="empty"><h3>No messages yet</h3><p>Questions from the contact form and product pages land here.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>From</th><th>About</th><th>Message</th><th>Received</th><th>Status</th></tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.customer_name}</strong>
                    <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                      {m.phone && <a href={`tel:${m.phone}`}>{m.phone}</a>}
                      {m.email && <div><a href={`mailto:${m.email}`}>{m.email}</a></div>}
                    </div>
                  </td>
                  <td>{m.product || 'General question'}</td>
                  <td style={{ maxWidth: 320 }}>{m.message}</td>
                  <td>{new Date(m.created_at).toLocaleDateString()}</td>
                  <td>
                    <select value={m.status} onChange={(e) => change(m, e.target.value)}
                            style={{ padding: '6px 9px', borderRadius: 'var(--r-md)', border: '1px solid var(--line)' }}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  )
}
