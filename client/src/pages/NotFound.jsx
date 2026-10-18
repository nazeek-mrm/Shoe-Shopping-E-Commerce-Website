import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page empty" style={{ padding: '110px 20px' }}>
      <h2>That page is not here</h2>
      <p>The link may be old, or the laptop may have been taken off the site.</p>
      <Link className="btn" to="/">Back to the shop front</Link>
    </div>
  )
}
