import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, LogIn, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { GradientButton } from '../components/ui/GradientButton'
import { AuthConfigBanner } from '../components/auth/AuthConfigBanner'
import { isEmailNotConfirmedError } from '../utils/authErrors'

export function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loginEmail, setLoginEmail] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [loading, setLoading] = useState(false)
  const { signIn, resendConfirmationEmail, isConfigured, user, loading: authLoading } =
    useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const needsEmailConfirmation = Boolean(error && isEmailNotConfirmedError(error))

  useEffect(() => {
    if (!authLoading && user) {
      navigate(decodeURIComponent(redirect), { replace: true })
    }
  }, [authLoading, user, redirect, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResendStatus('idle')
    setLoginEmail(null)
    setLoading(true)

    const { error: err, loginEmail: resolvedEmail } = await signIn(identifier, password)
    setLoading(false)

    if (resolvedEmail) setLoginEmail(resolvedEmail)

    if (err) {
      setError(err)
      return
    }

    navigate(decodeURIComponent(redirect), { replace: true })
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
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-md px-4 pb-20 pt-8">
        <ScrollReveal>
          <div className="mb-8 text-center">
            <span className="mb-4 inline-block rounded-full border border-accent-violet/30 bg-accent-violet/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-violet">
              Welcome back
            </span>
            <h1 className="font-display text-3xl font-bold text-white">Sign In</h1>
            <p className="mt-2 text-sm text-white/50">
              {searchParams.get('redirect')?.includes('/order')
                ? 'Sign in to complete your order'
                : 'Use your username or email to sign in'}
            </p>
          </div>

          {!isConfigured && <AuthConfigBanner />}

          <motion.form
            onSubmit={handleSubmit}
            className="glass-card space-y-5 p-6 sm:p-8"
          >
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
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-violet hover:text-accent-cyan disabled:opacity-60"
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
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-accent-violet/50 focus:outline-none"
                placeholder="username or you@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
                <Lock className="mr-1 inline h-4 w-4" />
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-accent-violet/50 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <GradientButton type="submit" className="w-full" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in…' : 'Sign In'}
            </GradientButton>

            <p className="text-center text-sm text-white/50">
              No account yet?{' '}
              <Link
                to={`/signup${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                className="font-medium text-accent-violet hover:text-accent-cyan"
              >
                Create account
              </Link>
            </p>
          </motion.form>
        </ScrollReveal>
      </div>
    </div>
  )
}
