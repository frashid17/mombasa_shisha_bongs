'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  endDate: Date | string
  onComplete?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({ endDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = typeof endDate === 'string' ? new Date(endDate) : endDate
      const now = new Date()
      const difference = end.getTime() - now.getTime()

      if (difference <= 0) {
        setIsExpired(true)
        if (onComplete) {
          onComplete()
        }
        return null
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    // Calculate immediately
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      if (newTimeLeft) {
        setTimeLeft(newTimeLeft)
      } else {
        setIsExpired(true)
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate, onComplete])

  if (isExpired || !timeLeft) {
    return (
      <div className="flex items-center gap-2 text-red-600 font-semibold">
        <Clock className="w-5 h-5" />
        <span>Sale Ended</span>
      </div>
    )
  }

  const formatTime = (value: number) => String(value).padStart(2, '0')

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-blue-600 font-semibold">
        <Clock className="w-5 h-5 animate-pulse" />
        <span>Ends in:</span>
      </div>
      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <div className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold min-w-[3rem] text-center">
            {formatTime(timeLeft.days)}d
          </div>
        )}
        <div className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold min-w-[3rem] text-center">
          {formatTime(timeLeft.hours)}h
        </div>
        <div className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold min-w-[3rem] text-center">
          {formatTime(timeLeft.minutes)}m
        </div>
        <div className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold min-w-[3rem] text-center animate-pulse">
          {formatTime(timeLeft.seconds)}s
        </div>
      </div>
    </div>
  )
}

