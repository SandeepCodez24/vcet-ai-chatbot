import { useRef } from 'react'
import SendButton from '../ui/SendButton'
import styles from './BottomInputBar.module.css'

/**
 * BottomInputBar — Pill input + circular send/stop button
 * @param {string}   placeholder  — e.g. "Chat with Flyer"
 * @param {string}   value
 * @param {function} onChange
 * @param {function} onSend
 * @param {boolean}  disabled
 * @param {boolean}  isStreaming  — swaps the button to Stop and blocks new sends
 * @param {function} onStop
 */
const BottomInputBar = ({
  placeholder = 'Chat with Flyer',
  value,
  onChange,
  onSend,
  disabled = false,
  isStreaming = false,
  onStop,
}) => {
  const textareaRef = useRef(null)

  /* Auto-grow textarea height */
  const handleChange = (e) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    onChange?.(e)
  }

  /* Send on Enter (not Shift+Enter) */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isStreaming && value?.trim()) onSend?.()
    }
  }

  return (
    <div className={styles.bar}>
      <form
        className={styles.inner}
        onSubmit={(e) => { e.preventDefault(); if (!isStreaming) onSend?.() }}
      >
        <textarea
          id="chat-input"
          ref={textareaRef}
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          aria-label="Message input"
        />
        <SendButton
          id="chat-send"
          stop={isStreaming}
          onClick={isStreaming ? onStop : undefined}
          disabled={isStreaming ? false : disabled || !value?.trim()}
          aria-label={isStreaming ? 'Stop generating' : 'Send message'}
        />
      </form>
    </div>
  )
}

export default BottomInputBar
