import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion'
import { useRef, useEffect, type ReactNode, memo, useState } from 'react'
import { usePerformanceMode } from '../utils/performanceUtils'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate'
  amount?: number
  disabled?: boolean
}

export const ScrollReveal = memo(({ 
  children, 
  delay = 0, 
  direction = 'up', 
  amount = 0.1,
  disabled = false
}: ScrollRevealProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount, once: true }) // Changed to once: true for performance

  if (disabled) return <>{children}</>

  const variants = {
    hidden: {
      opacity: 0,
      ...(direction === 'up' && { y: 30 }),
      ...(direction === 'down' && { y: -30 }),
      ...(direction === 'left' && { x: -30 }),
      ...(direction === 'right' && { x: 30 }),
      ...(direction === 'scale' && { scale: 0.9 }),
      ...(direction === 'rotate' && { rotate: -5 })
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotate: 0
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
})

ScrollReveal.displayName = 'ScrollReveal'

interface ScrollProgressProps {
  isMobile?: boolean
  mobileScrollProgress?: number
}

export const ScrollProgress = memo(({ isMobile = false, mobileScrollProgress = 0 }: ScrollProgressProps) => {
  const { scrollYProgress } = useScroll()
  const [springValue, setSpringValue] = useState(0)
  const scaleX = useSpring(springValue, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    if (isMobile) {
      setSpringValue(mobileScrollProgress)
    } else {
      const unsubscribe = scrollYProgress.on('change', setSpringValue)
      return unsubscribe
    }
  }, [isMobile, mobileScrollProgress, scrollYProgress])

  return (
    <motion.div
      className="scroll-progress"
      style={{ 
        scaleX,
        transformOrigin: '0%',
        willChange: 'transform'
      }}
    />
  )
})

ScrollProgress.displayName = 'ScrollProgress'

interface ParallaxProps {
  children: ReactNode
  offset?: number
  disabled?: boolean
}

export const Parallax = memo(({ children, offset = 50, disabled = false }: ParallaxProps) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.7, 1, 1, 0.7])

  if (disabled) return <>{children}</>

  return (
    <motion.div
      ref={ref}
      style={{ 
        y,
        opacity,
        willChange: 'transform'
      }}
    >
      {children}
    </motion.div>
  )
})

Parallax.displayName = 'Parallax'

interface StaggeredListProps {
  children: ReactNode[]
  staggerDelay?: number
  disabled?: boolean
}

export const StaggeredList = memo(({ 
  children, 
  staggerDelay = 0.05,
  disabled = false
}: StaggeredListProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  if (disabled) return <>{children}</>

  return (
    <div ref={ref}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.4,
            delay: index * staggerDelay,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
})

StaggeredList.displayName = 'StaggeredList'

// Performance-optimized scroll-triggered counter
interface CounterProps {
  from?: number
  to: number
  decimals?: number
  suffix?: string
  prefix?: string
}

export const ScrollCounter = memo(({ 
  from = 0, 
  to, 
  decimals = 0,
  suffix = '',
  prefix = ''
}: CounterProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const motionValue = useSpring(from, { 
    stiffness: 100, 
    damping: 30 
  })
  const [displayValue, setDisplayValue] = useState(from)

  useEffect(() => {
    if (isInView) {
      motionValue.set(to)
    }
  }, [isInView, to, motionValue])

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest) => {
      setDisplayValue(latest)
    })
    return unsubscribe
  }, [motionValue])

  return (
    <span ref={ref}>
      {prefix}
      <span>{displayValue.toFixed(decimals)}</span>
      {suffix}
    </span>
  )
})

ScrollCounter.displayName = 'ScrollCounter'


// Export all components
export default {
  ScrollReveal,
  ScrollProgress,
  Parallax,
  StaggeredList,
  ScrollCounter,
  usePerformanceMode
}