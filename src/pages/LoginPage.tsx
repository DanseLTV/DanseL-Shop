import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, LogIn, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GradientButton } from '../components/ui/GradientButton'
import { AuthConfigBanner } from '../components/auth/AuthConfigBanner'
import { AuthPageShell } from '../components/auth/AuthPageShell'
import { isAdminEmail, markAdminWelcomeToast } from '../constants/admin'
import { isEmailNotConfirmedError } from '../utils/authErrors'
import { isAccountVerified } from '../utils/authHelpers'

export function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loginEmail, setLoginEmail] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [loading, setLoading] = useState(false)
  const { signIn, resendConfirmationEmail, isConfigured, user, profile, isAdmin, loading: authLoading } =
    useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/shop'

  const needsEmailConfirmation = Boolean(error && isEmailNotConfirmedError(error))

  const loginSubtitle = (() => {
    const dest = searchParams.get('redirect')
    if (dest?.includes('/order') && !dest?.includes('/orders')) {
      return 'Sign in to complete your order'
    }
    if (dest?.includes('/orders')) return 'Sign in to view your orders and messages'
    if (dest?.includes('/account')) return 'Sign in to manage your account'
    return 'Sign in with your username or email to shop and track orders'
  })()

  const goAfterLogin = useCallback(
    (
      resolvedEmail: string | null | undefined,
      signedInEmail?: string | null,
      options?: { showAdminToast?: boolean }
    ) => {
      const email = resolvedEmail ?? signedInEmail ?? user?.email ?? null
      const dest = decodeURIComponent(redirect)
      const adminLogin = isAdminEmail(email) || isAdmin

      if (adminLogin) {
        const adminDest = dest.startsWith('/admin') ? dest : '/admin'
        if (options?.showAdminToast) {
          markAdminWelcomeToast()
        }
        navigate(adminDest, { replace: true, state: { adminWelcome: options?.showAdminToast } })
        return
      }

      navigate(dest, { replace: true })
    },
    [navigate, redirect, user?.email, isAdmin]
  )

  useEffect(() => {
    if (!loading) return
    const watchdog = setTimeout(() => {
      setLoading(false)
      setError((prev) =>
        prev || 'Login is taking too long. Refresh the page (Ctrl+Shift+R) and try again.'
      )
    }, 12000)
    return () => clearTimeout(watchdog)
  }, [loading])

  useEffect(() => {
    if (authLoading) return
    if (user && isAccountVerified(profile, user)) {
      goAfterLogin(user.email, user.email)
    }
  }, [authLoading, user, profile, goAfterLogin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResendStatus('idle')
    setLoginEmail(null)
    setLoading(true)

    try {
      const { error: err, loginEmail: resolvedEmail, user: signedInUser } = await signIn(
        identifier,
        password
      )

      if (resolvedEmail) setLoginEmail(resolvedEmail)

      if (err) {
        setError(err)
        return
      }

      goAfterLogin(resolvedEmail, signedInUser?.email, { showAdminToast: true })
    } catch {
      setError('Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!loginEmail) return
    setResendStatus('sending')
    const { error: resendError } = await resendConfirmationEmail(loginEmail)
    if (resendError) {
      setError(resendError)
      setResendStatus('idle')
      return
    }
    setResendStatus('sent')
  }

  return (
    <AuthPageShell>
      <div className="mb-4 text-center">
        <span className="mb-2 inline-block rounded-full border border-brand/30 bg-brand/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand">
          Welcome back
        </span>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Sign In</h1>
        <p className="mt-1.5 text-sm text-white/50">{loginSubtitle}</p>
      </div>

      {!isConfigured && <AuthConfigBanner />}

      <motion.form onSubmit={handleSubmit} className="glass-card space-y-4 p-5 sm:p-6">
            {error && (
              <div className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <p>{error}</p>
                {needsEmailConfirmation && (
                  <div className="border-t border-red-500/20 pt-3 text-red-200/90">
                    <p className="text-xs text-red-200/70">
                      Username &quot;{identifier}&quot; is OK — Supabase still needs you to confirm
                      the email used at signup
                      {loginEmail ? ` (${loginEmail})` : ''}.
                    </p>
                    {loginEmail && (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-bright disabled:opacity-60"
                      >
                        <Mail className="h-4 w-4" />
                        {resendStatus === 'sent'
                          ? 'Confirmation email sent — check inbox & spam'
                          : resendStatus === 'sending'
                            ? 'Sending…'
                            : 'Resend confirmation email'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="mb-2 block text-sm font-medium text-white/80">
                <User className="mr-1 inline h-4 w-4" />
                Username or Email
              </label>
              <input
                id="identifier"
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-brand/50 focus:outline-none"
                placeholder="Enter username or email"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
                <Lock className="mr-1 inline h-4 w-4" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-white/30 focus:border-brand/50 focus:outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-white/50 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand hover:text-brand-bright"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <GradientButton type="submit" className="w-full" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in…' : 'Sign In'}
            </GradientButton>

            <p className="text-center text-sm text-white/50">
              No account yet?{' '}
              <Link
                to={`/signup${redirect !== '/shop' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                className="font-medium text-brand hover:text-brand-bright"
              >
                Create account
              </Link>
            </p>
      </motion.form>
    </AuthPageShell>
  )
}
