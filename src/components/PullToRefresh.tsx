'use client'

import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: React.ReactNode
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canPull, setCanPull] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const threshold = 80 // Distance to pull before triggering refresh

  useEffect(() => {
    // Only enable on mobile/touch devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      // Only start pull if we're at the top of the page
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      if (scrollTop === 0 && !isRefreshing) {
        startY.current = e.touches[0].clientY
        setCanPull(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || isRefreshing) return

      const currentY = e.touches[0].clientY
      const distance = currentY - startY.current

      // Only track pull down (positive distance)
      if (distance > 0 && distance <= threshold * 1.5) {
        setPullDistance(distance)
        
        // Prevent default scroll when pulling
        if (distance > 10) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = async () => {
      if (!canPull || isRefreshing) return

      setCanPull(false)

      // Trigger refresh if pulled beyond threshold
      if (pullDistance >= threshold) {
        setIsRefreshing(true)
        setPullDistance(threshold)

        try {
          await onRefresh()
        } catch (error) {
          console.error('Refresh error:', error)
        } finally {
          setIsRefreshing(false)
          setPullDistance(0)
        }
      } else {
        // Reset if not pulled enough
        setPullDistance(0)
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [canPull, pullDistance, isRefreshing, onRefresh])

  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 360

  return (
    <div ref={containerRef} className="relative">
      {/* Pull to Refresh Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-b from-white to-transparent pointer-events-none"
          style={{
            height: `${Math.min(pullDistance, threshold * 1.2)}px`,
            opacity: progress,
            zIndex: 40,
          }}
        >
          <div
            className={`bg-white rounded-full p-3 shadow-lg ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: `rotate(${isRefreshing ? 0 : rotation}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.2s ease',
            }}
          >
            <RefreshCw
              className={`w-6 h-6 ${
                progress >= 1 ? 'text-red-600' : 'text-gray-400'
              }`}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: isRefreshing
            ? `translateY(${threshold}px)`
            : `translateY(${pullDistance}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
