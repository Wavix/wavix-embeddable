import { useRef, useState } from "react"

import clsx from "clsx"

import { playSound } from "@helpers/sound"

import type { SoundKey } from "@interfaces/sound"
import type { FC, ReactNode } from "react"

import "./style.scss"

export type DialerButtonData = {
  symbol: SoundKey
  subSymbol?: string
  title: ReactNode
  subTitle?: ReactNode
  onClick?: (symbol: string, isClear?: boolean) => void
}

type Props = DialerButtonData

export const DialerButton: FC<Props> = ({ onClick, symbol, subSymbol, title, subTitle }) => {
  const isLongPressRef = useRef(false)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPressed, setPressed] = useState<boolean>(false)

  const onMouseDown = (event: MouseEvent) => {
    setPressed(true)
    event.preventDefault()

    playSound(symbol)

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    onClick?.(symbol)

    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true

      if (isLongPressRef.current && subSymbol) {
        onClick?.(subSymbol, true)
        setPressed(false)
      }
    }, 1000)
  }

  const onMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    setPressed(false)
    isLongPressRef.current = false
  }

  return (
    <button
      className={clsx("webrtc-widget-dialer-button", "webrtc-widget-dialer-button--transition", {
        "webrtc-widget-dialer-button--with-subtitle": !!subTitle,
        "webrtc-widget-dialer-button--pressed": isPressed
      })}
      type="button"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <p className="webrtc-widget-dialer-button__text">{title}</p>
      {subTitle && <span className="webrtc-widget-dialer-button__subtext">{subTitle}</span>}
    </button>
  )
}
