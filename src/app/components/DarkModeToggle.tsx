'use client'
import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored) {
      // user has an explicit setting
      const wantsDark = stored === 'dark'
      setIsDark(wantsDark)
      document.documentElement.classList.toggle('dark', wantsDark)
    } else {
      // no stored preference => guess by local time
      const hour = new Date().getHours()
      const nightTime = hour < 6 || hour >= 18
      setIsDark(nightTime)
      document.documentElement.classList.toggle('dark', nightTime)
    }
  }, [])

  function toggleTheme() {
    setIsDark(!isDark)
    localStorage.setItem('theme', !isDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', !isDark)
  }

  return (
    <button className="dark-mode-toggle" onClick={toggleTheme}>
      {isDark ? 'light mode' : 'dark mode'}
    </button>
  )
}
