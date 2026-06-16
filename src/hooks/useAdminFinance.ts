import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { products as staticProducts } from '../data/products'
import { supabase } from '../lib/supabase'
import {
  summarizeRevenue,
  summarizeCapitalSpent,
  readProductCapitalLocal,
  writeProductCapitalLocal,
  type OrderFinanceRow,
  type ProductCapitalRow,
} from '../utils/financeHelpers'

interface UseAdminFinanceResult {
  revenue: ReturnType<typeof summarizeRevenue>
  capitalSpent: ReturnType<typeof summarizeCapitalSpent>
  products: ProductCapitalRow[]
  capitalDrafts: Record<string, string>
  setCapitalDraft: (productId: string, value: string) => void
  capitalByProduct: Record<string, number>
  loading: boolean
  savingProductId: string | null
  savedProductId: string | null
  error: string
  /** capital_cost column exists and Supabase updates are enabled */
  usesDatabase: boolean
  /** shop_products exists but capital_cost column is missing — run schema-shop-finance.sql */
  schemaRequired: boolean
  saveProductCapital: (productId: string, rawValue: string) => Promise<void>
  reload: () => Promise<void>
}

function parseCapitalInput(value: string): number | null {
  const parsed = Number(value.replace(/,/g, '').trim())
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

function isMissingCapitalColumn(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('capital_cost') || lower.includes('does not exist')
}

function staticProductRows(localCapital: Record<string, number>): ProductCapitalRow[] {
  return staticProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    capital_cost: localCapital[p.id] ?? 0,
  }))
}

