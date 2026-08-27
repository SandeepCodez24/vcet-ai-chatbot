import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { streamChatMessage } from '../services/api'
import { useSettingsStore } from './settingsStore'
import { useToastStore } from './toastStore'

const RECENTS_LIMIT = 30
let tempIdCounter = 0
const nextTempId = () => `tmp-${Date.now()}-${++tempIdCounter}`

const makeTitle = (text) => {
  const t = text.trim().replace(/\s+/g, ' ')
  return t.length > 42 ? `${t.slice(0, 42)}…` : t
}

export const useChatStore = create(
  persist(
    (set, get) => ({
      sessionId: null,
      messages: [],
      isStreaming: false,
      recents: [], // [{id, title, updatedAt}] — sidebar history, persisted
      _controller: null,

      /** Start a fresh, empty conversation with a brand-new session id. */
      startNewSession: () => {
        get()._controller?.abort()
        set({ sessionId: crypto.randomUUID(), messages: [], isStreaming: false, _controller: null })
      },

      /** Swap in a conversation loaded from the backend (e.g. after a reload). */
      loadSession: (id, messages) => {
        get()._controller?.abort()
        set({ sessionId: id, messages, isStreaming: false, _controller: null })
      },

      touchRecent: (id, title) =>
        set((state) => {
          const others = state.recents.filter((r) => r.id !== id)
          return { recents: [{ id, title, updatedAt: Date.now() }, ...others].slice(0, RECENTS_LIMIT) }
        }),

      clearRecents: () => set({ recents: [] }),

      stopStreaming: () => {
        get()._controller?.abort()
      },

      /** Shared send/stream path. `resend: true` (regenerate) skips adding a user bubble. */
      _run: async (query, { resend = false } = {}) => {
        let { sessionId } = get()
        if (!sessionId) {
          sessionId = crypto.randomUUID()
          set({ sessionId })
        }

        if (!resend) {
          set((state) => ({
            messages: [...state.messages, { id: nextTempId(), role: 'user', content: query }],
          }))
        }

        const userTurns = get().messages.filter((m) => m.role === 'user').length
        if (userTurns === 1) get().touchRecent(sessionId, makeTitle(query))

        const botId = nextTempId()
        const controller = new AbortController()
        set((state) => ({
          messages: [...state.messages, { id: botId, role: 'bot', content: '', streaming: true }],
          isStreaming: true,
          _controller: controller,
        }))

        const apiKey = useSettingsStore.getState().groqApiKey || null

        try {
          await streamChatMessage(query, sessionId, {
            apiKey,
            signal: controller.signal,
            onDelta: (text) => {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === botId ? { ...m, content: m.content + text } : m
                ),
              }))
            },
            onDone: ({ messageId, citations, route }) => {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === botId ? { ...m, id: messageId, streaming: false, citations, route } : m
                ),
              }))
            },
          })
        } catch (err) {
          if (err.name === 'AbortError') {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === botId ? { ...m, streaming: false, stopped: true } : m
              ),
            }))
          } else {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === botId
                  ? { ...m, streaming: false, error: true, content: m.content || err.message }
                  : m
              ),
            }))
            useToastStore.getState().push(err.message || 'Something went wrong.', 'error')
          }
        } finally {
          set({ isStreaming: false, _controller: null })
        }
      },

      sendMessage: (query) => get()._run(query, { resend: false }),

      /** Drop the last bot reply and ask again for the same last user query. */
      regenerate: () => {
        const lastUser = [...get().messages].reverse().find((m) => m.role === 'user')
        if (!lastUser) return
        set((state) => {
          const idxFromEnd = [...state.messages].reverse().findIndex((m) => m.role === 'bot')
          if (idxFromEnd === -1) return state
          const dropAt = state.messages.length - 1 - idxFromEnd
          return { messages: state.messages.filter((_, i) => i !== dropAt) }
        })
        get()._run(lastUser.content, { resend: true })
      },

      /** Truncate from an edited user message and resend on a fresh session (clean context). */
      editMessage: (messageId, newText) => {
        const idx = get().messages.findIndex((m) => m.id === messageId)
        if (idx === -1) return
        get()._controller?.abort()
        set({ sessionId: crypto.randomUUID(), messages: get().messages.slice(0, idx), isStreaming: false, _controller: null })
        get()._run(newText, { resend: false })
      },

      setMessageFeedback: (messageId, rating) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, feedback: m.feedback === rating ? null : rating } : m
          ),
        })),
    }),
    {
      name: 'vcet-chat',
      partialize: (state) => ({ recents: state.recents }),
    }
  )
)
