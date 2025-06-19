/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useContext } from "react"

import clsx from "clsx"

import { ScreenContext } from "@widget/providers/ScreenProvider"

import Keyboard from "@assets/icons/keyboard.svg?react"
import Menu from "@assets/icons/menu.svg?react"
import Timer from "@assets/icons/timer.svg?react"

import type { FC } from "react"

import "./style.scss"

export const TabBar: FC = () => {
  const { widgetScreenData, setWidgetScreenData } = useContext(ScreenContext)
  const { screen, tab } = widgetScreenData

  const isTabBarDisabled = screen === "in-call" || screen === "inbound" || screen === "outbound"
  const isTabBarHidden = tab === "error-tab"

  return (
    <nav
      className={clsx("webrtc-widget-tab-bar", {
        "webrtc-widget-tab-bar--disabled": isTabBarDisabled,
        "webrtc-widget-tab-bar--hidden": isTabBarHidden
      })}
    >
      <ul>
        <li
          className={clsx("webrtc-widget-tab-bar__item", "webrtc-widget-tab-bar__item--transition", {
            "webrtc-widget-tab-bar__item--active": tab === "call-tab",
            "webrtc-widget-tab-bar__item--disabled": isTabBarDisabled
          })}
          onClick={() => setWidgetScreenData("home")}
        >
          <Keyboard />
        </li>
        <li
          className={clsx("webrtc-widget-tab-bar__item", "webrtc-widget-tab-bar__item--transition", {
            "webrtc-widget-tab-bar__item--active": tab === "history-tab",
            "webrtc-widget-tab-bar__item--disabled": isTabBarDisabled
          })}
          onClick={() => setWidgetScreenData("history")}
        >
          <Timer />
        </li>
        <li
          className={clsx("webrtc-widget-tab-bar__item", "webrtc-widget-tab-bar__item--transition", {
            "webrtc-widget-tab-bar__item--active": tab === "settings-tab",
            "webrtc-widget-tab-bar__item--disabled": isTabBarDisabled
          })}
          onClick={() => setWidgetScreenData("main-settings")}
        >
          <Menu />
        </li>
      </ul>
    </nav>
  )
}
/* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
