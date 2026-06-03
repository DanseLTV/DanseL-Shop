import { useCallback, useEffect, useMemo, useState } from 'react'
import { products as baseProducts } from '../data/products'
import type { Product } from '../types'
import { supabase } from '../lib/supabase'

export interface ProductOverrideRow {
  product_id: string
  name: string | null
  description: string | null
  price: number | null
  duration: string | null
  availability: Product['availability'] | null
  image: string | null
}

function mergeProducts(base: Product[], overrides: ProductOverrideRow[]): Product[] {
  if (!overrides.length) return base
  const map = new Map(overrides.map((o) => [o.product_id, o]))
  return base.map((p) => {
    const o = map.get(p.id)
    if (!o) return p
    return {
      ...p,
      name: o.name ?? p.name,
      description: o.description ?? p.description,
      price: o.price ?? p.price,
      duration: o.duration ?? p.duration,
      availability: o.availability ?? p.availability,
      image: o.image ?? p.image,
      imageFit: 'cover',
    }
  })
}

export function useProducts() {
  const [overrides, setOverrides] = useState<ProductOverrideRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOverrides = useCallback(async (options?: { silent?: boolean }) => {
    if (!supabase) {
      setLoading(false)
      return
    }
    if (!options?.silent) setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('product_overrides')
      .select('product_id, name, description, price, duration, availability, image')

    if (fetchError) {
      setError(fetchError.message)
      setOverrides([])
    } else {
      setError('')
      setOverrides((data as ProductOverrideRow[]) ?? [])
    }
    if (!options?.silent) setLoading(false)
  }, [])

  useEffect(() => {
    loadOverrides()
  }, [loadOverrides])

  // Live updates: when admin saves a product, every open shop refreshes automatically.
  useEffect(() => {
    const client = supabase
    if (!client) return

    const channel = client
      .channel('product-overrides-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_overrides' },
        () => {
          void loadOverrides({ silent: true })
        }
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [loadOverrides])

  const products = useMemo(() => mergeProducts(baseProducts, overrides), [overrides])

  return {
    products,
    overrides,
    loading,
    error,
    reload: loadOverrides,
  }
}
