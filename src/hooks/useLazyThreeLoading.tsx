import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { DeviceCapabilities } from '../utils/performanceOptimizer'

interface LazyLoadOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  deviceCapabilities?: DeviceCapabilities
}

interface LazyThreeComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  deviceCapabilities?: DeviceCapabilities
}

export const useLazyThreeLoading = (options: LazyLoadOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const { gl } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  const {
    threshold = 0.1,
    triggerOnce = true,
    deviceCapabilities
  } = options

  // Adaptive threshold for 3D components based on device tier
  const getAdaptive3DThreshold = useCallback(() => {
    const tier = deviceCapabilities?.tier || 'medium'
    switch (tier) {
      case 'low':
        return Math.max(threshold, 0.5) // Very conservative for low-end devices
      case 'medium':
        return threshold
      case 'high':
        return Math.min(threshold, 0.1)
      case 'ultra':
        return Math.min(threshold, 0.05)
      default:
        return threshold
    }
  }, [threshold, deviceCapabilities])

  useEffect(() => {
    if (!groupRef.current) return

    const checkVisibility = () => {
      if (!groupRef.current) return false

      // Get the canvas element for intersection observer
      const canvas = gl.domElement
      const rect = canvas.getBoundingClientRect()
      
      // Check if canvas is in viewport
      const isCanvasVisible = rect.top < window.innerHeight && rect.bottom > 0

      if (isCanvasVisible && !hasLoaded) {
        setIsVisible(true)
        if (triggerOnce) {
          setHasLoaded(true)
        }
        return true
      }
      return false
    }

    // Initial check
    if (checkVisibility()) return

    // Use intersection observer on the canvas element
    const canvas = gl.domElement
    const adaptiveThreshold = getAdaptive3DThreshold()
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            setHasLoaded(true)
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          // Keep 3D components loaded on high-end devices to avoid re-compilation
          if (deviceCapabilities?.tier === 'low' || deviceCapabilities?.tier === 'medium') {
            setIsVisible(false)
          }
        }
      },
      { threshold: adaptiveThreshold }
    )

    observer.observe(canvas)

    return () => {
      observer.disconnect()
    }
  }, [gl, getAdaptive3DThreshold, triggerOnce, hasLoaded, deviceCapabilities])

  return { groupRef, isVisible, hasLoaded }
}

export const LazyThreeComponent: React.FC<LazyThreeComponentProps> = ({ 
  children, 
  fallback,
  threshold = 0.1,
  deviceCapabilities
  // priority parameter is accepted but not used in this simple component
}) => {
  const { groupRef, isVisible } = useLazyThreeLoading({ 
    threshold, 
    deviceCapabilities,
    triggerOnce: true // Keep 3D components loaded once visible to prevent shader recompilation
  })

  return (
    <group ref={groupRef}>
      {isVisible ? children : fallback}
    </group>
  )
}