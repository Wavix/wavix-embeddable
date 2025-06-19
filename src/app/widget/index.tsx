import { useEffect } from "react"

import clsx from "clsx"

import { Widget } from "@widget/Widget"
import { AccountProvider } from "@widget/providers/AccountProvider"
import { CallDataProvider } from "@widget/providers/CallDataProvider"
import { ErrorProvider } from "@widget/providers/ErrorProvider"
import { ScreenProvider } from "@widget/providers/ScreenProvider"
import { SessionProvider } from "@widget/providers/SessionProvider"
import { SipEventProvider } from "@widget/providers/SipEventProvider"
import { WsControllerProvider } from "@widget/providers/WsControllerProvider"

import { getParsedConfig } from "@helpers/widget"

import type { Config } from "@interfaces/widget"
import type { FC } from "react"

import "@styles/index.scss"
import "./style.scss"

type Props = {
  config: Config
}

export const WidgetApp: FC<Props> = ({ config }) => {
  useEffect(() => {
    const isWindow = config.inner?.isWindow
    const { windowTitle } = config.widget

    if (!isWindow || !windowTitle) return

    document.title = windowTitle
  }, [])

  return (
    <div
      className={clsx("webrtc-widget", {
        "webrtc-widget--with-logo": config.widget.withLogo,
        "webrtc-widget--spa": !config.inner?.isWindow
      })}
    >
      <CallDataProvider>
        <ScreenProvider>
          <ErrorProvider>
            <WsControllerProvider>
              <AccountProvider config={getParsedConfig(config)}>
                <SessionProvider>
                  <SipEventProvider config={getParsedConfig(config)}>
                    <Widget config={getParsedConfig(config)} />
                  </SipEventProvider>
                </SessionProvider>
              </AccountProvider>
            </WsControllerProvider>
          </ErrorProvider>
        </ScreenProvider>
      </CallDataProvider>
    </div>
  )
}
