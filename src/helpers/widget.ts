import { sessionCallerIdRegExp } from "@utils/regexp"

import { CallerIdType } from "@interfaces/widget"

import { getWidgetPath } from "./shared"

import type {
  CallHistory,
  Config,
  ExternalCallData,
  ExternalCallPayload,
  ListenerEvent,
  Listeners,
  WidgetChannelMessage,
  WidgetSettings
} from "@interfaces/widget"
import type { Account } from "@interfaces/widget-account"
import type { ActiveSession } from "@interfaces/widget-session"
import type { Session } from "sip.js"

/**
 * NOTE: init listeners
 * channel init in both windows because this module is using in parent and children windows
 */
const channel = new BroadcastChannel("wavix_webrtc")

export const execListeners = (listeners: Listeners, event: ListenerEvent, isWindow?: boolean, payload?: any) => {
  // window
  if (isWindow) {
    const message: WidgetChannelMessage = { event, payload }

    channel.postMessage(message)
    return
  }
  // spa
  if (!(event in listeners)) return
  if (!listeners[event].length) return
  try {
    listeners[event].forEach(callback => {
      callback({ ...payload })
    })
  } catch (error) {
    console.error(error)
  }
}

export const externalWindowEventsListener = (listeners: Listeners) => {
  channel.onmessage = (payload: MessageEvent<WidgetChannelMessage>) => {
    const widgetMessage = payload.data

    execListeners(listeners, widgetMessage.event, false, widgetMessage.payload)
  }
}

/**
 * NOTE: call data helpers
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-underscore-dangle
let _updateCallData = (_to: string, _callerId?: string) => {}

export const GlobalHelpers = {
  get updateCallData() {
    return _updateCallData
  },
  setUpdateCallData(fn: (_to: string, _callerId?: string) => void) {
    _updateCallData = fn
  }
}
Object.freeze(GlobalHelpers)

export const defaultCallPayload: ExternalCallPayload = {
  to: "",
  callerId: undefined
}

export const defaultCallData: ExternalCallData = {
  to: "",
  callerId: undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateCallData: (_to: string, _callerId?: string) => {},
  clearCallData: () => {},
  listeners: {
    call_setup: [],
    error: [],
    declined: [],
    completed: [],
    busy: [],
    ringing: [],
    answered: [],
    registered: [],
    unregistered: []
  }
}

/**
 * NOTE: init styles
 */
export const injectCustomStyles = async (path?: string) => {
  const currentStyles = document.querySelector("link[data-custom-styles]")

  if (currentStyles) {
    currentStyles.remove()
  }

  if (!path) return

  const newStyles = document.createElement("link")
  newStyles.setAttribute("data-custom-styles", "true")

  newStyles.rel = "stylesheet"
  newStyles.href = path

  document.head.appendChild(newStyles)

  await new Promise(resolve => {
    newStyles.onload = resolve
    newStyles.onerror = () => console.error(`[WavixWebRTC] Failed to load custom styles: ${path}`)
  })
}

export const injectBaseStyles = async () => {
  const currentStyles = document.querySelector("link[data-base-styles]")

  if (currentStyles) {
    currentStyles.remove()
  }

  const newStyles = document.createElement("link")
  newStyles.setAttribute("data-base-styles", "true")

  newStyles.rel = "stylesheet"
  newStyles.href = `${getWidgetPath()}/style.css`

  document.head.appendChild(newStyles)

  await new Promise(resolve => {
    newStyles.onload = resolve
    newStyles.onerror = () => console.error(`[WavixWebRTC] Failed to load base styles`)
  })
}

/**
 * NOTE: config helpers
 */
export const getParsedConfig = (config: Config): Config => {
  let callerIds: Array<string> = []

  if (Array.isArray(config.sip.callerIds)) {
    callerIds = config.sip.callerIds.filter(Boolean).map(callerId => String(callerId).trim())
  }

  return {
    widget: { ...config.widget },
    sip: { ...config.sip, callerIds },
    inner: { ...config.inner }
  }
}

/**
 * NOTE: history helpers
 */
const HISTORY_DATA_MAX_LENGTH = 20

export const getHistory = () => {
  const historyData = localStorage.getItem("phone-history")

  const callHistory: Array<CallHistory> = historyData ? JSON.parse(historyData) : []

  return callHistory
}

export const saveHistory = (session: ActiveSession | null) => {
  if (!session) return

  const historyData = localStorage.getItem("phone-history")

  const callHistory: Array<CallHistory> = historyData ? JSON.parse(historyData) : []

  callHistory.push({
    number: session.number,
    date: session.startedAt,
    direction: session.direction,
    is_success: !!session.answeredAt
  })

  if (callHistory.length > HISTORY_DATA_MAX_LENGTH) {
    callHistory.shift()
  }

  localStorage.setItem("phone-history", JSON.stringify(callHistory))

  window.dispatchEvent(new Event("phone-history-update"))
}

/**
 * NOTE: settings helpers
 */
export const getSettings = () => {
  const settingsJson = localStorage.getItem("phone-settings")

  const settings: WidgetSettings = { buttonSound: true }

  if (!settingsJson) {
    return settings
  }

  return JSON.parse(settingsJson) as WidgetSettings
}

export const saveSettings = (settings: WidgetSettings) => {
  localStorage.setItem("phone-settings", JSON.stringify(settings))
}

/**
 * NOTE: media helpers
 */
const VOLUME_THRESHOLD = 8
const FFT_SIZE = 256

const getRemoteStream = (session: Session): MediaStream => {
  const remoteStream = new MediaStream()

  if (session.sessionDescriptionHandler) {
    // @ts-ignore
    session.sessionDescriptionHandler.peerConnection.getReceivers().forEach(receiver => {
      if (receiver.track) {
        remoteStream.addTrack(receiver.track)
      }
    })
  }

  return remoteStream
}

const createAudioAnalyzer = (remoteStream: MediaStream) => {
  const audioContext = new AudioContext()

  const source = audioContext.createMediaStreamSource(remoteStream)
  const analyser = audioContext.createAnalyser()

  analyser.fftSize = FFT_SIZE
  const dataArray = new Uint8Array(analyser.frequencyBinCount)

  source.connect(analyser)

  return { analyser, dataArray }
}

const startVoiceDetection = (remoteStream: MediaStream, onVoiceActivity: (value: boolean) => void) => {
  const { analyser, dataArray } = createAudioAnalyzer(remoteStream)

  const detectVoiceActivity = (): void => {
    analyser.getByteFrequencyData(dataArray)

    const averageVolume =
      dataArray.reduce((acc, item) => {
        return acc + item
      }, 0) / dataArray.length

    onVoiceActivity(averageVolume > VOLUME_THRESHOLD)

    requestAnimationFrame(detectVoiceActivity)
  }

  detectVoiceActivity()
}

export const setupRemoteMedia = (session: Session, onVoiceActivity: (value: boolean) => void) => {
  const remoteStream = getRemoteStream(session)

  const audio = document.getElementById("phone-audio") as HTMLAudioElement
  if (audio) {
    audio.srcObject = remoteStream
    audio.play()
  }

  startVoiceDetection(remoteStream, onVoiceActivity)
}

export const cleanupMedia = () => {
  const audio = document.getElementById("phone-audio") as HTMLAudioElement
  audio.srcObject = null
  audio.pause()
}

/**
 * NOTE: call helpers
 */
export const getSessionCallerId = (activeAccount: Account, callerId?: string) => {
  if (!callerId || activeAccount.callerIdType === CallerIdType.Passthrough) {
    return callerId
  }

  return callerId.replace(sessionCallerIdRegExp, "")
}
