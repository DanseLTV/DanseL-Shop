export function mapAuthError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('email not confirmed')) {
    return 'Your email is not verified yet. Enter the OTP sent to your email, or request a new OTP.'
  }
  if (lower.includes('token has expired') || lower.includes('otp expired')) {
    return 'OTP expired. Request a new code and try again.'
  }
  if (
    lower.includes('invalid otp') ||
    lower.includes('token is invalid') ||
    lower.includes('invalid verification code')
  ) {
    return 'Invalid OTP code. Please check and try again.'
  }
  if (lower.includes('verification code expired')) {
    return 'OTP expired. Request a new code and try again.'
  }
  if (lower.includes('new password should be different')) {
    return 'New password must be different from your current password.'
  }
  if (lower.includes('invalid login credentials')) {
    return 'Wrong username/email or password.'
  }
  if (lower.includes('email rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }

  return message
}

export function isEmailNotConfirmedError(message: string): boolean {
  return message.toLowerCase().includes('email not confirmed')
}

/** Supabase may create the user but fail its own SMTP mail — we send OTP via Resend instead. */
export function isIgnorableSignupEmailError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('error sending confirmation email') ||
    lower.includes('error sending email')
  )
}

export function isUserAlreadyRegisteredError(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('already registered') || lower.includes('already been registered')
}

export function isEmailAlreadyVerifiedError(message: string): boolean {
  return message.toLowerCase().includes('already verified')
}
