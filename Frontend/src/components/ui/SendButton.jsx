import styles from './SendButton.module.css'
import clsx from 'clsx'

const SendButton = ({ onClick, disabled, size = 'md', stop = false, id, 'aria-label': ariaLabel }) => (
  <button
    id={id}
    type={stop ? 'button' : 'submit'}
    className={clsx(styles.btn, size === 'lg' && styles.lg)}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel || (stop ? 'Stop generating' : 'Send message')}
  >
    {stop ? (
      /* Stop square */
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="5" y="5" width="14" height="14" rx="2" />
      </svg>
    ) : (
      /* Play / send arrow */
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5.14v14l11-7-11-7z" />
      </svg>
    )}
  </button>
)

export default SendButton
