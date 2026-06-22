import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CART_STORAGE_KEY, MAX_CART_QUANTITY } from '../constants/cart'
import { useAuth } from './AuthContext'

export interface CartLine {
  productId: string
  quantity: number
}

interface CartContextValue {
  items: CartLine[]
  lineCount: number
  itemCount: number
  addItem: (productId: string, quantity?: number) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextValue | null>(null)

function clampQuantity(qty: number) {
  return Math.min(MAX_CART_QUANTITY, Math.max(1, Math.floor(qty)))
}

function readStoredCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (row): row is CartLine =>
          typeof row === 'object' &&
          row !== null &&
          typeof (row as CartLine).productId === 'string' &&
          typeof (row as CartLine).quantity === 'number'
      )
      .map((row) => ({
        productId: row.productId,
        quantity: clampQuantity(row.quantity),
      }))
  } catch {
    return []
  }
}

function writeStoredCart(items: CartLine[]) {
  try {
    if (items.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY)
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  } catch {
    /* storage full or unavailable */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [items, setItems] = useState<CartLine[]>(() => readStoredCart())

  useEffect(() => {
    if (loading) return
    if (!user) {
      setItems([])
      try {
        localStorage.removeItem(CART_STORAGE_KEY)
      } catch {
        /* ignore */
      }
      return
    }
    setItems(readStoredCart())
  }, [user, loading])

  useEffect(() => {
    if (loading || !user) return
    writeStoredCart(items)
  }, [items, user, loading])

  const addItem = useCallback((productId: string, quantity = 1) => {
    const addQty = clampQuantity(quantity)
    setItems((prev) => {
      const idx = prev.findIndex((line) => line.productId === productId)
      if (idx === -1) return [...prev, { productId, quantity: addQty }]
      const next = [...prev]
      next[idx] = {
        productId,
        quantity: clampQuantity(next[idx].quantity + addQty),
      }
      return next
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((line) => line.productId !== productId))
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((line) => line.productId !== productId))
      return
    }
    const qty = clampQuantity(quantity)
    setItems((prev) =>
      prev.map((line) => (line.productId === productId ? { ...line, quantity: qty } : line))
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const isInCart = useCallback(
    (productId: string) => items.some((line) => line.productId === productId),
    [items]
  )

  const getQuantity = useCallback(
    (productId: string) => items.find((line) => line.productId === productId)?.quantity ?? 0,
    [items]
  )

  const lineCount = items.length
  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      lineCount,
      itemCount,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      isInCart,
      getQuantity,
    }),
    [items, lineCount, itemCount, addItem, removeItem, setQuantity, clearCart, isInCart, getQuantity]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
