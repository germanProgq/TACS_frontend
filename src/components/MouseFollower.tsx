import { motion } from 'framer-motion'
import { useState, useEffect, useCallback, memo } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export const MouseFollower = memo(() => {
  const [realMousePos, setRealMousePos] = useState({ x: 0, y: 0 })
  const { resolvedTheme } = useTheme()
  const getAccentColor = useCallback(() => resolvedTheme === 'light' ? '#2d5a4a' : '#00ff88', [resolvedTheme])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setRealMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <motion.div
      className="mouse-follower-simple"
      animate={{
        x: realMousePos.x - 12,
        y: realMousePos.y - 12,
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{
        position: 'fixed',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: `2px solid ${getAccentColor()}99`,
        pointerEvents: 'none',
        zIndex: 50,
        mixBlendMode: 'screen'
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${getAccentColor()}33 0%, transparent 70%)`
        }}
      />
    </motion.div>
  )
})

MouseFollower.displayName = 'MouseFollower'