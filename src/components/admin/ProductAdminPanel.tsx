import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Save,
  Eye,
  Copy,
  Plus,
  Trash2,
  EyeOff,
  Download,
  Loader2,
  ArrowLeft,
  Check,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../hooks/useProducts'
import type { Product } from '../../types'
import { ProductCard } from '../shop/ProductCard'
import { ProductImageUploader } from './ProductImageUploader'
import { ProductBulkManager } from './ProductBulkManager'
import { ToastBanner } from '../ui/ToastBanner'
import { buildDefaultShopProductRows } from '../../utils/seedShopProducts'
import {
  BADGE_OPTIONS,
  GRADIENT_PRESETS,
  PRODUCT_CATEGORIES,
  emptyProductForm,
  buildPreviewProduct,
  formToShopPayload,
  productToForm,
  shopRowToProduct,
  slugifyProductId,
  validateProductForm,
  type ProductFormState,
  type ShopProductRow,
} from '../../utils/shopProductMapper'

type EditorMode = 'edit' | 'create'
type AutoSaveStatus = 'idle' | 'saving' | 'saved'

export type ProductAdminVariant = 'full' | 'catalog' | 'editor' | 'import-only'

interface ProductAdminPanelProps {
  variant?: ProductAdminVariant
  editProductId?: string
}

