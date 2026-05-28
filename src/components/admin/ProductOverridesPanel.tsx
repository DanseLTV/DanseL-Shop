import { useEffect, useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useProducts } from '../../hooks/useProducts'

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
  }, [selected?.id])

  const onSave = async () => {
    if (!supabase || !selected) return
    setSaving(true)
    setError('')
    setSuccess('')
    const { error: upsertError } = await supabase.from('product_overrides').upsert(
      {
        product_id: selected.id,
        name: form.name.trim() || null,
        description: form.description.trim() || null,
        price: Number(form.price) || null,
        duration: form.duration.trim() || null,
        availability: form.availability,
        image: form.image.trim() || null,
      },
      { onConflict: 'product_id' }
    )

    setSaving(false)
    if (upsertError) {
      setError(upsertError.message)
      return
    }
    setSuccess('Saved. Customer cards will update after refresh.')
    await reload()
  }

  if (!selected) return null

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent-violet/50 focus:outline-none'

  return (
    <div className="glass-card mt-6 p-5">
      <h3 className="font-display text-lg font-semibold text-white">Edit Products (CMS)</h3>
      <p className="mt-1 text-xs text-white/50">
        Edit card text, price, status, and image URL shown to customers.
      </p>

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {success && <p className="mt-3 text-sm text-emerald-300">{success}</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
          <label className="mb-1 block text-xs text-white/60">Image URL</label>
          <input
            className={inputClass}
            value={form.image}
            onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
            placeholder="/products/brands/disney.svg"
          />
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
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent-violet px-4 py-2 text-sm font-semibold text-white"
      >
        <Save className="h-4 w-4" />
        {saving ? 'Saving…' : 'Save Product Changes'}
      </button>
    </div>
  )
}
