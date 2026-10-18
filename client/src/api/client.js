const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/shoe-mart/server'

function authHeader() {
  const token = localStorage.getItem('shoemart_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handle(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.')
  return data
}

export function get(path, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  ).toString()
  return fetch(`${BASE}${path}${query ? `?${query}` : ''}`, { headers: authHeader() }).then(handle)
}

export function post(path, body) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  }).then(handle)
}

export function upload(file) {
  const form = new FormData()
  form.append('image', file)
  return fetch(`${BASE}/api/products/upload.php`, {
    method: 'POST',
    headers: authHeader(),
    body: form,
  }).then(handle)
}

function uploadReceiptFile(file) {
  const form = new FormData()
  form.append('receipt', file)
  return fetch(`${BASE}/api/orders/upload_receipt.php`, {
    method: 'POST',
    body: form,
  }).then(handle)
}

/* ---- the whole app talks to the API through these ---- */
export const api = {
  products:   (params) => get('/api/products/read.php', params),
  product:    (id)     => get('/api/products/read_one.php', { id }),
  brands:     ()       => get('/api/brands/read.php'),
  createOrder:(body)   => post('/api/orders/create.php', body),
  uploadReceipt: uploadReceiptFile,
  sendInquiry:(body)   => post('/api/inquiries/create.php', body),

  login:          (body)   => post('/api/auth/login.php', body),
  logout:         ()       => post('/api/auth/logout.php', {}),
  me:             ()       => get('/api/auth/me.php'),
  forgotPassword: (body)   => post('/api/auth/forgot_password.php', body),
  resetPassword:  (body)   => post('/api/auth/reset_password.php', body),

  stats:        ()       => get('/api/stats/read.php'),
  addProduct:   (body)   => post('/api/products/create.php', body),
  editProduct:  (body)   => post('/api/products/update.php', body),
  removeProduct:(id)     => post('/api/products/delete.php', { id }),
  orders:       (params) => get('/api/orders/read.php', params),
  setOrderStatus:(body)  => post('/api/orders/update_status.php', body),
  inquiries:    ()       => get('/api/inquiries/read.php'),
  setInquiryStatus:(body)=> post('/api/inquiries/update_status.php', body),
  uploadImage: upload,
}

/* ---- shared helpers ---- */
export const money = (n) =>
  'Rs. ' + Number(n || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })

export const USE_CASES = [
  { value: 'casual',   label: 'Casual wear' },
  { value: 'sport',    label: 'Sports & fitness' },
  { value: 'formal',   label: 'Formal & office' },
  { value: 'outdoor',  label: 'Outdoor & hiking' },
]

export const CLOSURE_OPTIONS = [
  'Lace-up',
  'Slip-on',
  'Velcro',
  'Buckle',
  'Chelsea / Elastic',
  'Zip',
]

export const GENDER_OPTIONS = [
  { value: 'men',    label: "Men's" },
  { value: 'women',  label: "Women's" },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids',   label: "Kids'" },
]

/* Shown whenever a product has no photo yet. */
export const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 160">
    <ellipse cx="110" cy="100" rx="66" ry="22" fill="#D0E6E8"/>
    <path d="M54 100 Q70 64 96 60 Q120 56 136 72 L148 72 Q162 72 162 86 Q162 98 148 100 Z" fill="#008891" stroke="#005361" stroke-width="2"/>
    <path d="M54 100 Q70 88 110 88 Q148 88 162 100 Z" fill="#005361"/>
    <path d="M96 60 Q100 48 110 46 Q120 48 122 58" fill="none" stroke="#005361" stroke-width="2"/>
    <text x="110" y="142" font-family="DM Sans,sans-serif" font-weight="600" font-size="9" fill="#005361" text-anchor="middle">photo coming soon</text>
  </svg>`)
