'use client'

import { useEffect, useState } from 'react'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    const nightTime = hour < 6 || hour >= 18
    setIsDark(nightTime)
    document.documentElement.classList.toggle('dark', nightTime)
  }, [])

  function toggleTheme() {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark', !isDark)
  }

  return (
    <button className="dark-mode-toggle" onClick={toggleTheme}>
      {isDark ? 'light mode' : 'dark mode'}
    </button>
  )
}
