import type { FC, ReactNode } from "react"

import "./style.scss"

type Props = {
  children: ReactNode
}

export const ScreenContainer: FC<Props> = ({ children }) => (
  <div className="webrtc-widget-screen-container">{children}</div>
)
