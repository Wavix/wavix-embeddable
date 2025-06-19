import { useContext } from "react"

import clsx from "clsx"

import { ScreenContainer } from "@widget/components"
import { AccountContext } from "@widget/providers/AccountProvider"
import { ScreenContext } from "@widget/providers/ScreenProvider"

import SettingsArrow from "@assets/icons/settings-arrow.svg?react"

import { Copy, Select } from "@components/index"

import type { SelectOption } from "@components/index"
import type { Config } from "@interfaces/widget"
import type { Account } from "@interfaces/widget-account"
import type { FC } from "react"

import "./style.scss"

type Props = {
  config: Config
  activeCallerId?: string
  setActiveCallerId: (callerId?: string) => void
}

const getCallerId = (config: Config, currentAccount: Account | null) => {
  if (!currentAccount) {
    return "Anonymous"
  }

  return config.sip.callerIds?.[0] || currentAccount.callerIds?.[0] || "Anonymous"
}

const getCallerIds = (callerIds?: Array<string>) =>
  callerIds?.map(callerId => ({ value: callerId, label: callerId }) as SelectOption)

export const Call: FC<Props> = ({ config, activeCallerId, setActiveCallerId }) => {
  const { setWidgetScreenData } = useContext(ScreenContext)
  const { sipAccounts, activeSipAccountSessionId } = useContext(AccountContext)

  const activeSipAccount = activeSipAccountSessionId ? sipAccounts[activeSipAccountSessionId] : null

  const onSelectCallerId = (option?: SelectOption) => {
    setActiveCallerId(option?.value)
  }

  return (
    <ScreenContainer>
      <div className="webrtc-widget-call-settings">
        <div
          className={clsx("webrtc-widget-call-settings__back_button", {
            "webrtc-widget-call-settings__back_button--with-logo": config.widget.withLogo
          })}
          onClick={() => setWidgetScreenData("main-settings")}
        >
          <SettingsArrow />
        </div>

        <h3 className="webrtc-widget-call-settings__title">Call settings</h3>

        {config.sip.allowSelectCallerId ? (
          <Select
            options={getCallerIds(config.sip.callerIds)}
            selected={activeCallerId ? { value: activeCallerId, label: activeCallerId } : undefined}
            onSelect={onSelectCallerId}
            label="Select Caller ID"
            name="caller_id"
          />
        ) : (
          <Copy text={getCallerId(config, activeSipAccount)} label="Select Caller ID" name="caller_id" />
        )}
      </div>
    </ScreenContainer>
  )
}
