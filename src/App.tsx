import { useEffect, useState, useRef, Suspense, lazy, useCallback, memo } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import { isMobile, isTablet } from 'react-device-detect'
import { LoadingScreen } from './components/LoadingScreen'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { Performance } from './components/Performance'
import { About } from './components/About'
import { Announcements } from './components/Announcements'
import { Navigation } from './components/Navigation'
import { MouseFollower } from './components/MouseFollower'
import { ScrollProgress } from './components/ScrollAnimationsOptimized'
import { ThemeSelector } from './components/ThemeSelector'
import { ResourceHints } from './components/ResourceHints'
import PerformanceOptimizer from './utils/performanceOptimizer'
import ScrollOptimizer from './utils/scrollOptimizer'
import './App.css'

// Lazy load 3D components for better performance
const NeuralNetworkBrain = lazy(() => import('./components/Interactive3D/AIBrainVisualization').then(m => ({ default: m.NeuralNetworkBrain })))
const AIParticleSystem = lazy(() => import('./components/Interactive3D/ParticleIntelligence').then(m => ({ default: m.AIParticleSystem })))

// Memoized 3D background component
interface Background3DProps {
  deviceCapabilities: {
    tier: string
    supportedFeatures: { animations: boolean }
  }
  mousePosition: { x: number; y: number }
  isLoading: boolean
  currentSection: number
}

