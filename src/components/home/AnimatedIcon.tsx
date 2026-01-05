'use client'

import { ReactNode } from 'react'

interface AnimatedIconProps {
  children: ReactNode
  animationType?: 'bounce' | 'pulse' | 'spin' | 'shake'
  className?: string
}

export default function AnimatedIcon({
  children,
  animationType = 'pulse',
  className = '',
}: AnimatedIconProps) {
  const animationClasses = {
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    shake: 'animate-[shake_0.5s_ease-in-out_infinite]',
  }
  
  // Add shake animation style if needed
  const shakeStyle = animationType === 'shake' ? { animation: 'shake 0.5s ease-in-out infinite' } : {}

  return (
    <div className={`${animationClasses[animationType]} ${className}`} style={shakeStyle}>
      {children}
    </div>
  )
}

