import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { useSettingsStore } from '../../store/settingsStore'
import { useChatStore } from '../../store/chatStore'
import { useToastStore } from '../../store/toastStore'
import styles from './SettingsModal.module.css'

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
]

const TEXT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

const SegmentedControl = ({ options, value, onChange, ariaLabel }) => (
  <div className={styles.segmented} role="radiogroup" aria-label={ariaLabel}>
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        role="radio"
        aria-checked={value === opt.value}
        className={clsx(styles.segment, value === opt.value && styles.segmentActive)}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

/** Settings modal — theme, text size, BYOK Groq key, and local-history reset. */
const SettingsModal = ({ isOpen, onClose }) => {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const textSize = useSettingsStore((s) => s.textSize)
  const setTextSize = useSettingsStore((s) => s.setTextSize)
  const groqApiKey = useSettingsStore((s) => s.groqApiKey)
  const setGroqApiKey = useSettingsStore((s) => s.setGroqApiKey)
  const clearRecents = useChatStore((s) => s.clearRecents)
  const pushToast = useToastStore((s) => s.push)

  const [keyDraft, setKeyDraft] = useState(groqApiKey)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => setKeyDraft(groqApiKey), [groqApiKey])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const saveKey = () => {
    setGroqApiKey(keyDraft)
    pushToast(keyDraft.trim() ? 'Groq key saved for this browser' : 'Groq key cleared', 'success')
  }

  const handleClearHistory = () => {
    clearRecents()
    pushToast('Local conversation list cleared', 'success')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>Settings</h2>
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close settings">
                <CloseIcon />
              </button>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Theme</p>
              <SegmentedControl options={THEME_OPTIONS} value={theme} onChange={setTheme} ariaLabel="Theme" />
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Text size</p>
              <SegmentedControl options={TEXT_SIZE_OPTIONS} value={textSize} onChange={setTextSize} ariaLabel="Text size" />
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Your own Groq API key (optional)</p>
              <p className={styles.hint}>
                Stored only in this browser. When set, it's sent with every message instead of
                the app's default key and skips the rate limit.
              </p>
              <div className={styles.keyRow}>
                <input
                  type={showKey ? 'text' : 'password'}
                  className={styles.keyInput}
                  placeholder="gsk_..."
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="button" className={styles.keyToggle} onClick={() => setShowKey((v) => !v)}>
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <button type="button" className={styles.saveBtn} onClick={saveKey} disabled={keyDraft === groqApiKey}>
                Save key
              </button>
            </div>

            <div className={styles.section}>
              <p className={styles.label}>Local data</p>
              <p className={styles.hint}>
                Clears the conversation list in this sidebar for this browser only — your
                messages stay on the server.
              </p>
              <button type="button" className={styles.dangerBtn} onClick={handleClearHistory}>
                Clear conversation list
              </button>
            </div>

            <p className={styles.footer}>VCET RAG Assistant</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SettingsModal
