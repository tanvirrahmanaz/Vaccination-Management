import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'

const INITIAL_FORM = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  nid: '',
}

export default function Register() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      setSuccess('')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: 'PATIENT',
        nid: form.nid || undefined,
      })
      setSuccess('Account created! You can now sign in.')
      setForm(INITIAL_FORM)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 900)
    } catch (err) {
      const message = err.response?.data?.detail || 'Could not create account. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.25),transparent_65%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.2),transparent_55%)]" />
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/30 lg:grid-cols-[1fr_1.1fr]">
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-600 p-10 text-white lg:flex">
          <div className="flex items-center gap-4 text-sm uppercase tracking-[0.35em] text-white/80">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold text-white">
              VMS
            </span>
            <span className="font-medium">Vaccination Management</span>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/75">Create your workspace</span>
              <h2 className="text-3xl font-semibold leading-tight">Set up a patient account in minutes</h2>
            </div>
            <ol className="grid gap-4 text-sm text-white/90">
              <li className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <strong className="block text-base font-semibold text-white">1. Share basics</strong>
                Provide your username, email, and optional national ID so we can personalize reminders.
              </li>
              <li className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <strong className="block text-base font-semibold text-white">2. Secure access</strong>
                Create a strong password to keep vaccination details protected across devices.
              </li>
              <li className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <strong className="block text-base font-semibold text-white">3. Track progress</strong>
                Book appointments, monitor dose history, and stay informed on upcoming campaigns.
              </li>
            </ol>
          </div>
          <div className="flex flex-col gap-1 text-sm text-white/80">
            <span className="font-semibold uppercase tracking-[0.3em] text-white/70">Support</span>
            <span>Need help? Email <span className="font-semibold text-white">support@vms.health</span></span>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-10 p-8 sm:p-12">
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Create your account</h1>
            <p className="text-base text-slate-500">
              Join the platform to schedule vaccinations, monitor your history, and share feedback with providers.
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-600" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-600" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-600" htmlFor="nid">
                National ID (optional)
              </label>
              <input
                id="nid"
                name="nid"
                value={form.nid}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-slate-600" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 lg:text-left">
            Already have an account?{' '}
            <Link className="font-semibold text-emerald-600 transition hover:text-emerald-700" to="/login">
              Sign in
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
