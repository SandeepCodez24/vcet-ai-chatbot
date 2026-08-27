import { useEffect, useState } from 'react'
import { getHealth } from '../../services/api'
import styles from './ConnectionBanner.module.css'

/** Pings the backend once on mount; shows a dismissible banner if it's unreachable. */
const ConnectionBanner = () => {
  const [unreachable, setUnreachable] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    getHealth().catch(() => setUnreachable(true))
  }, [])

  if (!unreachable || dismissed) return null

  return (
    <div className={styles.banner} role="alert">
      <span>Can't reach the VCET backend — is it running?</span>
      <button className={styles.dismiss} onClick={() => setDismissed(true)} aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}

export default ConnectionBanner
