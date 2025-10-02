import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import Bookings from './pages/Bookings'
import Reviews from './pages/Reviews'
import Register from './pages/Register'
import { isAuthRequired } from './config'
import { useAuthStore } from './store/authStore'

export default function App() {
  const requireAuth = isAuthRequired
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    if (!requireAuth) {
      return
    }
    initialize()
  }, [initialize, requireAuth])

  useEffect(() => {
    document.title = 'Vaccination Management'
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="reviews" element={<Reviews />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
