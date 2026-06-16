import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  CheckSquare,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Square,
  MoreVertical,
  Pencil,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { shopRowToProduct, type ShopProductRow } from '../../utils/shopProductMapper'
import type { Product } from '../../types'
import { isLocalProductImage } from '../../data/productImages'

type TriState = 'unchanged' | 'on' | 'off'

interface ProductBulkManagerProps {
  shopRows: ShopProductRow[]
  products: Product[]
  userId?: string
  disabled?: boolean
  onEdit: (id: string) => void
  onApplied: (message: string) => void
  onFailed: (message: string) => void
  onReload: () => Promise<void>
}

function triToBool(value: TriState): boolean | undefined {
  if (value === 'on') return true
  if (value === 'off') return false
  return undefined
}

export function ProductBulkManager({
  shopRows,
  products,
  userId,
  disabled,
  onEdit,
  onApplied,
  onFailed,
  onReload,
}: ProductBulkManagerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [bulkVisible, setBulkVisible] = useState<TriState>('unchanged')
  const [bulkFeatured, setBulkFeatured] = useState<TriState>('unchanged')
  const [applying, setApplying] = useState(false)

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const categories = useMemo(() => {
    const set = new Set(shopRows.map((r) => r.category))
    return ['All', ...Array.from(set).sort()]
  }, [shopRows])

  const filteredRows = useMemo(() => {
    if (categoryFilter === 'All') return shopRows
    return shopRows.filter((r) => r.category === categoryFilter)
  }, [shopRows, categoryFilter])

  const selectedCount = selected.size
  const filteredIds = useMemo(() => filteredRows.map((r) => r.id), [filteredRows])
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.has(id))

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      filteredIds.forEach((id) => next.add(id))
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  const selectAllVisible = () => {
    setSelected(new Set(shopRows.filter((r) => r.enabled).map((r) => r.id)))
  }

  const selectAllHidden = () => {
    setSelected(new Set(shopRows.filter((r) => !r.enabled).map((r) => r.id)))
  }

  useEffect(() => {
    if (!menuOpenId) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpenId])

  const applyBulk = async () => {
    if (!supabase) {
      onFailed('Database is not configured.')
      return
    }
    if (selectedCount === 0) {
      onFailed('Select at least one product card.')
      return
    }

    const enabled = triToBool(bulkVisible)
    const featured = triToBool(bulkFeatured)
    if (enabled === undefined && featured === undefined) {
      onFailed('Choose at least one change: Visible on shop or Featured on home.')
      return
    }

    setApplying(true)
    const client = supabase
    try {
      const ids = Array.from(selected)
      const payload: Record<string, unknown> = {
        ...(userId ? { updated_by: userId } : {}),
      }
      if (enabled !== undefined) payload.enabled = enabled
      if (featured !== undefined) payload.featured = featured

      const results = await Promise.all(
        ids.map((id) => client.from('shop_products').update(payload).eq('id', id))
      )

      const failed = results.find((r) => r.error)
      if (failed?.error) {
        onFailed(failed.error.message)
        return
      }

      const parts: string[] = []
      if (enabled !== undefined) parts.push(enabled ? 'shown on shop' : 'hidden from shop')
      if (featured !== undefined) parts.push(featured ? 'featured on home' : 'unfeatured on home')

      await onReload()
      setBulkVisible('unchanged')
      setBulkFeatured('unchanged')
      onApplied(`Updated ${ids.length} product(s): ${parts.join(', ')}.`)
    } catch (err) {
      onFailed(err instanceof Error ? err.message : 'Bulk update failed.')
    } finally {
      setApplying(false)
    }
  }

  if (shopRows.length === 0) return null

  const pillClass =
    'rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white'

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-semibold text-white">Quick card manager</h4>
          <p className="mt-0.5 text-xs text-white/45">
            Click cards to select · multi-select · apply Visible / Featured to many at once
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={selectAllFiltered} className={pillClass}>
            <CheckSquare className="mr-1 inline h-3.5 w-3.5" />
            Select {categoryFilter === 'All' ? 'all' : categoryFilter}
          </button>
          <button type="button" onClick={selectAllVisible} className={pillClass}>
            Select visible
          </button>
          <button type="button" onClick={selectAllHidden} className={pillClass}>
            Select hidden
          </button>
          {selectedCount > 0 && (
            <button type="button" onClick={clearSelection} className={pillClass}>
              Clear ({selectedCount})
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {filteredRows.map((row) => {
          const isSelected = selected.has(row.id)
          const display = productById.get(row.id) ?? shopRowToProduct(row)
          const thumb = display.image?.trim() || `/products/${row.id}.svg`
          const thumbIsLocal = isLocalProductImage(thumb)

          return (
            <div
              key={row.id}
              className={`relative rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_24px_rgba(52,211,153,0.22)]'
                  : 'border-white/15 bg-midnight-950/60 hover:border-emerald-400/35'
              }`}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleOne(row.id)}
                className="block w-full p-2 text-left disabled:opacity-50"
                aria-pressed={isSelected}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-midnight-900">
                  <img
                    src={thumb}
                    alt=""
                    className={`h-full w-full ${thumbIsLocal ? 'object-contain p-3' : 'object-cover'}`}
                  />
                  <span
                    className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-md border shadow-sm ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-500 text-white'
                        : 'border-white/25 bg-black/55 text-transparent'
                    }`}
                  >
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </span>
                </div>
                <p className="mt-2 truncate text-sm font-medium text-white">{row.name}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span
                    className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      row.enabled
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    {row.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    Shop
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      row.featured
                        ? 'bg-brand/20 text-brand-bright'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    Featured
                  </span>
                </div>
              </button>
              <div className="absolute right-2 top-2" ref={menuOpenId === row.id ? menuRef : undefined}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpenId((id) => (id === row.id ? null : row.id))
                  }}
                  className="rounded-md border border-white/15 bg-black/70 p-1.5 text-white/90 backdrop-blur-sm hover:bg-black/90"
                  aria-label={`Actions for ${row.name}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menuOpenId === row.id && (
                  <div className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] overflow-hidden rounded-lg border border-white/15 bg-midnight-950 py-1 shadow-xl">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpenId(null)
                        onEdit(row.id)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 text-brand-bright" />
                      Edit product
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedCount > 0 && (
        <div className="sticky bottom-2 z-10 mt-4 rounded-xl border border-emerald-400/35 bg-midnight-950/95 p-4 shadow-xl backdrop-blur-md">
          <p className="mb-3 text-sm font-medium text-white">
            {selectedCount} card{selectedCount === 1 ? '' : 's'} selected
            {allFilteredSelected && categoryFilter !== 'All' ? ` (${categoryFilter})` : ''}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-white/60">Visible on shop</legend>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['unchanged', 'No change', Square],
                    ['on', 'Show on shop', Eye],
                    ['off', 'Hide from shop', EyeOff],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBulkVisible(value)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      bulkVisible === value
                        ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-white/60">Featured on home</legend>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['unchanged', 'No change', Square],
                    ['on', 'Featured', Sparkles],
                    ['off', 'Not featured', Sparkles],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBulkFeatured(value)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      bulkFeatured === value
                        ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <button
            type="button"
            disabled={disabled || applying}
            onClick={() => void applyBulk()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 sm:w-auto"
          >
            {applying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying…
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4" />
                Apply to {selectedCount} selected
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
