import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Navigate to order page, or login first if not authenticated */
export function useOrderNavigation() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (productId?: string) => {
    const orderPath = productId ? `/order?product=${productId}` : '/order'

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(orderPath)}`)
      return
    }

    navigate(orderPath)
  }
}
