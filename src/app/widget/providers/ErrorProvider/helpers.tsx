import Microphone from "@assets/icons/microphone.svg?react"
import NoConnection from "@assets/icons/no-connection.svg?react"

import type { WidgetErrors } from "@interfaces/widget-error"

export const knownErrors: WidgetErrors = {
  "authentication-error": {
    title: "Authentication error"
  },
  "custom-error": {},
  "microphone-error": {
    icon: (
      <div className="webrtc-widget-error-container__icon">
        <Microphone />
      </div>
    ),
    title: "Microphone access unavailable",
    description: (
      <>
        Check your browser settings to
        <br />
        enable microphone access
      </>
    ),
    buttonText: "Try again"
  },
  "multiple-sessions-error": {
    title: "Multiple sessions",
    description: (
      <>
        An active session is currently open
        <br />
        in another window or device.
        <br />
        Click &apos;Switch&apos; to end the other
        <br />
        session and continue here.
      </>
    ),
    buttonText: "Switch"
  },
  "network-connection-error": {
    icon: (
      <div className="webrtc-widget-error-container__icon">
        <NoConnection />
      </div>
    ),
    title: "No internet connection",
    description: (
      <>
        Check your internet connection to
        <br />
        continue
      </>
    ),
    buttonText: "Try again"
  },
  "server-connection-error": {
    title: "Unable to connect to server"
  }
}
