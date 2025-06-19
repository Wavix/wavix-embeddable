import { useState, useEffect, useRef } from "react"

import clsx from "clsx"

import CheckIcon from "@assets/icons/check.svg?react"
import CopyIcon from "@assets/icons/copy.svg?react"

import type { FC } from "react"

import "./style.scss"

type Props = {
  text: string
  name?: string
  label?: string
}

export const Copy: FC<Props> = ({ text = "", name, label }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [copied, setCopied] = useState(false)
  const [isInputFilled, setInputFilled] = useState(false)

  const copyToClipboard = async () => {
    if (!inputRef.current || !inputRef.current.value) return

    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current)
    }

    try {
      await navigator.clipboard.writeText(inputRef.current.value)

      setCopied(true)

      copyTimerRef.current = setTimeout(() => {
        setCopied(false)
      }, 1500)

      // eslint-disable-next-line no-console
      console.info("[WavixWebRTC] Copy to clipboard.")
    } catch (error) {
      console.error(`[WavixWebRTC] Failed to copy to clipboard. Error: ${error}`)
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = text
    }

    setInputFilled(!!text)
  }, [])

  return (
    <div className="webrtc-widget-copy">
      {label && (
        <label
          className={clsx("webrtc-widget-copy__label", "webrtc-widget-select__label--transition", {
            "webrtc-widget-copy__label--filled": isInputFilled
          })}
          htmlFor={name}
        >
          {label}
        </label>
      )}

      <button
        className={clsx("webrtc-widget-copy__button", {
          "webrtc-widget-copy__button--copied": copied
        })}
        onClick={copyToClipboard}
        type="button"
        aria-label="Copy to clipboard"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>

      <input
        ref={inputRef}
        className="webrtc-widget-copy__input"
        value={text}
        type="text"
        readOnly
        name={name}
        id={name}
      />
    </div>
  )
}
