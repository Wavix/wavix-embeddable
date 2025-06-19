import type { SessionsState, ActiveSession } from "@interfaces/widget-session"

export const getActiveSipSession = (sessions: SessionsState, sessionId?: string | null): ActiveSession | null => {
  if (!sessionId) return null

  return sessions[sessionId] || null
}
