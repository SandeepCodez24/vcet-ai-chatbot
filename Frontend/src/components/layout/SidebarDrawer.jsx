import { useEffect, useRef } from 'react'
import styles from './SidebarDrawer.module.css'
import clsx from 'clsx'

/* ── Icons ────────────────────────────────────────────────── */
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ChatBubbleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

/**
 * SidebarDrawer — Slide-over left navigation drawer
 * @param {boolean}  isOpen
 * @param {function} onClose
 * @param {function} onNewChat
 * @param {Array<{id: string, title: string}>} chats — real conversation history, once a
 *   backend endpoint exists to list a user's sessions. Empty until then.
 * @param {string}   activeChatId
 * @param {function} onSelectChat
 * @param {string}   username
 */
const SidebarDrawer = ({
  isOpen,
  onClose,
  onNewChat,
  chats = [],
  activeChatId,
  onSelectChat,
  username = 'Sandeep',
}) => {
  const drawerRef = useRef(null)

  /* Trap focus inside drawer & close on Escape */
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  /* Prevent body scroll while open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const initial = username?.[0]?.toUpperCase() ?? 'S'

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <nav
        ref={drawerRef}
        className={styles.drawer}
        aria-label="Navigation"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.drawerTitle}>Flyer</span>
          <button
            id="drawer-close"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* New chat */}
        <button
          id="drawer-new-chat"
          className={styles.newChatBtn}
          onClick={() => { onNewChat?.(); onClose() }}
        >
          <span className={styles.newChatIcon} aria-hidden="true">+</span>
          New chat
        </button>

        {/* Recents */}
        <p className={styles.recentsLabel}>Recents</p>
        {chats.length === 0 ? (
          <p className={styles.emptyState}>No conversations yet — start one below.</p>
        ) : (
          <ul className={styles.chatList} role="list">
            {chats.map((chat) => (
              <li key={chat.id}>
                <button
                  className={clsx(
                    styles.chatListItem,
                    activeChatId === String(chat.id) && styles.active
                  )}
                  onClick={() => { onSelectChat?.(chat.id); onClose() }}
                  aria-current={activeChatId === String(chat.id) ? 'page' : undefined}
                >
                  <span className={styles.chatItemIcon}><ChatBubbleIcon /></span>
                  <span className={styles.chatItemText}>{chat.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* User row */}
        <div className={styles.userRow}>
          <div className={styles.avatar} aria-hidden="true">{initial}</div>
          <span className={styles.userName}>{username}</span>
          <button
            id="drawer-settings"
            className={styles.settingsBtn}
            aria-label="Settings"
          >
            <SettingsIcon />
          </button>
        </div>
      </nav>
    </>
  )
}

export default SidebarDrawer
