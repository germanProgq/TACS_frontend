import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Optimized GSAP scroll effects with performance controls
export const useGSAPScrollEffects = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return
    
    // Performance-based configuration
    const deviceTier = document.documentElement.getAttribute('data-device-tier') || 'medium'
    const isLowTier = deviceTier === 'low'
    
    // Skip animations on low-tier devices
    if (isLowTier) return
    
    // Wait for DOM to be ready
    const initScrollEffects = () => {
      // Performance optimizations
      ScrollTrigger.config({
        limitCallbacks: true,
        syncInterval: deviceTier === 'ultra' ? 8 : 16
      })
      
      // Batch DOM queries for better performance
      const fadeElements = document.querySelectorAll('.gsap-fade-up')
      const parallaxElements = document.querySelectorAll('.gsap-parallax')
      
      // Only animate if elements exist
      if (fadeElements.length > 0) {
        fadeElements.forEach((element: Element, index) => {
          // Stagger initialization to prevent frame drops
          setTimeout(() => {
            gsap.from(element, {
              y: deviceTier === 'ultra' ? 30 : 20,
              opacity: 0.85,
              duration: deviceTier === 'ultra' ? 0.8 : 0.6,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none none',
                once: false,
                fastScrollEnd: true // Optimize for fast scrolling
              }
            })
          }, index * 5) // Micro-stagger to prevent blocking
        })
      }

      // Conditional parallax only for high-tier devices
      if ((deviceTier === 'high' || deviceTier === 'ultra') && parallaxElements.length > 0) {
        parallaxElements.forEach((element: Element) => {
          gsap.to(element, {
            yPercent: deviceTier === 'ultra' ? -15 : -8,
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: deviceTier === 'ultra' ? 0.8 : 0.5,
              invalidateOnRefresh: true,
              fastScrollEnd: true
            }
          })
        })
      }
    }

    // Optimized timing
    const timer = setTimeout(initScrollEffects, deviceTier === 'ultra' ? 50 : 100)

    return () => {
      clearTimeout(timer)
      // Efficient cleanup
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      ScrollTrigger.clearScrollMemory()
    }
  }, [enabled])
}