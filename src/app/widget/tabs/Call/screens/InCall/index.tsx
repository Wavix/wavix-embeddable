import { CallDetails, ScreenContainer } from "@widget/components"

import PhoneDown from "@assets/icons/phone-down.svg?react"

import { Button } from "@components/index"

import type { ActiveSession } from "@interfaces/widget-session"
import type { FC } from "react"

import "./style.scss"

type Props = {
  session: ActiveSession | null
  isRemoteSpeaking: boolean
}

export const InCall: FC<Props> = ({ session, isRemoteSpeaking }) => {
  const onHangup = () => {
    if (!session) return

    session.invite.bye()
  }

  return (
    <ScreenContainer>
      <div className="webrtc-widget-in-call">
        <CallDetails session={session} isRemoteSpeaking={isRemoteSpeaking} />

        <Button onClick={onHangup} variant="negative" disabled={!session}>
          <span className="webrtc-widget-in-call__button-content">
            <PhoneDown />
          </span>
        </Button>
      </div>
    </ScreenContainer>
  )
}
