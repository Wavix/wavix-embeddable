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
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)

  const [isWsControllerConnected, setWsControllerConnected] = useState(false)

  const sendToWsController = (event: ControllerSendEvent) => {
    if (!wsControllerRef.current || wsControllerRef.current.readyState !== WebSocket.OPEN) return

    try {
      wsControllerRef.current.send(JSON.stringify(event))
    } catch {
      console.error("[WavixWebRTC] Failed to send message to ws controller")
    }
  }

  useEffect(() => {
    isMountedRef.current = true

    const cleanup = () => {
      if (wsControllerPingRef.current) {
        clearInterval(wsControllerPingRef.current)
        wsControllerPingRef.current = null
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      if (wsControllerRef.current) {
        wsControllerRef.current.close()
        wsControllerRef.current = null
      }
    }

    const setupWsController = () => {
      if (!isMountedRef.current) return

      const socket = new WebSocket(import.meta.env.VITE_CONTROLLER_URI)

      socket.onopen = () => {
        if (!isMountedRef.current) {
          socket.close()
          return
        }

        setWsControllerConnected(true)

        wsControllerPingRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: ControllerSendAction.Ping }))
          }
        }, WS_CONTROLLER_PING_INTERVAL)
      }

      socket.onclose = () => {
        if (wsControllerPingRef.current) {
          clearInterval(wsControllerPingRef.current)
          wsControllerPingRef.current = null
        }

        if (isMountedRef.current) {
          setWsControllerConnected(false)

          reconnectTimeoutRef.current = setTimeout(() => {
            setupWsController()
          }, WS_CONTROLLER_SETUP_TIMEOUT)
        }
      }

      socket.onerror = error => {
        console.error("[WavixWebRTC] Failed to connect to ws controller", error)
        if (isMountedRef.current) {
          errorContext.setWidgetError("server-connection-error")
        }
      }

      wsControllerRef.current = socket
    }

    setupWsController()

    return () => {
      isMountedRef.current = false
      cleanup()
    }
  }, [])

  return (
    <WsControllerContext.Provider
      value={{ wsController: wsControllerRef.current, isWsControllerConnected, sendToWsController }}
    >
      {children}
    </WsControllerContext.Provider>
  )
}
