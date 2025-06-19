import { useContext } from "react"

import { ScreenContainer } from "@widget/components"
import { ErrorContext } from "@widget/providers/ErrorProvider"

import Warning from "@assets/icons/warning.svg?react"

import { Button } from "@components/index"

import type { FC } from "react"

import "./style.scss"

export const Error: FC = () => {
  const { widgetErrors } = useContext(ErrorContext)

  const firstError = Object.values(widgetErrors)[0]

  return (
    <ScreenContainer>
      <div className="webrtc-widget-error">
        <div className="webrtc-widget-error-container">
          {firstError?.icon || (
            <div className="webrtc-widget-error-container__icon">
              <Warning />
            </div>
          )}

          <div className="webrtc-widget-error-container__info">
            {!!firstError?.title && <h3>{firstError.title}</h3>}
            {!!firstError?.description && <p>{firstError.description}</p>}
          </div>

          {!!firstError?.onErrorButtonClick && (
            <Button onClick={firstError.onErrorButtonClick}>{firstError?.buttonText || "Try again"}</Button>
          )}
        </div>
      </div>
    </ScreenContainer>
  )
}
