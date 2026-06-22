import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useOrderFlow } from '../context/OrderFlowContext'
import type { Product } from '../types'

/** Adds to cart when signed in; otherwise opens the sign-in prompt. */
export function useGuardedAddToCart() {
  const { user } = useAuth()
  const { addItem } = useCart()
  const { promptCartSignIn } = useOrderFlow()

  return useCallback(
    (product: Product): boolean => {
      if (product.availability === 'Out of Stock') return false
      if (!user) {
        promptCartSignIn()
        return false
      }
      addItem(product.id)
      return true
    },
    [user, addItem, promptCartSignIn]
  )
}
