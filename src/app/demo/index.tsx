import { useState, useEffect, useRef } from "react"

import clsx from "clsx"
import { render } from "preact"
import SyntaxHighlighter from "react-syntax-highlighter"
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs"

import { getHosts, getLinks, getScriptTemplate, getTemplate } from "@helpers/demo"
import { getWidgetPath, injectFonts } from "@helpers/shared"

import { Button, DialerInput, Select, Switch, Tabs } from "@components/index"

import type { SelectOption } from "@components/index"
import type { DemoInjectedWidget, DemoTab, DemoFormData } from "@interfaces/demo"
import type { FC } from "react"

import "@styles/index.scss"
import "./style.scss"

const tabs = [{ title: "SPA" }, { title: "Window" }]

export const DemoApp: FC = () => {
  const demoLinksRef = useRef<HTMLDivElement>(null)

  const [isInjected, setIsInjected] = useState<DemoInjectedWidget>({
    spa: false,
    window: false
  })

  const [activeTab, setActiveTab] = useState<DemoTab>("spa")

  const [hosts, setHosts] = useState<Array<SelectOption>>([])
  const [formData, setFormData] = useState<DemoFormData>({
    sipServer: "",
    token: "",
    callerIds: "",
    allowSelectCallerId: false,
    autoDial: false,
    customStyles: "",
    customLogo: "",
    customLink: "",
    withLogo: false
  })

  const getActiveTabNumber = () => (activeTab === "window" ? 1 : 0)

  const setActiveTabNumber = (index: number) => {
    if (index === 0) {
      setActiveTab("spa")
    }

    if (index === 1) {
      setActiveTab("window")
    }
  }

  const onMountLinks = () => {
    if (!demoLinksRef.current) return

    demoLinksRef.current.innerHTML = ""

    const newLinks = getLinks(activeTab)
    demoLinksRef.current.innerHTML = newLinks
  }

  const onInitWidget = () => {
    onMountLinks()

    const currentScript = document.querySelector("script[data-widget-script]")

    if (currentScript) {
      currentScript.remove()
    }

    if (activeTab === "window") {
      const widgetRoot = document.getElementById("webrtc-widget")

      if (widgetRoot) {
        render(null, widgetRoot)
      }

      setIsInjected({ spa: false, window: true })
    }

    if (activeTab === "spa") {
      // @ts-ignore
      const windowLink = window.wavixWebRTC?.widgetWindowLink

      if (windowLink) {
        windowLink.close()
      }

      setIsInjected({ spa: true, window: false })
    }

    const newScript = document.createElement("script")
    newScript.setAttribute("data-widget-script", "true")
    newScript.innerHTML = getScriptTemplate(activeTab, formData)

    document.body.appendChild(newScript)
  }

  useEffect(() => {
    ;(async () => {
      await injectFonts()
    })()

    setHosts(getHosts())
  }, [])

  return (
    <div className="demo-app">
      <div className="demo-app__header">
        <h1 className="demo-app__title">WebRTC example</h1>
        <p className="demo-app__version">version {import.meta.env.PACKAGE_VERSION}</p>
      </div>

      <div className="demo-app__section">
        <h3>SIP settings</h3>

        <div className="demo-app__inputs">
          <Select
            onSelect={option => setFormData({ ...formData, sipServer: option?.value || "" })}
            options={hosts}
            selected={{ value: formData.sipServer, label: formData.sipServer }}
            label="Server"
          />
          <DialerInput
            value={formData.token}
            onChange={event =>
              setFormData(prevFormData => ({ ...prevFormData, token: (event.target as HTMLInputElement).value }))
            }
            label="Access token"
          />
          <DialerInput
            value={formData.callerIds}
            onChange={event =>
              setFormData(prevFormData => ({ ...prevFormData, callerIds: (event.target as HTMLInputElement).value }))
            }
            label="Caller IDs"
          />
        </div>

        <div className="demo-app__checkboxes">
          <Switch
            onChange={() => setFormData({ ...formData, allowSelectCallerId: !formData.allowSelectCallerId })}
            checked={formData.allowSelectCallerId}
            label="Allow select caller ID"
          />
          <Switch
            onChange={() => setFormData({ ...formData, autoDial: !formData.autoDial })}
            checked={formData.autoDial}
            label="Dial automatically"
          />
        </div>
      </div>

      <div className="demo-app__section">
        <h3>Widget settings</h3>

        <div className="demo-app__inputs">
          <div className="demo-app__input">
            <DialerInput
              value={formData.customStyles}
              onChange={event =>
                setFormData(prevFormData => ({
                  ...prevFormData,
                  customStyles: (event.target as HTMLInputElement).value
                }))
              }
              label="Custom styles path"
            />
            <p>Dark theme example: {`${getWidgetPath()}/dark-theme.css`}</p>
          </div>

          <div className="demo-app__input">
            <DialerInput
              value={formData.customLogo}
              onChange={event =>
                setFormData(prevFormData => ({ ...prevFormData, customLogo: (event.target as HTMLInputElement).value }))
              }
              label="Custom logo path"
            />
            <p>Dark logo example: {`${getWidgetPath()}/dark-logo.svg`}</p>
          </div>

          <div className="demo-app__input">
            <DialerInput
              value={formData.customLink}
              onChange={event =>
                setFormData(prevFormData => ({ ...prevFormData, customLink: (event.target as HTMLInputElement).value }))
              }
              label="Custom link"
            />
            <p>A custom link is needed if you are changing the logo, but it is an optional value</p>
          </div>
        </div>

        <div className="demo-app__controls">
          <Switch
            onChange={() => setFormData({ ...formData, withLogo: !formData.withLogo })}
            checked={formData.withLogo}
            label="With logo"
          />

          <Button
            onClick={onInitWidget}
            disabled={
              !formData.token ||
              !formData.sipServer ||
              (activeTab === "spa" && isInjected.spa) ||
              (activeTab === "window" && isInjected.window)
            }
          >
            Launch widget
          </Button>
        </div>
      </div>

      <div className="demo-app__tabs">
        <Tabs tabs={tabs} activeTab={getActiveTabNumber()} setActiveTab={setActiveTabNumber} />
      </div>

      <div className="demo-app__syntax">
        <SyntaxHighlighter style={nightOwl}>{getTemplate(activeTab, formData)}</SyntaxHighlighter>
      </div>

      <div
        ref={demoLinksRef}
        className={clsx("demo-app__links", { "demo-app__links--visible": isInjected.spa || isInjected.window })}
      />
    </div>
  )
}
