import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import type { Product } from '../../types'
import type { LandingCarouselRow } from '../../hooks/useLandingCarousel'
import type { ShopProductRow } from '../../utils/shopProductMapper'
import { supabase } from '../../lib/supabase'
import { ProductImage } from '../shop/ProductImage'
import { formatPrice } from '../../data/products'

interface LandingCarouselAdminPanelProps {
  rows: LandingCarouselRow[]
  shopRows: ShopProductRow[]
  products: Product[]
  usesDatabase: boolean
  onChanged: (message: string) => void
  onFailed: (message: string) => void
  onReload: () => void
}

export function LandingCarouselAdminPanel({
  rows,
  shopRows,
  products,
  usesDatabase,
  onChanged,
  onFailed,
  onReload,
}: LandingCarouselAdminPanelProps) {
  const [adding, setAdding] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)),
    [rows]
  )

  const inCarousel = useMemo(() => new Set(rows.map((r) => r.product_id)), [rows])

  const enabledIds = useMemo(
    () => new Set(shopRows.filter((r) => r.enabled).map((r) => r.id)),
    [shopRows]
  )

  const availableProducts = useMemo(
    () => products.filter((p) => enabledIds.has(p.id) && !inCarousel.has(p.id)),
    [products, enabledIds, inCarousel]
  )

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const handleAdd = async () => {
    if (!selectedId || !supabase || !usesDatabase) return
    setAdding(true)
    const maxOrder = rows.reduce((max, r) => Math.max(max, r.sort_order), -1)
    const { error } = await supabase.from('landing_carousel_items').insert({
      product_id: selectedId,
      sort_order: maxOrder + 1,
      enabled: true,
    })
    setAdding(false)
    if (error) {
      onFailed(error.message)
      return
    }
    setSelectedId('')
    onChanged('Product added to landing carousel.')
    onReload()
  }

  const handleRemove = async (row: LandingCarouselRow) => {
    if (!supabase || !usesDatabase) return
    const product = productById.get(row.product_id)
    const label = product?.name ?? row.product_id
    if (!window.confirm(`Remove "${label}" from the landing carousel?`)) return
    setBusy(row.id)
    const { error } = await supabase.from('landing_carousel_items').delete().eq('id', row.id)
    setBusy(null)
    if (error) {
      onFailed(error.message)
      return
    }
    onChanged(`Removed "${label}" from carousel.`)
    onReload()
  }

  const moveRow = async (row: LandingCarouselRow, direction: -1 | 1) => {
    if (!supabase || !usesDatabase) return
    const idx = sortedRows.findIndex((r) => r.id === row.id)
    const swap = sortedRows[idx + direction]
    if (!swap) return
    setBusy(row.id)
    const [a, b] = await Promise.all([
      supabase.from('landing_carousel_items').update({ sort_order: swap.sort_order }).eq('id', row.id),
      supabase.from('landing_carousel_items').update({ sort_order: row.sort_order }).eq('id', swap.id),
    ])
    setBusy(null)
    if (a.error || b.error) {
      onFailed(a.error?.message ?? b.error?.message ?? 'Could not reorder.')
      return
    }
    onChanged('Carousel order updated.')
    onReload()
  }

  const toggleEnabled = async (row: LandingCarouselRow) => {
    if (!supabase || !usesDatabase) return
    setBusy(row.id)
    const { error } = await supabase
      .from('landing_carousel_items')
      .update({ enabled: !row.enabled })
      .eq('id', row.id)
    setBusy(null)
    if (error) {
      onFailed(error.message)
      return
    }
    onChanged(row.enabled ? 'Slide hidden from carousel.' : 'Slide shown on carousel.')
    onReload()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-sm font-semibold text-white">Add to carousel</h2>
        <p className="mt-1 text-xs text-white/45">
          Pick premium products to feature on the landing page. Customers can tap a slide to open
          product details.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm">
            <span className="mb-1 block text-white/50">Product</span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={!usesDatabase}
              className="w-full rounded-lg border border-white/10 bg-midnight-900 px-3 py-2.5 text-sm text-white disabled:opacity-40"
            >
              <option value="">Select a product…</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {formatPrice(p.price)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!usesDatabase || !selectedId || adding || availableProducts.length === 0}
            onClick={() => void handleAdd()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add to carousel
          </button>
        </div>
        {!usesDatabase && (
          <p className="mt-2 text-xs text-amber-200/80">
            Run <code className="text-amber-100">supabase/schema-landing-carousel.sql</code> in the
            Supabase SQL Editor, then refresh this page.
          </p>
        )}
        {usesDatabase && availableProducts.length === 0 && (
          <p className="mt-2 text-xs text-white/40">All products are already in the carousel.</p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white">
          Carousel slides ({sortedRows.length})
        </h2>
        {sortedRows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/45">
            No carousel items yet. Add products above, or featured products will show as a fallback
            on the landing page.
          </p>
        ) : (
          sortedRows.map((row, idx) => {
            const product = productById.get(row.product_id)
            const isBusy = busy === row.id
            return (
              <div
                key={row.id}
                className={`flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center ${
                  !row.enabled ? 'opacity-55' : ''
                }`}
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                  {product ? (
                    <ProductImage product={product} className="h-full w-full" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/5 text-xs text-white/40">
                      Missing
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">
                    {product?.name ?? row.product_id}
                  </p>
                  <p className="text-xs text-white/45">
                    Order {row.sort_order + 1}
                    {product ? ` · ${formatPrice(product.price)}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isBusy || idx === 0}
                    onClick={() => void moveRow(row, -1)}
                    className="rounded-lg border border-white/10 p-2 text-white/70 hover:bg-white/5 disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isBusy || idx === sortedRows.length - 1}
                    onClick={() => void moveRow(row, 1)}
                    className="rounded-lg border border-white/10 p-2 text-white/70 hover:bg-white/5 disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void toggleEnabled(row)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/5"
                  >
                    {row.enabled ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleRemove(row)}
                    className="rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                    aria-label="Remove from carousel"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
