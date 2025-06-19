import { useContext, useState } from "react"

import { ScreenTransition } from "@widget/components"
import { CallDataContext } from "@widget/providers/CallDataProvider"
import { ScreenContext } from "@widget/providers/ScreenProvider"

import { Home as HomeScreen } from "./screens/Home"
import { InCall as InCallScreen } from "./screens/InCall"
import { Inbound as InboundScreen } from "./screens/Inbound"
import { Outbound as OutboundScreen } from "./screens/Outbound"

import type { Config } from "@interfaces/widget"
import type { WidgetCallScreen, WidgetScreen } from "@interfaces/widget-screen"
import type { ActiveSession } from "@interfaces/widget-session"
import type { FC, ReactNode } from "react"

type Props = {
  config: Config
  activeCallerId?: string
  setActiveCallerId: (callerId?: string) => void
  isRemoteSpeaking: boolean
  session: ActiveSession | null
  onOutbound: (phone: string) => void
}

export const Call: FC<Props> = ({
  config,
  activeCallerId,
  setActiveCallerId,
  isRemoteSpeaking,
  session,
  onOutbound
}) => {
  const { to } = useContext(CallDataContext)
  const { widgetScreenData } = useContext(ScreenContext)
  const { screen } = widgetScreenData

  /**
   * NOTE: only for screen transition
   */
  const [activeScreen, setActiveScreen] = useState<WidgetScreen>(screen)

  const getScreen = (callScreen: WidgetCallScreen) => {
    const widgetCallScreens: Record<WidgetCallScreen, ReactNode> = {
      "home": (
        <HomeScreen
          config={config}
          activeCallerId={activeCallerId}
          setActiveCallerId={setActiveCallerId}
          to={to}
          onOutbound={onOutbound}
        />
      ),
      "in-call": <InCallScreen session={session} isRemoteSpeaking={isRemoteSpeaking} />,
      "inbound": <InboundScreen session={session} isRemoteSpeaking={isRemoteSpeaking} />,
      "outbound": <OutboundScreen session={session!} isRemoteSpeaking={isRemoteSpeaking} />
    }

    return widgetCallScreens[callScreen] || widgetCallScreens.home
  }

  return (
    <ScreenTransition screen={screen} activeScreen={activeScreen} setActiveScreen={setActiveScreen}>
      {getScreen(activeScreen as WidgetCallScreen)}
    </ScreenTransition>
  )
}
