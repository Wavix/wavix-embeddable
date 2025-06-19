import type { ReactNode } from "react"

export type ErrorType =
  | "authentication-error"
  | "custom-error"
  | "microphone-error"
  | "multiple-sessions-error"
  | "network-connection-error"
  | "server-connection-error"

export type WidgetErrorData = {
  icon?: ReactNode
  title?: string
  description?: ReactNode
  buttonText?: string
  onErrorButtonClick?: () => void
}

export type WidgetErrors = Partial<Record<ErrorType, WidgetErrorData>>

export type WidgetErrorContext = {
  widgetErrors: WidgetErrors
  setWidgetError: (errorType: ErrorType, externalErrorData?: WidgetErrorData) => void
  clearWidgetError: (errorType: ErrorType) => void
}
