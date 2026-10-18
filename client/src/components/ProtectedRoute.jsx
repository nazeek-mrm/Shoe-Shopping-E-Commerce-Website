import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from './Loader.jsx'

export default function ProtectedRoute({ children }) {
  const { admin, checking } = useAuth()
  if (checking) return <Loader text="Checking your session" />
  if (!admin) return <Navigate to="/admin" replace />
  return children
}
