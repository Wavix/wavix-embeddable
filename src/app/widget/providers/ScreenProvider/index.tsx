import { useState, createContext } from "react"

import { tabsData } from "./helpers"

import type { WidgetTab, WidgetScreen, WidgetScreenData, WidgetScreenContext } from "@interfaces/widget-screen"
import type { FC, ReactNode } from "react"

type Props = {
  children: ReactNode
}

export const ScreenContext = createContext<WidgetScreenContext>({
  widgetScreenData: {
    tab: "call-tab",
    screen: "home"
  },
  setWidgetScreenData: () => {}
})

export const ScreenProvider: FC<Props> = ({ children }) => {
  const [widgetScreenData, setWidgetScreen] = useState<WidgetScreenData>({
    tab: "call-tab",
    screen: "home"
  })

  const setWidgetScreenData = (screen: WidgetScreen) => {
    const tab = (Object.keys(tabsData) as Array<WidgetTab>).find(key => tabsData[key].includes(screen))

    if (tab) {
      setWidgetScreen({ tab, screen })
    }
  }

  return <ScreenContext.Provider value={{ widgetScreenData, setWidgetScreenData }}>{children}</ScreenContext.Provider>
}
