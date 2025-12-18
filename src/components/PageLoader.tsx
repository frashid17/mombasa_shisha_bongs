'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function PageLoader() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const prevPathnameRef = useRef<string | null>(null)

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
            setIsLoading(true)
          }
        } catch (err) {
          // Invalid URL, ignore
        }
      }
    }

    // Listen for popstate (back/forward buttons)
    const handlePopState = () => {
      setIsLoading(true)
    }

    // Add event listeners
    document.addEventListener('click', handleLinkClick, true)
    window.addEventListener('popstate', handlePopState)

    // Check if pathname changed (navigation completed)
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      // Navigation completed - hide loader after a short delay
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)
      
      return () => clearTimeout(timer)
    }
    
    prevPathnameRef.current = pathname

    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname])

  useEffect(() => {
    const originalTitle = document.title

    if (isLoading) {
      // Update title to show loading
      document.title = '⏳ Loading... | Mombasa Shisha Bongs'
      
      // Create a spinning favicon
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link')
      link.type = 'image/svg+xml'
      link.rel = 'icon'
      
      // Create a simple SVG spinner
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#9333ea" stroke-width="4" opacity="0.3"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#9333ea" stroke-width="4" stroke-dasharray="70 283" stroke-dashoffset="0">
            <animate attributeName="stroke-dashoffset" values="0;-283" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
      `
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      link.href = url
      
      if (!document.querySelector("link[rel*='icon']")) {
        document.getElementsByTagName('head')[0].appendChild(link)
      } else {
        document.querySelector("link[rel*='icon']")?.setAttribute('href', url)
      }
    } else {
      // Restore original title
      document.title = originalTitle
      
      // Restore original favicon
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      if (link) {
        link.href = '/uploads/hookah.svg'
      }
    }

    return () => {
      // Cleanup: restore original title and favicon
      document.title = originalTitle
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      if (link) {
        link.href = '/uploads/hookah.svg'
      }
    }
  }, [isLoading])

  // This component doesn't render anything visible
  return null
}

