import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../hooks/useProducts'
import { ProductBulkManager } from '../../components/admin/ProductBulkManager'
import { ProductAdminPanel } from '../../components/admin/ProductAdminPanel'

/** Catalog grid + bulk actions only — edit opens separate page. */
export function AdminProductsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notice, setNotice] = useState('')
  const [noticeError, setNoticeError] = useState('')
  const { products, shopRows, usesDatabase, loading, error: loadError, reload } = useProducts({
    includeDisabled: true,
  })

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <p className="text-sm text-white/50">
          Click cards to select · <span className="text-white/70">⋮</span> menu to edit one product
        </p>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <div className="min-h-0 flex-1 scroll-y p-4">
        {noticeError && (
          <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {noticeError}
          </p>
        )}
        {notice && (
          <p className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {notice}
          </p>
        )}
        {loadError && (
          <p className="mb-3 text-sm text-red-300">
            {loadError.includes('does not exist')
              ? 'Run supabase/schema-shop-products.sql, then import catalog below.'
              : loadError}
          </p>
        )}

        {loading && shopRows.length === 0 ? (
          <p className="text-sm text-white/50">Loading products…</p>
        ) : (
          <>
            {(!usesDatabase || shopRows.length === 0) && (
              <div className="mb-4">
                <ProductAdminPanel variant="import-only" />
              </div>
            )}
            {shopRows.length > 0 && (
              <ProductBulkManager
                shopRows={shopRows}
                products={products}
                userId={user?.id}
                onEdit={(id) => navigate(`/admin/products/${id}`)}
                onApplied={(msg) => {
                  setNoticeError('')
                  setNotice(msg)
                }}
                onFailed={(msg) => {
                  setNotice('')
                  setNoticeError(msg)
                }}
                onReload={() => reload({ silent: true })}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
