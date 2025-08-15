import { useState, useEffect } from "react"

import { render } from "preact"
import SyntaxHighlighter from "react-syntax-highlighter"
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs"

import {
  widgetTypeTabs,
  defaultDemoFormData,
  loadStoredFormData,
  saveStoredFormData,
  getHosts,
  getScriptTemplate,
  getTemplate
} from "@helpers/demo"
import { getWidgetPath, injectFonts } from "@helpers/shared"

import { Button, DialerInput, Select, Switch, Tabs } from "@components/index"

import { DemoTab } from "@interfaces/demo"

import type { DemoInjectedWidget } from "@interfaces/demo"
import type { FC } from "react"

import "@styles/index.scss"
import "./style.scss"

export const DemoApp: FC = () => {
  const [formData, setFormData] = useState(defaultDemoFormData)
  const [isInjected, setIsInjected] = useState<DemoInjectedWidget>({
    spa: false,
    window: false
  })

  const onInitWidget = () => {
    saveStoredFormData(formData)

    const currentScript = document.querySelector("script[data-widget-script]")

    if (currentScript) {
      currentScript.remove()
    }

    if (formData.widgetType === DemoTab.Window) {
      const widgetRoot = document.getElementById("webrtc-widget")

      if (widgetRoot) {
        render(null, widgetRoot)
      }

      setIsInjected({ spa: false, window: true })
    }

    if (formData.widgetType === DemoTab.Spa) {
      // @ts-ignore
      const windowLink = window.wavixWebRTC?.widgetWindowLink

      if (windowLink) {
        windowLink.close()
      }

      setIsInjected({ spa: true, window: false })
    }

    const newScript = document.createElement("script")
    newScript.setAttribute("data-widget-script", "true")
    newScript.innerHTML = getScriptTemplate(formData)

    document.body.appendChild(newScript)
  }

  useEffect(() => {
    ;(async () => {
      await injectFonts()
    })()

    const storedFormData = loadStoredFormData()
    setFormData(storedFormData)
  }, [])

  return (
    <div className="demo-app">
      <div className="demo-app__header">
        <h1 className="demo-app__title">Wavix Embeddable</h1>
        <p className="demo-app__version">version {import.meta.env.PACKAGE_VERSION}</p>
      </div>

      <div className="demo-app__section">
        <h3>SIP settings</h3>

        <div className="demo-app__inputs">
          <Select
            onSelect={option => setFormData(prevFormData => ({ ...prevFormData, sipServer: option?.value || "" }))}
            options={getHosts()}
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
        </div>

        <div className="demo-app__checkboxes">
          <Switch
            onChange={() => setFormData(prevFormData => ({ ...prevFormData, autoDial: !prevFormData.autoDial }))}
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
            onChange={() => setFormData(prevFormData => ({ ...prevFormData, withLogo: !prevFormData.withLogo }))}
            checked={formData.withLogo}
            label="With logo"
          />

          <Button
            onClick={onInitWidget}
            disabled={
              !formData.token ||
              !formData.sipServer ||
              (formData.widgetType === DemoTab.Spa && isInjected.spa) ||
              (formData.widgetType === DemoTab.Window && isInjected.window)
            }
          >
            Launch widget
          </Button>
        </div>
      </div>

      <div className="demo-app__tabs">
        <Tabs
          tabs={widgetTypeTabs}
          activeTab={formData.widgetType}
          setActiveTab={activeTab => setFormData(prevFormData => ({ ...prevFormData, widgetType: activeTab }))}
        />
      </div>

      <div className="demo-app__syntax">
        <SyntaxHighlighter style={nightOwl}>{getTemplate(formData)}</SyntaxHighlighter>
      </div>
    </div>
  )
}
