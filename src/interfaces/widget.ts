import type { SessionDirection } from "@interfaces/widget-session"

export type Config = {
  widget: {
    windowTitle?: string
    containerId?: string
    customStyles?: string
    customLogo?: string
    customLink?: string
    withLogo?: boolean
  }
  sip: {
    server: string
    token: string
    callerIds?: Array<string>
    allowSelectCallerId?: boolean
    autoDial?: boolean
  }
  inner?: {
    isWindow?: boolean
  }
}

export type Listeners = {
  call_setup: Array<(payload: { payload: any }) => void>
  declined: Array<(payload: { payload: any }) => void>
  answered: Array<() => void>
  ringing: Array<(payload: { payload: any }) => void>
  completed: Array<(payload: { payload: any }) => void>
  busy: Array<(payload: { payload: any }) => void>
  registered: Array<() => void>
  error: Array<(payload: { payload: any }) => void>
  unregistered: Array<() => void>
}

export type ListenerEvent = keyof Listeners

export type WidgetChannelMessage = {
  event: ListenerEvent
  payload?: any
}

export type ExternalCallPayload = {
  to: string
  callerId?: string
}

export type ExternalCallData = {
  updateCallData: (to: string, callerId: string) => void
  clearCallData: () => void
  listeners: Listeners
} & ExternalCallPayload

export enum CallerIdType {
  Single = "single",
  Whitelist = "whitelist",
  Passthrough = "passthrough"
}

export enum CallHistoryTab {
  All,
  Inbound,
  Outbound
}

export type CallHistory = {
  number: string
  direction: SessionDirection
  date: Date | string
  is_success: boolean
}

export type WidgetSettings = {
  buttonSound: boolean
}
