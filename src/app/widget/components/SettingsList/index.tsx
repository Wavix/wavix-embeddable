import type { FC, ReactNode } from "react"

import "./style.scss"

type SettingsListProps = {
  children: ReactNode
}

type SettingsListItemProps = {
  icon: ReactNode
  title: string
  action: ReactNode
  onClick: (event: Event) => void
}

const List: FC<SettingsListProps> = ({ children }) => <ul className="webrtc-widget-settings-list">{children}</ul>

const ListItem: FC<SettingsListItemProps> = ({ icon, title, action, onClick }) => (
  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
  <li className="webrtc-widget-settings-list__item" onClick={onClick}>
    <div>
      {icon}
      <span>{title}</span>
    </div>

    {action}
  </li>
)

export const SettingsList = {
  List,
  ListItem
}
