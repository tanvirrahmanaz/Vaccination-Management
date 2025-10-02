import { useEffect, useMemo, useState } from 'react'
import { createBooking, listBookings, updateBooking } from '../api/bookings'
import { listCampaigns } from '../api/campaigns'
import { listUsers } from '../api/auth'
import { DOSE_STATUS_OPTIONS, DOSE_STATUS_LABELS } from '../constants/enums'

const normalizeStatus = (value, fallbackIndex = 0) => {
  if (DOSE_STATUS_OPTIONS.includes(value)) {
    return value
  }
  return DOSE_STATUS_OPTIONS[fallbackIndex]
}

const INIT_FORM = {
  dose1_date: '',
  dose2_date: '',
  dose1_status: DOSE_STATUS_OPTIONS[0],
  dose2_status: DOSE_STATUS_OPTIONS[2],
  campaign: '',
  patient: '',
}

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [patients, setPatients] = useState([])
  const [form, setForm] = useState(INIT_FORM)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [rowSaving, setRowSaving] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const [bookingList, campaignList, userList] = await Promise.all([
          listBookings(),
          listCampaigns(),
          listUsers(),
        ])
        if (!cancelled) {
          setBookings(bookingList)
          setCampaigns(campaignList)
          setPatients(userList.filter((user) => user.role === 'PATIENT'))
        }
      } catch (error) {
        console.error('Failed to load bookings', error)
        if (!cancelled) {
          setError('Could not load bookings. Ensure you have permission to view this data.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  const refreshBookings = async () => {
    const bookingList = await listBookings()
    setBookings(bookingList)
  }

  const patientLookup = useMemo(() => {
    const map = new Map()
    patients.forEach((patient) => {
      map.set(patient.id, patient)
    })
    return map
  }, [patients])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.campaign) {
      setError('Select a campaign before creating a booking.')
      return
    }
    if (!form.patient) {
      setError('Assign a patient to complete the booking.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        dose1_date: form.dose1_date,
        dose1_status: form.dose1_status,
        dose2_status: form.dose2_status,
        campaign: Number(form.campaign),
        patient: Number(form.patient),
      }
      if (form.dose2_date) {
        payload.dose2_date = form.dose2_date
      }
      await createBooking(payload)
      setForm(() => ({ ...INIT_FORM }))
      await refreshBookings()
    } catch (error) {
      const message = error.response?.data?.detail || 'Could not create booking with that data.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (booking, field, value) => {
    setRowSaving(booking.id)
    setError('')
    try {
      await updateBooking(booking.id, { [field]: value })
      setBookings((prev) =>
        prev.map((item) => (item.id === booking.id ? { ...item, [field]: value } : item)),
      )
    } catch (error) {
      const message = error.response?.data?.detail || 'Could not update booking status.'
      setError(message)
    } finally {
      setRowSaving(null)
    }
  }

  return (
    <div className="page">
      <section className="card">
        <div className="card-header">
          <h2>Bookings</h2>
          <p className="muted">Monitor patient appointments and completion status.</p>
        </div>

        {loading && <p>Loading bookings…</p>}
        {error && <div className="error">{error}</div>}

        {!loading && bookings.length === 0 && <p className="muted">No bookings recorded yet.</p>}

        {!loading && bookings.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Campaign</th>
                <th>Dose 1</th>
                <th>Status</th>
                <th>Dose 2</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    {(() => {
                      const patient = patientLookup.get(booking.patient)
                      if (!patient) {
                        return `#${booking.patient || '—'}`
                      }
                      return (
                        <div>
                          <strong>{patient.username}</strong>
                          <div className="muted small">{patient.email}</div>
                        </div>
                      )
                    })()}
                  </td>
                  <td>#{booking.campaign}</td>
                  <td>{booking.dose1_date}</td>
                  <td>
                    <select
                      value={normalizeStatus(booking.dose1_status, 0)}
                      onChange={(event) => handleStatusUpdate(booking, 'dose1_status', event.target.value)}
                      disabled={rowSaving === booking.id}
                    >
                      {DOSE_STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {DOSE_STATUS_LABELS[option]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{booking.dose2_date || '—'}</td>
                  <td>
                    <select
                      value={normalizeStatus(booking.dose2_status, 2)}
                      onChange={(event) => handleStatusUpdate(booking, 'dose2_status', event.target.value)}
                      disabled={rowSaving === booking.id}
                    >
                      {DOSE_STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {DOSE_STATUS_LABELS[option]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>New booking</h2>
          <p className="muted">Book a patient into an available campaign slot.</p>
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
            Patient
            <select name="patient" value={form.patient} onChange={handleChange} required>
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.username} ({patient.email})
                </option>
              ))}
            </select>
          </label>
          <label>
            Dose 1 date
            <input type="date" name="dose1_date" value={form.dose1_date} onChange={handleChange} required />
          </label>
          <label>
            Dose 1 status
            <select name="dose1_status" value={form.dose1_status} onChange={handleChange}>
              {DOSE_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {DOSE_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Dose 2 date
            <input type="date" name="dose2_date" value={form.dose2_date} onChange={handleChange} />
          </label>
          <label>
            Dose 2 status
            <select name="dose2_status" value={form.dose2_status} onChange={handleChange}>
              {DOSE_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {DOSE_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Create booking'}
          </button>
        </form>
      </section>
    </div>
  )
}
