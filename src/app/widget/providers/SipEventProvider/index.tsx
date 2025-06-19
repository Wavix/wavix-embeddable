import { createContext, useContext, useState } from "react"

import { CallDataContext } from "@widget/providers/CallDataProvider"
import { WsControllerContext } from "@widget/providers/WsControllerProvider"

import { execListeners } from "@helpers/widget"

import { ControllerSendAction } from "@interfaces/widget-controller"
import { SipEvent } from "@interfaces/widget-sip-event"

import { initialSipEventPayload } from "./helpers"

import type { Config } from "@interfaces/widget"
import type { WidgetSipEventContext, BaseSipEventPayload, SipEventPayload } from "@interfaces/widget-sip-event"
import type { FC, ReactNode } from "react"

type Props = {
  config: Config
  children: ReactNode
}

export const SipEventContext = createContext<WidgetSipEventContext>({
  inboundSipEventPayload: initialSipEventPayload,
  setInboundSipEventPayload: () => {},
  sendEvent: () => {},
  sendDeclined: () => {}
})

export const SipEventProvider: FC<Props> = ({ config, children }) => {
  const { listeners } = useContext(CallDataContext)
  const { sendToWsController } = useContext(WsControllerContext)

  const [inboundSipEventPayload, setInboundSipEventPayload] = useState<BaseSipEventPayload>(initialSipEventPayload)

  const isWindow = config.inner?.isWindow

  const sendEvent = (sipEvent: SipEventPayload) => {
    const getBasePayload = (event: SipEvent, payload: BaseSipEventPayload | { token_uuid: string }) => {
      return {
        ...payload,
        event,
        date: new Date().toISOString()
      }
    }

    switch (sipEvent.type) {
      case SipEvent.Registered:
        sendToWsController({
          type: ControllerSendAction.WebhookEvent,
          payload: getBasePayload(SipEvent.Registered, sipEvent.payload)
        })
        execListeners(listeners, SipEvent.Registered, isWindow, getBasePayload(SipEvent.Registered, sipEvent.payload))
        break

      case SipEvent.Unregistered:
        sendToWsController({
          type: ControllerSendAction.WebhookEvent,
          payload: getBasePayload(SipEvent.Unregistered, sipEvent.payload)
        })
        execListeners(
          listeners,
          SipEvent.Unregistered,
          isWindow,
          getBasePayload(SipEvent.Unregistered, sipEvent.payload)
        )
        break

      case SipEvent.CallSetup:
        sendToWsController({
          type: ControllerSendAction.WebhookEvent,
          payload: getBasePayload(SipEvent.CallSetup, sipEvent.payload)
        })

        execListeners(listeners, SipEvent.CallSetup, isWindow, getBasePayload(SipEvent.CallSetup, sipEvent.payload))
        break

      case SipEvent.Ringing:
        sendToWsController({
          type: ControllerSendAction.WebhookEvent,
          payload: getBasePayload(SipEvent.Ringing, sipEvent.payload)
        })

        execListeners(listeners, SipEvent.Ringing, isWindow, getBasePayload(SipEvent.Ringing, sipEvent.payload))

        break

      case SipEvent.Answered:
        sendToWsController({
          type: ControllerSendAction.WebhookEvent,
          payload: getBasePayload(SipEvent.Answered, sipEvent.payload)
        })

        execListeners(listeners, SipEvent.Answered, isWindow, getBasePayload(SipEvent.Answered, sipEvent.payload))
        break

      case SipEvent.Completed:
        sendToWsController({
          type: ControllerSendAction.WebhookEvent,
          payload: getBasePayload(SipEvent.Completed, sipEvent.payload)
        })

        execListeners(listeners, SipEvent.Completed, isWindow, getBasePayload(SipEvent.Completed, sipEvent.payload))
        break

      case SipEvent.Busy:
        sendToWsController({
          type: ControllerSendAction.WebhookEvent,
          payload: getBasePayload(SipEvent.Busy, sipEvent.payload)
        })

        execListeners(listeners, SipEvent.Busy, isWindow, getBasePayload(SipEvent.Busy, sipEvent.payload))
        break

      case SipEvent.Declined:
        sendToWsController({
          type: ControllerSendAction.WebhookEvent,
          payload: getBasePayload(SipEvent.Declined, sipEvent.payload)
        })

        execListeners(listeners, SipEvent.Declined, isWindow, getBasePayload(SipEvent.Declined, sipEvent.payload))
        break

      default:
        break
    }
  }

  const sendDeclined = () => {
    sendEvent({
      type: SipEvent.Declined,
      payload: inboundSipEventPayload
    })

    setInboundSipEventPayload({
      token_uuid: "",
      from: "",
      to: "",
      uuid: "",
      direction: "inbound"
    })
  }

  return (
    <SipEventContext.Provider value={{ inboundSipEventPayload, setInboundSipEventPayload, sendEvent, sendDeclined }}>
      {children}
    </SipEventContext.Provider>
  )
}
