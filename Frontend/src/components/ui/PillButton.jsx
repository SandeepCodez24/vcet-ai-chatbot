import styles from './PillButton.module.css'
import clsx from 'clsx'

/**
 * PillButton — Pill-shaped button
 * @param {'primary'|'secondary'|'white'} variant
 * @param {boolean} loading
 * @param {boolean} fullWidth
 */
const PillButton = ({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className,
  id,
  ...rest
}) => {
  return (
    <button
      id={id}
      type={type}
      className={clsx(styles.btn, styles[variant], className)}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  )
}

export default PillButton
