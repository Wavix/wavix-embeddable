import { SessionAction, SessionStatus } from "@interfaces/widget-session"

import type { SessionsAction, SessionsState } from "@interfaces/widget-session"

export const sessionsReducer = (state: SessionsState, action: SessionsAction): SessionsState => {
  switch (action.type) {
    case SessionAction.Add:
      return {
        ...state,
        [action.session.invite.id]: action.session
      }

    case SessionAction.Remove:
      return Object.keys(state).reduce((acc, sessionId) => {
        return sessionId === action.sessionId ? acc : { ...acc, [sessionId]: state[sessionId] }
      }, {})

    case SessionAction.UpdateStateCallback:
      return {
        ...state,
        [action.sessionId]: {
          ...state[action.sessionId],
          stateCallback: action.stateCallback
        }
      }

    case SessionAction.ChangeStatus:
      return {
        ...state,
        [action.sessionId]: {
          ...state[action.sessionId],
          status: action.status,
          ...(action.status === SessionStatus.Answered && { answeredAt: new Date() })
        }
      }

    default:
      throw Error()
  }
}
