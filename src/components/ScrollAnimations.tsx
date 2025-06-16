import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion'
import { useRef, useEffect, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { useTheme } from '../contexts/ThemeContext'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin)

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate'
  amount?: number
}

export const ScrollReveal = ({ 
  children, 
  delay = 0, 
  direction = 'up', 
  amount = 0.1 
}: ScrollRevealProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount, once: false })

  const getInitialVariant = () => {
    switch (direction) {
      case 'up': return { opacity: 0, y: 50 }
      case 'down': return { opacity: 0, y: -50 }
      case 'left': return { opacity: 0, x: -50 }
      case 'right': return { opacity: 0, x: 50 }
      case 'scale': return { opacity: 0, scale: 0.8 }
      case 'rotate': return { opacity: 0, rotate: -10 }
      default: return { opacity: 0, y: 50 }
    }
  }

  const getAnimateVariant = () => {
    switch (direction) {
      case 'up': return { opacity: 1, y: 0 }
      case 'down': return { opacity: 1, y: 0 }
      case 'left': return { opacity: 1, x: 0 }
      case 'right': return { opacity: 1, x: 0 }
      case 'scale': return { opacity: 1, scale: 1 }
      case 'rotate': return { opacity: 1, rotate: 0 }
      default: return { opacity: 1, y: 0 }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={getInitialVariant()}
      animate={isInView ? getAnimateVariant() : getInitialVariant()}
      transition={{ 
        duration: 0.8, 
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 20
      }}
    >
      {children}
    </motion.div>
  )
}

interface ParallaxScrollProps {
  children: ReactNode
  speed?: number
  direction?: 'vertical' | 'horizontal'
}

