import { useState } from 'react'
import clsx from 'clsx'
import styles from './Citations.module.css'

const ChevronIcon = ({ open }) => (
  <svg
    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    className={clsx(styles.chevron, open && styles.chevronOpen)}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const InternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const WebIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const basename = (path) => path?.split('/').pop() ?? path

/** Collapsible "Sources" row under a bot message — the citations the backend already
 * returns but the UI used to throw away. Internal doc chips + web links, kept visually
 * distinct so it's clear which claims come from official docs vs. the open web. */
const Citations = ({ citations }) => {
  const [open, setOpen] = useState(false)
  if (!citations || citations.length === 0) return null

  const internal = citations.filter((c) => c.type === 'internal')
  const web = citations.filter((c) => c.type === 'web')

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <ChevronIcon open={open} />
        Sources ({citations.length})
      </button>

      {open && (
        <div className={styles.list}>
          {internal.map((c, i) => (
            <div key={`internal-${i}`} className={styles.chip} title={c.source}>
              <InternalIcon />
              <span className={styles.chipText}>{basename(c.source)}</span>
              {typeof c.similarity === 'number' && (
                <span className={styles.chipMeta}>{Math.round(c.similarity * 100)}%</span>
              )}
            </div>
          ))}
          {web.map((c, i) => (
            <a
              key={`web-${i}`}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(styles.chip, styles.chipLink)}
              title={c.url}
            >
              <WebIcon />
              <span className={styles.chipText}>{c.title || c.url}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default Citations
