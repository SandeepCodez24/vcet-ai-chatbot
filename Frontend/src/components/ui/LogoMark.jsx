import styles from './LogoMark.module.css'
import clsx from 'clsx'

/**
 * LogoMark — the ✦ VCET brand mark
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {boolean} showText — show "VCET" wordmark beside icon
 */
const LogoMark = ({ size = 'md', showText = true, className }) => {
  return (
    <div className={clsx(styles.wrapper, styles[size], className)}>
      <span className={styles.icon}>
        {/* Asterism / snowflake icon matching Figma design */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </span>
      {showText && <span className={styles.wordmark}>VCET</span>}
    </div>
  )
}

export default LogoMark
