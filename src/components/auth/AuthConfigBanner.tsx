import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export function AuthConfigBanner() {
  return (
    <div className="mb-6 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-medium">Auth not configured yet</p>
        <p className="mt-1 text-amber-200/80">
          Add <code className="rounded bg-black/20 px-1">VITE_SUPABASE_URL</code> and{' '}
          <code className="rounded bg-black/20 px-1">VITE_SUPABASE_ANON_KEY</code> in Vercel
          environment variables. See{' '}
          <Link to="/policies" className="underline">
            setup guide
          </Link>{' '}
          in AUTH_SETUP.md on GitHub.
        </p>
      </div>
    </div>
  )
}
