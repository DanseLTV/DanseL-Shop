import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { GradientButton } from '../components/ui/GradientButton'
import { AuthConfigBanner } from '../components/auth/AuthConfigBanner'
import { isValidUsername, normalizeUsername } from '../utils/authHelpers'

export function SignupPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp, isConfigured } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const normalized = normalizeUsername(form.username)
    if (!isValidUsername(normalized)) {
      setError('Username must be 3–20 characters (letters, numbers, underscore only)')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service to sign up')
      return
    }

    setLoading(true)
    const { error: err } = await signUp(form.email, form.password, form.username)
    setLoading(false)

    if (err) {
      setError(err)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`, { replace: true })
    }, 2500)
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-accent-violet/50 focus:outline-none'

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-md px-4 pb-20 pt-8">
        <ScrollReveal>
          <div className="mb-8 text-center">
            <span className="mb-4 inline-block rounded-full border border-accent-violet/30 bg-accent-violet/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-violet">
              Join DANSEL SHOP
            </span>
            <h1 className="font-display text-3xl font-bold text-white">Create Account</h1>
            <p className="mt-2 text-sm text-white/50">
              Choose a username — use it to sign in later
            </p>
          </div>

          {!isConfigured && <AuthConfigBanner />}

          {success ? (
            <div className="glass-card p-8 text-center">
              <p className="font-display text-xl font-semibold text-emerald-400">
                Account created!
              </p>
              <p className="mt-2 text-sm text-white/60">
                Redirecting to login…
              </p>
            </div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="glass-card space-y-4 p-6 sm:p-8"
            >
              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-white/80">
                  <User className="mr-1 inline h-4 w-4" />
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="dansel_user"
                />
                <p className="mt-1 text-xs text-white/40">
                  3–20 characters: letters, numbers, underscore
                </p>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                  <Mail className="mr-1 inline h-4 w-4" />
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
                  <Lock className="mr-1 inline h-4 w-4" />
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Min. 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-white/80">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Repeat password"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-accent-violet"
                  required
                />
                <span className="text-sm leading-relaxed text-white/60">
                  I have read and agreed with the{' '}
                  <Link
                    to="/policies#terms"
                    target="_blank"
                    className="font-medium text-accent-violet hover:text-accent-cyan hover:underline"
                  >
                    Terms of Service
                  </Link>
                </span>
              </label>

              <GradientButton
                type="submit"
                className="w-full"
                disabled={loading || !agreedToTerms}
              >
                <UserPlus className="h-4 w-4" />
                {loading ? 'Creating account…' : 'Sign Up'}
              </GradientButton>

              <p className="text-center text-sm text-white/50">
                Already have an account?{' '}
                <Link
                  to={`/login?redirect=${encodeURIComponent(redirect)}`}
                  className="font-medium text-accent-violet hover:text-accent-cyan"
                >
                  Sign in
                </Link>
              </p>
            </motion.form>
          )}
        </ScrollReveal>
      </div>
    </div>
  )
}
