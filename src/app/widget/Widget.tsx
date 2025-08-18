import { useCallback, useContext, useEffect, useRef, useState } from "react"

import clsx from "clsx"
import { useAudio } from "react-use"
import { Inviter, Registerer, RegistererState, SessionState, UserAgent } from "sip.js"
import { v4 as uuidv4 } from "uuid"

import { Header, TabBar } from "@widget/components"
import { AccountContext } from "@widget/providers/AccountProvider"
import { CallDataContext } from "@widget/providers/CallDataProvider"
import { ErrorContext } from "@widget/providers/ErrorProvider"
import { ScreenContext } from "@widget/providers/ScreenProvider"
import { SessionContext } from "@widget/providers/SessionProvider"
import { getActiveSipSession } from "@widget/providers/SessionProvider/helpers"
import { SipEventContext } from "@widget/providers/SipEventProvider"
import { WsControllerContext } from "@widget/providers/WsControllerProvider"
import { Call as CallTab, Error as ErrorTab, History as HistoryTab, Settings as SettingsTab } from "@widget/tabs"

import { getWidgetPath } from "@helpers/shared"
import { cleanupMedia, execListeners, saveHistory, setupRemoteMedia, getSessionCallerId } from "@helpers/widget"

import { CallerIdType } from "@interfaces/widget"
import { AccountAction, AccountState } from "@interfaces/widget-account"
import { ControllerSendAction, ControllerReceiveAction } from "@interfaces/widget-controller"
import { SessionAction, SessionDirection, SessionStatus } from "@interfaces/widget-session"
import { SipEvent } from "@interfaces/widget-sip-event"

import type { Config } from "@interfaces/widget"
import type { Account } from "@interfaces/widget-account"
import type { ControllerReceiveEvent } from "@interfaces/widget-controller"
import type { ActiveSession } from "@interfaces/widget-session"
import type { BaseSipEventPayload } from "@interfaces/widget-sip-event"
import type { FC } from "react"
import type { Core, Invitation } from "sip.js"

type Props = {
  config: Config
}

const REGISTRATION_TIMEOUT = 1_000
const REGISTRATION_INTERVAL = 60_000
const REFRESH_TOKEN_INTERVAL = 13 * 60_000

