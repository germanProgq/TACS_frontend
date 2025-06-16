import React, { createContext, useContext, useState, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'auto'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tacs-theme')
      return (saved as Theme) || 'auto'
    }
    return 'auto'
  })

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark')

  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setResolvedTheme(prefersDark ? 'dark' : 'light')
      } else {
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', updateResolvedTheme)
      return () => mediaQuery.removeEventListener('change', updateResolvedTheme)
    }
  }, [theme])

  useEffect(() => {
    localStorage.setItem('tacs-theme', theme)
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    
    // Apply theme-specific CSS custom properties
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.style.setProperty('--bg-primary', '#000000')
      root.style.setProperty('--bg-secondary', '#001122')
      root.style.setProperty('--bg-tertiary', '#002244')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#cccccc')
      root.style.setProperty('--text-accent', '#00ff88')
      root.style.setProperty('--accent-primary', '#00ff88')
      root.style.setProperty('--accent-secondary', '#0088ff')
      root.style.setProperty('--accent-tertiary', '#ff0088')
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)')
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)')
      root.style.setProperty('--glass-bg', 'rgba(0, 17, 34, 0.8)')
    } else {
      root.style.setProperty('--bg-primary', '#ffffff')
      root.style.setProperty('--bg-secondary', '#f8f9fa')
      root.style.setProperty('--bg-tertiary', '#e9ecef')
      root.style.setProperty('--text-primary', '#000000')
      root.style.setProperty('--text-secondary', '#333333')
      root.style.setProperty('--text-accent', '#2d5a4a')
      root.style.setProperty('--accent-primary', '#2d5a4a')
      root.style.setProperty('--accent-secondary', '#004499')
      root.style.setProperty('--accent-tertiary', '#990044')
      root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.3)')
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)')
      root.style.setProperty('--glass-bg', 'rgba(248, 249, 250, 0.8)')
    }
  }, [theme, resolvedTheme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  const toggleTheme = () => {
    setTheme(current => {
      if (current === 'light') return 'dark'
      if (current === 'dark') return 'auto'
      return 'light'
    })
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      resolvedTheme,
      setTheme: handleSetTheme,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}