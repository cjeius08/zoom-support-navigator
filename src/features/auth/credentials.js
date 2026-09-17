const usernamePattern = /^[a-z0-9_]{3,}$/

export function validateCredentials(username, password) {
  const normalizedUsername = username.trim().toLowerCase()
  const errors = {}

  if (!usernamePattern.test(normalizedUsername)) {
    errors.username = 'Use at least 3 letters, numbers, or underscores.'
  }
  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  return { username: normalizedUsername, errors }
}

export function validateActivation({ initials, username, password, confirmPassword }) {
  const { errors } = validateCredentials(username, password)
  if (!/^[A-Z]{2,3}$/.test(initials.trim().toUpperCase())) {
    errors.initials = 'Use 2–3 letters for initials.'
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return { errors }
}
