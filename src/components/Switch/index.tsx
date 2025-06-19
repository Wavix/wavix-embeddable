import clsx from "clsx"

import type { FC } from "react"

import "./style.scss"

type Props = {
  onChange?: (event: Event) => void
  checked?: boolean
  name?: string
  label?: string
  disabled?: boolean
}

export const Switch: FC<Props> = ({ onChange, checked, name, label, disabled }) => (
  <label className="webrtc-widget-switch" htmlFor={name}>
    <div
      className={clsx("webrtc-widget-switch__container", "webrtc-widget-switch__container--transition", {
        "webrtc-widget-switch__container--checked": checked,
        "webrtc-widget-switch__container--disabled": disabled
      })}
    >
      <input
        className="webrtc-widget-switch__input"
        onChange={onChange}
        checked={checked}
        type="checkbox"
        name={name}
        id={name}
        disabled={disabled}
      />

      <span
        className={clsx("webrtc-widget-switch__slider", "webrtc-widget-switch__slider--transition", {
          "webrtc-widget-switch__slider--checked": checked
        })}
      />
    </div>

    {label && (
      <span
        className={clsx("webrtc-widget-switch__label", {
          "webrtc-widget-switch__label--disabled": disabled
        })}
      >
        {label}
      </span>
    )}
  </label>
)
