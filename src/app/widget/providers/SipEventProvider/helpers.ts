import type { BaseSipEventPayload } from "@interfaces/widget-sip-event"

export const initialSipEventPayload: BaseSipEventPayload = {
  token_uuid: "",
  to: "",
  from: "",
  uuid: "",
  direction: "inbound"
}