export const ParallaxScroll = ({ 
  children, 
  speed = 0.5, 
  direction = 'vertical' 
}: ParallaxScrollProps) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], direction === 'vertical' ? [0, speed * 100] : [0, 0])
  const x = useTransform(scrollYProgress, [0, 1], direction === 'horizontal' ? [0, speed * 100] : [0, 0])

  return (
    <motion.div
      ref={ref}
      style={{ y, x }}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredRevealProps {
  children: ReactNode[]
  staggerDelay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export const StaggeredReveal = ({ 
  children, 
  staggerDelay = 0.1, 
  direction = 'up' 
}: StaggeredRevealProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: 0.1, once: false })

  const getInitialVariant = () => {
    switch (direction) {
      case 'up': return { opacity: 0, y: 30 }
      case 'down': return { opacity: 0, y: -30 }
      case 'left': return { opacity: 0, x: -30 }
      case 'right': return { opacity: 0, x: 30 }
      default: return { opacity: 0, y: 30 }
    }
  }

  const getAnimateVariant = () => {
    switch (direction) {
      case 'up': return { opacity: 1, y: 0 }
      case 'down': return { opacity: 1, y: 0 }
      case 'left': return { opacity: 1, x: 0 }
      case 'right': return { opacity: 1, x: 0 }
      default: return { opacity: 1, y: 0 }
    }
  }

  return (
    <div ref={ref}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={getInitialVariant()}
          animate={isInView ? getAnimateVariant() : getInitialVariant()}
          transition={{
            duration: 0.6,
            delay: index * staggerDelay,
            ease: 'easeOut'
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

interface MagneticHoverProps {
  children: ReactNode
  strength?: number
  distance?: number
}

export const MagneticHover = ({ 
  children, 
  strength = 0.3, 
  distance = 100 
}: MagneticHoverProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(0, { stiffness: 300, damping: 30 })
  const y = useSpring(0, { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const distanceFromCenter = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    )

    if (distanceFromCenter < distance) {
      const pullStrength = (1 - distanceFromCenter / distance) * strength
      x.set((e.clientX - centerX) * pullStrength)
      y.set((e.clientY - centerY) * pullStrength)
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}

interface ScrollProgressProps {
  color?: string
  height?: number
  isMobile?: boolean
  mobileScrollProgress?: number
}

export const ScrollProgress = ({ 
  color, 
  height = 4,
  isMobile = false,
  mobileScrollProgress = 0
}: ScrollProgressProps) => {
  const { scrollYProgress } = useScroll()
  const { resolvedTheme } = useTheme()
  const getAccentColor = () => resolvedTheme === 'light' ? '#2d5a4a' : '#00ff88'
  const progressColor = color || getAccentColor()
  
  // For mobile, use smooth transition progress instead of section-based jumps
  // For desktop, use actual scroll position MotionValue directly
  const mobileSpring = useSpring(mobileScrollProgress, {
    stiffness: 150,
    damping: 25,
    restDelta: 0.001
  })
  
  const desktopSpring = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 25,
    restDelta: 0.001
  })
  
  const scaleX = isMobile ? mobileSpring : desktopSpring

  return (
    <motion.div
      className="scroll-progress"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height,
        background: progressColor,
        transformOrigin: '0%',
        scaleX,
        zIndex: 1000
      }}
    />
  )
}

interface TypewriterProps {
  text: string
  delay?: number
  speed?: number
}

export const TypewriterEffect = ({ 
  text, 
  delay = 0, 
  speed = 50 
}: TypewriterProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false })

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      {isInView && text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: delay + (index * speed) / 1000,
            duration: 0.1
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

interface FloatingElementProps {
  children: ReactNode
  speed?: number
  range?: number
}

export const FloatingElement = ({ 
  children, 
  speed = 3, 
  range = 20 
}: FloatingElementProps) => {
  return (
    <motion.div
      animate={{
        y: [0, -range, 0],
        rotate: [-1, 1, -1]
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

interface PulseEffectProps {
  children: ReactNode
  scale?: number
  duration?: number
  delay?: number
}

export const PulseEffect = ({ 
  children, 
  scale = 1.05, 
  duration = 2, 
  delay = 0 
}: PulseEffectProps) => {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay
      }}
    >
      {children}
    </motion.div>
  )
}

interface GlitchEffectProps {
  children: ReactNode
  intensity?: number
  duration?: number
}

export const GlitchEffect = ({ 
  children, 
  intensity = 5, 
  duration = 0.2 
}: GlitchEffectProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.1 })

  return (
    <motion.div
      ref={ref}
      animate={isInView ? {
        x: [0, -intensity, intensity, 0],
        filter: [
          'hue-rotate(0deg)',
          `hue-rotate(${intensity * 10}deg)`,
          `hue-rotate(-${intensity * 10}deg)`,
          'hue-rotate(0deg)'
        ]
      } : {}}
      transition={{
        duration,
        repeat: 3,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

interface ScrollSnapSectionProps {
  children: ReactNode
  id: string
}

export const ScrollSnapSection = ({ children, id }: ScrollSnapSectionProps) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.95, 0.9])

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ opacity, scale }}
      className="scroll-snap-section"
    >
      {children}
    </motion.section>
  )
}

// Enhanced GSAP-powered scroll animations
interface GSAPScrollRevealProps {
  children: ReactNode
  trigger?: string
  animation?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scale' | 'rotate' | 'morphText' | 'splitText'
  duration?: number
  delay?: number
  scrub?: boolean | number
  markers?: boolean
}

