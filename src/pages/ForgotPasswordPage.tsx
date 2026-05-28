import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ShieldCheck, Lock, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { GradientButton } from '../components/ui/GradientButton'
import { AuthConfigBanner } from '../components/auth/AuthConfigBanner'

type Step = 'request' | 'verify' | 'done'

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const { requestPasswordResetOtp, resetPasswordWithOtp, isConfigured } = useAuth()
  const navigate = useNavigate()

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-accent-violet/50 focus:outline-none'
  const labelClass = 'mb-2 block text-sm font-medium text-white/80'

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: requestError } = await requestPasswordResetOtp(email)
    setLoading(false)
    if (requestError) {
      setError(requestError)
      return
    }
    setStep('verify')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (otp.trim().length < 6) {
      setError('Please enter the 6-digit OTP.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: resetError } = await resetPasswordWithOtp(email, otp, password)
    setLoading(false)
    if (resetError) {
      setError(resetError)
      return
    }

    setStep('done')
    setTimeout(() => navigate('/login', { replace: true }), 1800)
  }

  const handleResendOtp = async () => {
    setError('')
    setResending(true)
    const { error: resendError } = await requestPasswordResetOtp(email)
    setResending(false)
    if (resendError) setError(resendError)
  }

  return (
    <div className="relative min-h-screen pt-24">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-md px-4 pb-20 pt-8">
        <ScrollReveal>
          <div className="mb-8 text-center">
            <span className="mb-4 inline-block rounded-full border border-accent-violet/30 bg-accent-violet/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-violet">
              Password Recovery
            </span>
            <h1 className="font-display text-3xl font-bold text-white">Forgot Password</h1>
            <p className="mt-2 text-sm text-white/50">
              Reset your password with an OTP sent to your email
            </p>
          </div>

          {!isConfigured && <AuthConfigBanner />}

          {step === 'done' ? (
            <div className="glass-card p-8 text-center">
              <p className="font-display text-xl font-semibold text-emerald-400">
                Password updated!
              </p>
              <p className="mt-2 text-sm text-white/60">
                You can now sign in with your new password.
              </p>
            </div>
          ) : (
            <motion.form
              onSubmit={step === 'request' ? handleRequestOtp : handleResetPassword}
              className="glass-card space-y-5 p-6 sm:p-8"
            >
              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <div>
                <label htmlFor="email" className={labelClass}>
                  <Mail className="mr-1 inline h-4 w-4" />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@email.com"
                  disabled={step === 'verify'}
                />
              </div>

              {step === 'verify' && (
                <>
                  <div>
                    <label htmlFor="otp" className={labelClass}>
                      <ShieldCheck className="mr-1 inline h-4 w-4" />
                      Recovery OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={inputClass}
                      placeholder="6-digit code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className={labelClass}>
                      <Lock className="mr-1 inline h-4 w-4" />
                      New Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className={labelClass}>
                      <KeyRound className="mr-1 inline h-4 w-4" />
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                    />
                  </div>
                </>
              )}

              <GradientButton type="submit" className="w-full" disabled={loading}>
                {loading
                  ? step === 'request'
                    ? 'Sending OTP…'
                    : 'Resetting password…'
                  : step === 'request'
                    ? 'Send Reset OTP'
                    : 'Verify OTP & Reset Password'}
              </GradientButton>

              {step === 'verify' && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/80 transition-colors hover:border-accent-violet/40 hover:text-white disabled:opacity-60"
                >
                  {resending ? 'Resending OTP…' : 'Resend OTP'}
                </button>
              )}

              <p className="text-center text-sm text-white/50">
                Back to{' '}
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
