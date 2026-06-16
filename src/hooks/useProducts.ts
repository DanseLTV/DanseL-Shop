import { useCallback, useEffect, useMemo, useState } from 'react'
import { products as staticProducts } from '../data/products'
import type { Product } from '../types'
import { supabase } from '../lib/supabase'
import { shopRowToProduct, type ShopProductRow } from '../utils/shopProductMapper'

export interface ProductOverrideRow {
  product_id: string
  name: string | null
  description: string | null
  price: number | null
  duration: string | null
  availability: Product['availability'] | null
  image: string | null
}

export interface UseProductsOptions {
  /** Admin panel: include hidden/disabled products */
  includeDisabled?: boolean
}

function mergeLegacyOverrides(base: Product[], overrides: ProductOverrideRow[]): Product[] {
  if (!overrides.length) return base
  const map = new Map(overrides.map((o) => [o.product_id, o]))
  return base.map((p) => {
    const o = map.get(p.id)
    if (!o) return p
    const overrideImage =
      o.image != null && String(o.image).trim() !== '' ? String(o.image).trim() : null
    const image = overrideImage ?? p.image
    const overrideIsCustom =
      overrideImage != null && !overrideImage.startsWith('/products/')
    return {
      ...p,
      name: o.name?.trim() || p.name,
      description: o.description?.trim() || p.description,
      price: o.price != null && !Number.isNaN(Number(o.price)) ? Number(o.price) : p.price,
      duration: o.duration?.trim() || p.duration,
      availability: o.availability ?? p.availability,
      image,
      imageFit: overrideIsCustom ? 'cover' : p.imageFit ?? 'cover',
    }
  })
}

export function useProducts(options?: UseProductsOptions) {
  const includeDisabled = options?.includeDisabled ?? false
  const [shopRows, setShopRows] = useState<ShopProductRow[]>([])
  const [overrides, setOverrides] = useState<ProductOverrideRow[]>([])
  const [usesDatabase, setUsesDatabase] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAll = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!supabase) {
        setLoading(false)
        return
      }
      if (!opts?.silent) setLoading(true)

      const [productsRes, overridesRes] = await Promise.all([
        supabase
          .from('shop_products')
          .select(
            'id, name, category, description, price, duration, availability, featured, badge, features, image_gradient, image, image_fit, enabled, sort_order'
          )
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true }),
        supabase
          .from('product_overrides')
          .select('product_id, name, description, price, duration, availability, image'),
      ])

      if (productsRes.error) {
        const lower = productsRes.error.message.toLowerCase()
        if (lower.includes('does not exist')) {
          setUsesDatabase(false)
          setShopRows([])
        } else {
          setError(productsRes.error.message)
        }
      } else {
        setError('')
        const rows = (productsRes.data as ShopProductRow[]) ?? []
        setShopRows(rows)
        setUsesDatabase(rows.length > 0)
      }

      if (!overridesRes.error) {
        setOverrides((overridesRes.data as ProductOverrideRow[]) ?? [])
      } else {
        setOverrides([])
      }

      if (!opts?.silent) setLoading(false)
    },
    []
  )

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  useEffect(() => {
    const client = supabase
    if (!client) return

    // Unique channel name per hook instance — reusing a fixed name across
    // multiple mounted components makes Supabase throw
    // "cannot add 'postgres_changes' callbacks ... after subscribe()".
    const channelName = `shop-catalog-changes-${Math.random().toString(36).slice(2)}`

    const channel = client
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shop_products' },
        () => {
          void loadAll({ silent: true })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_overrides' },
        () => {
          void loadAll({ silent: true })
        }
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [loadAll])

  const products = useMemo(() => {
    let list: Product[]

    if (usesDatabase && shopRows.length > 0) {
      const visible = includeDisabled ? shopRows : shopRows.filter((row) => row.enabled)
      list = visible.map(shopRowToProduct)
    } else {
      list = staticProducts
    }

    return mergeLegacyOverrides(list, overrides)
  }, [shopRows, overrides, usesDatabase, includeDisabled])

  const allShopRows = shopRows

  return {
    products,
    shopRows: allShopRows,
    usesDatabase,
    overrides,
    loading,
    error,
    reload: loadAll,
  }
}
