import { useRef } from "react"

import clsx from "clsx"

import Backspace from "@assets/icons/backspace.svg?react"

import { playSound } from "@helpers/sound"

import type { SoundKey } from "@interfaces/sound"
import type { ChangeEvent, FC, MutableRefObject } from "react"

import "./style.scss"

type Props = {
  inputForwardRef?: MutableRefObject<HTMLInputElement | null>
  value?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  label?: string
  name?: string
  pattern?: RegExp
}

type BeforeInputEvent = Event & {
  nativeEvent: InputEvent
  target: HTMLInputElement
  currentTarget: HTMLInputElement
}

export const DialerInput: FC<Props> = ({ inputForwardRef, value, onChange, label, name, pattern }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const onBackspaceClick = (event: MouseEvent) => {
    event.preventDefault()

    const currentValue = value ?? ""

    const inputElement = inputForwardRef?.current || inputRef.current

    const selectionStart = inputElement?.selectionStart ?? currentValue.length
    const selectionEnd = inputElement?.selectionEnd ?? currentValue.length

    let newValue = currentValue
    let newSelection = selectionStart

    if (selectionStart === selectionEnd && selectionStart > 0) {
      newValue = currentValue.slice(0, selectionStart - 1) + currentValue.slice(selectionEnd)
      newSelection = selectionStart - 1
    } else if (selectionStart !== selectionEnd) {
      newValue = currentValue.slice(0, selectionStart) + currentValue.slice(selectionEnd)
    }

    const fakeEvent = {
      target: { value: newValue, name },
      currentTarget: { value: newValue, name }
    } as unknown as ChangeEvent<HTMLInputElement>

    onChange?.(fakeEvent)

    requestAnimationFrame(() => {
      if (!inputElement) return

      inputElement.focus()
      inputElement.setSelectionRange(newSelection, newSelection)
      inputElement.scrollLeft = inputElement.scrollWidth
    })
  }

  const onBeforeInput = (event: Event) => {
    const customEvent = event as unknown as BeforeInputEvent

    const inputValue: string = customEvent.currentTarget.value
    const insertedValue: string | null = customEvent.nativeEvent.data

    if (!pattern || !insertedValue) return

    const { selectionStart, selectionEnd } = customEvent.currentTarget

    const nextValue =
      selectionStart !== null && selectionEnd !== null
        ? inputValue.slice(0, selectionStart) + insertedValue + inputValue.slice(selectionEnd)
        : inputValue + insertedValue

    if (!pattern.test(nextValue)) {
      event.preventDefault()
    } else {
      playSound(insertedValue as SoundKey)
    }
  }

  return (
    <div className="webrtc-widget-input">
      {label && (
        <label
          className={clsx("webrtc-widget-input__label", {
            "webrtc-widget-input__label--filled": !!value
          })}
          htmlFor={name}
        >
          {label}
        </label>
      )}

      <div
        className={clsx("webrtc-widget-input__backspace", {
          "webrtc-widget-input__backspace--filled": !!value
        })}
        onMouseDown={event => {
          event.preventDefault()
          playSound("backspace")
        }}
        onClick={onBackspaceClick}
      >
        <Backspace />
      </div>

      <input
        ref={inputForwardRef || inputRef}
        className="webrtc-widget-input__input"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        value={value}
        onChange={onChange}
        onBeforeInput={onBeforeInput}
        name={name}
        id={name}
      />
    </div>
  )
}
