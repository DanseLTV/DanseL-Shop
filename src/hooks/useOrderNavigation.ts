import { useOrderFlow } from '../context/OrderFlowContext'
import type { Product } from '../types'

/** Start checkout — shows sign-in prompt for guests, else goes to order page */
export function useOrderNavigation() {
  const { startOrder } = useOrderFlow()

  return (productId?: string, product?: Pick<Product, 'name' | 'price'>) => {
    startOrder({
      productId,
      productName: product?.name,
      productPrice: product?.price,
    })
  }
}
