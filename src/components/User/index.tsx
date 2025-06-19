import clsx from "clsx"

import UserIcon from "@assets/icons/user.svg?react"

import type { FC } from "react"

import "./style.scss"

type Props = {
  isAnimated?: boolean
}

export const User: FC<Props> = ({ isAnimated }) => (
  <div
    className={clsx("webrtc-widget-user", {
      "webrtc-widget-user--animation": isAnimated
    })}
  >
    <div className="webrtc-widget-user__icon">
      <UserIcon />
    </div>

    <div className="webrtc-widget-user__ring" />
  </div>
)
