export function mapAuthError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('email not confirmed')) {
    return 'Your email is not verified yet. Enter the OTP sent to your email, or request a new OTP.'
  }
  if (lower.includes('token has expired') || lower.includes('otp expired')) {
    return 'OTP expired. Request a new code and try again.'
  }
  if (lower.includes('invalid otp') || lower.includes('token is invalid')) {
    return 'Invalid OTP code. Please check and try again.'
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
