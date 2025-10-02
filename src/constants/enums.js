export const DOSE_STATUS_OPTIONS = ['BOOKED', 'COMPLETED', 'PENDING']

export const ROLE_OPTIONS = ['PATIENT', 'DOCTOR']

export const DOSE_STATUS_LABELS = {
  BOOKED: 'Booked',
  COMPLETED: 'Completed',
  PENDING: 'Pending',
}

export const roleLabel = (role) => {
  if (!role) return 'Unknown'
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}
