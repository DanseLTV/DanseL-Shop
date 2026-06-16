import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { useLandingCarousel } from '../../hooks/useLandingCarousel'
import { useProducts } from '../../hooks/useProducts'
import { LandingCarouselAdminPanel } from '../../components/admin/LandingCarouselAdminPanel'

export function AdminLandingCarouselPage() {
  const [notice, setNotice] = useState('')
  const [noticeError, setNoticeError] = useState('')
  const { rows, usesDatabase, loading, error, reload } = useLandingCarousel({
    includeDisabled: true,
  })
  const { products, shopRows } = useProducts({ includeDisabled: true })

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Landing Carousel</h1>
          <p className="mt-1 max-w-xl text-sm text-white/50">
            Manage premium product slides on the landing page. Changes go live immediately.
          </p>
        </div>
        <Link
          to="/?preview=1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
        >
          Preview landing
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {!usesDatabase && !loading && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p className="font-medium">Database setup required</p>
          <p className="mt-1 text-amber-200/80">
            Open Supabase → SQL Editor → paste and run{' '}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs text-amber-50">
              supabase/schema-landing-carousel.sql
            </code>
            , then refresh this page. Until then, featured products appear on the landing page.
          </p>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {noticeError && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {noticeError}
        </p>
      )}
      {notice && (
        <p className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {notice}
        </p>
      )}

      {loading && rows.length === 0 ? (
        <p className="text-sm text-white/50">Loading carousel…</p>
      ) : (
        <LandingCarouselAdminPanel
          rows={rows}
          shopRows={shopRows}
          products={products}
          usesDatabase={usesDatabase}
          onChanged={(msg) => {
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
    </div>
  )
}