export function ProductAdminPanel({
  variant = 'full',
  editProductId,
}: ProductAdminPanelProps = {}) {
  const isEditorOnly = variant === 'editor'
  const isImportOnly = variant === 'import-only'
  const showBulk = variant === 'full'
  const { user } = useAuth()
  const { products, shopRows, usesDatabase, loading, error: loadError, reload } = useProducts({
    includeDisabled: true,
  })

  const [selectedId, setSelectedId] = useState('')
  const [mode, setMode] = useState<EditorMode>('edit')
  const lastLoadedKey = useRef<string | null>(null)
  const lastSavedFormJson = useRef<string>('')
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedFlashRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saving, setSaving] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle')
  const [importing, setImporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copyFromId, setCopyFromId] = useState('')
  const [form, setForm] = useState<ProductFormState>(emptyProductForm())

  const selectedRow = useMemo(
    () => shopRows.find((r) => r.id === selectedId) ?? shopRows[0],
    [shopRows, selectedId]
  )

  const selectedProduct = useMemo(() => {
    if (mode === 'create') return null
    return products.find((p) => p.id === selectedId) ?? (selectedRow ? shopRowToProduct(selectedRow) : products[0])
  }, [mode, products, selectedId, selectedRow])

  useEffect(() => {
    if (isEditorOnly) return
    if (mode === 'create') return
    if (shopRows.length === 0) return
    if (!selectedId || !shopRows.some((r) => r.id === selectedId)) {
      setSelectedId(shopRows[0].id)
    }
  }, [shopRows, selectedId, mode, isEditorOnly])

  useEffect(() => {
    if (mode !== 'edit' || !selectedRow || !selectedProduct) return
    const key = selectedRow.id
    if (key === lastLoadedKey.current) return
    lastLoadedKey.current = key
    const nextForm = productToForm(selectedProduct, {
      enabled: selectedRow.enabled,
      sortOrder: selectedRow.sort_order,
      storedImage: selectedRow.image,
      imageFit: selectedRow.image_fit ?? selectedProduct.imageFit,
    })
    setForm(nextForm)
    lastSavedFormJson.current = JSON.stringify(nextForm)
    setAutoSaveStatus('idle')
    setSuccess('')
    setError('')
  }, [selectedRow, selectedProduct, mode])

  useEffect(
    () => () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
      if (savedFlashRef.current) clearTimeout(savedFlashRef.current)
    },
    []
  )

  const copyCandidates = useMemo(
    () =>
      mode === 'edit' && selectedProduct
        ? products.filter((p) => p.id !== selectedProduct.id && Boolean(p.image?.trim()))
        : products.filter((p) => Boolean(p.image?.trim())),
    [products, selectedProduct, mode]
  )

  const copySource = useMemo(
    () => copyCandidates.find((p) => p.id === copyFromId) ?? copyCandidates[0],
    [copyCandidates, copyFromId]
  )

  useEffect(() => {
    if (copyCandidates.length === 0) {
      setCopyFromId('')
      return
    }
    if (!copyFromId || !copyCandidates.some((p) => p.id === copyFromId)) {
      setCopyFromId(copyCandidates[0].id)
    }
  }, [copyCandidates, copyFromId])

  const startCreate = () => {
    lastLoadedKey.current = null
    setMode('create')
    setForm(emptyProductForm())
    setSelectedId('')
    setSuccess('')
    setError('')
  }

  const startEdit = (id: string) => {
    setMode('edit')
    lastLoadedKey.current = null
    setSelectedId(id)
  }

  useEffect(() => {
    if (!isEditorOnly || !editProductId) return
    if (editProductId === 'new') {
      lastLoadedKey.current = null
      setMode('create')
      setForm(emptyProductForm())
      setSelectedId('')
      return
    }
    if (shopRows.some((r) => r.id === editProductId)) {
      startEdit(editProductId)
    }
  }, [isEditorOnly, editProductId, shopRows])

  const importDefaultCatalog = async () => {
    if (!supabase) {
      setError('Database is not configured.')
      return
    }
    setImporting(true)
    setError('')
    setSuccess('')
    try {
      const rows = buildDefaultShopProductRows().map((row) => ({
        ...row,
        ...(user?.id ? { updated_by: user.id } : {}),
      }))
      const { error: upsertError } = await supabase
        .from('shop_products')
        .upsert(rows, { onConflict: 'id' })

      if (upsertError) {
        const lower = upsertError.message.toLowerCase()
        if (lower.includes('does not exist')) {
          setError('Table shop_products missing. Run supabase/schema-shop-products.sql in Supabase.')
        } else if (lower.includes('row-level security')) {
          setError('Import blocked: your account needs profiles.role = admin.')
        } else {
          setError(`Import failed: ${upsertError.message}`)
        }
        return
      }

      await reload({ silent: true })
      setSuccess('Default catalog imported. You can now edit, add, or delete products.')
      setMode('edit')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not import catalog.')
    } finally {
      setImporting(false)
    }
  }

  const markAutoSaved = (nextForm: ProductFormState) => {
    lastSavedFormJson.current = JSON.stringify(nextForm)
    setAutoSaveStatus('saved')
    if (savedFlashRef.current) clearTimeout(savedFlashRef.current)
    savedFlashRef.current = setTimeout(() => setAutoSaveStatus('idle'), 2000)
  }

  const performSave = async (options?: { silent?: boolean }) => {
    if (!supabase) {
      if (!options?.silent) setError('Database is not configured.')
      return false
    }

    const validation = validateProductForm(form, mode === 'create')
    if (validation) {
      if (!options?.silent) setError(validation)
      else setAutoSaveStatus('idle')
      return false
    }

    setSaving(true)
    if (!options?.silent) {
      setError('')
      setSuccess('')
    }
    if (options?.silent) setAutoSaveStatus('saving')

    const payload = formToShopPayload(form, user?.id)

    try {
      if (mode === 'create') {
        const { error: insertError } = await supabase.from('shop_products').insert(payload)
        if (insertError) {
          if (insertError.message.toLowerCase().includes('duplicate')) {
            setError('A product with this ID already exists. Choose a different ID.')
          } else {
            setError(`Could not create product: ${insertError.message}`)
          }
          return false
        }
        await reload({ silent: true })
        setMode('edit')
        lastLoadedKey.current = null
        setSelectedId(payload.id)
        setSuccess('Product created. It is live on the shop (if enabled).')
        markAutoSaved(form)
        return true
      }

      const { data, error: updateError } = await supabase
        .from('shop_products')
        .update(payload)
        .eq('id', payload.id)
        .select('*')
        .single()

      if (updateError) {
        setError(`Could not save: ${updateError.message}`)
        setAutoSaveStatus('idle')
        return false
      }

      let nextForm = form
      if (data) {
        const row = data as ShopProductRow
        const savedProduct = shopRowToProduct(row)
        nextForm = productToForm(savedProduct, {
          enabled: row.enabled,
          sortOrder: row.sort_order,
          storedImage: row.image,
          imageFit: row.image_fit ?? savedProduct.imageFit,
        })
        setForm(nextForm)
      }

      markAutoSaved(nextForm)
      if (!options?.silent) {
        setSuccess('Saved. Customer shop updates live.')
      }
      await reload({ silent: true })
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save product.')
      setAutoSaveStatus('idle')
      return false
    } finally {
      setSaving(false)
    }
  }

  const onSave = async () => {
    await performSave()
  }

  useEffect(() => {
    if (mode !== 'edit' || !form.id) return

    const json = JSON.stringify(form)
    if (json === lastSavedFormJson.current) return

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      void performSave({ silent: true })
    }, 700)

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [form, mode])

  const setEnabled = async (enabled: boolean) => {
    if (!supabase || mode !== 'edit' || !form.id) return
    setSaving(true)
    setError('')
    try {
      const { error: updateError } = await supabase
        .from('shop_products')
        .update({ enabled, ...(user?.id ? { updated_by: user.id } : {}) })
        .eq('id', form.id)

      if (updateError) {
        setError(updateError.message)
        return
      }
      const nextForm = { ...form, enabled }
      setForm(nextForm)
      markAutoSaved(nextForm)
      setSuccess(enabled ? 'Product is visible on the shop again.' : 'Product hidden from customer shop.')
      await reload({ silent: true })
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async () => {
    if (!supabase || mode !== 'edit' || !form.id) return
    if (
      !window.confirm(
        `Permanently delete "${form.name}"?\n\nThis cannot be undone. Existing orders keep their snapshot.`
      )
    ) {
      return
    }

    setDeleting(true)
    setError('')
    try {
      const { error: deleteError } = await supabase.from('shop_products').delete().eq('id', form.id)
      if (deleteError) {
        setError(`Could not delete: ${deleteError.message}`)
        return
      }
      await reload({ silent: true })
      lastLoadedKey.current = null
      setSuccess('Product deleted permanently.')
      setMode('edit')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete product.')
    } finally {
      setDeleting(false)
    }
  }

  const copyImageFromProduct = () => {
    if (!copySource?.image) {
      setError('That product has no card image to copy.')
      return
    }
    setError('')
    setForm((s) => ({
      ...s,
      image: copySource.image ?? '',
      imageFit: copySource.imageFit ?? 'cover',
    }))
    setSuccess(`Copied card image from ${copySource.name}. Auto-saving…`)
  }

  const onNameBlur = () => {
    if (mode !== 'create' || form.id.trim()) return
    const slug = slugifyProductId(form.name)
    if (slug) setForm((s) => ({ ...s, id: slug }))
  }

  const inputClass =
    'w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder-white/40 focus:border-emerald-400/60 focus:ring-1 focus:ring-emerald-400/30 focus:outline-none'

  const previewProduct = useMemo(
    () => buildPreviewProduct(form, mode === 'edit' ? selectedProduct : null),
    [form, mode, selectedProduct]
  )

  if (loading && shopRows.length === 0 && !usesDatabase && !isImportOnly) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/50">
        Loading product catalog…
      </div>
    )
  }

  if (isImportOnly) {
    return (
      <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4">
        <p className="text-sm text-amber-100/90">Import your catalog into Supabase first.</p>
        <button
          type="button"
          onClick={importDefaultCatalog}
          disabled={importing}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand-bright/35 bg-brand-bright/10 px-3 py-2 text-sm font-medium text-brand-bright hover:bg-brand-bright/20 disabled:opacity-50"
        >
          {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Import default catalog
        </button>
        {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
        {success && <p className="mt-2 text-sm text-emerald-300">{success}</p>}
      </div>
    )
  }

  const shellClass = isEditorOnly
    ? 'flex h-full flex-col overflow-hidden'
    : 'glass-card mt-6 p-5'

  return (
    <div className={shellClass}>
      <div className="flex flex-wrap items-start justify-between gap-3 shrink-0">
        <div>
          {isEditorOnly ? (
            <Link
              to="/admin/products"
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-brand-bright"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to products
            </Link>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-lg font-semibold text-white">
              {isEditorOnly
                ? mode === 'create'
                  ? 'Add product'
                  : `Edit: ${form.name || selectedProduct?.name || 'Product'}`
                : 'Product Catalog (Admin)'}
            </h3>
            {mode === 'edit' && (
              <span className="text-xs text-white/45">
                {autoSaveStatus === 'saving' ? (
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Auto-saving…
                  </span>
                ) : autoSaveStatus === 'saved' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                    Saved
                  </span>
                ) : (
                  'Changes save automatically'
                )}
              </span>
            )}
          </div>
          {!isEditorOnly && (
            <p className="mt-1 text-xs text-white/50">
              Add, edit, hide, or delete products. Controls everything customers see on the shop.
            </p>
          )}
        </div>
        {!isEditorOnly && (
          <div className="flex flex-wrap gap-2">
            {(!usesDatabase || shopRows.length === 0) && (
              <button
                type="button"
                onClick={importDefaultCatalog}
                disabled={importing}
                className="inline-flex items-center gap-2 rounded-lg border border-brand-bright/35 bg-brand-bright/10 px-3 py-2 text-sm font-medium text-brand-bright hover:bg-brand-bright/20 disabled:opacity-50"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Import default catalog
              </button>
            )}
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand/90"
            >
              <Plus className="h-4 w-4" />
              Add product
            </button>
          </div>
        )}
      </div>

      {loadError && (
        <p className="mt-3 text-sm text-red-300">
          {loadError.includes('does not exist')
            ? 'Run supabase/schema-shop-products.sql in Supabase, then click Import default catalog.'
            : `Could not load products: ${loadError}`}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-status-error">{error}</p>}
      {success && <p className="mt-3 text-sm text-status-success">{success}</p>}
      {success && (
        <ToastBanner message={success} variant="success" onDismiss={() => setSuccess('')} />
      )}
      {error && (
        <ToastBanner message={error} variant="error" onDismiss={() => setError('')} />
      )}

      {!usesDatabase && shopRows.length === 0 && (
        <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100/90">
          <p className="font-medium">Database catalog not set up yet</p>
          <p className="mt-1 text-xs text-amber-100/70">
            Click <strong>Import default catalog</strong> to load all current products into Supabase.
            After that, add/edit/delete from here — no code changes needed.
          </p>
        </div>
      )}

      {showBulk && shopRows.length > 0 && (
        <ProductBulkManager
          shopRows={shopRows}
          products={products}
          userId={user?.id}
          disabled={saving || importing || deleting}
          onEdit={startEdit}
          onApplied={(msg) => {
            setError('')
            setSuccess(msg)
            lastLoadedKey.current = null
          }}
          onFailed={(msg) => {
            setSuccess('')
            setError(msg)
          }}
          onReload={() => reload({ silent: true })}
        />
      )}

      <div
        className={`mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr] ${
          isEditorOnly ? 'min-h-0 flex-1 scroll-y' : ''
        }`}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {!isEditorOnly && mode === 'edit' && shopRows.length > 0 && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-white/60">Select product</label>
              <select
                value={selectedId}
                onChange={(e) => startEdit(e.target.value)}
                className={inputClass}
              >
                {shopRows.map((row) => (
                  <option key={row.id} value={row.id} className="bg-midnight-900">
                    {row.enabled ? row.name : `${row.name} (hidden)`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === 'create' && (
            <div className="sm:col-span-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
              Creating new product — fill in details, then click Create product.
            </div>
          )}

          <div className={mode === 'create' ? 'sm:col-span-2' : ''}>
            <label className="mb-1 block text-xs text-white/60">Product ID (URL slug)</label>
            <input
              className={inputClass}
              value={form.id}
              onChange={(e) => setForm((s) => ({ ...s, id: e.target.value.toLowerCase() }))}
              disabled={mode === 'edit'}
              placeholder="e.g. disney-plus-shared"
            />
          </div>

          {mode === 'edit' && (
            <div>
              <label className="mb-1 block text-xs text-white/60">Sort order</label>
              <input
                type="number"
                className={inputClass}
                value={form.sortOrder}
                onChange={(e) => setForm((s) => ({ ...s, sortOrder: e.target.value }))}
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-white/60">Name</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              onBlur={onNameBlur}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Category</label>
            <input
              list="product-category-options"
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
            />
            <datalist id="product-category-options">
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Badge</label>
            <select
              className={inputClass}
              value={form.badge}
              onChange={(e) => setForm((s) => ({ ...s, badge: e.target.value }))}
            >
              {BADGE_OPTIONS.map((b) => (
                <option key={b || 'none'} value={b} className="bg-midnight-900">
                  {b || 'None'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Price (₱)</label>
            <input
              type="number"
              className={inputClass}
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Duration</label>
            <input
              className={inputClass}
              value={form.duration}
              onChange={(e) => setForm((s) => ({ ...s, duration: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Availability</label>
            <select
              className={inputClass}
              value={form.availability}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  availability: e.target.value as Product['availability'],
                }))
              }
            >
              <option className="bg-midnight-900">In Stock</option>
              <option className="bg-midnight-900">Limited</option>
              <option className="bg-midnight-900">Out of Stock</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Image fit</label>
            <select
              className={inputClass}
              value={form.imageFit}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  imageFit: e.target.value as Product['imageFit'],
                }))
              }
            >
              <option value="cover" className="bg-midnight-900">
                Cover (cropped card)
              </option>
              <option value="logo" className="bg-midnight-900">
                Logo (centered)
              </option>
            </select>
          </div>

          <div className="sm:col-span-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] text-white/45">
            <strong className="text-white/60">Show on shop</strong> — product appears on{' '}
            <code className="text-brand">/shop</code>.{' '}
            <strong className="text-white/60">Featured on About</strong> — highlighted on{' '}
            <code className="text-brand">/home</code> featured section.
          </div>

          <div className="sm:col-span-2 flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((s) => ({ ...s, featured: e.target.checked }))}
                className="h-4 w-4 rounded border-white/25 bg-white/5 accent-emerald-500"
              />
              Featured on About (/home)
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm((s) => ({ ...s, enabled: e.target.checked }))}
                className="h-4 w-4 rounded border-white/25 bg-white/5 accent-emerald-500"
              />
              Show on shop (/shop)
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-white/60">Card image</label>
            <ProductImageUploader
              productId={form.id || 'new-product'}
              value={form.image}
              onChange={(url) => {
                setForm((s) => ({
                  ...s,
                  image: url,
                  imageFit: url.startsWith('/products/') ? s.imageFit : 'cover',
                }))
                setSuccess('Image uploaded. Auto-saving…')
              }}
            />
          </div>

          {copyCandidates.length > 0 && (
            <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <label className="mb-2 block text-xs text-white/60">Copy card image from another product</label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {copySource?.image && (
                    <img
                      src={copySource.image}
                      alt=""
                      className="h-12 w-[4.8rem] shrink-0 rounded-md object-cover ring-1 ring-white/10"
                    />
                  )}
                  <select
                    value={copyFromId || copySource?.id || ''}
                    onChange={(e) => setCopyFromId(e.target.value)}
                    className={inputClass}
                  >
                    {copyCandidates.map((p) => (
                      <option key={p.id} value={p.id} className="bg-midnight-900">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={copyImageFromProduct}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-brand-bright/35 bg-brand-bright/10 px-4 py-2 text-sm font-medium text-brand-bright hover:bg-brand-bright/20"
                >
                  <Copy className="h-4 w-4" />
                  Copy image
                </button>
              </div>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-white/60">Image URL (manual)</label>
            <input
              className={inputClass}
              value={form.image}
              onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
              placeholder="/products/brands/disney.svg or Supabase URL"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-white/60">Card gradient (Tailwind classes)</label>
            <input
              className={inputClass}
              value={form.imageGradient}
              onChange={(e) => setForm((s) => ({ ...s, imageGradient: e.target.value }))}
              list="gradient-presets"
            />
            <datalist id="gradient-presets">
              {GRADIENT_PRESETS.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-white/60">Description</label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-white/60">Features (one per line)</label>
            <textarea
              rows={4}
              className={`${inputClass} resize-none font-mono text-xs`}
              value={form.featuresText}
              onChange={(e) => setForm((s) => ({ ...s, featuresText: e.target.value }))}
            />
          </div>

          <div className="sm:col-span-2 flex flex-wrap gap-2">
            {mode === 'create' && (
              <button
                type="button"
                onClick={onSave}
                disabled={saving || deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Creating…' : 'Create product'}
              </button>
            )}

            {mode === 'edit' && form.id && (
              <>
                <button
                  type="button"
                  onClick={() => void setEnabled(!form.enabled)}
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 disabled:opacity-50"
                >
                  {form.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {form.enabled ? 'Hide from shop' : 'Show on shop'}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteProduct()}
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? 'Deleting…' : 'Delete permanently'}
                </button>
              </>
            )}

            {mode === 'create' && (
              <button
                type="button"
                onClick={() => {
                  setMode('edit')
                  if (shopRows[0]) startEdit(shopRows[0].id)
                }}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/50">
            <Eye className="h-3.5 w-3.5" />
            Customer preview (live)
          </p>
          <div className="rounded-2xl border border-white/10 bg-midnight-950/60 p-4">
            <div className="pointer-events-none mx-auto max-w-[320px]">
              <ProductCard
                key={`${previewProduct.id}-${previewProduct.image ?? ''}-${previewProduct.imageFit}`}
                product={previewProduct}
                priorityImage
                onViewDetails={() => {}}
                onOrder={() => {}}
              />
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-white/40">
            Matches customer shop cards. Edits auto-save in edit mode.
          </p>

          {!isEditorOnly && mode === 'edit' && shopRows.length > 0 && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                All products ({shopRows.length})
              </p>
              <ul className="max-h-40 space-y-1 scroll-y text-xs">
                {shopRows.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => startEdit(row.id)}
                      className={`w-full rounded-md px-2 py-1.5 text-left transition-colors ${
                        row.id === selectedId && mode === 'edit'
                          ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40'
                          : 'text-white/65 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {row.name}
                      {!row.enabled && (
                        <span className="ml-1 text-[10px] text-amber-300/80">hidden</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {isEditorOnly && (
        <div className="sticky bottom-0 z-20 -mx-1 mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 bg-midnight-950/95 py-3 backdrop-blur-xl">
          {mode === 'create' ? (
            <button
              type="button"
              onClick={onSave}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Creating…' : 'Create product'}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-white/55">
              {autoSaveStatus === 'saving' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                  Auto-saving…
                </>
              ) : autoSaveStatus === 'saved' ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  Saved
                </>
              ) : (
                'Changes save automatically'
              )}
            </span>
          )}
          {mode === 'edit' && form.id && (
            <button
              type="button"
              onClick={() => void setEnabled(!form.enabled)}
              disabled={saving || deleting}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80"
            >
              {form.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {form.enabled ? 'Hide from shop' : 'Show on shop'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
