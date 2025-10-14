import { useEffect, useMemo, useState } from 'react'
import { listCampaigns } from '../api/campaigns'
import { listBookings } from '../api/bookings'
import { listReviews } from '../api/reviews'
import { listUsers } from '../api/auth'
import { DOSE_STATUS_OPTIONS, DOSE_STATUS_LABELS } from '../constants/enums'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [patients, setPatients] = useState([])
  const [warnings, setWarnings] = useState([])

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      setLoading(true)
      setError('')
      try {
        const [campaignResult, bookingResult, reviewResult, userResult] = await Promise.allSettled([
          listCampaigns(),
          listBookings(),
          listReviews(),
          listUsers(),
        ])

        if (cancelled) {
          return
        }

        const nextWarnings = []

        if (campaignResult.status === 'fulfilled') {
          setCampaigns(campaignResult.value)
        } else {
          console.error('Failed to load campaigns', campaignResult.reason)
          nextWarnings.push('campaigns')
        }

        if (bookingResult.status === 'fulfilled') {
          setBookings(bookingResult.value)
        } else {
          console.error('Failed to load bookings', bookingResult.reason)
          nextWarnings.push('bookings')
        }

        if (reviewResult.status === 'fulfilled') {
          setReviews(reviewResult.value)
        } else {
          console.error('Failed to load reviews', reviewResult.reason)
          nextWarnings.push('reviews')
        }

        if (userResult.status === 'fulfilled') {
          setPatients(userResult.value.filter((user) => user.role === 'PATIENT'))
        } else {
          console.error('Failed to load users', userResult.reason)
          nextWarnings.push('users')
        }

        const successfulLoads = [campaignResult, bookingResult, reviewResult, userResult].filter(
          (result) => result.status === 'fulfilled',
        ).length

        if (successfulLoads === 0) {
          setError('Unable to load dashboard data. Please verify the API server is running.')
          setWarnings([])
        } else {
          setError('')
          setWarnings(nextWarnings)
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error)
        if (!cancelled) {
          setError('Unable to load dashboard data. Please verify the API server is running.')
          setWarnings([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = useMemo(
    () => [
      {
        label: 'Active Campaigns',
        value: campaigns.length,
        hint: 'Manage vaccine availability and dose schedules.',
      },
      {
        label: 'Bookings',
        value: bookings.length,
        hint: 'Track appointments and dose completion.',
      },
      {
        label: 'Reviews',
        value: reviews.length,
        hint: 'Monitor campaign feedback and quality.',
      },
    ],
    [campaigns.length, bookings.length, reviews.length],
  )

  const patientLookup = useMemo(() => {
    const map = new Map()
    patients.forEach((patient) => {
      map.set(patient.id, patient)
    })
    return map
  }, [patients])

  const pendingBookings = useMemo(() => {
    return bookings
      .filter((booking) => booking.dose1_status !== 'COMPLETED' || booking.dose2_status !== 'COMPLETED')
      .slice(0, 5)
  }, [bookings])

  const statusBreakdown = useMemo(
    () =>
      DOSE_STATUS_OPTIONS.map((status) => ({
        status,
        label: DOSE_STATUS_LABELS[status],
        count: bookings.filter((booking) => booking.dose1_status === status || booking.dose2_status === status).length,
      })),
    [bookings],
  )

  return (
    <div className="dashboard">
      {loading && (
        <div className="card">
          <p>Loading dashboard insights…</p>
        </div>
      )}

      {error && <div className="card error-card">{error}</div>}

      {warnings.length > 0 && !error && (
        <div className="card">
          <h2>Partial data</h2>
          <p className="muted">
            Some sections did not load ({warnings.join(', ')}). Please retry once the API is available.
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="stat-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="card stat-card">
                <span className="stat-value">{stat.value}</span>
                <h3>{stat.label}</h3>
                <p className="muted">{stat.hint}</p>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Booking status mix</h2>
            <p className="muted">How frequently each dose status occurs across every booking.</p>
            <div className="status-grid">
              {statusBreakdown.map((status) => (
                <div key={status.status} className="status-tile">
                  <span className={`chip status-${status.status.toLowerCase()}`}>{status.label}</span>
                  <strong>{status.count}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>Pending bookings</h2>
            <p className="muted">Focus on the next five appointments still awaiting completion.</p>
            {pendingBookings.length === 0 ? (
              <p className="muted">No pending bookings right now.</p>
            ) : (
              <ul className="timeline">
                {pendingBookings.map((booking) => (
                  <li key={booking.id}>
                    <div>
                      <span className="chip">Dose 1: {booking.dose1_status}</span>
                      <span className="chip">Dose 2: {booking.dose2_status || 'N/A'}</span>
                    </div>
                    <p className="muted">
                      {(() => {
                        const patient = patientLookup.get(booking.patient)
                        return patient ? `${patient.username} · ${patient.email}` : `Patient #${booking.patient}`
                      })()}
                    </p>
                    <p className="muted">
                      Campaign #{booking.campaign} · {booking.dose1_date}
                      {booking.dose2_date ? ` → ${booking.dose2_date}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
