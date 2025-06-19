import type { CallerIdType } from "./widget"
import type { BaseSipEventPayload, SipEvent } from "./widget-sip-event"

export type WidgetWsControllerContext = {
  wsController: WebSocket | null
  isWsControllerConnected: boolean
  sendToWsController: (event: ControllerSendEvent) => void
}

export enum ControllerSendAction {
  RegistrationRequest = "token_registration_request",
  SessionCatchRequest = "token_session_catch_request",
  GenerateToken = "generate_token_request",
  WebhookEvent = "webhook_event",
  CallInfoRequest = "call_info_request",
  Ping = "ping"
}

export enum ControllerReceiveAction {
  RegistrationSuccess = "token_registration_success",
  RegistrationMultiSessions = "token_registration_multi_sessions",
  RegistrationFailed = "token_registration_failed",
  TokenGenerated = "token_generation_success",
  TokenGeneratedFailed = "token_generation_failed"
}

export type ControllerSendEvent =
  | {
      type: ControllerSendAction.RegistrationRequest
      session_id: string
      version: string
      webrtc_token: string
    }
  | {
      type: ControllerSendAction.SessionCatchRequest
      session_id: string
      version: string
      webrtc_token: string
    }
  | {
      type: ControllerSendAction.Ping
    }
  | {
      type: ControllerSendAction.GenerateToken
      webrtc_token: string
    }
  | {
      type: ControllerSendAction.CallInfoRequest
      call_id: string
      webrtc_token_uuid: string
      webrtc_session_id: string
    }
  | {
      type: ControllerSendAction.WebhookEvent
      payload: {
        event: SipEvent
        date?: string
      } & Partial<BaseSipEventPayload>
    }

export type ControllerReceiveEvent =
  | {
      type: ControllerReceiveAction.RegistrationSuccess
      webrtc_uuid: string
      webrtc_token: string
      webrtc_jwt: string
      send_events: boolean
      trunk_name: string
      label: string
      cli_type: CallerIdType
      caller_ids: Array<string>
    }
  | {
      type: ControllerReceiveAction.RegistrationMultiSessions
      name: string
      token: string
    }
  | {
      type: ControllerReceiveAction.RegistrationFailed
      token: string
      message: string
    }
  | {
      type: ControllerReceiveAction.TokenGenerated
      webrtc_token: string
      webrtc_jwt: string
    }
