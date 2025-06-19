export type DemoInjectedWidget = {
  spa: boolean
  window: boolean
}

export type DemoTab = "spa" | "window"

export type DemoFormData = {
  sipServer: string
  token: string
  callerIds: string
  customStyles: string
  customLogo: string
  customLink: string
  withLogo: boolean
  autoDial: boolean
  allowSelectCallerId: boolean
}
