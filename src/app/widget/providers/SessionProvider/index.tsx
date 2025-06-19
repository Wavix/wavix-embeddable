import { useState, useEffect, useReducer, createContext } from "react"

import { sessionsReducer } from "@widget/state/session"

import { SessionStatus } from "@interfaces/widget-session"

import { getActiveSipSession } from "./helpers"

import type { WidgetAccountContext, SessionsState, SessionsAction } from "@interfaces/widget-session"
import type { FC, ReactNode } from "react"

type Props = {
  children: ReactNode
}

export const SessionContext = createContext<WidgetAccountContext>({
  sessions: {},
  activeSessionId: null,
  updateSession: () => {},
  setActiveSessionId: () => {},
  dropSessions: () => {}
})

export const SessionProvider: FC<Props> = ({ children }) => {
  const [sessions, dispatchSessions] = useReducer<SessionsState, SessionsAction>(sessionsReducer, {})

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  const updateSession = (payload: SessionsAction) => {
    dispatchSessions({ ...payload })
  }

  const dropSessions = () => {
    if (!activeSessionId) return

    const session = getActiveSipSession(sessions, activeSessionId)

    if (session?.status === SessionStatus.Answered) {
      session.invite.bye()
      return
    }
    // @ts-ignore
    session.invite.cancel()
  }

  useEffect(() => {
    window.removeEventListener("beforeunload", dropSessions)
    window.addEventListener("beforeunload", dropSessions)
  }, [activeSessionId])

  useEffect(() => {
    return () => {
      dropSessions()
    }
  }, [])

  return (
    <SessionContext.Provider value={{ sessions, activeSessionId, updateSession, setActiveSessionId, dropSessions }}>
      {children}
    </SessionContext.Provider>
  )
}
