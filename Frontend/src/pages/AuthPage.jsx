import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LogoMark from '../components/ui/LogoMark'
import PillInput from '../components/ui/PillInput'
import PillButton from '../components/ui/PillButton'
import styles from './AuthPage.module.css'

/* ─── Validation helpers ─────────────────────────────────── */
const validateEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address'

const validatePassword = (v) =>
  v.length >= 8 ? '' : 'Password must be at least 8 characters'

const validateConfirm = (v, pw) =>
  v === pw ? '' : 'Passwords do not match'

/* ─── AuthPage ───────────────────────────────────────────── */
const AuthPage = () => {
  const navigate = useNavigate()

  /* mode: 'signin' | 'signup' */
  const [mode, setMode] = useState('signup')

  const [fields, setFields] = useState({
    email: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)

  /* ── Field change handler ─────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    // clear error on type
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  /* ── Validate all fields ──────────────────────────────── */
  const validate = () => {
    const newErrors = {}
    const emailErr = validateEmail(fields.email)
    const pwErr = validatePassword(fields.password)
    if (emailErr) newErrors.email = emailErr
    if (pwErr) newErrors.password = pwErr
    if (mode === 'signup') {
      const cfErr = validateConfirm(fields.confirm, fields.password)
      if (cfErr) newErrors.confirm = cfErr
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ── Submit ───────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Simulate a brief loading state (replace with real API call later)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    // Navigate to welcome/chat on success
    navigate('/welcome')
  }

  /* ── Switch mode ──────────────────────────────────────── */
  const switchMode = (next) => {
    setMode(next)
    setErrors({})
    setFields({ email: '', password: '', confirm: '' })
  }

  const isSignIn = mode === 'signin'

  return (
    <main className={styles.page} id="auth-page">
      <div className={styles.card}>

        {/* ── Logo ─────────────────────────────────────── */}
        <div className={styles.logoArea}>
          <LogoMark size="md" showText />
        </div>

        {/* ── Headline ─────────────────────────────────── */}
        <h1 className={styles.headline}>
          The AI for VCET Students
        </h1>

        {/* ── Form ─────────────────────────────────────── */}
        <form
          id="auth-form"
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email */}
          <PillInput
            id="auth-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={fields.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />

          {/* Password */}
          <PillInput
            id="auth-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={fields.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
          />

          {/* Confirm password — Sign Up only */}
          {!isSignIn && (
            <div className={styles.fieldEnter}>
              <PillInput
                id="auth-confirm"
                name="confirm"
                type="password"
                placeholder="Confirm password"
                value={fields.confirm}
                onChange={handleChange}
                error={errors.confirm}
                autoComplete="new-password"
              />
            </div>
          )}

          {/* Remember me */}
          <div className={styles.rememberRow}>
            <label className={styles.toggle} htmlFor="auth-remember">
              <input
                id="auth-remember"
                type="checkbox"
                className={styles.toggleInput}
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className={styles.toggleTrack} />
              <span className={styles.toggleThumb} />
            </label>
            <label htmlFor="auth-remember" className={styles.rememberLabel}>
              Remember me
            </label>
          </div>

          {/* CTA Button */}
          <div className={styles.ctaWrap}>
            <PillButton
              id="auth-submit"
              type="submit"
              variant="primary"
              loading={loading}
            >
              {isSignIn ? 'Sign In' : 'Create Account'}
            </PillButton>
          </div>
        </form>

        {/* ── OR divider ───────────────────────────────── */}
        <div className={styles.divider} role="separator">
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <span className={styles.dividerLine} />
        </div>

        {/* ── Toggle sign in / sign up ──────────────────── */}
        <p className={styles.toggleLink}>
          {isSignIn ? (
            <>
              don&apos;t have account?{' '}
              <button
                id="auth-switch-signup"
                type="button"
                onClick={() => switchMode('signup')}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              already have account?{' '}
              <button
                id="auth-switch-signin"
                type="button"
                onClick={() => switchMode('signin')}
              >
                Sign In
              </button>
            </>
          )}
        </p>

        {/* ── Terms ────────────────────────────────────── */}
        <p className={styles.terms}>
          By continuing, you agree to our <a href="#terms">Terms</a>. This screen is a
          preview — no account is created yet.
        </p>

      </div>
    </main>
  )
}

export default AuthPage
