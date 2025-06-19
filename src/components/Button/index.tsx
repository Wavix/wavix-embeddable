import clsx from "clsx"

import type { FC, ReactNode } from "react"

import "./style.scss"

type Props = {
  children: ReactNode
  onClick?: (event: MouseEvent) => void
  type?: "button" | "submit" | "reset"
  variant?: "main" | "accent" | "negative"
  disabled?: boolean
}

export const Button: FC<Props> = ({ children, onClick, type = "button", variant = "main", disabled }) => (
  <button
    className={clsx("webrtc-widget-button", `webrtc-widget-button--${variant}`, "webrtc-widget-button--transition")}
    type={type} // eslint-disable-line react/button-has-type
    onClick={event => onClick?.(event)}
    disabled={disabled}
  >
    {children}
  </button>
)
