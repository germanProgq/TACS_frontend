import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { DeviceCapabilities } from '../utils/performanceOptimizer'

interface LazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  deviceCapabilities?: DeviceCapabilities
  priority?: 'low' | 'medium' | 'high'
}

interface ScrollDirection {
  direction: 'up' | 'down' | 'none'
  speed: number
}

const useScrollDirection = (): ScrollDirection => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>({ direction: 'none', speed: 0 })
  const lastScrollY = useRef(0)
  const lastTimestamp = useRef(0)

  useEffect(() => {
    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY
      const currentTimestamp = Date.now()
      const deltaY = currentScrollY - lastScrollY.current
      const deltaTime = currentTimestamp - lastTimestamp.current
      
      if (deltaTime > 0) {
        const speed = Math.abs(deltaY) / deltaTime
        const direction = deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : 'none'
        
        setScrollDirection({ direction, speed })
      }
      
      lastScrollY.current = currentScrollY
      lastTimestamp.current = currentTimestamp
    }

    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollDirection()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollDirection
}

export const useLazyLoading = (options: LazyLoadOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false) // Track if component was ever visible
  const elementRef = useRef<HTMLDivElement>(null)
  const scrollDirection = useScrollDirection()

  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    deviceCapabilities,
    priority = 'medium'
  } = options

  // Adaptive loading based on device capabilities and scroll behavior
  const getAdaptiveSettings = useCallback(() => {
    const tier = deviceCapabilities?.tier || 'medium'
    const isSlowScrolling = scrollDirection.speed < 0.5
    const isFastScrolling = scrollDirection.speed > 2

    let adaptiveThreshold = threshold
    let adaptiveRootMargin = rootMargin
    let preloadDistance = '100px'

    // Adjust settings based on device tier - more conservative to reduce churn
    switch (tier) {
      case 'low':
        adaptiveThreshold = Math.max(threshold, 0.4)
        adaptiveRootMargin = '50px'
        preloadDistance = '100px'
        break
      case 'medium':
        adaptiveThreshold = Math.max(threshold, 0.2)
        adaptiveRootMargin = '100px'
        preloadDistance = '200px'
        break
      case 'high':
        adaptiveThreshold = Math.max(threshold, 0.1)
        adaptiveRootMargin = '200px'
        preloadDistance = '400px'
        break
      case 'ultra':
        adaptiveThreshold = Math.max(threshold, 0.05)
        adaptiveRootMargin = '300px'
        preloadDistance = '500px'
        break
    }

    // Adjust for scroll speed
    if (isFastScrolling && tier !== 'low') {
      // Aggressive preloading for fast scrolling on capable devices
      preloadDistance = tier === 'ultra' ? '400px' : '250px'
    } else if (isSlowScrolling) {
      // Conservative loading for slow scrolling
      preloadDistance = tier === 'low' ? '25px' : '75px'
    }

    // Priority adjustments
    if (priority === 'high') {
      preloadDistance = `${parseInt(preloadDistance) * 1.5}px`
    } else if (priority === 'low') {
      preloadDistance = `${parseInt(preloadDistance) * 0.5}px`
    }

    return { adaptiveThreshold, adaptiveRootMargin, preloadDistance }
  }, [threshold, rootMargin, deviceCapabilities, scrollDirection, priority])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const { adaptiveThreshold, adaptiveRootMargin, preloadDistance } = getAdaptiveSettings()

    // Preemptively load if element is already in view
    const rect = element.getBoundingClientRect()
    const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight

    if (isInViewport && !hasLoaded) {
      setIsVisible(true)
      setHasLoaded(true)
      return
    }

    // Create two observers: one for preloading, one for visibility
    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isPreparing && !hasLoaded) {
          setIsPreparing(true)
          // Start background preparation/loading
          if (deviceCapabilities?.tier === 'ultra' || deviceCapabilities?.tier === 'high') {
            // Prefetch resources in the background
            setTimeout(() => setIsPreparing(false), 100)
          }
        }
      },
      {
        threshold: 0,
        rootMargin: preloadDistance
      }
    )

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setHasBeenVisible(true) // Mark as having been visible
          if (triggerOnce) {
            setHasLoaded(true)
            visibilityObserver.disconnect()
            preloadObserver.disconnect()
          }
        } else if (!triggerOnce) {
          // Only hide if component hasn't been visible before OR on very low-end devices
          if (!hasBeenVisible || deviceCapabilities?.tier === 'low') {
            setIsVisible(false)
            setIsPreparing(false)
          }
          // For all other cases, keep the component visible once it's been loaded
        }
      },
      {
        threshold: adaptiveThreshold,
        rootMargin: adaptiveRootMargin
      }
    )

    preloadObserver.observe(element)
    visibilityObserver.observe(element)

    return () => {
      preloadObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [getAdaptiveSettings, triggerOnce, hasLoaded, isPreparing, deviceCapabilities, hasBeenVisible])

  return { elementRef, isVisible, hasLoaded, isPreparing, scrollDirection }
}


interface LazyComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  threshold?: number
  deviceCapabilities?: DeviceCapabilities
  priority?: 'low' | 'medium' | 'high'
}

export const LazyComponent: React.FC<LazyComponentProps> = ({ 
  children, 
  fallback, 
  className = '', 
  threshold = 0.1,
  deviceCapabilities,
  priority = 'medium'
}) => {
  const { elementRef, isVisible, isPreparing, scrollDirection } = useLazyLoading({ 
    threshold, 
    deviceCapabilities, 
    priority,
    triggerOnce: true // Keep components loaded once visible to reduce churn
  })

  // Create a progressive loading indicator based on device capabilities
  const getProgressiveLoader = () => {
    const tier = deviceCapabilities?.tier || 'medium'
    
    if (isPreparing && tier !== 'low') {
      return (
        <div className="lazy-preparing" style={{ 
          opacity: 0.6, 
          filter: 'blur(2px)',
          transition: 'all 0.3s ease'
        }}>
          {fallback || <div className="lazy-placeholder">Preparing...</div>}
        </div>
      )
    }
    
    return fallback || <div className="lazy-placeholder">Loading...</div>
  }

  return (
    <div 
      ref={elementRef} 
      className={className}
      data-scroll-direction={scrollDirection.direction}
      data-scroll-speed={scrollDirection.speed.toFixed(2)}
      data-device-tier={deviceCapabilities?.tier}
    >
      {isVisible ? children : getProgressiveLoader()}
    </div>
  )
}

