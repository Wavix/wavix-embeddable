import { useState, useEffect, useRef, useContext, createContext } from "react"

import { ErrorContext } from "@widget/providers/ErrorProvider"

import { ControllerSendAction } from "@interfaces/widget-controller"

import { WS_CONTROLLER_PING_INTERVAL, WS_CONTROLLER_SETUP_TIMEOUT } from "./helpers"

import type { WidgetWsControllerContext, ControllerSendEvent } from "@interfaces/widget-controller"
import type { FC, ReactNode } from "react"

type Props = {
  children: ReactNode
}

export const WsControllerContext = createContext<WidgetWsControllerContext>({
  wsController: null,
  isWsControllerConnected: false,
  sendToWsController: () => {}
})

export const WsControllerProvider: FC<Props> = ({ children }) => {
  const errorContext = useContext(ErrorContext)

  const wsControllerRef = useRef<WebSocket | null>(null)
  const wsControllerPingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isWsControllerConnected, setWsControllerConnected] = useState(false)

  const sendToWsController = (event: ControllerSendEvent) => {
    if (!wsControllerRef.current) return

    try {
      wsControllerRef.current.send(JSON.stringify(event))
    } catch {
      console.error("[WavixWebRTC] Failed to send message to ws controller")
    }
  }

  const setupWsController = () => {
    const socket = new WebSocket(import.meta.env.VITE_CONTROLLER_URI)

    socket.onopen = () => {
      setWsControllerConnected(true)

      wsControllerPingRef.current = setInterval(() => {
        if (socket.readyState === socket.OPEN) {
          sendToWsController({ type: ControllerSendAction.Ping })
        }
      }, WS_CONTROLLER_PING_INTERVAL)
    }

    socket.onclose = () => {
      if (wsControllerPingRef.current) {
        clearInterval(wsControllerPingRef.current)
      }

      setWsControllerConnected(false)

      setTimeout(() => {
        setupWsController()
      }, WS_CONTROLLER_SETUP_TIMEOUT)
    }

    socket.onerror = error => {
      console.error("[WavixWebRTC] Failed to connect to ws controller", error)
      errorContext.setWidgetError("server-connection-error")
    }

    wsControllerRef.current = socket
  }

  useEffect(() => {
    setupWsController()
  }, [])

  return (
    <WsControllerContext.Provider
      value={{ wsController: wsControllerRef.current, isWsControllerConnected, sendToWsController }}
    >
      {children}
    </WsControllerContext.Provider>
  )
}
