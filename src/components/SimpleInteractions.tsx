import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

interface InteractionState {
  isDragging: boolean
  position: { x: number; y: number }
  scale: number
  rotation: number
}

interface RippleEffect {
  id: string
  x: number
  y: number
  timestamp: number
  intensity: number
}

export const SimpleInteractions: React.FC<{
  children: React.ReactNode
  onInteraction?: (state: InteractionState) => void
  className?: string
}> = ({ children, onInteraction, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isDragging: false,
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0
  })
  const [ripples, setRipples] = useState<RippleEffect[]>([])
  
  const { resolvedTheme } = useTheme()
  const getAccentColor = () => resolvedTheme === 'light' ? '#2d5a4a' : '#00ff88'

  const createRipple = useCallback((clientX: number, clientY: number, intensity = 1) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const newRipple: RippleEffect = {
      id: Math.random().toString(36).substr(2, 9),
      x: clientX - rect.left,
      y: clientY - rect.top,
      timestamp: Date.now(),
      intensity
    }

    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 1000)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const newState = {
      ...interactionState,
      isDragging: true,
      position: { x: e.clientX, y: e.clientY }
    }
    setInteractionState(newState)
    onInteraction?.(newState)
    createRipple(e.clientX, e.clientY, 1)
  }, [interactionState, onInteraction, createRipple])

  const handlePointerUp = useCallback(() => {
    const newState = { ...interactionState, isDragging: false }
    setInteractionState(newState)
    onInteraction?.(newState)
  }, [interactionState, onInteraction])

  return (
    <motion.div
      ref={containerRef}
      className={`simple-interaction-container ${className}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: interactionState.isDragging ? 'grabbing' : 'grab'
      }}
    >
      {children}
      
      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="simple-ripple"
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: 20,
            height: 20,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 1000
          }}
          initial={{
            scale: 0,
            opacity: 0.8,
            backgroundColor: getAccentColor()
          }}
          animate={{
            scale: ripple.intensity * 10,
            opacity: 0,
            backgroundColor: 'transparent'
          }}
          transition={{
            duration: 1,
            ease: 'easeOut'
          }}
        />
      ))}
    </motion.div>
  )
}