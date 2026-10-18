import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ShoeIcon, EyeIcon, EyeOffIcon } from '../components/Icons.jsx'
import { api } from '../api/client.js'

export default function AdminLogin() {
  const { admin, signIn } = useAuth()
  const navigate = useNavigate()

  // Mode: 'login' | 'forgot'
  const [mode, setMode] = useState('login')

  // Login form state
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Forgot password state
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [devOtp, setDevOtp] = useState('')

  if (admin) return <Navigate to="/admin/dashboard" replace />

  const submitLogin = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn(form.username, form.password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setResetMessage('')
    setBusy(true)
    try {
      const res = await api.forgotPassword({ username_or_email: recoveryEmail.trim() })
      setOtpSent(true)
      setResetMessage(res.message || 'A 6-digit OTP has been sent to your recovery email.')
      if (res.dev_otp) {
        setDevOtp(res.dev_otp)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.')
      return
    }
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.')
      return
    }
    setBusy(true)
    try {
      const res = await api.resetPassword({
        email: recoveryEmail,
        otp: otp.trim(),
        new_password: newPassword,
      })
      setResetSuccess(res.message || 'Password updated successfully! You can now sign in.')
      setForm((prev) => ({ ...prev, password: '' }))
      setTimeout(() => {
        setMode('login')
        setResetSuccess('')
        setOtpSent(false)
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
        setDevOtp('')
      }, 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="wordmark" style={{ marginBottom: 24 }}>
          <span className="wordmark-icon">
            <ShoeIcon />
          </span>
          <strong>SHOE MART</strong>
          <em>Admin</em>
        </div>

        {mode === 'login' ? (
          <>
            <h2>Staff sign in</h2>
            <p>For shop staff only. Customers do not need an account to order.</p>

            {error && <div className="alert alert--error">{error}</div>}
            {resetSuccess && <div className="alert alert--success">{resetSuccess}</div>}

            <form onSubmit={submitLogin}>
              <label className="field">
                <span>Username</span>
                <input
                  required
                  autoFocus
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </label>

              <label className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot')
                      setError('')
                      setResetSuccess('')
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-text)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      marginBottom: 6,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="password-input-wrap">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </label>

              <button className="btn btn--rose btn--wide" disabled={busy} style={{ marginTop: 10 }}>
                {busy ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Reset Password</h2>
            <p style={{ marginBottom: 18 }}>
              Enter your recovery email to receive a 6-digit OTP verification code.
            </p>

            {error && <div className="alert alert--error" style={{ marginBottom: 14 }}>{error}</div>}
            {resetSuccess && <div className="alert alert--success" style={{ marginBottom: 14 }}>{resetSuccess}</div>}
            {resetMessage && (
              <div className="alert alert--success" style={{ marginBottom: 14 }}>
                {resetMessage}
                {devOtp && (
                  <div style={{ marginTop: 6, fontWeight: 700, fontSize: '0.85rem' }}>
                    OTP Code: <span style={{ letterSpacing: '2px', background: 'var(--paper)', padding: '2px 8px', borderRadius: 'var(--r-sm)' }}>{devOtp}</span>
                  </div>
                )}
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <label className="field">
                  <span>Recovery Email</span>
                  <input
                    required
                    type="email"
                    autoFocus
                    placeholder="Enter recovery email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                  />
                </label>

                <button className="btn btn--rose btn--wide" disabled={busy}>
                  {busy ? 'Sending OTP...' : 'Send OTP'}
                </button>

                <button
                  type="button"
                  className="btn btn--ghost btn--wide"
                  style={{ marginTop: 10 }}
                  onClick={() => {
                    setMode('login')
                    setError('')
                  }}
                >
                  Back to Sign in
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <label className="field">
                  <span>Enter 6-Digit OTP</span>
                  <input
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="e.g. 123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{ letterSpacing: '4px', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                  />
                </label>

                <label className="field">
                  <span>New Password</span>
                  <div className="password-input-wrap">
                    <input
                      required
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      placeholder="At least 4 characters"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </label>

                <label className="field">
                  <span>Confirm New Password</span>
                  <div className="password-input-wrap">
                    <input
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      placeholder="Re-enter new password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </label>

                <button className="btn btn--rose btn--wide" disabled={busy} style={{ marginTop: 4 }}>
                  {busy ? 'Updating Password...' : 'Save New Password'}
                </button>

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn btn--ghost btn--small"
                    style={{ flex: 1 }}
                    onClick={handleSendOtp}
                    disabled={busy}
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--small"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setMode('login')
                      setError('')
                      setOtpSent(false)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
