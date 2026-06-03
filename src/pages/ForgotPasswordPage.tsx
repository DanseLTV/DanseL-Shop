import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ShieldCheck, Lock, KeyRound, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { GradientButton } from '../components/ui/GradientButton'
import { AuthConfigBanner } from '../components/auth/AuthConfigBanner'
import { AuthStepCardHeader } from '../components/auth/AuthStepCardHeader'
import { OTP_LENGTH, isCompleteOtp, normalizeOtpInput } from '../constants/authOtp'

type Step = 'request' | 'otp' | 'password' | 'done'

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const {
    requestPasswordResetOtp,
    verifyRecoveryOtp,
    resetPasswordAfterRecovery,
    isConfigured,
  } = useAuth()
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
    setOtp('')
    setStep('otp')
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isCompleteOtp(otp)) {
      setError(`Please enter the ${OTP_LENGTH}-digit code.`)
      return
    }

    setLoading(true)
    const { error: verifyError } = await verifyRecoveryOtp(email, otp)
    setLoading(false)
    if (verifyError) {
      setError(verifyError)
      return
    }

    setPassword('')
    setConfirmPassword('')
    setStep('password')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: resetError } = await resetPasswordAfterRecovery(email, password)
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
    if (resendError) {
      setError(resendError)
      return
    }
    setOtp('')
  }

  const handleBack = () => {
    if (loading || resending) return
    setError('')
    if (step === 'request') {
      navigate('/login')
      return
    }
    if (step === 'otp') {
      setOtp('')
      setStep('request')
      return
    }
    if (step === 'password') {
      setPassword('')
      setConfirmPassword('')
      setStep('otp')
    }
  }

  const stepNumber = step === 'request' ? 1 : step === 'otp' ? 2 : 3

  const stepHint =
    step === 'request'
      ? 'Enter your email to receive a reset code'
      : step === 'otp'
        ? `Enter the ${OTP_LENGTH}-digit code sent to your email`
        : 'Choose a new password for your account'

  const backLabel =
    step === 'request'
      ? 'Back to sign in'
      : step === 'otp'
        ? 'Back to email'
        : 'Back to OTP'

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
            <p className="mt-2 text-sm text-white/50">{stepHint}</p>
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
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden"
            >
              <AuthStepCardHeader
                backLabel={backLabel}
                onBack={handleBack}
                disabled={loading || resending}
                stepLabel={`Step ${stepNumber} of 3`}
              />

              <form
                onSubmit={
                  step === 'request'
                    ? handleRequestOtp
                    : step === 'otp'
                      ? handleVerifyOtp
                      : handleResetPassword
                }
                className="space-y-5 p-6 sm:p-8"
              >
              {step !== 'request' && (
                <div className="rounded-lg border border-accent-violet/30 bg-accent-violet/10 px-4 py-3">
                  <p className="text-sm text-white/80">
                    Reset code for <span className="font-semibold">{email.trim().toLowerCase()}</span>
                  </p>
                </div>
              )}

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              {step === 'request' && (
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
                  />
                </div>
              )}

              {step === 'otp' && (
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
                    onChange={(e) => setOtp(normalizeOtpInput(e.target.value))}
                    className={inputClass}
                    placeholder={`${OTP_LENGTH}-digit code`}
                    maxLength={OTP_LENGTH}
                    pattern="\d{4}"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
              )}

              {step === 'password' && (
                <>
                  <div>
                    <label htmlFor="password" className={labelClass}>
                      <Lock className="mr-1 inline h-4 w-4" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClass} pr-11`}
                        placeholder="Min. 6 characters"
                        autoComplete="new-password"
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

                  <div>
                    <label htmlFor="confirmPassword" className={labelClass}>
                      <KeyRound className="mr-1 inline h-4 w-4" />
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClass} pr-11`}
                        placeholder="Repeat new password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-white/50 hover:text-white"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <GradientButton type="submit" className="w-full" disabled={loading}>
                {loading
                  ? step === 'request'
                    ? 'Sending OTP…'
                    : step === 'otp'
                      ? 'Verifying OTP…'
                      : 'Resetting password…'
                  : step === 'request'
                    ? 'Send Reset OTP'
                    : step === 'otp'
                      ? 'Verify OTP'
                      : 'Reset Password'}
              </GradientButton>

              {step === 'otp' && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/80 transition-colors hover:border-accent-violet/40 hover:text-white disabled:opacity-60"
                >
                  {resending ? 'Resending OTP…' : 'Resend OTP'}
                </button>
              )}
              </form>
            </motion.div>
          )}
        </ScrollReveal>
      </div>
    </div>
  )
}
