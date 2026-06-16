import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Product } from '../types'
import { supabase } from '../lib/supabase'
import { useProducts } from './useProducts'

export interface LandingCarouselRow {
  id: string
  product_id: string
  sort_order: number
  enabled: boolean
  created_at: string
}

export interface UseLandingCarouselOptions {
  includeDisabled?: boolean
}

export function useLandingCarousel(options?: UseLandingCarouselOptions) {
  const includeDisabled = options?.includeDisabled ?? false
  const { products, loading: productsLoading } = useProducts({
    includeDisabled: options?.includeDisabled,
  })
  const [rows, setRows] = useState<LandingCarouselRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [usesDatabase, setUsesDatabase] = useState(false)

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!supabase) {
        setLoading(false)
        return
      }
      if (!opts?.silent) setLoading(true)

      const { data, error: fetchError } = await supabase
        .from('landing_carousel_items')
        .select('id, product_id, sort_order, enabled, created_at')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (fetchError) {
        const lower = fetchError.message.toLowerCase()
        if (lower.includes('does not exist') || lower.includes('schema cache')) {
          setUsesDatabase(false)
          setRows([])
          setError('')
        } else {
          setError(fetchError.message)
        }
      } else {
        setUsesDatabase(true)
        setRows((data as LandingCarouselRow[]) ?? [])
        setError('')
      }

      if (!opts?.silent) setLoading(false)
    },
    []
  )

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const client = supabase
    if (!client) return

    const channelName = `landing-carousel-${Math.random().toString(36).slice(2)}`
    const channel = client
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'landing_carousel_items' },
        () => {
          void load({ silent: true })
        }
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [load])

  const visibleRows = useMemo(
    () => (includeDisabled ? rows : rows.filter((r) => r.enabled)),
    [rows, includeDisabled]
  )

  const carouselProducts = useMemo(() => {
    const resolved: Product[] = []
    for (const row of visibleRows) {
      const product = products.find((p) => p.id === row.product_id)
      if (product && product.availability !== 'Out of Stock') {
        resolved.push(product)
      }
    }
    return resolved
  }, [visibleRows, products])

  const fallbackProducts = useMemo(
    () => products.filter((p) => p.featured).slice(0, 6),
    [products]
  )

  const displayProducts = carouselProducts.length > 0 ? carouselProducts : fallbackProducts

  return {
    rows,
    products: displayProducts,
    usesDatabase,
    loading: loading || productsLoading,
    error,
    reload: load,
  }
}
