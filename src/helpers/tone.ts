type ToneSegment = {
  frequencies: Array<number>
  duration: number
}

type PlayToneOptions = {
  volume?: number
}

type PlaybackState = {
  context: AudioContext
  oscillators: Set<OscillatorNode>
  gainNodes: Set<GainNode>
  timeouts: Set<ReturnType<typeof setTimeout>>
}

let audioContext: AudioContext | null = null
let currentPlayback: PlaybackState | null = null
let resolvePlayback: (() => void) | null = null

const getAudioContext = (): AudioContext | null => {
  if (audioContext) return audioContext

  if (typeof window === "undefined") return null

  const Ctor =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null

  audioContext = new Ctor()

  return audioContext
}

const scheduleTimeout = globalThis.setTimeout.bind(globalThis)

const parseTonePattern = (pattern: string): Array<ToneSegment> =>
  pattern
    .split(",")
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const [frequenciesPart, rawDurationPart] = part.split("/")
      if (!rawDurationPart) throw new Error(`Invalid pattern segment: ${part}`)

      const [durationPart] = rawDurationPart.split("@")
      const duration = Number(durationPart)
      if (Number.isNaN(duration) || duration <= 0) {
        throw new Error(`Invalid duration in segment: ${part}`)
      }

      const frequencies = frequenciesPart
        .split("+")
        .map(freq => Number(freq.trim()))
        .filter(freq => !Number.isNaN(freq) && freq >= 0)

      return {
        frequencies,
        duration
      }
    })

const cleanupPlayback = (playback: PlaybackState) => {
  const { context, oscillators, gainNodes, timeouts } = playback

  timeouts.forEach(timeoutId => clearTimeout(timeoutId))
  timeouts.clear()

  oscillators.forEach(oscillator => {
    try {
      oscillator.stop()
    } catch (error) {
      console.warn("Failed to stop oscillator", error)
    }

    try {
      oscillator.disconnect()
    } catch (error) {
      console.warn("Failed to disconnect oscillator", error)
    }
  })
  oscillators.clear()

  gainNodes.forEach(gainNode => {
    try {
      gainNode.gain.cancelScheduledValues(context.currentTime)
      gainNode.gain.setValueAtTime(0, context.currentTime)
      gainNode.disconnect()
    } catch (error) {
      console.warn("Failed to cleanup gain node", error)
    }
  })
  gainNodes.clear()
}

const finalizePlayback = (playback: PlaybackState | null) => {
  if (!playback) return

  cleanupPlayback(playback)

  if (currentPlayback === playback) {
    currentPlayback = null
  }

  const resolve = resolvePlayback
  resolvePlayback = null
  if (resolve) resolve()
}

export const getTonePatternDuration = (pattern: string): number =>
  parseTonePattern(pattern).reduce((accumulator, segment) => accumulator + segment.duration, 0)

export const playTonePattern = async (pattern: string, options: PlayToneOptions = {}): Promise<void> => {
  const segments = parseTonePattern(pattern)
  if (!segments.length) return

  const context = getAudioContext()
  if (!context) return

  stopTonePattern()

  if (context.state === "suspended") {
    try {
      await context.resume()
    } catch (error) {
      console.warn("Failed to resume audio context", error)
      return
    }
  }

  const playback: PlaybackState = {
    context,
    oscillators: new Set(),
    gainNodes: new Set(),
    timeouts: new Set()
  }

  currentPlayback = playback

  const now = context.currentTime
  let offset = 0
  const volume = Math.max(0, Math.min(options.volume ?? 0.2, 1))

  segments.forEach(segment => {
    const durationSeconds = segment.duration / 1000
    const startTime = now + offset
    const endTime = startTime + durationSeconds

    if (!segment.frequencies.length || segment.frequencies.every(freq => freq === 0)) {
      offset += durationSeconds
      return
    }

    const gainNode = context.createGain()
    const fadeDuration = Math.min(0.01, durationSeconds / 4)
    const fadeInEnd = startTime + fadeDuration
    const fadeOutStart = Math.max(fadeInEnd, endTime - fadeDuration)

    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume, fadeInEnd)
    if (fadeOutStart > fadeInEnd) {
      gainNode.gain.setValueAtTime(volume, fadeOutStart)
    }
    gainNode.gain.linearRampToValueAtTime(0, endTime)
    gainNode.connect(context.destination)

    playback.gainNodes.add(gainNode)

    const oscillators = segment.frequencies
      .filter(freq => freq > 0)
      .map(freq => {
        const oscillator = context.createOscillator()
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(freq, startTime)
        oscillator.connect(gainNode)
        oscillator.start(startTime)
        oscillator.stop(endTime)
        playback.oscillators.add(oscillator)
        return oscillator
      })

    const cleanupDelay = Math.max(endTime - context.currentTime + 0.05, 0)
    const cleanupTimeout = scheduleTimeout(() => {
      playback.timeouts.delete(cleanupTimeout)

      oscillators.forEach(oscillator => {
        playback.oscillators.delete(oscillator)

        try {
          oscillator.disconnect()
        } catch (error) {
          console.warn("Failed to disconnect oscillator", error)
        }
      })

      playback.gainNodes.delete(gainNode)

      try {
        gainNode.disconnect()
      } catch (error) {
        console.warn("Failed to disconnect gain node", error)
      }
    }, cleanupDelay * 1000)

    playback.timeouts.add(cleanupTimeout)

    offset += durationSeconds
  })

  await new Promise<void>(resolve => {
    let resolved = false

    const finish = () => {
      if (resolved) return
      resolved = true
      resolve()
    }

    resolvePlayback = finish

    const totalDuration = segments.reduce((acc, segment) => acc + segment.duration, 0)
    const completionTimeout = scheduleTimeout(() => {
      playback.timeouts.delete(completionTimeout)
      finalizePlayback(playback)
    }, totalDuration)

    playback.timeouts.add(completionTimeout)
  })
}

export const stopTonePattern = (disposeContext = false): void => {
  if (!currentPlayback) {
    if (resolvePlayback) {
      resolvePlayback()
      resolvePlayback = null
    }

    if (disposeContext && audioContext) {
      audioContext
        .close()
        .catch(() => null)
        .finally(() => {
          audioContext = null
        })
    }

    return
  }

  const playback = currentPlayback
  finalizePlayback(playback)

  if (!disposeContext || !audioContext) return

  audioContext
    .close()
    .catch(() => null)
    .finally(() => {
      audioContext = null
    })
}
