import { useState, useEffect, useRef } from "react"

import clsx from "clsx"

import type { WidgetScreen } from "@interfaces/widget-screen"
import type { FC, ReactNode } from "react"

import "./style.scss"

type Props = {
  screen: WidgetScreen
  activeScreen: WidgetScreen
  setActiveScreen: (screen: WidgetScreen) => void
  children: ReactNode
}

const transitionPairs: Array<Array<WidgetScreen>> = [
  ["home", "outbound"],
  ["home", "inbound"],
  ["home", "in-call"],
  ["history", "outbound"],
  ["history", "inbound"],
  ["history", "in-call"],
  ["main-settings", "call-settings"],
  ["call-settings", "main-settings"],
  ["main-settings", "about-settings"],
  ["about-settings", "main-settings"]
]

export const ScreenTransition: FC<Props> = ({ screen, activeScreen, setActiveScreen, children }) => {
  const [isTransitionActive, setTransitionActive] = useState(false)

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setScreenWithTransition = () => {
    const prevScreen = activeScreen
    const nextScreen = screen

    if (transitionPairs.some(([from, to]) => from === prevScreen && to === nextScreen)) {
      transitionTimerRef.current && clearTimeout(transitionTimerRef.current)

      setTransitionActive(true)

      transitionTimerRef.current = setTimeout(() => {
        setTransitionActive(false)

        setActiveScreen(screen)
      }, 300)
    } else {
      setActiveScreen(screen)
    }
  }

  useEffect(() => {
    if (screen === activeScreen) return

    setScreenWithTransition()
  }, [screen])

  return (
    <div
      className={clsx("webrtc-widget-screen-transition", {
        "webrtc-widget-screen-transition--active": isTransitionActive
      })}
    >
      {children}
    </div>
  )
}
