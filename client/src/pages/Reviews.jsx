import { useEffect, useMemo, useState } from 'react'
import { listCampaigns } from '../api/campaigns'
import { createReview, listReviews } from '../api/reviews'
import { listUsers } from '../api/auth'

const INIT_FORM = {
  campaign: '',
  rating: 5,
  comment: '',
}

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [patients, setPatients] = useState([])
  const [form, setForm] = useState(INIT_FORM)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      setLoading(true)
      setError('')
      try {
        const [reviewList, campaignList, userList] = await Promise.all([
          listReviews(),
          listCampaigns(),
          listUsers(),
        ])
        if (!cancelled) {
          setReviews(reviewList)
          setCampaigns(campaignList)
          setPatients(userList.filter((user) => user.role === 'PATIENT'))
        }
      } catch (error) {
        console.error('Failed to load reviews', error)
        if (!cancelled) {
          setError('Could not load reviews. Make sure the API is reachable.')
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

  const refreshReviews = async () => {
    const reviewList = await listReviews()
    setReviews(reviewList)
  }

  const patientLookup = useMemo(() => {
    const map = new Map()
    patients.forEach((patient) => map.set(patient.id, patient))
    return map
  }, [patients])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.campaign) {
      setError('Select a campaign before submitting a review.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createReview({
        campaign: Number(form.campaign),
        rating: Number(form.rating),
        comment: form.comment,
      })
      setForm(() => ({ ...INIT_FORM }))
      await refreshReviews()
    } catch (error) {
      const message = error.response?.data?.detail || 'Could not save review.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <section className="card">
        <div className="card-header">
          <h2>Reviews</h2>
          <p className="muted">Capture feedback for each campaign to measure satisfaction.</p>
        </div>

        {loading && <p>Loading reviews…</p>}
        {error && <div className="error">{error}</div>}

        {!loading && reviews.length === 0 && <p className="muted">No feedback recorded yet.</p>}

        {!loading && reviews.length > 0 && (
          <ul className="reviews">
            {reviews.map((review) => (
              <li key={review.id} className="review-item">
                <div className="review-header">
                  <strong>Campaign #{review.campaign}</strong>
                  <span className="chip rating">{review.rating} ★</span>
                </div>
                <p>{review.comment || 'No comment provided.'}</p>
                <p className="muted">
                  {(() => {
                    const patient = patientLookup.get(review.patient)
                    return patient ? `${patient.username} · ${patient.email}` : `Patient #${review.patient}`
                  })()}
                  {' · '}
                  {new Date(review.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Log new review</h2>
          <p className="muted">Attach internal notes or patient feedback to campaigns.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Campaign
            <select name="campaign" value={form.campaign} onChange={handleChange} required>
              <option value="">Select campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Rating
            <select name="rating" value={form.rating} onChange={handleChange}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            Comment
            <textarea name="comment" value={form.comment} onChange={handleChange} rows={3} />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Submit review'}
          </button>
        </form>
      </section>
    </div>
  )
}
