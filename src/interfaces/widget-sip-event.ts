export type WidgetSipEventContext = {
  inboundSipEventPayload: BaseSipEventPayload
  setInboundSipEventPayload: (payload: BaseSipEventPayload) => void
  sendEvent: (event: SipEventPayload) => void
  sendDeclined: () => void
}

export enum SipEvent {
  Registered = "registered",
  Unregistered = "unregistered",
  Errored = "error",
  CallSetup = "call_setup",
  Ringing = "ringing",
  Answered = "answered",
  Busy = "busy",
  Declined = "declined",
  Completed = "completed"
}

export type BaseSipEventPayload = {
  uuid: string
  direction: string
  from: string
  to: string
  token_uuid: string
}

export type SipEventPayload =
  | {
      type: SipEvent.Registered
      payload: { token_uuid: string }
    }
  | { type: SipEvent.Unregistered; payload: { token_uuid: string } }
  | {
      type: SipEvent.Errored
      payload: {
        error: string
      }
    }
  | {
      type: SipEvent.CallSetup
      payload: BaseSipEventPayload
    }
  | {
      type: SipEvent.Ringing
      payload: BaseSipEventPayload
    }
  | {
      type: SipEvent.Answered
      payload: BaseSipEventPayload
    }
  | {
      type: SipEvent.Busy
      payload: BaseSipEventPayload
    }
  | {
      type: SipEvent.Declined
      payload: BaseSipEventPayload
    }
  | {
      type: SipEvent.Completed
      payload: BaseSipEventPayload
    }
