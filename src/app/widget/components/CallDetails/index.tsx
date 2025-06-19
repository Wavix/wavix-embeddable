import { useState, useEffect } from "react"

import InboundCall from "@assets/icons/inbound-call.svg?react"
import OutboundCall from "@assets/icons/outbound-call.svg?react"

import { Loader, User } from "@components/index"

import { SessionDirection, SessionStatus } from "@interfaces/widget-session"

import { DurationTimer } from "../DurationTimer"

import type { ActiveSession } from "@interfaces/widget-session"
import type { FC, ReactNode } from "react"

import "./style.scss"

type Props = {
  session: ActiveSession | null
  isRemoteSpeaking: boolean
  isDeclined?: boolean
}

const getCallStatus = (session: ActiveSession | null, isDeclined?: boolean) => {
  if (!session) {
    return isDeclined ? "Declined" : "Call ended"
  }

  switch (session.status) {
    case SessionStatus.Initiated:
    case SessionStatus.Trying:
      return session.direction === SessionDirection.Outbound ? "Dialing..." : "Ringing..."

    case SessionStatus.Ringing:
    case SessionStatus.Progress:
      return "Ringing..."

    case SessionStatus.Busy:
      return "Busy"

    case SessionStatus.Answered:
      return null

    default:
      return "Call ended"
  }
}

const getCallNumber = (session: ActiveSession | null) => {
  if (!session) return null

  switch (session.direction) {
    case SessionDirection.Inbound:
      return (
        <>
          <InboundCall />
          <span>{session.invite.request.from.uri.user}</span>
        </>
      )
    case SessionDirection.Outbound:
      return (
        <>
          <OutboundCall />
          <span>{session.number}</span>
        </>
      )
    default:
      return null
  }
}

const getCallContent = (session: ActiveSession | null, isRemoteSpeaking: boolean) => {
  if (!session) return null

  switch (session.status) {
    case SessionStatus.Initiated:
    case SessionStatus.Trying:
      return <Loader />

    case SessionStatus.Ringing:
    case SessionStatus.Progress:
      return <Loader />

    case SessionStatus.Answered:
      return <User isAnimated={isRemoteSpeaking} />

    default:
      return null
  }
}

export const CallDetails: FC<Props> = ({ session, isRemoteSpeaking, isDeclined }) => {
  const [callNumberNode, setCallNumberNode] = useState<ReactNode | null>(null)

  useEffect(() => {
    if (!session) return

    setCallNumberNode(getCallNumber(session))
  }, [session])

  return (
    <>
      <div className="webrtc-widget-call-details">
        <div className="webrtc-widget-call-details__status">
          {getCallStatus(session, isDeclined) || <DurationTimer isActive />}
        </div>

        <div className="webrtc-widget-call-details__number">{getCallNumber(session) || callNumberNode}</div>
      </div>

      {getCallContent(session, isRemoteSpeaking)}
    </>
  )
}
