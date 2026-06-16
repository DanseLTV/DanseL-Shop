import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, UserPlus, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GradientButton } from '../components/ui/GradientButton'
import { AuthConfigBanner } from '../components/auth/AuthConfigBanner'
import { AuthPageShell } from '../components/auth/AuthPageShell'
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
      ? 'Create your account to shop and track orders'
      : `Enter the ${OTP_LENGTH} digit code sent to your email`
  const backLabel = step === 'signup' ? 'Back to sign in' : 'Back to sign up'

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-brand/50 focus:outline-none sm:rounded-xl sm:py-2.5'
  const labelClass = 'mb-1 block text-xs font-medium text-white/80'

  return (
    <AuthPageShell compact>
      <div className="mb-2.5 text-center sm:mb-3">
        <span className="mb-1 inline-block rounded-full border border-brand/30 bg-brand/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand sm:text-xs">
          Join DANSEL SHOP
        </span>
        <h1 className="font-display text-xl font-bold text-white sm:text-2xl">Create Account</h1>
        <p className="mt-0.5 text-xs text-white/50 sm:text-sm">{stepHint}</p>
      </div>

      {!isConfigured && <AuthConfigBanner />}

      {success ? (
        <div className="glass-card p-5 text-center sm:p-6">
          <p className="font-display text-lg font-semibold text-emerald-400 sm:text-xl">
            Verified successfully!
          </p>
          <p className="mt-2 text-sm text-white/60">
            Your account is ready. Sign in with your username or email and password.
          </p>
          <p className="mt-1 text-xs text-white/40">Redirecting to login…</p>
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

          <form onSubmit={handleVerifyOtp} className="space-y-3 p-4 sm:p-5">
            <div className="rounded-lg border border-brand/30 bg-brand/10 px-3 py-2.5">
              <p className="text-sm text-white/80">
                We sent a {OTP_LENGTH}-digit code to{' '}
                <span className="font-semibold">{signupEmail}</span>.
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="otpCode" className={labelClass}>
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
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
                placeholder={`Enter ${OTP_LENGTH} digit code`}
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
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:border-brand/40 hover:text-white disabled:opacity-60"
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

          <form onSubmit={handleSubmit} className="p-4 sm:p-5">
            {error && (
              <p className="mb-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              <div>
                <label htmlFor="username" className={labelClass}>
                  <User className="mr-1 inline h-3.5 w-3.5" />
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
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  <Mail className="mr-1 inline h-3.5 w-3.5" />
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
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  <Lock className="mr-1 inline h-3.5 w-3.5" />
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
                    className={`${inputClass} pr-10`}
                    placeholder="Min. 6 characters"
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
                    className={`${inputClass} pr-10`}
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 inline-flex w-9 items-center justify-center text-white/50 hover:text-white"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <label className="mt-2.5 flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 sm:mt-3">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-3.5 w-3.5 shrink-0 rounded border-white/20 bg-white/5 accent-brand sm:h-4 sm:w-4"
                required
              />
              <span className="text-xs text-white/60 sm:text-sm">
                I agree to the{' '}
                <Link
                  to="/policies#terms"
                  target="_blank"
                  className="font-medium text-brand hover:text-brand-bright hover:underline"
                >
                  Terms of Service
                </Link>
              </span>
            </label>

            <div className="mt-2.5 sm:mt-3">
              <GradientButton type="submit" className="w-full" disabled={loading || !agreedToTerms}>
                <UserPlus className="h-4 w-4" />
                {loading ? 'Creating account…' : 'Sign Up'}
              </GradientButton>
            </div>

            <p className="mt-2 text-center text-xs text-white/50 sm:text-sm">
              Already have an account?{' '}
              <Link
                to={`/login?redirect=${encodeURIComponent(redirect)}`}
                onClick={() => {
                  void signOut()
                }}
                className="font-medium text-brand hover:text-brand-bright"
              >
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      )}
    </AuthPageShell>
  )
}
