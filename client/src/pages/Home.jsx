import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { isAuthRequired } from '../config'
import { useAuthStore } from '../store/authStore'
import './Home.css'

export default function Home() {
  const requireAuth = isAuthRequired
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    if (!requireAuth) {
      return
    }

    if (status === 'idle') {
      initialize()
    }
  }, [initialize, requireAuth, status])

  if (requireAuth && (status === 'idle' || status === 'loading')) {
    return (
      <div className="home-loading" role="status" aria-live="polite">
        <div className="spinner" aria-hidden />
        <p>Verifying your session…</p>
      </div>
    )
  }

  if (requireAuth && (!user || status !== 'authenticated')) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero__content">
          <span className="home-badge">Vaccination Management System</span>
          <h1>Coordinate campaigns and care with confidence</h1>
          <p>
            Log in to monitor vaccinations, manage appointments, and keep an eye on patient feedback. New to the
            platform? Create an account and get started in minutes.
          </p>
          <div className="home-actions">
            <Link className="btn primary" to="/login">
              Sign in
            </Link>
            <Link className="btn secondary" to="/register">
              Create account
            </Link>
          </div>
        </div>
        <div className="home-hero__visual" aria-hidden>
          <div className="home-hero__card">
            <span className="chip">Live stats</span>
            <h2>All your vaccination data in one place</h2>
            <ul>
              <li>
                <strong>Campaign oversight</strong>
                <span>Track doses required and intervals across programs.</span>
              </li>
              <li>
                <strong>Booking visibility</strong>
                <span>See appointment status and upcoming visits in real time.</span>
              </li>
              <li>
                <strong>Feedback loop</strong>
                <span>Monitor reviews to keep patient satisfaction high.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="home-highlights" aria-labelledby="highlights-section">
        <div className="home-highlights__intro">
          <h2 id="highlights-section">Everything your vaccination drive needs</h2>
          <p>
            From planning community campaigns to tracking patient feedback, the platform keeps your whole workflow
            connected and transparent.
          </p>
        </div>
        <div className="home-highlights__grid">
          <article className="home-highlights__item">
            <h3>Smart scheduling</h3>
            <p>Coordinate outreach teams and avoid clashes with automated dose and interval suggestions.</p>
          </article>
          <article className="home-highlights__item">
            <h3>Real-time oversight</h3>
            <p>Stay ahead with live dashboards that surface upcoming appointments and overdue follow-ups.</p>
          </article>
          <article className="home-highlights__item">
            <h3>Patient-focused</h3>
            <p>Turn feedback into action with review summaries and alerts for low satisfaction scores.</p>
          </article>
        </div>
      </section>

      <section className="home-flow" aria-labelledby="workflow-section">
        <div className="home-flow__intro">
          <h2 id="workflow-section">How it works</h2>
          <p>Three quick steps to move from sign-up to a fully orchestrated vaccination program.</p>
        </div>
        <ol className="home-flow__steps">
          <li className="home-flow__step">
            <span className="home-flow__step-number">1</span>
            <div>
              <h3>Create your workspace</h3>
              <p>Sign up, invite teammates, and tailor roles to keep sensitive health data secure.</p>
            </div>
          </li>
          <li className="home-flow__step">
            <span className="home-flow__step-number">2</span>
            <div>
              <h3>Launch campaigns</h3>
              <p>Configure vaccine schedules, outreach locations, and lending facilities—all from a single dashboard.</p>
            </div>
          </li>
          <li className="home-flow__step">
            <span className="home-flow__step-number">3</span>
            <div>
              <h3>Track outcomes</h3>
              <p>Monitor bookings, check patient feedback, and export reports that keep stakeholders aligned.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="home-auth" aria-labelledby="auth-section">
        <div className="home-auth__intro">
          <h2 id="auth-section">Get started quickly</h2>
          <p>Whether you already have credentials or need a new account, choose an option below.</p>
        </div>
        <div className="home-auth__grid">
          <article className="home-auth__card">
            <h3>Already registered?</h3>
            <p>Sign in to reach your personalized dashboard and manage vaccination operations.</p>
            <Link className="btn primary" to="/login">
              Go to sign in
            </Link>
          </article>
          <article className="home-auth__card">
            <h3>New to the platform?</h3>
            <p>Create a patient account to book appointments, manage vaccination history, and leave feedback.</p>
            <Link className="btn secondary" to="/register">
              Create your account
            </Link>
          </article>
        </div>
      </section>
    </div>
  )
}
