import { useState } from 'react'
import styles from './PillInput.module.css'
import clsx from 'clsx'

/**
 * PillInput — Fully-rounded dark input field
 * @param {string} type - input type (text, email, password)
 * @param {string} placeholder
 * @param {string} value
 * @param {function} onChange
 * @param {string} error - error message
 * @param {string} id
 */
const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
)

const PillInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  id,
  name,
  autoComplete,
  className,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={clsx(styles.wrapper, isPassword && styles.hasIcon, className)}>
      <input
        id={id}
        name={name}
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={clsx(styles.input, error && styles.error)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {isPassword && (
        <button
          type="button"
          className={styles.iconRight}
          onClick={() => setShowPassword((p) => !p)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <EyeIcon open={showPassword} />
        </button>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default PillInput
