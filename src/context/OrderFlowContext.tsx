import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { OrderLoginPromptModal } from '../components/order/OrderLoginPromptModal'

export interface PendingOrder {
  productId?: string
  productName?: string
  productPrice?: number
}

interface OrderFlowContextValue {
  startOrder: (pending?: PendingOrder) => void
  closePrompt: () => void
}

const OrderFlowContext = createContext<OrderFlowContextValue | null>(null)

function buildOrderPath(productId?: string) {
  return productId ? `/order?product=${productId}` : '/order'
}

export function OrderFlowProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showPrompt, setShowPrompt] = useState(false)
  const [pending, setPending] = useState<PendingOrder | null>(null)

  const closePrompt = useCallback(() => {
    setShowPrompt(false)
    setPending(null)
  }, [])

  const startOrder = useCallback(
    (options?: PendingOrder) => {
      const orderPath = buildOrderPath(options?.productId)

      if (user) {
        navigate(orderPath)
        return
      }

      setPending(options ?? {})
      setShowPrompt(true)
    },
    [user, navigate]
  )

  const goToLogin = useCallback(() => {
    const orderPath = buildOrderPath(pending?.productId)
    setShowPrompt(false)
    navigate(`/login?redirect=${encodeURIComponent(orderPath)}`)
    setPending(null)
  }, [navigate, pending?.productId])

  const goToSignup = useCallback(() => {
    const orderPath = buildOrderPath(pending?.productId)
    setShowPrompt(false)
    navigate(`/signup?redirect=${encodeURIComponent(orderPath)}`)
    setPending(null)
  }, [navigate, pending?.productId])

  return (
    <OrderFlowContext.Provider value={{ startOrder, closePrompt }}>
      {children}
      <OrderLoginPromptModal
        open={showPrompt}
        pending={pending}
        onCancel={closePrompt}
        onLogin={goToLogin}
        onSignup={goToSignup}
      />
    </OrderFlowContext.Provider>
  )
}

export function useOrderFlow() {
  const ctx = useContext(OrderFlowContext)
  if (!ctx) throw new Error('useOrderFlow must be used within OrderFlowProvider')
  return ctx
}
