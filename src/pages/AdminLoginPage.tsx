import { Navigate, useLocation } from 'react-router-dom'

/** Legacy route — admin and customers share /login now. */
export function AdminLoginPage() {
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const redirect = from && from.startsWith('/admin') ? from : '/admin'
  return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
}
