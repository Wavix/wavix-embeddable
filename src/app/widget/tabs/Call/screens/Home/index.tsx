import { useContext, useEffect, useRef, useState } from "react"

import clsx from "clsx"

import { ScreenContainer } from "@widget/components"
import { AccountContext } from "@widget/providers/AccountProvider"

import PhoneUp from "@assets/icons/phone-up.svg?react"
import Plus from "@assets/icons/plus.svg?react"
import PoundKey from "@assets/icons/pound-key.svg?react"
import StarKey from "@assets/icons/star-key.svg?react"

import { phoneNumberPatternRegExp, phoneNumberRegExp } from "@utils/regexp"

import { Button, DialerButton, DialerInput, Select } from "@components/index"

import { AccountState } from "@interfaces/widget-account"

import type { DialerButtonData, SelectOption } from "@components/index"
import type { Config } from "@interfaces/widget"
import type { JSX } from "preact"
import type { ChangeEvent, FC } from "react"

import "./style.scss"

export type Props = {
  config: Config
  activeCallerId?: string
  setActiveCallerId: (callerId?: string) => void
  to?: string
  onOutbound: (phone: string) => void
}

const dialerButtonsData: Array<DialerButtonData> = [
  { symbol: "1", title: "1", subTitle: " " },
  { symbol: "2", title: "2", subTitle: "ABC" },
  { symbol: "3", title: "3", subTitle: "DEF" },
  { symbol: "4", title: "4", subTitle: "GHI" },
  { symbol: "5", title: "5", subTitle: "JKL" },
  { symbol: "6", title: "6", subTitle: "MNO" },
  { symbol: "7", title: "7", subTitle: "PQRS" },
  { symbol: "8", title: "8", subTitle: "TUV" },
  { symbol: "9", title: "9", subTitle: "WXYZ" },
  { symbol: "*", title: <StarKey /> },
  { symbol: "0", subSymbol: "+", title: "0", subTitle: <Plus /> },
  { symbol: "#", title: <PoundKey /> }
]

const getCallerIds = (callerIds?: Array<string>) =>
  callerIds?.map(callerId => ({ value: callerId, label: callerId }) as SelectOption)

export const Home: FC<Props> = ({ config, activeCallerId, setActiveCallerId, to, onOutbound }) => {
  const { sipAccounts, activeSipAccountSessionId } = useContext(AccountContext)

  const inputRef = useRef<HTMLInputElement>(null)

  const [phoneNumber, setPhoneNumber] = useState(to)

  const canViewSelect = config.sip.allowSelectCallerId
  const activeSipAccount = activeSipAccountSessionId ? sipAccounts[activeSipAccountSessionId] : null

  const onSelectCallerId = (option?: SelectOption) => {
    setActiveCallerId(option?.value)
  }

  const onChangePhone = (char: string, isClear?: boolean) => {
    const prevValue = phoneNumber ?? ""

    const selectionStart = inputRef.current?.selectionStart ?? prevValue.length
    const selectionEnd = inputRef.current?.selectionEnd ?? prevValue.length

    let newValue: string

    if (isClear) {
      const before = prevValue.slice(0, selectionStart - 1)
      const after = prevValue.slice(selectionEnd)

      newValue = before + char + after
    } else {
      newValue = prevValue.slice(0, selectionStart) + char + prevValue.slice(selectionEnd)
    }

    setPhoneNumber(newValue)

    requestAnimationFrame(() => {
      if (!inputRef.current) return

      const newSelection = isClear ? selectionStart : selectionStart + 1
      inputRef.current.focus()
      inputRef.current.setSelectionRange(newSelection, newSelection)
      inputRef.current.scrollLeft = inputRef.current.scrollWidth
    })
  }

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber((e.target as HTMLInputElement).value)
  }

  const onOutboundSubmit = (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    event.preventDefault()

    if (!phoneNumber || activeSipAccount?.state !== AccountState.Registered) return

    onOutbound(phoneNumber ?? "")
  }

  useEffect(() => {
    if (!to) return

    setPhoneNumber(to)
  }, [to])

  return (
    <ScreenContainer>
      <form autoComplete="off" className="webrtc-widget-home" onSubmit={onOutboundSubmit}>
        <div
          className={clsx("webrtc-widget-home__inputs", {
            "webrtc-widget-home__inputs--with-select": canViewSelect
          })}
        >
          {canViewSelect && (
            <Select
              options={getCallerIds(config.sip.callerIds)}
              selected={activeCallerId ? { value: activeCallerId, label: activeCallerId } : undefined}
              onSelect={onSelectCallerId}
              label="Select Caller ID"
              name="caller_id"
            />
          )}

          <DialerInput
            inputForwardRef={inputRef}
            value={phoneNumber}
            onChange={onInputChange}
            label="Enter number"
            name="xyz123"
            pattern={phoneNumberPatternRegExp}
          />
        </div>

        <div className="webrtc-widget-home__numpad">
          {dialerButtonsData.map(button => (
            <DialerButton
              key={button.symbol}
              symbol={button.symbol}
              subSymbol={button.subSymbol}
              title={button.title}
              subTitle={button.subTitle}
              onClick={onChangePhone}
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="accent"
          disabled={
            activeSipAccount?.state !== AccountState.Registered || !phoneNumber || !phoneNumberRegExp.test(phoneNumber)
          }
        >
          <span className="webrtc-widget-home__button-content">
            <PhoneUp />
          </span>
        </Button>
      </form>
    </ScreenContainer>
  )
}
