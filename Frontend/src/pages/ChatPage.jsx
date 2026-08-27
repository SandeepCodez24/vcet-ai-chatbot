import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import BottomInputBar from '../components/layout/BottomInputBar'
import SidebarDrawer from '../components/layout/SidebarDrawer'
import ChatMessage from '../components/chat/ChatMessage'
import SettingsModal from '../components/settings/SettingsModal'
import { getHistory, sendFeedback } from '../services/api'
import { useChatStore } from '../store/chatStore'
import { useToastStore } from '../store/toastStore'
import styles from './ChatPage.module.css'

const USERNAME = 'Sandeep'

/* Cosmetic-only greeting shown when a conversation has no messages yet — never part of
   chatStore.messages, never sent to the backend, no message actions rendered for it. */
const GREETING = {
  id: 'greeting',
  role: 'bot',
  content: "Hi! What's on your mind?",
  static: true,
}

const mapHistoryMessage = (m) => ({
  id: m.id,
  role: m.role === 'assistant' ? 'bot' : 'user',
  content: m.content,
})

const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

/* ── ChatPage ─────────────────────────────────────────────── */
const ChatPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: routeId } = useParams()
  const messagesEndRef = useRef(null)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const sessionId = useChatStore((s) => s.sessionId)
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const recents = useChatStore((s) => s.recents)
  const startNewSession = useChatStore((s) => s.startNewSession)
  const loadSession = useChatStore((s) => s.loadSession)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const regenerate = useChatStore((s) => s.regenerate)
  const editMessage = useChatStore((s) => s.editMessage)
  const stopStreaming = useChatStore((s) => s.stopStreaming)
  const setMessageFeedback = useChatStore((s) => s.setMessageFeedback)
  const pushToast = useToastStore((s) => s.push)

  /* Keep the active session in sync with the :id route param — load history for a
     session we don't already have, or mint a fresh one when there's no id at all. */
  useEffect(() => {
    if (!routeId) {
      startNewSession()
      navigate(`/chat/${useChatStore.getState().sessionId}`, { replace: true, state: location.state })
      return
    }
    if (routeId === sessionId) return
    getHistory(routeId)
      .then((res) => loadSession(routeId, res.messages.map(mapHistoryMessage)))
      .catch(() => {
        pushToast("Couldn't load that conversation.", 'error')
        navigate('/welcome')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId])

  /* Once the session matches the URL, send a pending initial message from WelcomePage (if any). */
  useEffect(() => {
    const initial = location.state?.initialMessage
    if (initial && routeId === sessionId && messages.length === 0) {
      sendMessage(initial)
      window.history.replaceState({}, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, sessionId, messages.length])

  /* Auto-scroll to bottom on new message / streaming progress */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const handleSend = (text = inputValue) => {
    const trimmed = text?.trim()
    if (!trimmed || isStreaming) return
    setInputValue('')
    sendMessage(trimmed)
  }

  const handleFeedback = async (message, rating) => {
    const next = message.feedback === rating ? null : rating
    setMessageFeedback(message.id, rating)
    try {
      await sendFeedback(message.id, sessionId, next ?? rating)
      pushToast(next ? 'Feedback removed' : 'Thanks for the feedback!', 'success')
    } catch {
      setMessageFeedback(message.id, rating) // revert the optimistic toggle
      pushToast("Couldn't save feedback.", 'error')
    }
  }

  const handleNewChat = () => {
    startNewSession()
    navigate(`/chat/${useChatStore.getState().sessionId}`)
    setSidebarOpen(false)
  }

  const displayMessages = messages.length === 0 ? [GREETING] : messages
  const initial = USERNAME?.[0]?.toUpperCase() ?? 'S'

  return (
    <div className={styles.page} id="chat-page">

      {/* ── Sidebar Drawer ──────────────────────────────── */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        chats={recents}
        activeChatId={sessionId}
        onSelectChat={(id) => { navigate(`/chat/${id}`); setSidebarOpen(false) }}
        username={USERNAME}
      />

      {/* ── Settings modal ──────────────────────────────── */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* ── Top bar ─────────────────────────────────────── */}
      <TopBar
        onMenuClick={() => setSidebarOpen(true)}
        rightSlot={
          <>
            <button className={styles.moreBtn} onClick={() => setSettingsOpen(true)} aria-label="Settings">
              <SettingsIcon />
            </button>
            <button className={styles.moreBtn} aria-label="More options">
              <MoreIcon />
            </button>
            <button
              className={styles.userChip}
              aria-label={`User: ${USERNAME}`}
              title={USERNAME}
            >
              {initial}
            </button>
          </>
        }
      />

      {/* ── Messages area ───────────────────────────────── */}
      <main
        className={styles.messagesArea}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {displayMessages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onRegenerate={regenerate}
            onEdit={(text) => editMessage(msg.id, text)}
            onFeedback={(rating) => handleFeedback(msg, rating)}
            onCopy={() => pushToast('Copied to clipboard', 'success')}
            onShareFallback={() => pushToast('Copied to clipboard', 'success')}
            regenerateDisabled={isStreaming}
          />
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </main>

      {/* ── Bottom input bar ────────────────────────────── */}
      <BottomInputBar
        placeholder="Reply to Flyer..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onSend={() => handleSend()}
        isStreaming={isStreaming}
        onStop={stopStreaming}
      />

    </div>
  )
}

export default ChatPage
