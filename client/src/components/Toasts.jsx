import { useStore } from '../context/StoreContext.jsx'

export default function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toast-area" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.kind === 'err' ? ' err' : ''}`}>{t.message}</div>
      ))}
    </div>
  )
}
