import { render } from "preact"

import { WidgetApp } from "@widget/index"

import { injectFonts } from "@helpers/shared"
import { preloadSounds } from "@helpers/sound"
import {
  defaultCallData,
  externalWindowEventsListener,
  GlobalHelpers,
  injectBaseStyles,
  injectCustomStyles
} from "@helpers/widget"

import type { Config, ListenerEvent } from "@interfaces/widget"

const eventListeners = defaultCallData.listeners

const initWavixWebRTC = async (config: Config): Promise<string | null> => {
  const { widget, sip } = config

  if (!sip.server || !sip.token) {
    console.error(`[WavixWebRTC] server and token are required`)
    return null
  }

  try {
    const configToken = btoa(JSON.stringify(config))

    // window injection
    if (!widget.containerId) {
      externalWindowEventsListener(eventListeners)

      return configToken
    }

    // spa injection
    const widgetRoot = document.getElementById(widget.containerId)

    if (!widgetRoot) {
      console.error(`[WavixWebRTC] Element with id "${widget.containerId}" not found`)
      return null
    }

    await injectFonts()
    await injectBaseStyles()
    await injectCustomStyles(widget.customStyles)

    preloadSounds()

    render(<WidgetApp config={config} />, widgetRoot)

    // eslint-disable-next-line no-console
    console.info(`[WavixWebRTC] Initialized ver: ${import.meta.env.PACKAGE_VERSION}`)

    return configToken
  } catch (error) {
    console.error(`[WavixWebRTC] Error: ${error}`)
    return null
  }
}

const wavixWebRTC = {
  init: initWavixWebRTC,
  widgetWindowLink: null,
  call: (to: string, callerId?: string) => {
    GlobalHelpers.updateCallData(to, callerId)
  },
  on: (event: ListenerEvent, callback: () => void) => {
    if (!(event in eventListeners)) return
    eventListeners[event].push(callback)
  }
}

// @ts-ignore
window.wavixWebRTC = wavixWebRTC
