import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useStore } from '../context/StoreContext.jsx'
import { getEmailMistake } from '../utils/validation.js'

export default function Contact() {
  const { toast } = useStore()
  const [form, setForm] = useState({ customer_name: '', phone: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setPhoneTouched(true)

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

    setSending(true)
    try {
      await api.sendInquiry({ ...form, phone: cleanPhone })
      setSent(true)
      setPhoneTouched(false)
      setEmailTouched(false)
      setForm({ customer_name: '', phone: '', email: '', message: '' })
      toast('Message sent.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setForm({ ...form, phone: val })
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

  return (
    <div className="page section">
      <div className="split">
        <div>
          <h1>Talk to the shop</h1>
          <p>
            Tell us your budget and what the shoes are for — daily wear, sports, formal occasions or hiking —
            and we'll reply with two or three options that suit your needs.
            Messages sent during shop hours usually get an answer the same day.
          </p>

          {sent && <div className="alert">Message received. Watch for a call or a WhatsApp reply.</div>}
          {error && <div className="alert alert--error">{error}</div>}

          <form onSubmit={submit} style={{ maxWidth: 520, marginBottom: 48 }}>
            <div className="field-row">
              <label className="field">
                <span>Your name</span>
                <input required value={form.customer_name} onChange={set('customer_name')} />
              </label>
              <label className="field">
                <span>Phone number *</span>
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
              <span>Email, if you prefer a written reply</span>
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
            <label className="field">
              <span>How can we help?</span>
              <textarea required value={form.message} onChange={set('message')} />
            </label>
            <button className="btn" disabled={sending}>{sending ? 'Sending' : 'Send the message'}</button>
          </form>

          <div className="about-details" style={{ borderTop: '2px solid var(--line)', paddingTop: 36 }}>
            <h2 style={{ marginTop: 0 }}>A shoe store that tells you everything</h2>
            <p>
              SHOE MART started in 2020 as a small import counter on Peradeniya Road. We noticed
              that customers kept returning other online purchases — wrong size, wrong material,
              not what the photo showed. So we decided to build something different: a store where
              every specification is listed clearly, and every pair can be inspected in person.
            </p>
            <p>
              We stock genuine footwear from Nike, Adidas, Puma, Reebok, New Balance, Vans and
              Converse — sourced through authorised distributors. No grey market imports,
              no fakes, no compromises.
            </p>

            <h3 style={{ marginTop: 28 }}>What happens before a pair is listed</h3>
            <p>
              New pairs are unpacked and inspected for manufacturing defects before they go on the
              shelf. Pre-owned pairs receive more attention: the upper, sole, insole and stitching
              are all checked, and the pair is cleaned before listing. Only then does it get a
              photograph and a price.
            </p>

            <h3 style={{ marginTop: 28 }}>Buying a pre-owned pair here</h3>
            <p>
              Our pre-owned stock is mostly lightly used pairs from individuals and corporate
              uniforms, inspected and cleaned to a consistent standard. They carry a six month
              warranty from the shop and we will show you photos of the actual pair before you
              commit to buying.
            </p>

            <Link className="btn" to="/shop" style={{ marginTop: 14 }}>See what's in stock</Link>
          </div>
        </div>

        <div className="panel">
          <h3>The shop</h3>
          <ul className="info-list">
            <li><strong>Address</strong>142 Peradeniya Road</li>
            <li><strong>Open</strong>Monday to Saturday, 9am to 7pm. Closed Sundays and poya days.</li>
            <li><strong>Phone or WhatsApp</strong><a href="tel:+94771234567">077 123 4567</a></li>
            <li><strong>Email</strong><a href="mailto:hello@shoemart.lk">hello@shoemart.lk</a></li>
            <li><strong>Sizing help</strong>Not sure about your size? Come in and try the pair before you buy. We measure your foot if needed.</li>
            <li><strong>Trade in</strong>Bring your old pair and we will value it against the new one.</li>
          </ul>

          <h3 style={{ marginTop: 26 }}>Delivery</h3>
          <ul className="info-list">
            <li><strong>Colombo & Local Areas</strong>Next working day</li>
            <li><strong>Other districts</strong>Two to three working days</li>
            <li><strong>Free over Rs. 5,000</strong>Otherwise Rs. 350</li>
          </ul>

          <h3 style={{ marginTop: 26 }}>Warranty</h3>
          <ul className="info-list">
            <li><strong>All shoes</strong>Six months from the shop</li>
            <li><strong>Pre-owned</strong>Six months from the shop</li>
            <li><strong>Returns</strong>Seven days if the pair is unworn and in original box</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
