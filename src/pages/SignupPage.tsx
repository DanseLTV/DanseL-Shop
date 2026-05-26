import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Phone, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { GradientButton } from '../components/ui/GradientButton'
import { AuthConfigBanner } from '../components/auth/AuthConfigBanner'

export function SignupPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp, isConfigured } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/shop'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error: err } = await signUp(
      form.email,
      form.password,
      form.fullName,
      form.phone
    )
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
              Sign up once — order faster next time
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
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-white/80">
                  <User className="mr-1 inline h-4 w-4" />
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Juan Dela Cruz"
                />
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
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-white/80">
                  <Phone className="mr-1 inline h-4 w-4" />
                  Phone / Telegram
                </label>
                <input
                  id="phone"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="09XX XXX XXXX"
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
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Repeat password"
                />
              </div>

              <GradientButton type="submit" className="w-full" disabled={loading}>
                <UserPlus className="h-4 w-4" />
                {loading ? 'Creating account…' : 'Sign Up'}
              </GradientButton>

              <p className="text-center text-sm text-white/50">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-accent-violet hover:text-accent-cyan">
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
