import { useContext } from "react"

import clsx from "clsx"

import { ScreenContext } from "@widget/providers/ScreenProvider"

import SettingsArrow from "@assets/icons/settings-arrow.svg?react"

import { getWidgetPath } from "@helpers/shared"

import type { WidgetScreen } from "@interfaces/widget-screen"
import type { FC } from "react"

import "./style.scss"

type Props = {
  customLogo?: string
  customLink?: string
}

const screensWithBackButton: Array<WidgetScreen> = ["call-settings", "about-settings"]

export const Header: FC<Props> = ({ customLogo, customLink }) => {
  const { widgetScreenData, setWidgetScreenData } = useContext(ScreenContext)
  const { screen } = widgetScreenData

  const imgSrc = customLogo || `${getWidgetPath()}/logo.svg`
  const linkHref = customLogo ? customLink : "https://app.wavix.com"

  return (
    <div className="webrtc-widget-header">
      <div
        className={clsx("webrtc-widget-header__back_button", {
          "webrtc-widget-header__back_button--show": screensWithBackButton.includes(screen)
        })}
        onClick={() => setWidgetScreenData("main-settings")}
      >
        <SettingsArrow />
      </div>

      {linkHref ? (
        <a href={linkHref} target="_blank" rel="noopener noreferrer">
          <img src={imgSrc} alt="logo" className="webrtc-widget-header__logo" />
        </a>
      ) : (
        <img src={imgSrc} alt="logo" className="webrtc-widget-header__logo" />
      )}
    </div>
  )
}
