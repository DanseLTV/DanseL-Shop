import { useOrderFlow } from '../context/OrderFlowContext'

/** Go to multi-item checkout — sign-in prompt for guests */
export function useCartCheckout() {
  const { startCartCheckout } = useOrderFlow()
  return startCartCheckout
}
