import { useEffect } from 'react'

interface ResourceHintsProps {
  currentSection: number
}

export const ResourceHints = ({ currentSection }: ResourceHintsProps) => {
  useEffect(() => {
    // Prefetch resources for the next section
    const prefetchNextSection = () => {
      switch (currentSection) {
        case 0: // Hero -> Features
          // Prefetch Features section assets
          prefetchComponent('/src/components/Features.tsx')
          break
        case 1: // Features -> Performance
          // Prefetch Performance section assets
          prefetchComponent('/src/components/Performance.tsx')
          // Preconnect to any external APIs if needed
          preconnect('https://api.example.com')
          break
        case 2: // Performance -> About
          // Prefetch About section assets
          prefetchComponent('/src/components/About.tsx')
          break
        case 3: // About -> Announcements
          // Prefetch Announcements section assets
          prefetchComponent('/src/components/Announcements.tsx')
          break
      }
    }

    const timeoutId = setTimeout(prefetchNextSection, 1000) // Delay prefetch by 1 second

    return () => clearTimeout(timeoutId)
  }, [currentSection])

  return null
}

// Utility functions for resource hints
const prefetchComponent = (url: string) => {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url
  link.as = 'script'
  document.head.appendChild(link)
}

const preconnect = (url: string) => {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = url
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

// Unused but keeping for potential future use
// const preload = (url: string, as: string) => {
//   const link = document.createElement('link')
//   link.rel = 'preload'
//   link.href = url
//   link.as = as
//   if (as === 'font') {
//     link.crossOrigin = 'anonymous'
//   }
//   document.head.appendChild(link)
// }

