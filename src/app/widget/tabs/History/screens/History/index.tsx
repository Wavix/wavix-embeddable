import { useEffect, useState } from "react"

import clsx from "clsx"

import { ScreenContainer } from "@widget/components"

import InboundCall from "@assets/icons/inbound-call.svg?react"
import OutboundCall from "@assets/icons/outbound-call.svg?react"

import { localDateFormat } from "@utils/formatter"

import { getHistory } from "@helpers/widget"

import { Tabs } from "@components/index"

import { CallHistoryTab } from "@interfaces/widget"
import { SessionDirection } from "@interfaces/widget-session"

import type { CallHistory } from "@interfaces/widget"
import type { FC } from "react"

import "./style.scss"

type Props = {
  onOutbound: (phone: string) => void
}

const tabs = [{ title: "All calls" }, { title: "Inbound" }, { title: "Outbound" }]

export const History: FC<Props> = ({ onOutbound }) => {
  const [activeTab, setActiveTab] = useState(CallHistoryTab.All)
  const [history, setHistory] = useState<Array<CallHistory>>([])

  const filteredHistory = history.filter(item => {
    if (activeTab === CallHistoryTab.Inbound) {
      return item.direction === SessionDirection.Inbound
    }
    if (activeTab === CallHistoryTab.Outbound) {
      return item.direction === SessionDirection.Outbound
    }

    return true
  })

  const onCall = (phone: string) => {
    if (!phone) return

    onOutbound(phone)
  }

  useEffect(() => {
    const updateHistory = () => {
      const newHistory = getHistory().reverse()
      setHistory(newHistory)
    }

    updateHistory()

    window.addEventListener("phone-history-update", updateHistory)

    return () => {
      window.removeEventListener("phone-history-update", updateHistory)
    }
  }, [])

  return (
    <ScreenContainer>
      <div className="webrtc-widget-history">
        <h3 className="webrtc-widget-history__title">Recents</h3>

        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        <ul
          className={clsx("webrtc-widget-history__calls-list", {
            "webrtc-widget-history__calls-list--empty": !filteredHistory.length
          })}
        >
          {filteredHistory.length ? (
            filteredHistory.map((item, index) => (
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
              <li
                key={index}
                className={clsx("webrtc-widget-history__call", {
                  "webrtc-widget-history__call--failed": !item.is_success && item.direction === SessionDirection.Inbound
                })}
                onClick={() => onCall(item.number)}
              >
                <div>
                  {item.direction === SessionDirection.Inbound ? <InboundCall /> : <OutboundCall />}
                  <p className="webrtc-widget-history__number">{item.number}</p>
                </div>
                <div>
                  <p>{localDateFormat(item.date)}</p>
                </div>
              </li>
            ))
          ) : (
            <p>No recent calls</p>
          )}
        </ul>
      </div>
    </ScreenContainer>
  )
}
