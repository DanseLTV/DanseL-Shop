import { Navigate } from 'react-router-dom'

/** Legacy URL — send admins to the new overview. */
export function AdminDashboardPage() {
  return <Navigate to="/admin" replace />
}
