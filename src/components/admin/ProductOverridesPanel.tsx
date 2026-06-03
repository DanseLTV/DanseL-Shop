import { useEffect, useMemo, useState } from 'react'
import { Save, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useProducts } from '../../hooks/useProducts'
import type { Product } from '../../types'
import { ProductCard } from '../shop/ProductCard'
import { ProductImageUploader } from './ProductImageUploader'

export function ProductOverridesPanel() {
  const { products, reload } = useProducts()
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? products[0],
    [products, selectedId]
  )

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    availability: 'In Stock',
    image: '',
  })

  useEffect(() => {
    if (!selected) return
    setForm({
      name: selected.name,
      description: selected.description,
      price: String(selected.price),
      duration: selected.duration,
      availability: selected.availability,
      image: selected.image ?? '',
    })
    setSuccess('')
    setError('')
  }, [selected?.id])

  const onSave = async () => {
    if (!supabase) {
      setError('Database is not configured.')
      return
    }
    if (!selected) return

    const priceNum = Number(form.price)
    if (form.price.trim() && (Number.isNaN(priceNum) || priceNum < 0)) {
      setError('Price must be a valid non-negative number.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: upsertError } = await supabase.from('product_overrides').upsert(
        {
          product_id: selected.id,
          name: form.name.trim() || null,
          description: form.description.trim() || null,
          price: form.price.trim() ? priceNum : null,
          duration: form.duration.trim() || null,
          availability: form.availability,
          image: form.image.trim() || null,
        },
        { onConflict: 'product_id' }
      )

      if (upsertError) {
        const lower = upsertError.message.toLowerCase()
        if (lower.includes('row-level security')) {
          setError('Save blocked: your account must have the admin role (profiles.role = admin).')
        } else if (lower.includes('does not exist')) {
          setError('Table product_overrides missing. Run supabase/schema-transaction-cms-fix.sql.')
        } else {
          setError(`Could not save: ${upsertError.message}`)
        }
        return
      }

      setSuccess('Saved. Customer cards update live on the shop.')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save product changes.')
    } finally {
      setSaving(false)
    }
  }

  if (!selected) return null

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-violet/50 focus:outline-none'

  // Live preview product reflecting the current (unsaved) form values
  const previewProduct: Product = {
    ...selected,
    name: form.name.trim() || selected.name,
    description: form.description.trim() || selected.description,
    price: Number(form.price) || selected.price,
    duration: form.duration.trim() || selected.duration,
    availability: (form.availability as Product['availability']) || selected.availability,
    image: form.image.trim() || selected.image,
    imageFit: 'cover',
  }

  return (
    <div className="glass-card mt-6 p-5">
      <h3 className="font-display text-lg font-semibold text-white">Edit Products (CMS)</h3>
      <p className="mt-1 text-xs text-white/50">
        Upload &amp; crop the card image, edit text and price, then preview exactly what customers
        see before saving.
      </p>

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {success && <p className="mt-3 text-sm text-emerald-300">{success}</p>}

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Editor */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-white/60">Product</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className={inputClass}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-midnight-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-white/60">Card Image</label>
            <ProductImageUploader
              productId={selected.id}
              value={form.image}
              onChange={(url) => {
                setForm((s) => ({ ...s, image: url }))
                setSuccess('Image uploaded. Click "Save Product Changes" to publish.')
              }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-white/60">Image URL (optional manual)</label>
            <input
              className={inputClass}
              value={form.image}
              onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
              placeholder="/products/brands/disney.svg or paste a URL"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">Name</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">Price</label>
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
              onChange={(e) => setForm((s) => ({ ...s, availability: e.target.value }))}
            >
              <option className="bg-midnight-900">In Stock</option>
              <option className="bg-midnight-900">Limited</option>
              <option className="bg-midnight-900">Out of Stock</option>
            </select>
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
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-accent-violet px-4 py-2 text-sm font-semibold text-white hover:bg-accent-violet/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save Product Changes'}
            </button>
          </div>
        </div>

        {/* Live customer-side preview */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/50">
            <Eye className="h-3.5 w-3.5" />
            Customer preview (live)
          </p>
          <div className="rounded-2xl border border-white/10 bg-midnight-950/60 p-4">
            <div className="pointer-events-none mx-auto max-w-[320px]">
              <ProductCard
                product={previewProduct}
                onViewDetails={() => {}}
                onOrder={() => {}}
              />
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-white/35">
            Updates as you type. Save to publish to the shop.
          </p>
        </div>
      </div>
    </div>
  )
}
