import { render } from "preact"

import { DemoApp } from "@demo/index"

const demoAppRoot = document.getElementById("demo-app")

if (demoAppRoot) {
  render(<DemoApp />, demoAppRoot)
}