const Background3D = memo(({ deviceCapabilities, mousePosition, isLoading, currentSection }: Background3DProps) => {
  const [show3D, setShow3D] = useState(false)
  
  useEffect(() => {
    // Delay 3D rendering until after initial load
    const timer = setTimeout(() => {
      if (!isLoading && deviceCapabilities.tier !== 'low') {
        setShow3D(true)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [isLoading, deviceCapabilities.tier])

  if (!show3D || deviceCapabilities.tier === 'low') return null

  return (
    <div className="background-3d-effects">
      <Canvas 
        className="background-canvas"
        dpr={deviceCapabilities.tier === 'ultra' ? [1, 2] : [1, 1]}
        performance={{ min: 0.5 }}
        frameloop={currentSection === 3 || currentSection === 4 ? 'always' : 'demand'}
      >
        <Suspense fallback={null}>
          <AIParticleSystem 
            count={deviceCapabilities.tier === 'ultra' ? 300 : deviceCapabilities.tier === 'high' ? 150 : 50}
            mousePosition={mousePosition}
            isActive={!isLoading}
            mode={'emergence'}
          />
        </Suspense>
        
        {(currentSection === 3 || currentSection === 4) && (
          <Suspense fallback={null}>
            <NeuralNetworkBrain
              mousePosition={mousePosition}
              isActive={true}
            />
          </Suspense>
        )}
      </Canvas>
    </div>
  )
})

Background3D.displayName = 'Background3D'

// Memoized gradient orb
interface GradientOrbProps {
  mousePosition: { x: number; y: number }
  deviceCapabilities: {
    tier: string
  }
}

const GradientOrb = memo(({ mousePosition, deviceCapabilities }: GradientOrbProps) => {
  if (deviceCapabilities.tier === 'low') return null
  
  return (
    <motion.div
      className="dynamic-gradient-orb"
      animate={{
        x: mousePosition.x * 100,
        y: mousePosition.y * 100,
      }}
      transition={{ type: 'spring', stiffness: 100, damping: 30 }}
      style={{
        position: 'fixed',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: `radial-gradient(circle, 
          rgba(0, 255, 136, 0.08) 0%, 
          rgba(0, 136, 255, 0.04) 50%, 
          transparent 100%)`,
        pointerEvents: 'none',
        zIndex: -1,
        filter: deviceCapabilities.tier === 'ultra' ? 'blur(20px)' : 'blur(10px)',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    />
  )
})

GradientOrb.displayName = 'GradientOrb'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [currentSection, setCurrentSection] = useState(0)
  const [mobileScrollProgress, setMobileScrollProgress] = useState(0)
  const [performanceOptimizer] = useState(() => new PerformanceOptimizer())
  const [deviceCapabilities] = useState(() => performanceOptimizer.getCapabilities())
  const [scrollOptimizer] = useState(() => new ScrollOptimizer(deviceCapabilities))
  const containerRef = useRef<HTMLDivElement>(null)
  const isDevice = isMobile || isTablet
  const mouseTimeoutRef = useRef<number | undefined>(undefined)
  const rafRef = useRef<number | undefined>(undefined)

  // Optimized mouse move handler with RAF
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDevice || deviceCapabilities.tier === 'low') return
    
    if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current)
    
    mouseTimeoutRef.current = setTimeout(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      
      rafRef.current = requestAnimationFrame(() => {
        setMousePosition({ 
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: -(e.clientY / window.innerHeight) * 2 + 1
        })
      })
    }, deviceCapabilities.tier === 'ultra' ? 16 : 33)
  }, [isDevice, deviceCapabilities.tier])

  useEffect(() => {
    // Apply performance optimizations to CSS
    performanceOptimizer.applyCSSVariables()
    
    // Add device-specific classes
    if (isDevice) {
      document.body.classList.add('mobile')
    } else {
      document.body.classList.remove('mobile')
    }
    document.body.dataset.deviceTier = deviceCapabilities.tier
    
    // Create optimized scroll handler
    const handleScrollCore = () => {
      const sectionIds = ['hero', 'features', 'performance', 'about', 'announcements']
      let currentIndex = 0
      
      for (let i = 0; i < sectionIds.length; i++) {
        const element = document.getElementById(sectionIds[i])
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentIndex = i
            break
          }
        }
      }
      
      setCurrentSection(currentIndex)
    }

    const handleScroll = scrollOptimizer.optimizeScrollHandler(handleScrollCore, 'main-scroll')
    
    // Intersection Observer for section detection
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionIds = ['hero', 'features', 'performance', 'about', 'announcements']
          const index = sectionIds.indexOf(entry.target.id)
          if (index !== -1) {
            setCurrentSection(index)
          }
        }
      })
    }, observerOptions)

    // Event listeners
    if (!isDevice && deviceCapabilities.tier !== 'low') {
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Set up intersection observer
    const sectionIds = ['hero', 'features', 'performance', 'about', 'announcements']
    sectionIds.forEach(id => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })
    
    return () => {
      if (!isDevice && deviceCapabilities.tier !== 'low') {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      window.removeEventListener('scroll', handleScroll)
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      scrollOptimizer.cleanup()
      observer.disconnect()
    }
  }, [isDevice, performanceOptimizer, scrollOptimizer, handleMouseMove, deviceCapabilities.tier])

  // Update mobile scroll progress
  useEffect(() => {
    if (isDevice) {
      const progress = currentSection / 4
      setMobileScrollProgress(progress)
    }
  }, [currentSection, isDevice])

  // Component preloading
  const [componentsLoaded, setComponentsLoaded] = useState(false)

  useEffect(() => {
    const preloadComponents = async () => {
      // Only preload 3D components for capable devices
      if (deviceCapabilities.tier !== 'low') {
        try {
          await Promise.all([
            import('./components/Interactive3D/AIBrainVisualization'),
            import('./components/Interactive3D/ParticleIntelligence')
          ])
        } catch (error) {
          console.error('Failed to preload 3D components:', error)
        }
      }
      setComponentsLoaded(true)
    }

    preloadComponents()
  }, [deviceCapabilities.tier])

  useEffect(() => {
    if (!componentsLoaded) return

    const timer = setTimeout(() => {
      setIsLoading(false)
      document.body.style.overflow = 'auto'
    }, 800)
    
    // Only hide overflow on desktop during loading
    if (!isDevice) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = 'auto'
    }
  }, [componentsLoaded, isDevice])

  const sections = [
    { component: Hero, id: 'hero' },
    { component: Features, id: 'features' },
    { component: Performance, id: 'performance' },
    { component: About, id: 'about' },
    { component: Announcements, id: 'announcements' }
  ]

  return (
      <div className={`app ${isDevice ? 'mobile' : 'desktop'}`} ref={containerRef} data-device-tier={deviceCapabilities.tier}>
        <AnimatePresence>
          {isLoading && <LoadingScreen componentsLoaded={componentsLoaded} />}
        </AnimatePresence>
        
        <ScrollProgress 
          isMobile={isDevice}
          mobileScrollProgress={mobileScrollProgress}
        />
        
        {!isDevice && deviceCapabilities.supportedFeatures.animations && (
          <MouseFollower />
        )}
        
        <Navigation currentSection={currentSection} onSectionChange={setCurrentSection} />
        {!isDevice && <ThemeSelector />}
        <ResourceHints currentSection={currentSection} />
        
        {/* 3D Background - Only render when needed */}
        <Background3D 
          deviceCapabilities={deviceCapabilities}
          mousePosition={mousePosition}
          isLoading={isLoading}
          currentSection={currentSection}
        />

        {/* Main Content */}
        <div className="main-container">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className={isDevice ? "mobile-sections" : "desktop-sections"}>
              {sections.map(({ component: Component, id }, index) => (
                <motion.section
                  key={id}
                  className={`section ${id}`}
                  id={id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                >
                  <Component 
                    mousePosition={mousePosition} 
                    isActive={currentSection === index}
                    {...(id === 'performance' && { performanceOptimizer })}
                  />
                </motion.section>
              ))}
            </div>
          </motion.div>
        </div>
      
        {/* Gradient Effect - Optimized */}
        <GradientOrb mousePosition={mousePosition} deviceCapabilities={deviceCapabilities} />
      </div>
  )
}

export default App