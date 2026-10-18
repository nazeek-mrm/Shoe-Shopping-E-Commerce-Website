import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [admin, setAdmin]         = useState(null)
  const [checking, setChecking]   = useState(true)
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('shoemart_token')) { setChecking(false); return }
    api.me()
      .then((d) => setAdmin(d.admin))
      .catch(() => localStorage.removeItem('shoemart_token'))
      .finally(() => setChecking(false))
  }, [])

  const signIn = async (username, password) => {
    const data = await api.login({ username, password })
    localStorage.setItem('shoemart_token', data.token)
    setAdmin(data.admin)
  }

  const signOut = async () => {
    try { await api.logout() } catch { /* token already gone */ }
    localStorage.removeItem('shoemart_token')
    setAdmin(null)
  }

  const requestSignOut = () => setIsExitModalOpen(true)
  const cancelSignOut  = () => setIsExitModalOpen(false)

  const confirmSignOut = async () => {
    setIsExitModalOpen(false)
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <AuthContext.Provider value={{
      admin,
      checking,
      signIn,
      signOut,
      isExitModalOpen,
      requestSignOut,
      cancelSignOut,
      confirmSignOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}