export const GSAPScrollReveal = ({ 
  children, 
  trigger,
  animation = 'fadeUp',
  duration = 1,
  delay = 0,
  scrub = false,
  markers = false
}: GSAPScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const tl = gsap.timeline()

    // Define animation types
    switch (animation) {
      case 'fadeUp':
        gsap.set(element, { y: 100, opacity: 0 })
        tl.to(element, { y: 0, opacity: 1, duration, ease: 'power3.out' })
        break
      
      case 'fadeLeft':
        gsap.set(element, { x: -100, opacity: 0 })
        tl.to(element, { x: 0, opacity: 1, duration, ease: 'power3.out' })
        break
      
      case 'fadeRight':
        gsap.set(element, { x: 100, opacity: 0 })
        tl.to(element, { x: 0, opacity: 1, duration, ease: 'power3.out' })
        break
      
      case 'scale':
        gsap.set(element, { scale: 0.5, opacity: 0 })
        tl.to(element, { scale: 1, opacity: 1, duration, ease: 'back.out(1.7)' })
        break
      
      case 'rotate':
        gsap.set(element, { rotation: -180, opacity: 0 })
        tl.to(element, { rotation: 0, opacity: 1, duration, ease: 'power2.out' })
        break
      
      case 'morphText': {
        const textElements = element.querySelectorAll('.gsap-text')
        textElements.forEach((textEl, index) => {
          tl.to(textEl, { 
            text: (textEl as HTMLElement).dataset.finalText || '', 
            duration: duration / textElements.length,
            ease: 'none'
          }, index * 0.1)
        })
        break
      }

      case 'splitText': {
        const words = element.querySelectorAll('.word')
        if (words.length > 0) {
          gsap.set(words, { y: 100, opacity: 0 })
          tl.to(words, { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            ease: 'power3.out',
            stagger: 0.1 
          })
        }
        break
      }
    }

    ScrollTrigger.create({
      trigger: trigger || element,
      start: 'top 80%',
      end: 'bottom 20%',
      animation: tl,
      scrub: scrub,
      markers: markers,
      onToggle: self => {
        if (!self.isActive && animation !== 'morphText' && animation !== 'splitText') {
          tl.reverse()
        }
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [animation, duration, delay, scrub, markers, trigger])

  return (
    <div ref={ref}>
      {children}
    </div>
  )
}

interface GSAPParallaxProps {
  children: ReactNode
  speed?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  rotate?: boolean
  scale?: boolean
}

export const GSAPParallax = ({ 
  children, 
  speed = 0.5, 
  direction = 'up',
  rotate = false,
  scale = false
}: GSAPParallaxProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    
    const getTransform = (): Record<string, number> => {
      switch (direction) {
        case 'up': return { x: 0, y: speed * -100 }
        case 'down': return { x: 0, y: speed * 100 }
        case 'left': return { x: speed * -100, y: 0 }
        case 'right': return { x: speed * 100, y: 0 }
        default: return { x: 0, y: speed * -100 }
      }
    }

    const transform: Record<string, number> = getTransform()
    if (rotate) transform.rotation = 360 * speed
    if (scale) transform.scale = 1 + speed * 0.5

    ScrollTrigger.create({
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      animation: gsap.to(element, transform)
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [speed, direction, rotate, scale])

  return (
    <div ref={ref}>
      {children}
    </div>
  )
}

interface GSAPMorphingTextProps {
  texts: string[]
  className?: string
  duration?: number
  delay?: number
}

export const GSAPMorphingText = ({ 
  texts, 
  className = '', 
  duration = 2, 
  delay = 0.5 
}: GSAPMorphingTextProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || texts.length === 0) return

    const element = ref.current
    let currentIndex = 0

    const morphText = () => {
      const nextIndex = (currentIndex + 1) % texts.length
      
      gsap.to(element, {
        duration: 0.3,
        ease: 'power2.in',
        scale: 0.8,
        opacity: 0.5,
        onComplete: () => {
          element.textContent = texts[nextIndex]
          gsap.to(element, {
            duration: 0.3,
            ease: 'power2.out',
            scale: 1,
            opacity: 1
          })
        }
      })
      
      currentIndex = nextIndex
    }

    // Initial text
    element.textContent = texts[0]
    
    // Start morphing
    const interval = setInterval(morphText, (duration + delay) * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [texts, duration, delay])

  return (
    <div ref={ref} className={className}>
      {texts[0]}
    </div>
  )
}

interface GSAPScrollTriggeredCounterProps {
  end: number
  start?: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
}

export const GSAPScrollTriggeredCounter = ({ 
  end, 
  start = 0, 
  duration = 2, 
  className = '',
  suffix = '',
  prefix = ''
}: GSAPScrollTriggeredCounterProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const counter = { value: start }

    ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(counter, {
          value: end,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            element.textContent = `${prefix}${Math.round(counter.value)}${suffix}`
          }
        })
      }
    })

    // Initial value
    element.textContent = `${prefix}${start}${suffix}`

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [start, end, duration, prefix, suffix])

  return (
    <div ref={ref} className={className}>
      {prefix}{start}{suffix}
    </div>
  )
}

