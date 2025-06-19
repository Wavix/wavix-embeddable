import { useContext } from "react"

import clsx from "clsx"

import { ScreenContainer, SettingsList } from "@widget/components"
import { AccountContext } from "@widget/providers/AccountProvider"
import { ScreenContext } from "@widget/providers/ScreenProvider"

import Keyboard from "@assets/icons/keyboard.svg?react"
import PhoneUp from "@assets/icons/phone-up.svg?react"
import SettingsArrow from "@assets/icons/settings-arrow.svg?react"
import Smartphone from "@assets/icons/smartphone.svg?react"

import { Switch } from "@components/index"

import { AccountState, AccountStatus } from "@interfaces/widget-account"

import type { WidgetSettings } from "@interfaces/widget"
import type { Account } from "@interfaces/widget-account"
import type { FC } from "react"

import "./style.scss"

type Props = {
  settings: WidgetSettings
  onChangeSettings: (key: keyof WidgetSettings, value: WidgetSettings[keyof WidgetSettings]) => void
  showCallSettings: boolean
}

const getAccountStatus = (currentAccount: Account | null) => {
  if (!currentAccount) {
    return { accountStatus: AccountStatus.Offline, statusText: "Disconnected" }
  }

  switch (currentAccount.state) {
    case AccountState.UnRegistered:
      return { accountStatus: AccountStatus.Offline, statusText: "Disconnected" }
    case AccountState.AccessDenied:
      return { accountStatus: AccountStatus.AccessDenied, statusText: "Disconnected" }
    case AccountState.InvalidAuth:
      return { accountStatus: AccountStatus.TokenIncorrect, statusText: "Disconnected" }
    case AccountState.Registered:
      return { accountStatus: AccountStatus.Connected, statusText: "Connected" }
    default:
      return { accountStatus: AccountStatus.Connecting, statusText: "Disconnected" }
  }
}

export const Main: FC<Props> = ({ settings, onChangeSettings, showCallSettings }) => {
  const { setWidgetScreenData } = useContext(ScreenContext)
  const { sipAccounts, activeSipAccountSessionId } = useContext(AccountContext)

  const activeSipAccount = activeSipAccountSessionId ? sipAccounts[activeSipAccountSessionId] : null
  const { accountStatus, statusText } = getAccountStatus(activeSipAccount)

  const isOnline = accountStatus === AccountStatus.Connected
  const isOffline =
    accountStatus === AccountStatus.Offline ||
    accountStatus === AccountStatus.Connecting ||
    accountStatus === AccountStatus.AccessDenied ||
    accountStatus === AccountStatus.TokenIncorrect

  const onChangeButtonSound = (event: Event) => {
    event.stopPropagation()
    onChangeSettings("buttonSound", !settings.buttonSound)
  }

  return (
    <ScreenContainer>
      <div className="webrtc-widget-main-settings">
        <h3 className="webrtc-widget-main-settings__title">Settings</h3>

        <div
          className={clsx("webrtc-widget-main-settings__connection", {
            "webrtc-widget-main-settings__connection--online": isOnline,
            "webrtc-widget-main-settings__connection--offline": isOffline
          })}
        >
          <div />
          <span>{statusText}</span>
        </div>

        <SettingsList.List>
          <SettingsList.ListItem
            icon={<Keyboard />}
            title="Dialpad sound"
            action={<Switch checked={settings.buttonSound} onChange={onChangeButtonSound} />}
            onClick={onChangeButtonSound}
          />
          {showCallSettings && (
            <SettingsList.ListItem
              icon={<PhoneUp />}
              title="Call settings"
              action={<SettingsArrow />}
              onClick={() => setWidgetScreenData("call-settings")}
            />
          )}
          <SettingsList.ListItem
            icon={<Smartphone />}
            title="About widget"
            action={<SettingsArrow />}
            onClick={() => setWidgetScreenData("about-settings")}
          />
        </SettingsList.List>
      </div>
    </ScreenContainer>
  )
}