export const Widget: FC<Props> = ({ config }) => {
  const { listeners, to, callerId, clearCallData } = useContext(CallDataContext)
  const { widgetScreenData, setWidgetScreenData } = useContext(ScreenContext)
  const { widgetErrors, setWidgetError, clearWidgetError } = useContext(ErrorContext)
  const { wsController, isWsControllerConnected, sendToWsController } = useContext(WsControllerContext)
  const { sipAccounts, activeSipAccountSessionId, updateSipAccount } = useContext(AccountContext)
  const { sessions, activeSessionId, updateSession, setActiveSessionId, dropSessions } = useContext(SessionContext)
  const { setInboundSipEventPayload, sendEvent } = useContext(SipEventContext)
  const registrationInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const screenSwitchDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentJwtRef = useRef<string | null>(null)
  const hasActiveCallRef = useRef<boolean>(false)
  const ringSoundIntervalRef = useRef(0)
  const sessionsRef = useRef<Record<string, ActiveSession>>({})

  const [isRemoteSpeaking, setIsRemoteSpeaking] = useState(false)
  const [activeExternalCallerId, setActiveExternalCallerId] = useState<string | undefined>(config.sip.callerIds?.[0])

  const [ringAudio, , ringControls] = useAudio({
    src: `${getWidgetPath()}/assets/ring.wav`,
    autoPlay: false
  })

  const isWindow = config.inner?.isWindow
  const activeSessionStatus = getActiveSipSession(sessions, activeSessionId)?.status

  // const startRingSound = () => {
  //   if (ringSoundIntervalRef.current) return
  //   ringControls.play()
  //   ringSoundIntervalRef.current = window.setInterval(() => ringControls.play(), 2000)
  // }

  const stopRingSound = () => {
    ringControls.pause()

    if (ringSoundIntervalRef.current) {
      clearInterval(ringSoundIntervalRef.current)
      ringSoundIntervalRef.current = 0
    }
  }

  const onRefreshToken = (token: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    sendToWsController({ type: ControllerSendAction.GenerateToken, webrtc_token: token })
  }

  const onDropMultipleSessions = useCallback(() => {
    if (!activeSipAccountSessionId) return

    const activeAccount = sipAccounts[activeSipAccountSessionId]

    sendToWsController({
      type: ControllerSendAction.SessionCatchRequest,
      session_id: activeAccount.sessionId,
      version: import.meta.env.PACKAGE_VERSION,
      webrtc_token: activeAccount.webrtcToken
    })

    if (registrationInterval.current) {
      clearInterval(registrationInterval.current)
    }

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    updateSipAccount({ type: AccountAction.ChangeState, ...activeAccount, state: AccountState.UnRegistered })

    clearWidgetError("multiple-sessions-error")
  }, [sipAccounts, activeSipAccountSessionId])

  const sipRegistrationRequest = (account: Account, registerer: Registerer) => {
    if (!currentJwtRef.current) return

    registerer.register({
      requestOptions: {
        extraHeaders: [`X-token-jwt: ${currentJwtRef.current}`]
      },
      requestDelegate: {
        onAccept() {
          sendEvent({ type: SipEvent.Registered, payload: { token_uuid: account.webrtcUuid } })
        },
        onReject: response => {
          if (response.message.reasonPhrase?.includes("Unauthorized")) {
            updateSipAccount({
              type: AccountAction.ChangeState,
              webrtcToken: account.webrtcToken,
              state: AccountState.AccessDenied
            })
            execListeners(listeners, "error", isWindow, { message: "Unauthorized" })

            return
          }

          if (response.message.reasonPhrase?.includes("Forbidden")) {
            updateSipAccount({
              type: AccountAction.ChangeState,
              webrtcToken: account.webrtcToken,
              state: AccountState.InvalidAuth
            })
            setWidgetError("authentication-error", { description: "Token is expired" })
            execListeners(listeners, "error", isWindow, { message: "Token is expired" })

            return
          }

          if (response.message.statusCode === 401) {
            updateSipAccount({
              type: AccountAction.ChangeState,
              webrtcToken: account.webrtcToken,
              state: AccountState.InvalidAuth
            })

            return
          }

          execListeners(listeners, "error", isWindow, { message: response.message?.reasonPhrase || "" })
        }
      }
    })
  }

  const registration = async (account: Account) => {
    if (account.trunkName === "anonymous") return

    if (account.state === AccountState.MultipleSessionDetected || account.state === AccountState.Registered) return

    try {
      updateSipAccount({
        type: AccountAction.ChangeState,
        webrtcToken: account.webrtcToken,
        state: AccountState.Connecting
      })

      const ua = new UserAgent({
        reconnectionAttempts: Infinity,
        logLevel: "error",
        uri: UserAgent.makeURI(`sip:${account.trunkName}@${account.server}`),
        userAgentString: `WavixWebRTC/${import.meta.env.PACKAGE_VERSION}`,
        delegate: {
          onInvite: invitation => {
            const payload = {
              uuid: invitation.request?.getHeader("x-call-uuid") || "",
              to: invitation.request?.getHeader("x-number") || invitation.request.getHeader("x-didinfo") || "",
              from: invitation.request.from.displayName || "Anonymous",
              direction: "inbound",
              token_uuid: account.webrtcUuid
            }

            sendToWsController({
              type: ControllerSendAction.CallInfoRequest,
              call_id: invitation.request.getHeader("x-call-uuid") || "",
              webrtc_token_uuid: account.webrtcUuid,
              webrtc_session_id: account.sessionId
            })

            if (hasActiveCallRef.current) {
              invitation.reject({
                statusCode: 486
              })

              sendEvent({
                type: SipEvent.Declined,
                payload
              })

              return
            }

            setInboundSipEventPayload(payload)

            sendEvent({
              type: SipEvent.CallSetup,
              payload
            })

            onInboundInvite(account, invitation, payload)
          },
          onDisconnect: error => {
            if (!error) return

            updateSipAccount({
              type: AccountAction.ChangeState,
              webrtcToken: account.webrtcToken,
              state: AccountState.UnRegistered
            })

            setTimeout(() => {
              registration(account)
            }, REGISTRATION_TIMEOUT)
          }
        },

        transportOptions: {
          server: `wss://${account.server}:5973/`
          // keepAliveInterval: 10
        }
      })

      const trunkRegistration = new Registerer(ua)

      trunkRegistration.stateChange.addListener(async newState => {
        switch (newState) {
          case RegistererState.Registered:
            updateSipAccount({
              type: AccountAction.ChangeState,
              webrtcToken: account.webrtcToken,
              state: AccountState.Registered
            })
            break

          case RegistererState.Terminated:
            updateSipAccount({
              type: AccountAction.ChangeState,
              webrtcToken: account.webrtcToken,
              state: AccountState.UnRegistered
            })
            break

          case RegistererState.Unregistered:
            updateSipAccount({
              type: AccountAction.ChangeState,
              webrtcToken: account.webrtcToken,
              state: AccountState.UnRegistered
            })
            sendEvent({ type: SipEvent.Unregistered, payload: { token_uuid: account.webrtcUuid } })
            break

          default:
            break
        }
      })

      updateSipAccount({
        type: AccountAction.SetupUserAgent,
        webrtcToken: account.webrtcToken,
        ua
      })

      updateSipAccount({
        type: AccountAction.SetupRegister,
        webrtcToken: account.webrtcToken,
        registration: trunkRegistration
      })

      await ua.start()

      updateSipAccount({
        type: AccountAction.ChangeState,
        webrtcToken: account.webrtcToken,
        state: AccountState.Connecting
      })

      sipRegistrationRequest(account, trunkRegistration)

      if (!registrationInterval.current) {
        registrationInterval.current = setInterval(() => {
          sipRegistrationRequest(account, trunkRegistration)
        }, REGISTRATION_INTERVAL)
      }
    } catch (_) {
      updateSipAccount({
        type: AccountAction.ChangeState,
        webrtcToken: account.webrtcToken,
        state: AccountState.UnRegistered
      })
    }
  }

  const onControllerReceiveEvent = (event: MessageEvent) => {
    try {
      const message: ControllerReceiveEvent = JSON.parse(event.data)

      onControllerReceiveMessage(message)
    } catch (error) {
      console.error("[WavixWebRTC] Failed to parse incoming message", error)
    }
  }

  const onControllerReceiveMessage = async (event: ControllerReceiveEvent) => {
    switch (event.type) {
      case ControllerReceiveAction.RegistrationMultiSessions:
        if (event.token === activeSipAccountSessionId) {
          setWidgetError("multiple-sessions-error", { onErrorButtonClick: onDropMultipleSessions })
        }

        setTimeout(() => {
          updateSipAccount({
            type: AccountAction.ChangeState,
            webrtcToken: event.token,
            state: AccountState.MultipleSessionDetected
          })
        }, 200)

        if (registrationInterval.current) {
          clearInterval(registrationInterval.current)
        }

        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }

        await sipAccounts[event.token].registration?.unregister()
        await sipAccounts[event.token].ua?.stop()
        break

      case ControllerReceiveAction.RegistrationFailed:
        updateSipAccount({
          type: AccountAction.ChangeState,
          webrtcToken: event.token,
          state: AccountState.InvalidAuth
        })

        setWidgetError("authentication-error", { description: event.message })
        break

      case ControllerReceiveAction.RegistrationSuccess:
        updateSipAccount({
          type: AccountAction.SetupConfig,
          webrtcUuid: event.webrtc_uuid,
          webrtcToken: event.webrtc_token,
          jwtToken: event.webrtc_jwt,
          trunkName: event.trunk_name,
          label: event.label,
          callerIdType: event.cli_type,
          callerIds: event.caller_ids
        })

        const payload = {
          sessionId: sipAccounts[event.webrtc_token].sessionId,
          state: sipAccounts[event.webrtc_token].state,
          webrtcUuid: event.webrtc_uuid,
          webrtcToken: event.webrtc_token,
          jwtToken: event.webrtc_jwt,
          trunkName: event.trunk_name,
          server: config.sip.server
        }

        currentJwtRef.current = payload.jwtToken

        registration(payload)

        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }

        refreshTimeoutRef.current = setTimeout(() => {
          onRefreshToken(payload.webrtcToken)
        }, REFRESH_TOKEN_INTERVAL)
        break

      case ControllerReceiveAction.TokenGenerated:
        currentJwtRef.current = event.webrtc_jwt

        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }

        refreshTimeoutRef.current = setTimeout(() => {
          onRefreshToken(event.webrtc_token)
        }, REFRESH_TOKEN_INTERVAL)

        updateSipAccount({
          type: AccountAction.UpdateJwt,
          webrtcToken: event.webrtc_token,
          jwtToken: event.webrtc_jwt
        })
        break

      default:
        break
    }
  }

  const processProgressResponse = (
    sessionId: string,
    response: Core.IncomingResponse,
    payload: BaseSipEventPayload
  ) => {
    switch (response.message.statusCode) {
      case 180:
        sendEvent({
          type: SipEvent.Ringing,
          payload
        })

        updateSession({ type: SessionAction.ChangeStatus, sessionId, status: SessionStatus.Ringing })

        break

      case 183:
        updateSession({
          type: SessionAction.ChangeStatus,
          sessionId,
          status: SessionStatus.Progress
        })

        // Early media for 183 Session Progress
        const activeSession = getActiveSipSession(sessionsRef.current, sessionId)
        if (activeSession?.invite.id === sessionId) {
          setupRemoteMedia(activeSession.invite, setIsRemoteSpeaking)
        }

        break

      default:
        break
    }
  }

  const sessionListener = (
    session: Inviter | Invitation,
    newState: SessionState,
    sipEventBasePayload: BaseSipEventPayload
  ) => {
    const activeSession = getActiveSipSession(sessions, activeSessionId)
    const isCurrentSession = activeSession?.invite.id === session.id

    const termination = () => {
      if (isCurrentSession) setActiveSessionId(null)
      updateSession({ type: SessionAction.Remove, sessionId: session.id })
    }

    switch (newState) {
      case SessionState.Establishing:
        return newState

      case SessionState.Established:
        if (isCurrentSession && sipEventBasePayload.direction === "inbound") {
          // console.log("stopRingSound")
          // stopRingSound()
        }

        sendEvent({
          type: SipEvent.Answered,
          payload: sipEventBasePayload
        })

        setWidgetScreenData("in-call")

        updateSession({
          type: SessionAction.ChangeStatus,
          sessionId: session.id,
          status: SessionStatus.Answered
        })

        return newState

      case SessionState.Terminating:
        hasActiveCallRef.current = false
        return newState

      case SessionState.Terminated:
        hasActiveCallRef.current = false
        saveHistory(getActiveSipSession(sessions, session.id))
        stopRingSound()

        cleanupMedia()

        if (sipEventBasePayload.direction === "inbound") {
          termination()
        }

        if (
          activeSession?.answeredAt ||
          activeSession?.status === SessionStatus.Answered ||
          // @ts-ignore
          (sipEventBasePayload.direction === "inbound" && session.isCanceled)
        ) {
          termination()
          sendEvent({ type: SipEvent.Completed, payload: sipEventBasePayload })
        }

        if (screenSwitchDelayTimeoutRef.current) {
          clearTimeout(screenSwitchDelayTimeoutRef.current)
        }

        screenSwitchDelayTimeoutRef.current = setTimeout(() => {
          const hasErrors = !!Object.keys(widgetErrors).length
          setInboundSipEventPayload({ direction: "inbound", token_uuid: "", uuid: "", to: "", from: "" })

          if (!hasErrors) {
            setWidgetScreenData("home")
          }
        }, 2_000)

        return newState

      default:
        return newState
    }
  }

  const updateSessionCallback = (sessionId: string) => {
    const activeSession = getActiveSipSession(sessions, sessionId)

    if (!activeSession || !activeSession.invite) return

    const { payload } = activeSession

    if (activeSession.stateCallback) {
      activeSession.invite.stateChange.removeListener(activeSession.stateCallback)
    }

    const callback = (newState: SessionState) => sessionListener(activeSession.invite, newState, payload)
    activeSession.invite.stateChange.addListener(callback)

    updateSession({
      type: SessionAction.UpdateStateCallback,
      sessionId: activeSession.invite.id,
      stateCallback: callback
    })
  }

  const onInboundInvite = (account: Account, invitation: Invitation, payload: BaseSipEventPayload) => {
    // startRingSound()

    sendEvent({
      type: SipEvent.Ringing,
      payload
    })

    const session: ActiveSession = {
      token: account.jwtToken,
      status: SessionStatus.Initiated,
      direction: SessionDirection.Inbound,
      number: invitation.request.from.displayName || "Anonymous",
      startedAt: new Date(),
      answeredAt: null,
      invite: invitation,
      stateCallback: (newState: SessionState) => sessionListener(invitation, newState, payload),
      payload
    }

    updateSession({ type: SessionAction.Add, session })

    if (!activeSessionId) {
      setWidgetScreenData("inbound")
      hasActiveCallRef.current = true
      setActiveSessionId(session.invite.id)
    }
  }

  const onOutboundCall = (outboundCallTo: string, outboundCallerId?: string) => {
    clearCallData()

    if (!activeSipAccountSessionId) return

    const activeAccount = sipAccounts[activeSipAccountSessionId]

    if (!activeAccount || !activeAccount.ua) return

    const externalCallerIdCannotBeUsed =
      (activeAccount.callerIdType === CallerIdType.Single || activeAccount.callerIdType === CallerIdType.Whitelist) &&
      activeExternalCallerId &&
      !activeAccount.callerIds?.includes(activeExternalCallerId.replace(/\D/g, ""))

    if (externalCallerIdCannotBeUsed) {
      setWidgetScreenData("outbound")

      if (screenSwitchDelayTimeoutRef.current) {
        clearTimeout(screenSwitchDelayTimeoutRef.current)
      }

      screenSwitchDelayTimeoutRef.current = setTimeout(() => {
        setWidgetScreenData("home")
      }, 2_000)

      return
    }

    const sessionCallerId = getSessionCallerId(activeAccount, outboundCallerId || activeExternalCallerId)

    const target = UserAgent.makeURI(`sip:${outboundCallTo}@${activeAccount.server}`)
    if (!target) throw new Error("Failed to create target URI.")

    const uuid = uuidv4()

    const outboundSession = new Inviter(activeAccount.ua, target, {
      params: {
        ...(sessionCallerId && {
          fromDisplayName: sessionCallerId,
          fromUri: `sip:${sessionCallerId}@${activeAccount.server}`
        })
      },
      extraHeaders: [`X-token-jwt: ${activeAccount.jwtToken}`, `X-Call-UUID: ${uuid}`],
      earlyMedia: true,
      sessionDescriptionHandlerOptions: {
        constraints: { audio: true, video: false }
      }
    })

    const from = sessionCallerId || (activeAccount.callerIds ? activeAccount.callerIds[0] : "")

    const payload = {
      uuid,
      to: outboundCallTo,
      from,
      direction: "outbound",
      token_uuid: activeAccount.webrtcUuid
    }

    const session: ActiveSession = {
      token: activeAccount.jwtToken,
      status: SessionStatus.Initiated,
      direction: SessionDirection.Outbound,
      invite: outboundSession,
      startedAt: new Date(),
      answeredAt: null,
      number: outboundCallTo,
      payload,
      stateCallback: (newState: SessionState) => sessionListener(outboundSession, newState, payload)
    }

    updateSession({ type: SessionAction.Add, session })
    setActiveSessionId(session.invite.id)

    sendEvent({
      type: SipEvent.CallSetup,
      payload
    })

    setWidgetScreenData("outbound")

    outboundSession.invite({
      requestDelegate: {
        onProgress: response => processProgressResponse(outboundSession.id, response, payload),
        onTrying: response => {
          sendToWsController({
            type: ControllerSendAction.CallInfoRequest,
            call_id: response.message.getHeader("Call-ID") || "",
            webrtc_token_uuid: activeAccount.webrtcUuid,
            webrtc_session_id: activeAccount.sessionId
          })

          updateSession({
            type: SessionAction.ChangeStatus,
            sessionId: outboundSession.id,
            status: SessionStatus.Trying
          })
        },
        onReject(response) {
          if (response.message.statusCode === 487) {
            if (outboundSession?.id) {
              updateSession({ type: SessionAction.Remove, sessionId: outboundSession.id })
            }

            sendEvent({
              type: SipEvent.Completed,
              payload
            })

            return
          }

          updateSession({
            type: SessionAction.ChangeStatus,
            sessionId: outboundSession.id,
            status: SessionStatus.Busy
          })

          sendEvent({
            type: SipEvent.Busy,
            payload
          })
        },
        onAccept() {
          hasActiveCallRef.current = true
        }
      }
    })

    setTimeout(() => {
      if (outboundSession.state === SessionState.Establishing || outboundSession.state === SessionState.Initial) {
        outboundSession.cancel()
      }
    }, 60_000)
  }

  useEffect(() => {
    sessionsRef.current = sessions
  }, [sessions])

  useEffect(() => {
    if (!activeSessionId) return

    updateSessionCallback(activeSessionId)
  }, [activeSessionId, activeSessionStatus])

  useEffect(() => {
    if (!to || !activeSipAccountSessionId) return

    const activeAccount = sipAccounts[activeSipAccountSessionId]

    if (config.sip.autoDial && activeAccount.state === AccountState.Registered) {
      onOutboundCall(to, callerId)
    }
  }, [to, sipAccounts, activeSipAccountSessionId])

  useEffect(() => {
    const hasErrors = !!Object.keys(widgetErrors).length

    if (!hasErrors) return

    dropSessions()
  }, [widgetErrors])

  useEffect(() => {
    if (!wsController || !isWsControllerConnected) return

    wsController.onmessage = onControllerReceiveEvent
  }, [wsController, isWsControllerConnected, activeSipAccountSessionId])

  useEffect(() => {
    if (!wsController || !isWsControllerConnected) return

    wsController.onmessage = onControllerReceiveEvent

    if (!activeSipAccountSessionId) return

    const activeAccount = sipAccounts[activeSipAccountSessionId]

    sendToWsController({
      type: ControllerSendAction.RegistrationRequest,
      session_id: activeAccount.sessionId,
      version: import.meta.env.PACKAGE_VERSION,
      webrtc_token: activeAccount.webrtcToken
    })
  }, [wsController, isWsControllerConnected, activeSipAccountSessionId])

  return (
    <div className="webrtc-widget-content">
      {ringAudio}
      <audio id="phone-audio" controls>
        <track default kind="captions" />
      </audio>

      {config.widget.withLogo && <Header customLogo={config.widget.customLogo} customLink={config.widget.customLink} />}

      <div
        className={clsx("webrtc-widget-tab", `webrtc-widget-tab__${widgetScreenData.tab}`, {
          "webrtc-widget-tab--transition": widgetScreenData.tab !== "error-tab",
          "webrtc-widget-tab--with-logo": config.widget.withLogo
        })}
      >
        {widgetScreenData.tab === "error-tab" ? (
          <ErrorTab />
        ) : (
          <>
            <CallTab
              config={config}
              activeCallerId={activeExternalCallerId}
              setActiveCallerId={setActiveExternalCallerId}
              isRemoteSpeaking={isRemoteSpeaking}
              session={getActiveSipSession(sessions, activeSessionId)}
              onOutbound={onOutboundCall}
            />
            <HistoryTab onOutbound={onOutboundCall} />
            <SettingsTab
              config={config}
              activeCallerId={activeExternalCallerId}
              setActiveCallerId={setActiveExternalCallerId}
            />
          </>
        )}
      </div>

      <TabBar />
    </div>
  )
}
