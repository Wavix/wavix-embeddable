import { useState, useEffect, useReducer, createContext } from "react"

import { accountsReducer } from "@widget/state/account"

import { AccountState, AccountAction } from "@interfaces/widget-account"

import { getSessionId, saveAccountsRegistration } from "./helpers"

import type { Config } from "@interfaces/widget"
import type { WidgetAccountContext, AccountsState, AccountsAction } from "@interfaces/widget-account"
import type { FC, ReactNode } from "react"

type Props = {
  config: Config
  children: ReactNode
}

export const AccountContext = createContext<WidgetAccountContext>({
  sipAccounts: {},
  activeSipAccountSessionId: "",
  updateSipAccount: () => {}
})

export const AccountProvider: FC<Props> = ({ config, children }) => {
  const [sipAccounts, dispatchAccounts] = useReducer<AccountsState, AccountsAction>(accountsReducer, {})

  const [activeSipAccountSessionId, setActiveSipAccountSessionId] = useState("")

  const updateSipAccount = (payload: AccountsAction) => {
    dispatchAccounts({ ...payload })
  }

  const addTokenAccount = () => {
    const sessionId = getSessionId(config.sip.token)

    dispatchAccounts({
      type: AccountAction.Add,
      account: {
        sessionId,
        state: AccountState.UnRegistered,
        webrtcUuid: "",
        webrtcToken: config.sip.token,
        jwtToken: "",
        trunkName: "",
        label: "",
        server: config.sip.server
      }
    })

    setActiveSipAccountSessionId(config.sip.token)
  }

  useEffect(() => {
    const onBeforeUnload = () => {
      saveAccountsRegistration(sipAccounts)
    }

    window.removeEventListener("beforeunload", onBeforeUnload)
    window.addEventListener("beforeunload", onBeforeUnload)
  }, [sipAccounts])

  useEffect(() => {
    addTokenAccount()
  }, [])

  return (
    <AccountContext.Provider value={{ sipAccounts, activeSipAccountSessionId, updateSipAccount }}>
      {children}
    </AccountContext.Provider>
  )
}
