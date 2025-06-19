import { AccountAction } from "@interfaces/widget-account"

import type { AccountsState, AccountsAction } from "@interfaces/widget-account"

export const accountsReducer = (state: AccountsState, action: AccountsAction) => {
  switch (action.type) {
    case AccountAction.Add:
      return {
        ...state,
        [action.account.webrtcToken]: { ...action.account }
      }

    case AccountAction.ChangeState:
      return {
        ...state,
        [action.webrtcToken]: {
          ...state[action.webrtcToken],
          state: action.state
        }
      }

    case AccountAction.SetupUserAgent:
      return {
        ...state,
        [action.webrtcToken]: {
          ...state[action.webrtcToken],
          ua: action.ua
        }
      }

    case AccountAction.SetupRegister:
      return {
        ...state,
        [action.webrtcToken]: {
          ...state[action.webrtcToken],
          registration: action.registration
        }
      }

    case AccountAction.SetupConfig:
      return {
        ...state,
        [action.webrtcToken]: {
          ...state[action.webrtcToken],
          webrtcUuid: action.webrtcUuid,
          jwtToken: action.jwtToken,
          trunkName: action.trunkName,
          label: action.label,
          callerIdType: action.callerIdType,
          callerIds: action.callerIds
        }
      }

    case AccountAction.UpdateJwt:
      return {
        ...state,
        [action.webrtcToken]: {
          ...state[action.webrtcToken],
          jwtToken: action.jwtToken
        }
      }

    default:
      throw Error()
  }
}
