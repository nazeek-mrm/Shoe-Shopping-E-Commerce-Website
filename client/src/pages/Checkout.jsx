import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, money, PLACEHOLDER } from '../api/client.js'
import { useStore } from '../context/StoreContext.jsx'
import { getEmailMistake } from '../utils/validation.js'

const DELIVERY_FREE_OVER = 5000
const DELIVERY_FEE = 350

// Shop official bank account details
const SHOP_BANK_DETAILS = {
  bankName: 'Commercial Bank of Ceylon',
  accountName: 'SHOE MART (PVT) LTD',
  accountNumber: '8012 3456 7890',
  branch: 'Kandy City Branch',
  branchCode: '043',
}

export default function Checkout() {
  const { cart, cartTotal, clearCart, toast } = useStore()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    payment_method: '', // Initially unselected
    address: '',
    city: '',
    landmark: '',
    note: '',
  })

  // Online payment specific fields
  const [referenceNo, setReferenceNo] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [receiptUrl, setReceiptUrl] = useState('')
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [receiptError, setReceiptError] = useState('')
  const [copiedAccount, setCopiedAccount] = useState(false)

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)

  if (!cart.length) {
    return (
      <div className="page empty">
        <h3>There is nothing to check out</h3>
        <p>Add a shoe to the cart first.</p>
        <Link className="btn" to="/shop">Browse Shoes</Link>
      </div>
    )
  }

  const delivery = cartTotal >= DELIVERY_FREE_OVER ? 0 : DELIVERY_FEE
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setForm({ ...form, phone: val })
  }

  const handleCopyAccount = () => {
    navigator.clipboard?.writeText(SHOP_BANK_DETAILS.accountNumber.replace(/\s+/g, ''))
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2200)
  }

  const handleReceiptChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setReceiptError('')
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setReceiptError('File exceeds 5MB maximum size. Please upload a smaller file.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    const allowedExts = ['pdf', 'jpg', 'jpeg', 'png']
    if (!allowedExts.includes(ext)) {
      setReceiptError('Only PDF, JPG, JPEG, and PNG files are accepted.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setReceiptFile(file)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => setReceiptPreview(reader.result)
      reader.readAsDataURL(file)
    } else {
      setReceiptPreview(null)
    }

    // Auto-upload receipt to server
    setUploadingReceipt(true)
    try {
      const res = await api.uploadReceipt(file)
      setReceiptUrl(res.url)
      toast('Receipt uploaded successfully.', 'ok')
    } catch (err) {
      setReceiptError(err.message || 'Failed to upload receipt. You can still enter your reference number below.')
    } finally {
      setUploadingReceipt(false)
    }
  }

  const handleRemoveReceipt = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
    setReceiptUrl('')
    setReceiptError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const phoneDigits = form.phone.replace(/\D/g, '')
  let phoneMistake = ''
  if (phoneDigits.length > 0) {
    if (!phoneDigits.startsWith('07') && (phoneDigits.length >= 2 || phoneDigits[0] !== '0')) {
      phoneMistake = 'Must start with 07 and have 10 digits (e.g. 0712345678)'
    } else if (phoneTouched && phoneDigits.length < 10) {
      phoneMistake = 'Must be 10 digits starting with 07 (e.g. 0712345678)'
    }
  } else if (phoneTouched) {
    phoneMistake = 'Phone number is required (10 digits starting with 07)'
  }

  const emailMistake = getEmailMistake(form.email, emailTouched)

  const placeOrder = async (e) => {
    e.preventDefault()
    setError('')
    setPhoneTouched(true)

    if (!form.customer_name.trim()) {
      setError('Please provide your full name.')
      return
    }

    const cleanPhone = form.phone.replace(/\D/g, '')
    if (!/^07\d{8}$/.test(cleanPhone)) {
      setError('Phone number is compulsory and must be exactly 10 digits starting with 07 (e.g. 0712345678).')
      return
    }

    if (form.email.trim()) {
      const emailErr = getEmailMistake(form.email, true)
      if (emailErr) {
        setEmailTouched(true)
        setError(emailErr)
        return
      }
    }

    if (!form.payment_method) {
      setError('Please choose a payment method: Cash on Delivery or Online Payment.')
      return
    }

    if (!form.address.trim()) {
      setError('Please enter your delivery address.')
      return
    }

    if (form.payment_method === 'bank') {
      if (!receiptUrl && !receiptFile && !referenceNo.trim()) {
        setError('For online payment, please either upload your transfer receipt or enter your transaction reference number.')
        return
      }
    }

    setSaving(true)
    try {
      const notesParts = []
      if (form.payment_method === 'bank') {
        if (referenceNo.trim()) notesParts.push(`Txn Reference: ${referenceNo.trim()}`)
        if (receiptUrl) notesParts.push(`Receipt: ${receiptUrl}`)
        else if (receiptFile) notesParts.push(`Receipt File: ${receiptFile.name}`)
      }
      if (form.landmark.trim()) notesParts.push(`Landmark: ${form.landmark.trim()}`)
      if (form.note.trim()) notesParts.push(`Customer Note: ${form.note.trim()}`)

      const finalNote = notesParts.join(' | ')

      const res = await api.createOrder({
        customer_name: form.customer_name.trim(),
        phone: cleanPhone,
        email: form.email.trim() || undefined,
        address: form.address.trim(),
        city: form.city.trim() || undefined,
        payment_method: form.payment_method,
        note: finalNote || undefined,
        items: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
      })

      clearCart()
      toast('Order placed. The shop will call you shortly.')
      navigate(`/order-placed/${res.order_code}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page section">
      <div className="section-head">
        <div>
          <h2>Checkout</h2>
          <p>Complete your order details below to receive your pair.</p>
        </div>
      </div>

      <form className="cart-layout" onSubmit={placeOrder}>
        <div className="panel checkout-panel">
          {error && <div className="alert alert--error">{error}</div>}

          {/* Section 1: Customer Contact Details */}
          <div className="checkout-contact-section">
            <h3 style={{ margin: '0 0 16px' }}>Your Contact Details</h3>
            <div className="field-row">
              <label className="field">
                <span>Full Name *</span>
                <input
                  required
                  value={form.customer_name}
                  onChange={set('customer_name')}
                />
              </label>
              <label className="field">
                <span>Phone Number *</span>
                <input
                  type="tel"
                  required
                  pattern="07[0-9]{8}"
                  maxLength={10}
                  value={form.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setPhoneTouched(true)}
                  title="Phone number must be exactly 10 digits starting with 07 (e.g. 0712345678)"
                />
                {phoneMistake && (
                  <small style={{ color: '#a23b2b', fontSize: '0.78rem', display: 'block', marginTop: 4 }}>
                    {phoneMistake}
                  </small>
                )}
              </label>
            </div>

            <label className="field">
              <span>Email Address</span>
              <input
                type="text"
                value={form.email}
                onChange={set('email')}
                onBlur={() => setEmailTouched(true)}
              />
              {emailMistake && (
                <small style={{ color: '#a23b2b', fontSize: '0.78rem', display: 'block', marginTop: 4 }}>
                  {emailMistake}
                </small>
              )}
            </label>
          </div>

          {/* Section 2: Payment Choices (Shown as selectable option cards) */}
          <div className="checkout-payment-choice-section" style={{ marginTop: 28 }}>
            <h3 style={{ margin: '0 0 6px' }}>How would you like to pay?</h3>
            <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Choose a payment method below to enter your delivery details.
            </p>

            <div className="checkout-pay-grid">
              {/* Choice 1: Cash on Delivery */}
              <button
                type="button"
                className={`checkout-pay-card ${form.payment_method === 'cod' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, payment_method: 'cod' })}
              >
                <div className="checkout-pay-card-header">
                  <div className="checkout-pay-radio">
                    <span className="radio-inner" />
                  </div>
                  <div className="checkout-pay-icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                  </div>
                  <div className="checkout-pay-title-group">
                    <strong>Cash on Delivery</strong>
                    <small>Pay courier in cash when pair arrives</small>
                  </div>
                </div>
              </button>

              {/* Choice 2: Online Payment */}
              <button
                type="button"
                className={`checkout-pay-card ${form.payment_method === 'bank' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, payment_method: 'bank' })}
              >
                <div className="checkout-pay-card-header">
                  <div className="checkout-pay-radio">
                    <span className="radio-inner" />
                  </div>
                  <div className="checkout-pay-icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <line x1="7" y1="8" x2="17" y2="8" />
                      <line x1="7" y1="12" x2="17" y2="12" />
                      <line x1="7" y1="16" x2="13" y2="16" />
                    </svg>
                  </div>
                  <div className="checkout-pay-title-group">
                    <strong>Online Payment</strong>
                    <small>Direct bank transfer / deposit slip</small>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3A: Expanded Downward View for CASH ON DELIVERY */}
          {form.payment_method === 'cod' && (
            <div className="pay-expand-panel cod-expand-panel">
              <div className="expand-panel-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>
                  <strong>Cash on Delivery selected.</strong> You will pay the courier in cash when the shoe reaches your hands. Please check the pair before paying.
                </span>
              </div>

              <h4 style={{ margin: '20px 0 14px', fontSize: '1.05rem', color: 'var(--ink)' }}>
                Delivery Information
              </h4>

              <label className="field">
                <span>Delivery Address</span>
                <textarea
                  required
                  value={form.address}
                  onChange={set('address')}
                  style={{ minHeight: 85 }}
                />
              </label>

              <div className="field-row">
                <label className="field">
                  <span>City / Town</span>
                  <input
                    required
                    value={form.city}
                    onChange={set('city')}
                  />
                </label>
                <label className="field">
                  <span>Nearest Landmark or Note</span>
                  <input
                    value={form.landmark}
                    onChange={set('landmark')}
                  />
                </label>
              </div>



              {/* Centered Place Order Button */}
              <div className="place-order-center-wrap">
                <button
                  type="submit"
                  className="btn btn--rose btn--place-order-main"
                  disabled={saving}
                >
                  {saving ? 'Placing your order...' : 'Place Order'}
                </button>
                <p className="order-secure-note">
                  No advance payment needed. Pay in cash directly upon delivery.
                </p>
              </div>
            </div>
          )}

          {/* Section 3B: Expanded Downward View for ONLINE PAYMENT */}
          {form.payment_method === 'bank' && (
            <div className="pay-expand-panel bank-expand-panel">
              <div className="expand-panel-badge bank-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4" />
                </svg>
                <span>
                  <strong>Online Bank Transfer.</strong> Transfer the order amount to our shop account below and attach your receipt or reference number.
                </span>
              </div>

              {/* Shop Bank Details Card */}
              <div className="shop-bank-card">
                <div className="bank-card-header">
                  <span className="bank-card-tag">OFFICIAL SHOP ACCOUNT</span>
                  <span className="bank-card-total">Amount to pay: <strong>{money(cartTotal + delivery)}</strong></span>
                </div>
                <div className="bank-details-grid">
                  <div className="bank-detail-item">
                    <span className="detail-label">Bank Name</span>
                    <strong className="detail-value">{SHOP_BANK_DETAILS.bankName}</strong>
                  </div>
                  <div className="bank-detail-item">
                    <span className="detail-label">Account Name</span>
                    <strong className="detail-value">{SHOP_BANK_DETAILS.accountName}</strong>
                  </div>
                  <div className="bank-detail-item">
                    <span className="detail-label">Account Number</span>
                    <div className="account-number-copy-wrap">
                      <strong className="detail-value num-code">{SHOP_BANK_DETAILS.accountNumber}</strong>
                      <button
                        type="button"
                        className="btn-copy-account"
                        onClick={handleCopyAccount}
                        title="Copy account number"
                      >
                        {copiedAccount ? 'Copied ✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="bank-detail-item">
                    <span className="detail-label">Branch & Code</span>
                    <strong className="detail-value">{SHOP_BANK_DETAILS.branch} ({SHOP_BANK_DETAILS.branchCode})</strong>
                  </div>
                </div>
              </div>

              <h4 style={{ margin: '22px 0 14px', fontSize: '1.05rem', color: 'var(--ink)' }}>
                Delivery Information
              </h4>

              <label className="field">
                <span>Delivery Address</span>
                <textarea
                  required
                  value={form.address}
                  onChange={set('address')}
                  style={{ minHeight: 85 }}
                />
              </label>

              <div className="field-row">
                <label className="field">
                  <span>City / Town</span>
                  <input
                    required
                    value={form.city}
                    onChange={set('city')}
                  />
                </label>
                <label className="field">
                  <span>Nearest Landmark</span>
                  <input
                    value={form.landmark}
                    onChange={set('landmark')}
                  />
                </label>
              </div>

              {/* Payment Proof / Receipt Upload Section */}
              <div className="receipt-upload-box">
                <div className="receipt-upload-header">
                  <label className="field-label-custom">
                    <span>Upload Bank Receipt / Deposit Slip</span>
                    <small style={{ color: 'var(--muted)', display: 'block', marginTop: 2 }}>
                      Accepted formats: PDF, JPG, JPEG, PNG (Maximum size: 5MB)
                    </small>
                  </label>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,image/jpeg,image/jpg,image/png"
                  onChange={handleReceiptChange}
                  style={{ display: 'none' }}
                  id="receipt-file-input"
                />

                {!receiptFile ? (
                  <button
                    type="button"
                    className="btn-upload-receipt-trigger"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Choose receipt file (PDF / JPG / PNG)</span>
                  </button>
                ) : (
                  <div className="receipt-file-selected-badge">
                    {receiptPreview ? (
                      <img src={receiptPreview} alt="Receipt preview" className="receipt-thumb" />
                    ) : (
                      <div className="receipt-doc-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                    )}
                    <div className="receipt-file-info">
                      <strong className="file-name">{receiptFile.name}</strong>
                      <span className="file-meta">
                        {(receiptFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadingReceipt ? 'Uploading...' : 'Uploaded ✓'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-receipt"
                      onClick={handleRemoveReceipt}
                      title="Remove receipt file"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {receiptError && (
                  <div className="alert alert--error" style={{ marginTop: 10, padding: '8px 12px', fontSize: '0.84rem' }}>
                    {receiptError}
                  </div>
                )}

                {/* Alternative: Reference Number */}
                <div className="receipt-alternative-divider">
                  <span>OR ENTER REFERENCE NUMBER</span>
                </div>

                <label className="field" style={{ marginBottom: 0 }}>
                  <span>Transaction Reference Number / Deposit Slip No</span>
                  <input
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                  />
                  <small style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4, display: 'block' }}>
                    Enter the reference code shown on your banking app or receipt slip.
                  </small>
                </label>
              </div>



              {/* Centered Place Order Button */}
              <div className="place-order-center-wrap">
                <button
                  type="submit"
                  className="btn btn--rose btn--place-order-main"
                  disabled={saving || uploadingReceipt}
                >
                  {saving ? 'Placing your order...' : 'Place Order'}
                </button>
                <p className="order-secure-note">
                  Bank transfers are verified by our team promptly upon receipt.
                </p>
              </div>
            </div>
          )}


        </div>

        {/* Aside: Order Summary */}
        <aside className="summary checkout-summary">
          <div className="summary-head">
            <h3>Order summary</h3>
            <span className="summary-badge">
              {cart.reduce((sum, i) => sum + i.quantity, 0)} {cart.reduce((sum, i) => sum + i.quantity, 0) === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="summary-items-list">
            {cart.map((i) => (
              <div className="summary-item-card" key={i.id}>
                <div className="summary-item-thumb-box">
                  <img
                    src={i.image || PLACEHOLDER}
                    alt={i.model}
                    className="summary-item-thumb"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER }}
                  />
                  <span className="summary-item-qty-badge">{i.quantity}</span>
                </div>
                <div className="summary-item-info">
                  <strong className="summary-item-name">{i.model}</strong>
                  <div className="summary-item-meta">
                    <span>{money(i.price)} each</span>
                  </div>
                </div>
                <div className="summary-item-price">
                  {money(i.price * i.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-breakdown">
            <div className="summary-row">
              <span>Items Subtotal</span>
              <span>{money(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{delivery === 0 ? <span className="free-delivery-tag">Free</span> : money(delivery)}</span>
            </div>
            <div className="summary-row summary-row-total">
              <span className="total-label">Total</span>
              <span className="total-val">{money(cartTotal + delivery)}</span>
            </div>
          </div>

          <div className="summary-trust-box">
            <div className="trust-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>100% Authentic Shoes Guaranteed</span>
            </div>
            <div className="trust-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Stock reserved upon placing order</span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  )
}
