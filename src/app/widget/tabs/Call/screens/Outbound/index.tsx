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

export const Outbound: FC<Props> = ({ session, isRemoteSpeaking }) => {
  const onHangup = () => {
    if (!session) return
    // @ts-ignore
    session.invite.cancel()
  }

  return (
    <ScreenContainer>
      <div className="webrtc-widget-outbound">
        <CallDetails session={session} isRemoteSpeaking={isRemoteSpeaking} />

        <Button variant="negative" disabled={!session} onClick={onHangup}>
          <span className="webrtc-widget-outbound__button-content">
            <PhoneDown />
          </span>
        </Button>
      </div>
    </ScreenContainer>
  )
}
