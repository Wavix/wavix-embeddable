import type { WidgetTab, WidgetScreen } from "@interfaces/widget-screen"

export const tabsData: Record<WidgetTab, Array<WidgetScreen>> = {
  "call-tab": ["home", "outbound", "inbound", "in-call"],
  "history-tab": ["history"],
  "settings-tab": ["main-settings", "call-settings", "about-settings"],
  "error-tab": ["error"]
}
