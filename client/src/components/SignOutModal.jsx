import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useStore } from '../context/StoreContext.jsx'

export default function SignOutModal() {
  const { isExitModalOpen, cancelSignOut, confirmSignOut } = useAuth()
  const { toast } = useStore()

  useEffect(() => {
    if (!isExitModalOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') cancelSignOut()
    }
    window.addEventListener('keydown', onKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isExitModalOpen, cancelSignOut])

  if (!isExitModalOpen) return null

  const handleConfirm = async () => {
    await confirmSignOut()
    if (toast) {
      toast('Signed out successfully. Welcome back to Shoe Mart.', 'ok')
    }
  }

  return (
    <div
      className="admin-exit-backdrop"
      onClick={cancelSignOut}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
    >
      <div
        className="admin-exit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-exit-icon-wrap">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <h3 id="exit-modal-title" className="admin-exit-title">
          Are you sure you want to sign out?
        </h3>

        <div className="admin-exit-actions">
          <button
            type="button"
            className="btn admin-exit-btn-yes"
            onClick={handleConfirm}
          >
            Yes
          </button>
          <button
            type="button"
            className="btn admin-exit-btn-no"
            onClick={cancelSignOut}
            autoFocus
          >
            No
          </button>
        </div>
      </div>
    </div>
  )
}
