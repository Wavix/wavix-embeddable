import { getSettings } from "@helpers/widget"

import type { SoundKey } from "@interfaces/sound"

const files = import.meta.glob<string>("/src/assets/audio/{button,ring}/*.{wav,mp3}", {
  query: "?url",
  import: "default",
  eager: true
})

const audioCache: Record<string, HTMLAudioElement> = {}

const soundsMap: Record<SoundKey, Array<string>> = {
  "0": ["/src/assets/audio/button/dtmf-0.wav"],
  "1": ["/src/assets/audio/button/dtmf-1.wav"],
  "2": ["/src/assets/audio/button/dtmf-2.wav"],
  "3": ["/src/assets/audio/button/dtmf-3.wav"],
  "4": ["/src/assets/audio/button/dtmf-4.wav"],
  "5": ["/src/assets/audio/button/dtmf-5.wav"],
  "6": ["/src/assets/audio/button/dtmf-6.wav"],
  "7": ["/src/assets/audio/button/dtmf-7.wav"],
  "8": ["/src/assets/audio/button/dtmf-8.wav"],
  "9": ["/src/assets/audio/button/dtmf-9.wav"],
  "#": ["/src/assets/audio/button/dtmf-pound.wav"],
  "*": ["/src/assets/audio/button/dtmf-star.wav"],
  "backspace": [],
  "ring": ["/src/assets/audio/ring/ring.mp3"]
}

export const preloadSounds = () =>
  Object.values(files).forEach(url => {
    const audio = new Audio(url)

    audio.preload = "auto"
    audio.load()

    audioCache[url] = audio
  })

export const playSound = (symbol: SoundKey, variant?: number): void => {
  const { buttonSound } = getSettings()

  if (!buttonSound) return

  const paths = soundsMap[symbol] ?? []
  const path = variant ? paths[variant] : paths[0]
  if (!path) return

  const url = files[path]
  if (!url) return

  const audio = audioCache[url] ?? null
  if (!audio) return

  audio.currentTime = 0
  audio.play()
}
