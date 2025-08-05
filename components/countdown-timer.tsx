"use client"

import { useState, useEffect } from "react"
import type { JSX } from "react/jsx-runtime"

interface CountdownTimerProps {
  targetDate: Date
  onTimerEnd?: () => void
}

export function CountdownTimer({ targetDate, onTimerEnd }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date()
    let timeLeft = {} as { days?: number; hours?: number; minutes?: number; seconds?: number }

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    } else {
      if (onTimerEnd) {
        onTimerEnd()
      }
    }
    return timeLeft
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer)
  })

  const timerComponents: JSX.Element[] = []

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof typeof timeLeft]) {
      return
    }

    timerComponents.push(
      <span key={interval} className="font-mono text-lg">
        {timeLeft[interval as keyof typeof timeLeft]?.toString().padStart(2, "0")} {interval}{" "}
      </span>,
    )
  })

  return (
    <div className="text-center text-xl font-semibold text-blue-600">
      {timerComponents.length ? timerComponents : <span>Time's up!</span>}
    </div>
  )
}
