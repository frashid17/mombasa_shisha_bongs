'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function PageLoader() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const prevPathnameRef = useRef<string | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const startProgress = () => {
    setIsLoading(true)
    setProgress(0)
    startTimeRef.current = Date.now()
    
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    
    // Simulate progress - start fast, slow down
    let currentProgress = 0
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current || 0)
      
      // Fast initial progress
      if (elapsed < 200) {
        currentProgress = Math.min(30 + (elapsed / 200) * 20, 50)
      } else {
        // Slower progress after initial burst
        currentProgress = Math.min(50 + ((elapsed - 200) / 1000) * 30, 90)
      }
      
      setProgress(currentProgress)
    }, 50)
  }

  const completeProgress = () => {
    setProgress(100)
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    
    // Hide after animation completes
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
      startTimeRef.current = null
    }, 300)
  }

  useEffect(() => {
    // Detect navigation start on link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href) {
        try {
          const url = new URL(link.href)
          const currentUrl = new URL(window.location.href)
          
          // Only show loader for internal navigation
          if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
            // Start progress immediately
            startProgress()
          }
        } catch (err) {
          // Invalid URL, ignore
        }
      }
    }

    // Listen for popstate (back/forward buttons)
    const handlePopState = () => {
      startProgress()
    }

    // Add event listeners with capture phase for early detection
    document.addEventListener('click', handleLinkClick, true)
    window.addEventListener('popstate', handlePopState)

    // Check if pathname changed (navigation completed)
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      // Navigation completed - complete progress
      completeProgress()
    } else if (prevPathnameRef.current === null) {
      // Initial load - don't show progress bar
      prevPathnameRef.current = pathname
    }
    
    // Update previous pathname
    prevPathnameRef.current = pathname

    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick, true)
      window.removeEventListener('popstate', handlePopState)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [pathname])


  // Render progress bar
  if (!isLoading) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 transition-all duration-150 ease-out shadow-lg"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 5px rgba(147, 51, 234, 0.5)',
          transition: 'width 0.15s ease-out',
        }}
      />
    </div>
  )
}