export function useAdminFinance(): UseAdminFinanceResult {
  const [orders, setOrders] = useState<OrderFinanceRow[]>([])
  const [products, setProducts] = useState<ProductCapitalRow[]>([])
  const [capitalDrafts, setCapitalDrafts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingProductId, setSavingProductId] = useState<string | null>(null)
  const [savedProductId, setSavedProductId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [usesDatabase, setUsesDatabase] = useState(false)
  const [schemaRequired, setSchemaRequired] = useState(false)
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const savedFlashRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    setSchemaRequired(false)
    setUsesDatabase(false)

    const localCapital = readProductCapitalLocal()

    if (!supabase) {
      const list = staticProductRows(localCapital)
      setProducts(list)
      setCapitalDrafts(Object.fromEntries(list.map((p) => [p.id, String(p.capital_cost)])))
      setOrders([])
      setLoading(false)
      return
    }

    const [ordersRes, productsRes] = await Promise.all([
      supabase.from('orders').select('product_id, amount, status, created_at'),
      supabase
        .from('shop_products')
        .select('id, name, price, capital_cost')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true }),
    ])

    if (ordersRes.error) {
      setError(ordersRes.error.message)
      setOrders([])
    } else {
      setOrders((ordersRes.data as OrderFinanceRow[]) ?? [])
    }

    if (productsRes.error) {
      if (isMissingCapitalColumn(productsRes.error.message)) {
        const { data: bareRows, error: bareError } = await supabase
          .from('shop_products')
          .select('id, name, price')
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true })

        if (bareError) {
          setError(bareError.message)
          const list = staticProductRows(localCapital)
          setProducts(list)
          setCapitalDrafts(Object.fromEntries(list.map((p) => [p.id, String(p.capital_cost)])))
        } else if ((bareRows ?? []).length > 0) {
          const list = bareRows!.map((row) => ({
            id: row.id,
            name: row.name,
            price: Number(row.price),
            capital_cost: localCapital[row.id] ?? 0,
          }))
          setProducts(list)
          setCapitalDrafts(Object.fromEntries(list.map((p) => [p.id, String(p.capital_cost)])))
          setSchemaRequired(true)
        } else {
          const list = staticProductRows(localCapital)
          setProducts(list)
          setCapitalDrafts(Object.fromEntries(list.map((p) => [p.id, String(p.capital_cost)])))
          setSchemaRequired(true)
        }
      } else {
        setError(productsRes.error.message)
        const list = staticProductRows(localCapital)
        setProducts(list)
        setCapitalDrafts(Object.fromEntries(list.map((p) => [p.id, String(p.capital_cost)])))
      }
    } else {
      const rows = (productsRes.data as ProductCapitalRow[]) ?? []
      if (rows.length > 0) {
        setUsesDatabase(true)
        const merged = rows.map((row) => ({
          ...row,
          price: Number(row.price),
          capital_cost: Number(row.capital_cost ?? localCapital[row.id] ?? 0),
        }))
        setProducts(merged)
        setCapitalDrafts(Object.fromEntries(merged.map((p) => [p.id, String(p.capital_cost)])))
        writeProductCapitalLocal(
          Object.fromEntries(merged.map((p) => [p.id, p.capital_cost]))
        )
      } else {
        const list = staticProductRows(localCapital)
        setProducts(list)
        setCapitalDrafts(Object.fromEntries(list.map((p) => [p.id, String(p.capital_cost)])))
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  const saveProductCapital = useCallback(
    async (productId: string, rawValue: string) => {
      const parsed = parseCapitalInput(rawValue)
      if (parsed === null) return

      const product = products.find((p) => p.id === productId)
      if (product && Number(product.capital_cost) === parsed) return

      setSavingProductId(productId)
      setError('')

      const local = readProductCapitalLocal()
      local[productId] = parsed
      writeProductCapitalLocal(local)

      if (supabase && usesDatabase) {
        const { error: updateError } = await supabase
          .from('shop_products')
          .update({ capital_cost: parsed })
          .eq('id', productId)

        if (updateError) {
          setError(updateError.message)
          setSavingProductId(null)
          return
        }
      } else if (schemaRequired) {
        setError(
          'Run supabase/schema-shop-finance.sql in the Supabase SQL Editor, then click Refresh.'
        )
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, capital_cost: parsed } : p))
      )
      setSavingProductId(null)
      if (!schemaRequired || usesDatabase) {
        setSavedProductId(productId)
        if (savedFlashRef.current) clearTimeout(savedFlashRef.current)
        savedFlashRef.current = setTimeout(() => setSavedProductId(null), 2000)
      }
    },
    [products, schemaRequired, usesDatabase]
  )

  const setCapitalDraft = useCallback(
    (productId: string, value: string) => {
      setCapitalDrafts((prev) => ({ ...prev, [productId]: value }))

      if (saveTimersRef.current[productId]) {
        clearTimeout(saveTimersRef.current[productId])
      }
      saveTimersRef.current[productId] = setTimeout(() => {
        void saveProductCapital(productId, value)
      }, 600)
    },
    [saveProductCapital]
  )

  useEffect(
    () => () => {
      Object.values(saveTimersRef.current).forEach(clearTimeout)
      if (savedFlashRef.current) clearTimeout(savedFlashRef.current)
    },
    []
  )

  const capitalByProduct = useMemo(() => {
    const map: Record<string, number> = {}
    for (const product of products) {
      const draft = capitalDrafts[product.id]
      const parsed = draft !== undefined ? parseCapitalInput(draft) : null
      map[product.id] = parsed ?? Number(product.capital_cost) ?? 0
    }
    return map
  }, [products, capitalDrafts])

  const revenue = useMemo(() => summarizeRevenue(orders), [orders])
  const capitalSpent = useMemo(
    () => summarizeCapitalSpent(orders, capitalByProduct),
    [orders, capitalByProduct]
  )

  return {
    revenue,
    capitalSpent,
    products,
    capitalDrafts,
    setCapitalDraft,
    capitalByProduct,
    loading,
    savingProductId,
    savedProductId,
    error,
    usesDatabase,
    schemaRequired,
    saveProductCapital,
    reload: loadAll,
  }
}
