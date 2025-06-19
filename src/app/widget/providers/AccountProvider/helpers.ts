import { AccountState } from "@interfaces/widget-account"

import type { Account } from "@interfaces/widget-account"

const ACCOUNTS_KEY = "phone-accounts-registration"

const generateSessionId = () => Math.random().toString(36).substring(2)

export const getSessionId = (webrtcToken: string) => {
  const currentData = localStorage.getItem(ACCOUNTS_KEY)

  if (!currentData) {
    return generateSessionId()
  }

  const accounts = JSON.parse(currentData)
  const sessionId = accounts[webrtcToken] as string | undefined

  delete accounts[webrtcToken]

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))

  return sessionId || generateSessionId()
}

export const saveAccountsRegistration = (accounts: Record<string, Account>) => {
  const currentData: Record<string, string> = {}

  Object.values(accounts).forEach(account => {
    if (account.state !== AccountState.Registered || !account.webrtcToken) return

    currentData[account.webrtcToken] = account.sessionId
  })

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(currentData))
}
