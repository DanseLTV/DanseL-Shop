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
  if (lower.includes('no account found for this email')) {
    return 'Account was not created. Please try Sign Up again. If this keeps happening, turn off Confirm email in Supabase Auth settings.'
  }
  if (lower.includes('database error querying schema')) {
    return 'Login failed due to a database auth token issue. Run supabase/schema-login-fix.sql in Supabase SQL Editor, then try again.'
  }
  if (lower.includes('database error loading user')) {
    return 'Signup failed while creating your account. Run supabase/schema-signup-fix.sql in Supabase SQL Editor, then try again.'
  }
  if (lower.includes('username does not match')) {
    return 'Username does not match. Type your exact username to confirm deletion.'
  }
  if (lower.includes('admin accounts cannot be deleted')) {
    return 'Admin accounts cannot be deleted here.'
  }
  if (lower.includes('please verify the recovery code first')) {
    return 'Please verify the recovery code before setting a new password.'
  }
  if (lower.includes('recovery session expired')) {
    return 'Recovery session expired. Request a new code and verify again.'
  }
  if (lower.includes('not authenticated')) {
    return 'Please sign in again to delete your account.'
  }

  return message
}

export function isEmailNotConfirmedError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('email not confirmed') ||
    lower.includes('email is not verified') ||
    lower.includes('not verified yet')
  )
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
