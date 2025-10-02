import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAuthRequired } from '../config'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute() {
  const requireAuth = isAuthRequired
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    if (!requireAuth) {
      return
    }

    if (status === 'idle') {
      initialize()
    }
  }, [initialize, requireAuth, status])

  if (!requireAuth) {
    return <Outlet />
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="centered">
        <div className="spinner" aria-hidden />
        <p>Checking your session…</p>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
