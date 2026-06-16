import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ShieldCheck, Lock, KeyRound, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GradientButton } from '../components/ui/GradientButton'
import { AuthConfigBanner } from '../components/auth/AuthConfigBanner'
import { AuthPageShell } from '../components/auth/AuthPageShell'
import { AuthStepCardHeader } from '../components/auth/AuthStepCardHeader'
import { OTP_LENGTH, isCompleteOtp, normalizeOtpInput } from '../constants/authOtp'

type Step = 'verify' | 'password' | 'done'

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('verify')
  const [otpSent, setOtpSent] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const {
    requestPasswordResetOtp,
    verifyRecoveryOtp,
    resetPasswordAfterRecovery,
    isConfigured,
  } = useAuth()
  const navigate = useNavigate()

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-brand/50 focus:outline-none sm:rounded-xl'
  const labelClass = 'mb-1 block text-xs font-medium text-white/80 sm:text-sm'

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('Enter your account email first.')
      return
    }
    setError('')
    setSending(true)
    const { error: requestError } = await requestPasswordResetOtp(email)
    setSending(false)
    if (requestError) {
      setError(requestError)
      return
    }
    if (otpSent) setOtp('')
    setOtpSent(true)
  }

  const handleVerifyStep = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otpSent) {
      setError('Tap Send Reset OTP first, then enter the code from your email.')
      return
    }

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

  const handleBack = () => {
    if (loading || sending) return
    setError('')
    if (step === 'verify') {
      navigate('/login')
      return
    }
    if (step === 'password') {
      setPassword('')
      setConfirmPassword('')
      setStep('verify')
    }
  }

  const stepNumber = step === 'verify' ? 1 : 2

  const stepHint =
    step === 'verify'
      ? `Enter your email, send a reset code, then type the ${OTP_LENGTH} digit OTP below`
      : 'Choose a new password for your account'

  const backLabel = step === 'verify' ? 'Back to sign in' : 'Back to verification'

  return (
    <AuthPageShell>
      <div className="mb-3 text-center">
        <span className="mb-1.5 inline-block rounded-full border border-brand/30 bg-brand/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand sm:text-xs">
          Password Recovery
        </span>
        <h1 className="font-display text-xl font-bold text-white sm:text-2xl">Forgot Password</h1>
        <p className="mt-1 text-xs text-white/50 sm:text-sm">{stepHint}</p>
      </div>

      {!isConfigured && <AuthConfigBanner />}

      {step === 'done' ? (
        <div className="glass-card p-5 text-center sm:p-6">
          <p className="font-display text-lg font-semibold text-emerald-400 sm:text-xl">
            Password updated!
          </p>
          <p className="mt-2 text-sm text-white/60">You can now sign in with your new password.</p>
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
            disabled={loading || sending}
            stepLabel={`Step ${stepNumber} of 2`}
          />

          <form
            onSubmit={step === 'verify' ? handleVerifyStep : handleResetPassword}
            className="p-4 sm:p-5"
          >
            {step === 'password' && (
              <div className="mb-3 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2.5">
                <p className="text-sm text-white/80">
                  New password for{' '}
                  <span className="font-semibold">{email.trim().toLowerCase()}</span>
                </p>
              </div>
            )}

            {error && (
              <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            {step === 'verify' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    <Mail className="mr-1 inline h-3.5 w-3.5" />
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    readOnly={otpSent}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass}${otpSent ? ' cursor-default opacity-75' : ''}`}
                    placeholder="Enter your account email"
                  />
                </div>

                <div>
                  <label htmlFor="otp" className={labelClass}>
                    <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                    Recovery OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(normalizeOtpInput(e.target.value))}
                    className={inputClass}
                    placeholder={`Enter ${OTP_LENGTH} digit code`}
                    maxLength={OTP_LENGTH}
                    pattern="\d{4}"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>

                {otpSent && (
                  <p className="text-xs text-emerald-300/90">
                    Reset code sent to{' '}
                    <span className="font-medium">{email.trim().toLowerCase()}</span>
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSendOtp()}
                    disabled={sending}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-brand/40 hover:text-white disabled:opacity-60"
                  >
                    {sending ? 'Sending OTP…' : otpSent ? 'Resend OTP' : 'Send Reset OTP'}
                  </button>
                  <GradientButton type="submit" className="w-full" disabled={loading || !otpSent}>
                    <ShieldCheck className="h-4 w-4" />
                    {loading ? 'Verifying OTP…' : 'Verify OTP'}
                  </GradientButton>
                </div>
              </div>
            )}

            {step === 'password' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="password" className={labelClass}>
                    <Lock className="mr-1 inline h-3.5 w-3.5" />
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
                      className={`${inputClass} pr-10`}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 inline-flex w-9 items-center justify-center text-white/50 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>
                    <KeyRound className="mr-1 inline h-3.5 w-3.5" />
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
                      className={`${inputClass} pr-10`}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 inline-flex w-9 items-center justify-center text-white/50 hover:text-white"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <GradientButton type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Resetting password…' : 'Reset Password'}
                </GradientButton>
              </div>
            )}
          </form>
        </motion.div>
      )}
    </AuthPageShell>
  )
}
