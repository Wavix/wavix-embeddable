import type { CallerIdType } from "./widget"
import type { Registerer, UserAgent } from "sip.js"

export type WidgetAccountContext = {
  sipAccounts: AccountsState
  activeSipAccountSessionId: string
  updateSipAccount: (payload: AccountsAction) => void
}

export enum AccountState {
  Connecting,
  Registered,
  UnRegistered,
  InvalidAuth,
  AccessDenied,
  MultipleSessionDetected
}

export enum AccountAction {
  Add,
  ChangeState,
  SetupUserAgent,
  SetupRegister,
  SetupConfig,
  UpdateJwt
}

export enum AccountStatus {
  Offline = "offline",
  Connecting = "connecting",
  AccessDenied = "access_denied",
  TokenIncorrect = "token_incorrect",
  Connected = "connected"
}

export type Account = {
  sessionId: string
  state: AccountState
  webrtcUuid: string
  webrtcToken: string
  jwtToken: string
  trunkName: string
  label?: string
  callerIdType?: CallerIdType
  callerIds?: Array<string>
  server: string
  ua?: UserAgent
  registration?: Registerer | null
}

export type AccountsState = {
  [trunkToken: string]: Account
}

export type AccountsAction =
  | {
      type: AccountAction.Add
      account: Account
    }
  | {
      type: AccountAction.ChangeState
      webrtcToken: string
      state: AccountState
    }
  | {
      type: AccountAction.SetupUserAgent
      webrtcToken: string
      ua: UserAgent
    }
  | {
      type: AccountAction.SetupRegister
      webrtcToken: string
      registration: Registerer
    }
  | {
      type: AccountAction.SetupConfig
      webrtcUuid: string
      webrtcToken: string
      jwtToken: string
      trunkName: string
      label: string
      callerIdType: CallerIdType
      callerIds: Array<string>
    }
  | {
      type: AccountAction.UpdateJwt
      webrtcToken: string
      jwtToken: string
    }
