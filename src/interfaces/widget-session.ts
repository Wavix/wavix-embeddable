import type { BaseSipEventPayload } from "@interfaces/widget-sip-event"
import type { Invitation, Inviter, SessionState } from "sip.js"

export type WidgetAccountContext = {
  sessions: SessionsState
  activeSessionId: string | null
  updateSession: (payload: SessionsAction) => void
  setActiveSessionId: (sessionId: string | null) => void
  dropSessions: () => void
}

export enum SessionAction {
  Add,
  Remove,
  UpdateStateCallback,
  ChangeStatus
}

export enum SessionDirection {
  Inbound,
  Outbound
}

export enum SessionStatus {
  Initiated,
  Trying,
  Ringing,
  Progress,
  Answered,
  Busy,
  Declined,
  Terminated
}

export type ActiveSession = {
  token: string
  status: SessionStatus
  direction: SessionDirection
  number: string
  startedAt: Date
  answeredAt: Date | null
  invite: Inviter | Invitation
  payload: BaseSipEventPayload
  stateCallback?: (newState: SessionState) => SessionState
}

export type SessionsState = {
  [sessionId: string]: ActiveSession
}

export type SessionsAction =
  | {
      type: SessionAction.Add
      session: ActiveSession
    }
  | {
      type: SessionAction.Remove
      sessionId: string
    }
  | {
      type: SessionAction.UpdateStateCallback
      sessionId: string
      stateCallback: (newState: SessionState) => SessionState
    }
  | {
      type: SessionAction.ChangeStatus
      sessionId: string
      status: SessionStatus
    }
