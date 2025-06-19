import { useContext, useEffect, useRef, useState } from "react"

import { ScreenTransition } from "@widget/components"
import { ScreenContext } from "@widget/providers/ScreenProvider"

import { getSettings, saveSettings } from "@helpers/widget"

import { About as AboutScreen } from "./screens/About"
import { Call as CallScreen } from "./screens/Call"
import { Main as MainScreen } from "./screens/Main"

import type { Config, WidgetSettings } from "@interfaces/widget"
import type { WidgetScreen, WidgetSettingsScreen } from "@interfaces/widget-screen"
import type { FC, ReactNode } from "react"

type Props = {
  config: Config
  activeCallerId?: string
  setActiveCallerId: (callerId?: string) => void
}

const settingsScreens: Array<WidgetSettingsScreen> = ["main-settings", "call-settings", "about-settings"]

export const Settings: FC<Props> = ({ config, activeCallerId, setActiveCallerId }) => {
  const { widgetScreenData } = useContext(ScreenContext)
  const { screen } = widgetScreenData

  const [settings, setSettings] = useState<WidgetSettings>(getSettings())

  /**
   * NOTE: only for screen transition
   */
  const [activeScreen, setActiveScreen] = useState<WidgetScreen>(screen)
  const prevActiveScreenRef = useRef<WidgetSettingsScreen>("main-settings")

  const onChangeSettings = (key: keyof WidgetSettings, value: WidgetSettings[keyof WidgetSettings]) => {
    setSettings(prevData => ({ ...prevData, [key]: value }))

    saveSettings({ ...settings, [key]: value })
  }

  const getScreen = (settingsScreen: WidgetSettingsScreen) => {
    const widgetSettingsScreens: Record<WidgetSettingsScreen, ReactNode> = {
      "main-settings": (
        <MainScreen
          settings={settings}
          onChangeSettings={onChangeSettings}
          showCallSettings={!!(config.sip.callerIds?.length && config.sip.callerIds.length > 1)}
        />
      ),
      "call-settings": (
        <CallScreen config={config} activeCallerId={activeCallerId} setActiveCallerId={setActiveCallerId} />
      ),
      "about-settings": <AboutScreen config={config} />
    }

    return widgetSettingsScreens[settingsScreen] || widgetSettingsScreens[prevActiveScreenRef.current]
  }

  useEffect(() => {
    if (settingsScreens.includes(screen as WidgetSettingsScreen)) {
      prevActiveScreenRef.current = screen as WidgetSettingsScreen
    }
  }, [screen])

  return (
    <ScreenTransition screen={screen} activeScreen={activeScreen} setActiveScreen={setActiveScreen}>
      {getScreen(activeScreen as WidgetSettingsScreen)}
    </ScreenTransition>
  )
}
