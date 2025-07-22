import { getWidgetPath } from "@helpers/shared"

import { DemoTab } from "@interfaces/demo"

import type { DemoFormData } from "@interfaces/demo"

const EXPIRES_AT_KEY = "demo-form-data-expires-at"
const FORM_DATA_KEY = "demo-form-data"
const ONE_HOUR_MS = 60 * 60 * 1000

export const widgetTypeTabs = [{ title: "SPA" }, { title: "Window" }]

export const defaultDemoFormData: DemoFormData = {
  sipServer: "",
  token: "",
  callerIds: "",
  allowSelectCallerId: false,
  autoDial: false,
  customStyles: "",
  customLogo: "",
  customLink: "",
  withLogo: false,
  widgetType: DemoTab.Spa
}

const clearStoredFormData = () => {
  localStorage.removeItem(EXPIRES_AT_KEY)
  localStorage.removeItem(FORM_DATA_KEY)
}

export const loadStoredFormData = () => {
  const storedExpiresAt = localStorage.getItem(EXPIRES_AT_KEY)
  const storedFormData = localStorage.getItem(FORM_DATA_KEY)

  if (!storedExpiresAt || Number(storedExpiresAt) < Date.now() || !storedFormData) {
    clearStoredFormData()

    return defaultDemoFormData
  }

  try {
    const demoFormData = JSON.parse(storedFormData) as DemoFormData
    const expiresAt = Date.now() + ONE_HOUR_MS

    localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt))

    return demoFormData
  } catch {
    clearStoredFormData()

    return defaultDemoFormData
  }
}

export const saveStoredFormData = (demoFormData: DemoFormData) => {
  const expiresAt = Date.now() + ONE_HOUR_MS

  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt))
  localStorage.setItem(FORM_DATA_KEY, JSON.stringify(demoFormData))
}

export const getHosts = () => {
  const sipServer = import.meta.env.VITE_SIP_SERVER

  if (sipServer) {
    return [{ value: sipServer, label: sipServer }]
  }

  return [
    { value: "au.wavix.net", label: "au.wavix.net" },
    { value: "sg.wavix.net", label: "sg.wavix.net" },
    { value: "nl.wavix.net", label: "nl.wavix.net" },
    { value: "us.wavix.net", label: "us.wavix.net" }
  ]
}

const getConfigCallerIds = (callerIds: string) =>
  callerIds
    .split(",")
    .map(callerId => callerId.trim())
    .filter(Boolean)

const getConfig = (formData: DemoFormData, container: { type: "containerId" | "windowTitle"; name: string }) => {
  const callerIds = getConfigCallerIds(formData.callerIds)
  const callerIdsStr = callerIds.length ? `["${getConfigCallerIds(formData.callerIds).join('", "')}"]` : "[]"

  return `widget: {
                ${container.type}: "${container.name}",
                customStyles: "${formData.customStyles}",
                customLogo: "${formData.customLogo}",
                customLink: "${formData.customLink}",
                withLogo: ${formData.withLogo},
              },
              sip: {
                server: "${formData.sipServer}",
                token: "${formData.token.trim()}",
                callerIds: ${callerIdsStr},
                allowSelectCallerId: ${formData.allowSelectCallerId},
                autoDial: ${formData.autoDial},
              },`
}

