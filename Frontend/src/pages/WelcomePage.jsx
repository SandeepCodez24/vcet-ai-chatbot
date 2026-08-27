import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import BottomInputBar from '../components/layout/BottomInputBar'
import { useChatStore } from '../store/chatStore'
import styles from './WelcomePage.module.css'

/* ── Time-based greeting ──────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Evening'
  return 'Good night'
}

/* ── Quick suggestion chips ───────────────────────────────── */
const SUGGESTIONS = [
  'Exam schedule',
  'Department info',
  'Faculty details',
  'Hostel enquiry',
]

/* ── Large asterism SVG (✦ brand mark) ───────────────────── */
const AsterismLarge = () => (
  <svg
    className={styles.logo}
    width="72"
    height="72"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <line x1="12" y1="1"    x2="12" y2="23"   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="1"  y1="12"   x2="23" y2="12"   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="20.5" y1="3.5" x2="3.5" y2="20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Inner shorter lines for the 8-pointed asterism look */}
    <line x1="12" y1="4.5"  x2="12" y2="7.5"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="12" y1="16.5" x2="12" y2="19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="4.5"  y1="12" x2="7.5"  y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="16.5" y1="12" x2="19.5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

/* ── WelcomePage ──────────────────────────────────────────── */
const WelcomePage = () => {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')

  // Placeholder username — will come from auth context later
  const username = 'Sandeep'
  const greeting = `${getGreeting()}, ${username}`

  const handleSend = () => {
    if (!message.trim()) return
    useChatStore.getState().startNewSession()
    const { sessionId } = useChatStore.getState()
    // Navigate to the new chat's own URL with the first message pre-loaded
    navigate(`/chat/${sessionId}`, { state: { initialMessage: message.trim() } })
  }

  const handleChip = (text) => {
    setMessage(text)
  }

  return (
    <main className={styles.page} id="welcome-page">

      {/* ── Top bar ─────────────────────────────────────── */}
      <TopBar
        onMenuClick={() => navigate('/chat')}   /* open sidebar */
        onNewChat={() => setMessage('')}
      />

      {/* ── Hero center ─────────────────────────────────── */}
      <section className={styles.hero} aria-label="Welcome">

        {/* Large coral asterism */}
        <div className={styles.logoWrap}>
          <AsterismLarge />
        </div>

        {/* Time-based personalized greeting */}
        <h1 className={styles.greeting}>{greeting}</h1>

        {/* Quick suggestion chips */}
        <div className={styles.chips} role="list" aria-label="Quick suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              role="listitem"
              className={styles.chip}
              onClick={() => handleChip(s)}
              aria-label={`Ask about ${s}`}
            >
              {s}
            </button>
          ))}
        </div>

      </section>

      {/* ── Bottom input bar ────────────────────────────── */}
      <BottomInputBar
        placeholder="Chat with Flyer"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onSend={handleSend}
      />

    </main>
  )
}

export default WelcomePage
