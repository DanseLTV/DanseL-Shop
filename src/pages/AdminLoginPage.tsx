import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { checkIsAdminUid } from '../lib/adminCheck'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { GradientButton } from '../components/ui/GradientButton'
import { AuthConfigBanner } from '../components/auth/AuthConfigBanner'

export function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithEmail, signOut, refreshProfile, isConfigured } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError, user } = await signInWithEmail(email, password)

      if (signInError) {
        setError(signInError)
        return
      }

      if (!user) {
        setError('Sign-in succeeded but no session was returned. Please try again.')
        return
      }

      const check = await checkIsAdminUid(user.id)
      if (!check.isAdmin) {
        await signOut()
        setError(
          `Access denied. ${check.errorMessage ?? 'This account is not set as admin in profiles table.'}`
        )
        return
      }

      await refreshProfile()
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-md px-4 pb-20 pt-8">
        <ScrollReveal>
          <div className="mb-8 text-center">
            <img
              src="/shop-logo.png"
              alt="Dansel Shop"
              className="mx-auto mb-4 h-16 w-16 rounded-2xl border border-white/10 object-cover shadow-glow"
            />
            <h1 className="font-display text-3xl font-bold text-white">Admin Sign In</h1>
            <p className="mt-2 text-sm text-white/50">DANSEL SHOP admin access only</p>
          </div>

          {!isConfigured && <AuthConfigBanner />}

          <motion.form onSubmit={handleSubmit} className="glass-card space-y-5 p-6 sm:p-8">
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                <Mail className="mr-1 inline h-4 w-4" />
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-accent-violet/50 focus:outline-none"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-white/30 focus:border-accent-violet/50 focus:outline-none"
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
            </div>

            <GradientButton type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying…' : 'Sign In as Admin'}
            </GradientButton>

            <p className="text-center text-sm text-white/40">
              <Link to="/" className="hover:text-accent-violet">
                ← Back to shop
              </Link>
            </p>
          </motion.form>
        </ScrollReveal>
      </div>
    </div>
  )
}