export const getTemplate = (formData: DemoFormData) => {
  if (formData.widgetType === DemoTab.Spa) {
    const containerId = "webrtc-widget"

    return `
      <script src="${getWidgetPath()}/widget.js" type="module"></script>

      <script>
        ;(() => {
          const initWidget = () => {
            wavixWebRTC.init({
              ${getConfig(formData, { type: "containerId", name: containerId })}
            })
            
            wavixWebRTC.on("registered", (data) => {
              console.log("registered", data)
            })
            
            wavixWebRTC.on("unregistered", (data) => {
              console.log("unregistered", data)
            })

            wavixWebRTC.on("call_setup", (data) => {
              console.log("call_setup", data)
            })
            
            wavixWebRTC.on("ringing", (data) => {
              console.log("ringing", data)
            })

            wavixWebRTC.on("answered", (data) => {
              console.log("answered", data)
            })
            
            wavixWebRTC.on("busy", (data) => {
              console.log("busy", data)
            })
            
            wavixWebRTC.on("declined", (data) => {
              console.log("declined", data)
            })

            wavixWebRTC.on("completed", (data) => {
              console.log("completed", data)
            })
          }
        
          if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initWidget)
          } else {
            initWidget()
          }
        })()
      </script>

      <body>   
        <div id="webrtc-widget" />
      </body>
    `
  }

  if (formData.widgetType === DemoTab.Window) {
    const width = 288
    const height = formData.withLogo ? 504 : 460
    const windowTitle = "Wavix softphone"

    return `
      <script src="${getWidgetPath()}/widget.js" type="module"></script>

      <script>
        ;(() => {
          let configToken
          
          const initWidget = async () => {
            configToken = await wavixWebRTC.init({
              ${getConfig(formData, { type: "windowTitle", name: windowTitle })}
            })
            
            wavixWebRTC.on("registered", (data) => {
              console.log("registered", data)
            })
            
            wavixWebRTC.on("unregistered", (data) => {
              console.log("unregistered", data)
            })

            wavixWebRTC.on("call_setup", (data) => {
              console.log("call_setup", data)
            })

            wavixWebRTC.on("ringing", (data) => {
              console.log("ringing", data)
            })

            wavixWebRTC.on("answered", (data) => {
              console.log("answered", data)
            })
            
            wavixWebRTC.on("busy", (data) => {
              console.log("busy", data)
            })
            
            wavixWebRTC.on("declined", (data) => {
              console.log("declined", data)
            })

            wavixWebRTC.on("completed", (data) => {
              console.log("completed", data)
            })
          }
          
          const openWidgetWindow = async (to, from) => {
            if (!configToken) {
              await initWidget()
            }

            const width = ${width}
            const height = ${height}
            
            const top = window.screen.height - height - 50
            const left = window.screen.width - width - 50
            
            const params = \`width=$\{width}, height=$\{height}, top=$\{top}, left=$\{left}, resizable=no, scrollbars=no, status=yes\`
            const urlParams = \`config_token=$\{configToken}$\{to ? \`&to=$\{to}\` : ''}$\{from ? \`&from=$\{from}\` : ''}\`

            wavixWebRTC.widgetWindowLink = window.open(\`${getWidgetPath()}/widget.html?\` + urlParams, null, params)
          }

          window.openWidgetWindow = openWidgetWindow
        })()
      </script>
    `
  }

  return "No content"
}

export const getScriptTemplate = (formData: DemoFormData) => {
  if (formData.widgetType === DemoTab.Spa) {
    const containerId = "webrtc-widget"

    return `
      ;(() => {
        const initWidget = () => {
          wavixWebRTC.init({
            ${getConfig(formData, { type: "containerId", name: containerId })}
          })
          
          wavixWebRTC.on("registered", (data) => {
            console.log("registered", data)
          })
            
          wavixWebRTC.on("unregistered", (data) => {
            console.log("unregistered", data)
          })

          wavixWebRTC.on("call_setup", (data) => {
            console.log("call_setup", data)
          })
          
          wavixWebRTC.on("ringing", (data) => {
            console.log("ringing", data)
          })

          wavixWebRTC.on("answered", (data) => {
            console.log("answered", data)
          })
          
          wavixWebRTC.on("busy", (data) => {
            console.log("busy", data)
          })
          
          wavixWebRTC.on("declined", (data) => {
            console.log("declined", data)
          })

          wavixWebRTC.on("completed", (data) => {
            console.log("completed", data)
          })
        }

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", initWidget)
        } else {
          initWidget()
        }
      })()
    `
  }

  if (formData.widgetType === DemoTab.Window) {
    const width = 288
    const height = formData.withLogo ? 504 : 460
    const windowTitle = "Wavix softphone"
    const windowUrl = getWidgetPath()

    return `
      ;(() => {
        let configToken

        const initWidget = async () => {
          configToken = await wavixWebRTC.init({
            ${getConfig(formData, { type: "windowTitle", name: windowTitle })}
          })
          
          wavixWebRTC.on("registered", (data) => {
            console.log("registered", data)
          })
            
          wavixWebRTC.on("unregistered", (data) => {
            console.log("unregistered", data)
          })

          wavixWebRTC.on("call_setup", (data) => {
            console.log("call_setup", data)
          })
          
          wavixWebRTC.on("ringing", (data) => {
            console.log("ringing", data)
          })

          wavixWebRTC.on("answered", (data) => {
            console.log("answered", data)
          })
          
          wavixWebRTC.on("busy", (data) => {
            console.log("busy", data)
          })
          
          wavixWebRTC.on("declined", (data) => {
            console.log("declined", data)
          })

          wavixWebRTC.on("completed", (data) => {
            console.log("completed", data)
          })
        }
    
        const openWidgetWindow = async (to, from) => {
          if (!configToken) {
            await initWidget()
          }

          const width = ${width}
          const height = ${height}

          const top = window.screen.height - height - 50
          const left = window.screen.width - width - 50
          
          const params = \`width=$\{width}, height=$\{height}, top=$\{top}, left=$\{left}, resizable=no, scrollbars=no, status=yes\`
          const urlParams = \`config_token=$\{configToken}$\{to ? \`&to=$\{to}\` : ''}$\{from ? \`&from=$\{from}\` : ''}\`
          
          wavixWebRTC.widgetWindowLink = window.open(\`${windowUrl}/widget.html?\` + urlParams, null, params)
        }

        window.openWidgetWindow = openWidgetWindow
    
        ;(async () => {
          await openWidgetWindow()
        })()
      })()
    `
  }

  return ""
}
