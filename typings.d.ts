/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_CONTROLLER_URI: string
  readonly VITE_WIDGET_URI: string
  readonly VITE_SIP_SERVER: string
}

type ImportMeta = {
  readonly env: ImportMetaEnv
}

declare module "*.svg" {
  import type { ComponentType, SVGProps } from "react"

  const content: ComponentType<SVGProps<SVGSVGElement>>
  export default content
}

declare module "*.svg?react" {
  import type { ComponentType, SVGProps } from "react"

  const content: ComponentType<SVGProps<SVGSVGElement>>
  export default content
}
