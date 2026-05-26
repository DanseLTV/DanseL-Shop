import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { GradientButton } from '../components/ui/GradientButton'
import { AuthConfigBanner } from '../components/auth/AuthConfigBanner'

async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!supabase) return false
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return data?.role === 'admin'
}

export function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signOut, isConfigured } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await signIn(email, password)
    if (err) {
      setLoading(false)
      setError(err)
      return
    }

    const { data: { user } } = await supabase!.auth.getUser()
    if (!user || !(await checkIsAdmin(user.id))) {
      await signOut()
      setLoading(false)
      setError('Access denied. This account is not an admin.')
      return
    }

    setLoading(false)
    navigate('/admin', { replace: true })
  }

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-md px-4 pb-20 pt-8">
        <ScrollReveal>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-violet to-accent-cyan shadow-glow">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white">Admin Sign In</h1>
            <p className="mt-2 text-sm text-white/50">
              DANSEL SHOP admin access only
            </p>
          </div>

          {!isConfigured && <AuthConfigBanner />}

          <motion.form
            onSubmit={handleSubmit}
            className="glass-card space-y-5 p-6 sm:p-8"
          >
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
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-accent-violet/50 focus:outline-none"
              />
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
