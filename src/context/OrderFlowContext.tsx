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
import { CartLoginPromptModal } from '../components/cart/CartLoginPromptModal'

export interface PendingOrder {
  productId?: string
  productName?: string
  productPrice?: number
  cartCheckout?: boolean
}

interface OrderFlowContextValue {
  startOrder: (pending?: PendingOrder) => void
  startCartCheckout: () => void
  closePrompt: () => void
  promptCartSignIn: () => void
  closeCartPrompt: () => void
}

const OrderFlowContext = createContext<OrderFlowContextValue | null>(null)

function buildOrderPath(options?: PendingOrder) {
  if (options?.cartCheckout) return '/order?cart=1'
  return options?.productId ? `/order?product=${options.productId}` : '/order'
}

export function OrderFlowProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showPrompt, setShowPrompt] = useState(false)
  const [pending, setPending] = useState<PendingOrder | null>(null)
  const [cartPromptOpen, setCartPromptOpen] = useState(false)

  const closePrompt = useCallback(() => {
    setShowPrompt(false)
    setPending(null)
  }, [])

  const startOrder = useCallback(
    (options?: PendingOrder) => {
      const orderPath = buildOrderPath(options)

      if (user) {
        navigate(orderPath)
        return
      }

      setPending(options ?? {})
      setShowPrompt(true)
    },
    [user, navigate]
  )

  const startCartCheckout = useCallback(() => {
    const orderPath = buildOrderPath({ cartCheckout: true })

    if (user) {
      navigate(orderPath)
      return
    }

    setPending({ cartCheckout: true })
    setShowPrompt(true)
  }, [user, navigate])

  const goToLogin = useCallback(() => {
    const orderPath = buildOrderPath(pending ?? undefined)
    setShowPrompt(false)
    navigate(`/login?redirect=${encodeURIComponent(orderPath)}`)
    setPending(null)
  }, [navigate, pending])

  const closeCartPrompt = useCallback(() => {
    setCartPromptOpen(false)
  }, [])

  const promptCartSignIn = useCallback(() => {
    if (user) return
    setCartPromptOpen(true)
  }, [user])

  const goToLoginFromCart = useCallback(() => {
    setCartPromptOpen(false)
    navigate(`/login?redirect=${encodeURIComponent('/shop')}`)
  }, [navigate])

  const goToSignup = useCallback(() => {
    const orderPath = buildOrderPath(pending ?? undefined)
    setShowPrompt(false)
    navigate(`/signup?redirect=${encodeURIComponent(orderPath)}`)
    setPending(null)
  }, [navigate, pending])

  return (
    <OrderFlowContext.Provider
      value={{ startOrder, startCartCheckout, closePrompt, promptCartSignIn, closeCartPrompt }}
    >
      {children}
      <OrderLoginPromptModal
        open={showPrompt}
        pending={pending}
        onCancel={closePrompt}
        onLogin={goToLogin}
        onSignup={goToSignup}
      />
      <CartLoginPromptModal
        open={cartPromptOpen}
        onCancel={closeCartPrompt}
        onLogin={goToLoginFromCart}
      />
    </OrderFlowContext.Provider>
  )
}

export function useOrderFlow() {
  const ctx = useContext(OrderFlowContext)
  if (!ctx) throw new Error('useOrderFlow must be used within OrderFlowProvider')
  return ctx
}
