import { useContext } from "react"

import clsx from "clsx"

import { ScreenContainer } from "@widget/components"
import { AccountContext } from "@widget/providers/AccountProvider"
import { ScreenContext } from "@widget/providers/ScreenProvider"

import SettingsArrow from "@assets/icons/settings-arrow.svg?react"

import { Copy } from "@components/index"

import type { Config } from "@interfaces/widget"
import type { FC } from "react"

import "./style.scss"

type Props = {
  config: Config
}

export const About: FC<Props> = ({ config }) => {
  const { setWidgetScreenData } = useContext(ScreenContext)
  const { sipAccounts, activeSipAccountSessionId } = useContext(AccountContext)

  const activeSipAccount = activeSipAccountSessionId ? sipAccounts[activeSipAccountSessionId] : null
  const sessionId = activeSipAccount?.sessionId || "Unknown"
  const webrtcUuid = activeSipAccount?.webrtcUuid || "Unknown"

  return (
    <ScreenContainer>
      <div className="webrtc-widget-about-settings">
        <div
          className={clsx("webrtc-widget-about-settings__back_button", {
            "webrtc-widget-about-settings__back_button--with-logo": config.widget.withLogo
          })}
          onClick={() => setWidgetScreenData("main-settings")}
        >
          <SettingsArrow />
        </div>

        <h3 className="webrtc-widget-about-settings__title">About widget</h3>

        <p className="webrtc-widget-about-settings__description">
          You may be asked to provide the Widget ID to help troubleshoot your issue
        </p>

        <Copy text={webrtcUuid} label="Widget ID" name="widget_id" />
        <Copy text={sessionId} label="Session ID" name="session_id" />

        <div className="webrtc-widget-about-settings__version">Version {import.meta.env.PACKAGE_VERSION}</div>
      </div>
    </ScreenContainer>
  )
}
