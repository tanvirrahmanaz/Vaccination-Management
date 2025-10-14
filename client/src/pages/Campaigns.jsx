import { useEffect, useState } from 'react'
import { createCampaign, deleteCampaign, listCampaigns } from '../api/campaigns'
import { useAuthStore } from '../store/authStore'

const INITIAL_FORM = {
  name: '',
  description: '',
  doses_required: 2,
  dose_interval_days: 21,
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    let cancelled = false
    async function fetchCampaigns() {
      setLoading(true)
      setError('')
      try {
        const data = await listCampaigns()
        if (!cancelled) {
          setCampaigns(data)
        }
      } catch (error) {
        console.error('Failed to load campaigns', error)
        if (!cancelled) {
          setError('Could not load campaigns. Confirm API availability and permissions.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    fetchCampaigns()
    return () => {
      cancelled = true
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: Number(value) }))
  }

  const refreshCampaigns = async () => {
    const data = await listCampaigns()
    setCampaigns(data)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await createCampaign({
        ...form,
        created_by: user?.id,
      })
      setForm(() => ({ ...INITIAL_FORM }))
      await refreshCampaigns()
    } catch (error) {
      const message = error.response?.data?.detail || 'Unable to create campaign with the provided data.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign?')) return
    try {
      await deleteCampaign(id)
      await refreshCampaigns()
    } catch (error) {
      const message = error.response?.data?.detail || 'Unable to delete campaign.'
      setError(message)
    }
  }

  return (
    <div className="page">
      <section className="card">
        <div className="card-header">
          <h2>Vaccination campaigns</h2>
          <p className="muted">Create or manage scheduled vaccine programs.</p>
        </div>

        {loading && <p>Loading campaigns…</p>}
        {error && <div className="error">{error}</div>}

        {!loading && campaigns.length === 0 && <p className="muted">No campaigns yet.</p>}

        {!loading && campaigns.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Doses</th>
                <th>Interval</th>
                <th>Description</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>{campaign.name}</td>
                  <td>{campaign.doses_required}</td>
                  <td>{campaign.dose_interval_days} days</td>
                  <td className="muted">{campaign.description || '—'}</td>
                  <td>
                    <button className="ghost" onClick={() => handleDelete(campaign.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>New campaign</h2>
          <p className="muted">Fill out the basic details to launch an additional vaccination campaign.</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </label>
          <label>
            Doses required
            <input
              type="number"
              min={1}
              name="doses_required"
              value={form.doses_required}
              onChange={handleNumberChange}
              required
            />
          </label>
          <label>
            Interval (days)
            <input
              type="number"
              min={1}
              name="dose_interval_days"
              value={form.dose_interval_days}
              onChange={handleNumberChange}
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create campaign'}
          </button>
        </form>
      </section>
    </div>
  )
}
