'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, X } from 'lucide-react'

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    applyTheme(initialTheme)
    
    // Listen for theme changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        const newTheme = e.newValue as 'light' | 'dark'
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-indigo-800 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 transform flex items-center justify-center"
        aria-label="Accessibility options"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : theme === 'light' ? (
          <Sun className="w-6 h-6" />
        ) : (
          <Moon className="w-6 h-6" />
        )}
      </button>

      {/* Toolbar Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 min-w-[200px] animate-fade-in-up">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Accessibility</h3>
          
          <div className="space-y-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl transition-all duration-300 group"
            >
              <span className="text-sm font-semibold text-gray-700 dark:text-white">
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </span>
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

