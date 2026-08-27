import styles from './TopBar.module.css'

/* ── Icon: Hamburger menu ─────────────────────────────────── */
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <line x1="3" y1="7" x2="21" y2="7" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="17" x2="21" y2="17" />
  </svg>
)

/* ── Icon: New/Edit (pencil-square) ───────────────────────── */
const NewChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

/**
 * TopBar — minimal floating nav bar
 * @param {function} onMenuClick  — opens sidebar drawer
 * @param {function} onNewChat    — starts a new chat
 * @param {string}   title        — optional center title
 * @param {ReactNode} rightSlot  — custom right-side content override
 */
const TopBar = ({ onMenuClick, onNewChat, title, rightSlot }) => {
  return (
    <header className={styles.bar} role="banner">
      {/* Left — hamburger */}
      <button
        id="topbar-menu"
        className={styles.iconBtn}
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <HamburgerIcon />
      </button>

      {/* Center — optional title */}
      {title && <span className={styles.title}>{title}</span>}

      {/* Right — new chat or custom slot */}
      <div className={styles.rightGroup}>
        {rightSlot || (
          <button
            id="topbar-new-chat"
            className={styles.iconBtn}
            onClick={onNewChat}
            aria-label="New chat"
          >
            <NewChatIcon />
          </button>
        )}
      </div>
    </header>
  )
}

export default TopBar
