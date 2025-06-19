import { useContext } from "react"

import { ScreenContext } from "@widget/providers/ScreenProvider"

import { History as HistoryScreen } from "./screens/History"

import type { WidgetHistoryScreen } from "@interfaces/widget-screen"
import type { FC, ReactNode } from "react"

type Props = {
  onOutbound: (phone: string) => void
}

export const History: FC<Props> = ({ onOutbound }) => {
  const { widgetScreenData } = useContext(ScreenContext)
  const { screen } = widgetScreenData

  const getScreen = (historyScreen: WidgetHistoryScreen) => {
    const widgetHistoryScreens: Record<WidgetHistoryScreen, ReactNode> = {
      history: <HistoryScreen onOutbound={onOutbound} />
    }

    return widgetHistoryScreens[historyScreen] || widgetHistoryScreens.history
  }

  return <>{getScreen(screen as WidgetHistoryScreen)}</>
}
