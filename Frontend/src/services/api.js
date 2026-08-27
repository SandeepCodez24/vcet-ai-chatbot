const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const authHeaders = (apiKey) => (apiKey ? { 'X-Groq-Api-Key': apiKey } : {})

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new ApiError('Could not reach the backend. Is it running?', 0)
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new ApiError(detail?.detail || `Request failed (${response.status})`, response.status)
  }
  return response.json()
}

/** GET /api/health — used to confirm the frontend can reach the backend. */
export const getHealth = () => request('/health')

/** GET /api/chat/{sessionId}/history — full transcript, used to rehydrate a conversation. */
export const getHistory = (sessionId) => request(`/chat/${sessionId}/history`)

/**
 * POST /api/chat/stream — send a message and stream the answer back token-by-token (SSE).
 * Native EventSource can't do POST, so this reads the fetch body as a stream and parses
 * `data: {...}\n\n` lines by hand.
 *
 * @param {string} query
 * @param {string} sessionId
 * @param {object} opts
 * @param {string|null} [opts.apiKey] — BYOK Groq key, sent as X-Groq-Api-Key
 * @param {AbortSignal} [opts.signal] — to support a Stop button
 * @param {(text: string) => void} opts.onDelta — called with each new text chunk
 * @param {(payload: {sessionId, messageId, citations, route, latencyMs}) => void} opts.onDone
 */
export async function streamChatMessage(query, sessionId, { apiKey, signal, onDelta, onDone } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(apiKey) },
      body: JSON.stringify({ query, session_id: sessionId ?? null }),
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Could not reach the backend. Is it running?', 0)
  }

  if (!response.ok || !response.body) {
    const detail = await response.json().catch(() => null)
    throw new ApiError(detail?.detail || `Request failed (${response.status})`, response.status)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const payload = line.trim().replace(/^data:\s*/, '')
      if (!payload) continue
      const event = JSON.parse(payload)
      if (event.type === 'delta') {
        onDelta?.(event.text)
      } else if (event.type === 'done') {
        onDone?.({
          sessionId: event.session_id,
          messageId: event.message_id,
          citations: event.citations,
          route: event.route,
          latencyMs: event.latency_ms,
        })
      }
    }
  }
}

/** POST /api/feedback — thumbs up/down on a bot message. */
export const sendFeedback = (messageId, sessionId, rating, comment) =>
  request('/feedback', {
    method: 'POST',
    body: JSON.stringify({ message_id: messageId, session_id: sessionId, rating, comment }),
  })

export { ApiError }
