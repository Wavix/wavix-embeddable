import { useState, useEffect, useRef } from "react"

import { durationFormat } from "@utils/formatter"

import type { FC } from "react"

type DurationTimerProps = {
  isActive: boolean
}

type DurationProps = {
  duration: number
}

const Duration: FC<DurationProps> = ({ duration }) => <span>{durationFormat(duration)}</span>

export const DurationTimer: FC<DurationTimerProps> = ({ isActive }) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (isActive) {
      setDuration(0)

      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1_000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      setDuration(0)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive])

  return (
    <>
      <Duration duration={duration} />
    </>
  )
}
