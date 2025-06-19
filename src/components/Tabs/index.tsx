import clsx from "clsx"

import type { FC } from "react"

import "./style.scss"

export type TabsItem = {
  title: string
}

type Props = {
  tabs: Array<TabsItem>
  activeTab: number
  setActiveTab?: (activeTab: number) => void
}

export const Tabs: FC<Props> = ({ tabs, activeTab, setActiveTab }) => {
  const onTabClick = (index: number) => {
    setActiveTab?.(index)
  }

  return (
    <ul className="webrtc-widget-tabs">
      {tabs.map((tab, index) => (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <li
          key={index}
          className={clsx("webrtc-widget-tabs__tab", { "webrtc-widget-tabs__tab--active": activeTab === index })}
          onClick={() => onTabClick(index)}
        >
          {tab.title}
        </li>
      ))}

      <hr className="webrtc-widget-tabs__divider" />
    </ul>
  )
}
