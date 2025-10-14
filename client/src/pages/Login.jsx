import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { isAuthRequired } from '../config'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const login = useAuthStore((state) => state.login)
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const navigate = useNavigate()
  const location = useLocation()
  const requireAuth = isAuthRequired
  const from = location.state?.from?.pathname || '/dashboard'

  if (requireAuth && status === 'authenticated') {
    return <Navigate to={from} replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login failed', error)
      // handled in store
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),transparent_65%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.2),transparent_55%)]" />
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/30 lg:grid-cols-[1fr_0.9fr]">
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600 p-10 text-white lg:flex">
          <div className="flex items-center gap-4 text-sm uppercase tracking-[0.35em] text-white/80">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold text-white">
              VMS
            </span>
            <span className="font-medium">Vaccination Management</span>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Why teams trust us</span>
              <h2 className="text-3xl font-semibold leading-tight">Plan, track, and improve every vaccination drive</h2>
            </div>
            <ul className="grid gap-4 text-sm text-white/90">
              <li className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                Coordinate campaigns with real-time scheduling and stock insights.
              </li>
              <li className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                Keep appointments full thanks to automated reminders and smart queues.
              </li>
              <li className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                Turn community feedback into action with built-in review analytics.
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/80">
            <div className="flex -space-x-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-sm font-semibold">TC</span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">HR</span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">MC</span>
            </div>
            <span>Trusted by 120+ community health organizations</span>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-10 p-8 sm:p-12">
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Welcome back</h1>
            <p className="text-base text-slate-500">
              Sign in with your credentials to access dashboards, bookings, and campaign insights.
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-600" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-700 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-600" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-700 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 lg:text-left">
            New here?{' '}
            <Link className="font-semibold text-sky-600 transition hover:text-sky-700" to="/register">
              Create an account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
