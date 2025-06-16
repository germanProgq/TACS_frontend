import { useState, useEffect } from 'react'

// Utility hook for detecting device performance
export const usePerformanceMode = () => {
  const [performanceMode, setPerformanceMode] = useState<'high' | 'low'>('high')

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    // Check device memory (if available)
    const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory || 4
    
    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency || 4
    
    // Determine performance mode
    if (prefersReducedMotion || deviceMemory < 4 || cores < 4) {
      setPerformanceMode('low')
    }
  }, [])

  return performanceMode
}