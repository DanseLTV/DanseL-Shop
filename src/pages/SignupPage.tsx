import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, UserPlus, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { GradientButton } from '../components/ui/GradientButton'
import { AuthConfigBanner } from '../components/auth/AuthConfigBanner'
import { AuthStepCardHeader } from '../components/auth/AuthStepCardHeader'
import { isValidUsername, normalizeUsername } from '../utils/authHelpers'
import { OTP_LENGTH, isCompleteOtp, normalizeOtpInput } from '../constants/authOtp'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState<'signup' | 'otp'>('signup')
  const [otpCode, setOtpCode] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [resendingOtp, setResendingOtp] = useState(false)
  const { signUp, verifySignupOtp, resendSignupOtp, signOut, isConfigured } = useAuth()
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
    const { error: err, email } = await signUp(form.email, form.password, form.username)
    setLoading(false)

    if (err) {
      setError(err)
      return
    }

    setSignupEmail(email ?? form.email.trim().toLowerCase())
    setStep('otp')
    setError('')
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isCompleteOtp(otpCode)) {
      setError(`Please enter the ${OTP_LENGTH}-digit code sent to your email.`)
      return
    }

    setLoading(true)
    const { error: verifyError } = await verifySignupOtp(signupEmail, otpCode)
    setLoading(false)

    if (verifyError) {
      setError(verifyError)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`, { replace: true })
    }, 1800)
  }

  const handleResendOtp = async () => {
    if (!signupEmail) return
    setResendingOtp(true)
    setError('')
    const { error: resendError } = await resendSignupOtp(signupEmail)
    setResendingOtp(false)
    if (resendError) {
      setError(resendError)
      return
    }
  }

  const handleBack = () => {
    if (loading || resendingOtp) return
    setError('')
    if (step === 'otp') {
      setOtpCode('')
      setStep('signup')
      return
    }
    void signOut()
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
  }

  const stepNumber = step === 'signup' ? 1 : 2
  const stepHint =
    step === 'signup'
      ? 'Choose a username — use it to sign in later'
      : `Enter the ${OTP_LENGTH}-digit code sent to your email`
  const backLabel = step === 'signup' ? 'Back to sign in' : 'Back to sign up'

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
            <p className="mt-2 text-sm text-white/50">{stepHint}</p>
          </div>

          {!isConfigured && <AuthConfigBanner />}

          {success ? (
            <div className="glass-card p-8 text-center">
              <p className="font-display text-xl font-semibold text-emerald-400">
                Verified successfully!
              </p>
              <p className="mt-2 text-sm text-white/60">
                Your account is now active. You can sign in with username/email + password.
              </p>
              <p className="mt-2 text-xs text-white/40">Redirecting to login…</p>
            </div>
          ) : step === 'otp' ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden"
            >
              <AuthStepCardHeader
                backLabel={backLabel}
                onBack={handleBack}
                disabled={loading || resendingOtp}
                stepLabel={`Step ${stepNumber} of 2`}
              />

              <form onSubmit={handleVerifyOtp} className="space-y-4 p-6 sm:p-8">
              <div className="rounded-lg border border-accent-violet/30 bg-accent-violet/10 px-4 py-3">
                <p className="text-sm text-white/80">
                  We sent a {OTP_LENGTH}-digit code to <span className="font-semibold">{signupEmail}</span>.
                </p>
                <p className="mt-1 text-xs text-white/50">
                  Enter all {OTP_LENGTH} numbers below to finish creating your account.
                </p>
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <div>
                <label htmlFor="otpCode" className="mb-2 block text-sm font-medium text-white/80">
                  <ShieldCheck className="mr-1 inline h-4 w-4" />
                  Email OTP
                </label>
                <input
                  id="otpCode"
                  name="otpCode"
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(normalizeOtpInput(e.target.value))}
                  className={inputClass}
                  placeholder={`${OTP_LENGTH}-digit code`}
                  inputMode="numeric"
                  maxLength={OTP_LENGTH}
                  pattern="\d{4}"
                  autoComplete="one-time-code"
                />
              </div>

              <GradientButton type="submit" className="w-full" disabled={loading}>
                <ShieldCheck className="h-4 w-4" />
                {loading ? 'Verifying OTP…' : 'Verify OTP'}
              </GradientButton>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendingOtp}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/80 transition-colors hover:border-accent-violet/40 hover:text-white disabled:opacity-60"
              >
                {resendingOtp ? 'Resending OTP…' : 'Resend OTP'}
              </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden"
            >
              <AuthStepCardHeader
                backLabel={backLabel}
                onBack={handleBack}
                disabled={loading}
                stepLabel={`Step ${stepNumber} of 2`}
              />

              <form onSubmit={handleSubmit} className="space-y-4 p-6 sm:p-8">
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
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    className={`${inputClass} pr-11`}
                    placeholder="Min. 6 characters"
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
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-white/80">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`${inputClass} pr-11`}
                    placeholder="Repeat password"
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
                  onClick={() => {
                    void signOut()
                  }}
                  className="font-medium text-accent-violet hover:text-accent-cyan"
                >
                  Sign in
                </Link>
              </p>
              </form>
            </motion.div>
          )}
        </ScrollReveal>
      </div>
    </div>
  )
}
