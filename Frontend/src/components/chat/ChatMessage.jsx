import { useState } from 'react'
import clsx from 'clsx'
import Markdown from './Markdown'
import Citations from './Citations'
import styles from './ChatMessage.module.css'

/* ── Action icons ─────────────────────────────────────────── */
const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)
const ThumbUpIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
)
const ThumbDownIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
)
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
  </svg>
)

const routeLabel = (route) => {
  if (route === 'internal+web') return 'Internal docs + Web search'
  if (route === 'web') return 'Web search'
  return 'Internal docs'
}

/**
 * ChatMessage — a bot or user bubble.
 * @param {object}   message      — {id, role, content, streaming, stopped, error, citations, route, feedback}
 * @param {function} onRegenerate
 * @param {function} onEdit(newText)
 * @param {function} onFeedback(rating)  — 'up' | 'down'
 * @param {function} onCopy()  — called after a successful copy, for a toast
 * @param {function} onShareFallback()  — called when Web Share isn't available, after clipboard copy
 * @param {boolean}  regenerateDisabled
 */
const ChatMessage = ({
  message,
  onRegenerate,
  onEdit,
  onFeedback,
  onCopy,
  onShareFallback,
  regenerateDisabled = false,
}) => {
  const { role, content, streaming, stopped, error, citations, route, feedback, static: isStatic } = message
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(content)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      onCopy?.()
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: content })
        return
      } catch {
        return // user cancelled the native share sheet — not an error
      }
    }
    try {
      await navigator.clipboard.writeText(content)
      onShareFallback?.()
    } catch {
      /* ignore */
    }
  }

  const startEdit = () => {
    setDraft(content)
    setEditing(true)
  }

  const saveEdit = () => {
    const trimmed = draft.trim()
    setEditing(false)
    if (trimmed && trimmed !== content) onEdit?.(trimmed)
  }

  /* ── User message ──────────────────────────────────────── */
  if (role === 'user') {
    if (editing) {
      return (
        <div className={clsx(styles.row, styles.user)}>
          <div className={styles.editBox}>
            <textarea
              className={styles.editTextarea}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.min(6, Math.max(2, draft.split('\n').length))}
              autoFocus
            />
            <div className={styles.editActions}>
              <button className={styles.editCancel} onClick={() => setEditing(false)}>Cancel</button>
              <button className={styles.editSave} onClick={saveEdit} disabled={!draft.trim()}>Save &amp; resend</button>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className={clsx(styles.row, styles.user)}>
        <div className={styles.userBubble}>{content}</div>
        <div className={clsx(styles.actions, styles.userActions)}>
          <button className={styles.actionBtn} onClick={handleCopy} aria-label="Copy message" title="Copy">
            <CopyIcon />
          </button>
          <button className={styles.actionBtn} onClick={startEdit} aria-label="Edit and resend" title="Edit">
            <EditIcon />
          </button>
        </div>
      </div>
    )
  }

  /* ── Bot message ───────────────────────────────────────── */
  const isThinking = streaming && !content
  const showActions = !streaming && !error && !isStatic

  return (
    <div className={clsx(styles.row, styles.bot)}>
      {isThinking ? (
        <span className={styles.modeChip} aria-label="Thinking">
          <span className={styles.thinkingDot} />
          Thinking…
        </span>
      ) : (
        !streaming && !error && !isStatic && (
          <span className={styles.modeChip} aria-label={`Mode: ${routeLabel(route)}`}>
            <span className={styles.modeChipIcon} aria-hidden="true">✦</span>
            {routeLabel(route)}
          </span>
        )
      )}

      {error ? (
        <p className={styles.errorText}>{content}</p>
      ) : (
        content && (
          <div className={styles.botContent}>
            <Markdown>{content}</Markdown>
            {streaming && <span className={styles.cursor} aria-hidden="true" />}
          </div>
        )
      )}

      {stopped && <span className={styles.stoppedNote}>Stopped</span>}

      {!streaming && !error && <Citations citations={citations} />}

      {showActions && (
        <div className={styles.actions} role="group" aria-label="Message actions">
          <button className={styles.actionBtn} onClick={handleCopy} aria-label="Copy message" title="Copy">
            <CopyIcon />
          </button>
          <button className={styles.actionBtn} onClick={handleShare} aria-label="Share" title="Share">
            <ShareIcon />
          </button>
          <button
            className={clsx(styles.actionBtn, feedback === 'up' && styles.liked)}
            onClick={() => onFeedback?.('up')}
            aria-label={feedback === 'up' ? 'Remove like' : 'Like'}
            aria-pressed={feedback === 'up'}
            title="Like"
          >
            <ThumbUpIcon />
          </button>
          <button
            className={clsx(styles.actionBtn, feedback === 'down' && styles.disliked)}
            onClick={() => onFeedback?.('down')}
            aria-label={feedback === 'down' ? 'Remove dislike' : 'Dislike'}
            aria-pressed={feedback === 'down'}
            title="Dislike"
          >
            <ThumbDownIcon />
          </button>
          <button
            className={styles.actionBtn}
            onClick={onRegenerate}
            disabled={regenerateDisabled}
            aria-label="Regenerate response"
            title="Regenerate"
          >
            <RefreshIcon />
          </button>
        </div>
      )}
    </div>
  )
}

export default ChatMessage
