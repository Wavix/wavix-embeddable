import { useState, useEffect, useContext, createContext } from "react"

import { ScreenContext } from "@widget/providers/ScreenProvider"

import { knownErrors } from "./helpers"

import type { ErrorType, WidgetErrorData, WidgetErrors, WidgetErrorContext } from "@interfaces/widget-error"
import type { FC, ReactNode } from "react"

type Props = {
  children: ReactNode
}

export const ErrorContext = createContext<WidgetErrorContext>({
  widgetErrors: {},
  setWidgetError: () => {},
  clearWidgetError: () => {}
})

export const ErrorProvider: FC<Props> = ({ children }) => {
  const { setWidgetScreenData } = useContext(ScreenContext)

  const [widgetErrors, setWidgetErrors] = useState<WidgetErrors>({})
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const setWidgetError = (errorType: ErrorType, externalErrorData?: WidgetErrorData) => {
    setWidgetErrors(prevErrors => ({
      ...prevErrors,
      [errorType]: { ...knownErrors[errorType], ...externalErrorData }
    }))
  }

  const clearWidgetError = (errorType: ErrorType) => {
    setWidgetErrors(prevErrors =>
      Object.entries(prevErrors).reduce((acc, [key, value]) => {
        if (key === errorType) {
          return acc
        }

        return { ...acc, [key]: value }
      }, {})
    )
  }

  const onRequestMicrophone = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })

      clearWidgetError("microphone-error")
    } catch (error) {
      const e = error as Error

      if (e.name === "NotAllowedError") {
        setWidgetError("microphone-error", { onErrorButtonClick: onRequestMicrophone })
      }

      console.error(`[WavixWebRTC] Microphone permission error: ${e}`)
    }
  }

  useEffect(() => {
    if (Object.keys(widgetErrors).length) {
      setWidgetScreenData("error")
    } else {
      setWidgetScreenData("home")
    }
  }, [widgetErrors])

  useEffect(() => {
    if (isOnline) {
      clearWidgetError("network-connection-error")
    } else {
      setWidgetError("network-connection-error", {
        onErrorButtonClick: () => {}
      })
    }
  }, [isOnline])

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  useEffect(() => {
    const checkMicrophoneStatus = async () => {
      try {
        const microphoneStatus = await navigator.permissions.query({ name: "microphone" as PermissionName })

        if (microphoneStatus.state === "denied" || microphoneStatus.state === "prompt") {
          setWidgetError("microphone-error", { onErrorButtonClick: onRequestMicrophone })
        } else {
          clearWidgetError("microphone-error")
        }

        microphoneStatus.onchange = () => {
          if (microphoneStatus.state === "granted") {
            clearWidgetError("microphone-error")
          } else {
            setWidgetError("microphone-error", { onErrorButtonClick: onRequestMicrophone })
          }
        }
      } catch (error) {
        setWidgetError("microphone-error", { onErrorButtonClick: onRequestMicrophone })

        console.error(`[WavixWebRTC] Microphone permission error: ${error}`)
      }
    }

    checkMicrophoneStatus()

    navigator.mediaDevices.addEventListener("devicechange", checkMicrophoneStatus)

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", checkMicrophoneStatus)
    }
  }, [])

  return (
    <ErrorContext.Provider value={{ widgetErrors, setWidgetError, clearWidgetError }}>{children}</ErrorContext.Provider>
  )
}
