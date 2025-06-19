export type WidgetCallScreen = "home" | "in-call" | "inbound" | "outbound"
export type WidgetHistoryScreen = "history"
export type WidgetSettingsScreen = "main-settings" | "call-settings" | "about-settings"
export type WidgetErrorScreen = "error"

export type WidgetTab = "call-tab" | "history-tab" | "settings-tab" | "error-tab"
export type WidgetScreen = WidgetCallScreen | WidgetHistoryScreen | WidgetSettingsScreen | WidgetErrorScreen

export type WidgetScreenData = {
  tab: WidgetTab
  screen: WidgetScreen
}

export type WidgetScreenContext = {
  widgetScreenData: WidgetScreenData
  setWidgetScreenData: (screen: WidgetScreen) => void
}
