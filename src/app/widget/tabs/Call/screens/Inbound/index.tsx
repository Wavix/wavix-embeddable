import { useContext, useEffect, useState } from "react"

import clsx from "clsx"

import { CallDetails, ScreenContainer } from "@widget/components"
import { SipEventContext } from "@widget/providers/SipEventProvider"

import PhoneDown from "@assets/icons/phone-down.svg?react"
import PhoneUp from "@assets/icons/phone-up.svg?react"

import { Button } from "@components/index"

import type { ActiveSession } from "@interfaces/widget-session"
import type { FC } from "react"

import "./style.scss"

type Props = {
  session: ActiveSession | null
  isRemoteSpeaking: boolean
}

export const Inbound: FC<Props> = ({ session, isRemoteSpeaking }) => {
  const { sendDeclined } = useContext(SipEventContext)

  const [isDeclined, setDeclined] = useState(false)

  const onAnswer = () => {
    if (!session) return
    // @ts-ignore
    session.invite.accept()
  }

  const onHangup = () => {
    if (!session) return

    setDeclined(true)
    // @ts-ignore
    session.invite.reject()
    sendDeclined()
  }

  useEffect(() => {
    return () => {
      setDeclined(false)
    }
  }, [])

  return (
    <ScreenContainer>
      <div className="webrtc-widget-inbound">
        <CallDetails isDeclined={isDeclined} session={session} isRemoteSpeaking={isRemoteSpeaking} />

        <div className="webrtc-widget-inbound__buttons">
          <Button variant="negative" disabled={!session} onClick={onHangup}>
            <span
              className={clsx(
                "webrtc-widget-inbound__button-content",
                "webrtc-widget-inbound__button-content--negative"
              )}
            >
              <PhoneDown />
            </span>
          </Button>
          <Button variant="accent" disabled={!session} onClick={onAnswer}>
            <span
              className={clsx("webrtc-widget-inbound__button-content", "webrtc-widget-inbound__button-content--accent")}
            >
              <PhoneUp />
            </span>
          </Button>
        </div>
      </div>
    </ScreenContainer>
  )
}
