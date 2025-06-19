import { useState, useEffect, useCallback, createContext } from "react"

import { GlobalHelpers, defaultCallPayload, defaultCallData } from "@helpers/widget"

import type { ExternalCallPayload, ExternalCallData } from "@interfaces/widget"
import type { FC, ReactNode } from "react"

type Props = {
  children: ReactNode
}

export const CallDataContext = createContext<ExternalCallData>(defaultCallData)

export const CallDataProvider: FC<Props> = ({ children }) => {
  const [externalCallPayload, setExternalCallPayload] = useState<ExternalCallPayload>(defaultCallPayload)

  const clearCallData = () => {
    setExternalCallPayload(defaultCallPayload)
  }

  const updateCallData = useCallback((to: string, callerId?: string) => {
    setExternalCallPayload(prevCallData => ({ ...prevCallData, to, callerId }))
  }, [])

  useEffect(() => {
    GlobalHelpers.setUpdateCallData(updateCallData)
  }, [updateCallData])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const to = urlParams.get("to")
    const callerId = urlParams.get("from")

    updateCallData(to || "", callerId || undefined)
  }, [])

  return (
    <CallDataContext.Provider
      value={{
        ...externalCallPayload,
        updateCallData,
        clearCallData,
        listeners: defaultCallData.listeners
      }}
    >
      {children}
    </CallDataContext.Provider>
  )
}
