import fs from "fs"
import * as path from "path"

import preact from "@preact/preset-vite"
import sass from "sass"
import { defineConfig } from "vite"
import version from "vite-plugin-package-version"
import svgr from "vite-plugin-svgr"

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf-8"))

const pathAliases = {
  "@demo": path.resolve(__dirname, "./src/app/demo"),
  "@widget": path.resolve(__dirname, "./src/app/widget"),
  "@assets": path.resolve(__dirname, "./src/assets"),
  "@utils": path.resolve(__dirname, "./src/utils"),
  "@helpers": path.resolve(__dirname, "./src/helpers"),
  "@components": path.resolve(__dirname, "./src/components"),
  "@styles": path.resolve(__dirname, "./src/styles"),
  "@interfaces": path.resolve(__dirname, "./src/interfaces")
}

const preactAliases = {
  react: "preact/compat"
}

// eslint-disable-next-line func-style
function placeFilesInVersionFolder() {
  return {
    name: "place-files-in-version-folder",
    writeBundle() {
      const buildPath = path.resolve(__dirname, "./build")
      const versionPath = path.resolve(__dirname, `./build/v${packageJson.version}/`)

      if (!fs.existsSync(versionPath)) {
        fs.mkdirSync(versionPath)
      }

      const filesToCopy = fs.readdirSync(buildPath)

      filesToCopy.forEach(fileName => {
        if (fileName === `v${packageJson.version}`) return

        const srcPath = path.resolve(__dirname, `./build/${fileName}`)
        const dstPath = path.resolve(__dirname, `./build/v${packageJson.version}/${fileName}`)

        const stat = fs.statSync(srcPath)

        if (stat.isDirectory()) {
          fs.cpSync(srcPath, dstPath, { recursive: true })
        } else {
          fs.copyFileSync(srcPath, dstPath)
        }
      })
    }
  }
}

export default defineConfig({
  base: "./",
  build: {
    outDir: "build",
    assetsInlineLimit: 0,
    assetsDir: "assets",
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "./index.html"),
        nested: path.resolve(__dirname, "./widget.html")
      },
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: assetInfo => {
          if (assetInfo.name?.endsWith(".css")) {
            return `style_v${packageJson.version}.css`
          }

          return "assets/[name].[ext]"
        }
      }
    }
  },
  plugins: [preact(), svgr(), version(), placeFilesInVersionFolder()],
  resolve: {
    alias: {
      ...pathAliases,
      ...preactAliases
    },
    extensions: [".mjs", ".js", ".jsx", ".mts", ".ts", ".tsx", ".json", ".scss"]
  },
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
        api: "modern"
      }
    }
  }
})
