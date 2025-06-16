import { motion } from 'framer-motion'
import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface HeroProps {
  mousePosition: { x: number; y: number }
  isActive: boolean
}

export const Hero = memo(({ mousePosition, isActive }: HeroProps) => {
  const [typedText, setTypedText] = useState('')
  const fullText = 'Revolutionary AI-Powered Traffic Management'
  
  const { resolvedTheme } = useTheme()
  const getAccentColor = useCallback(() => resolvedTheme === 'light' ? '#2d5a4a' : '#00ff88', [resolvedTheme])

  useEffect(() => {
    if (!isActive) return
    
    let index = 0
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [isActive])

  const stats = useMemo(() => [
    { value: '94.2%', label: 'Detection Accuracy', color: 'var(--text-primary)' },
    { value: '6.3ms', label: 'Inference Time', color: '#0088ff' },
    { value: '99.97%', label: 'System Uptime', color: '#ff6b00' },
    { value: '10K/s', label: 'Object Throughput', color: '#ff0066' }
  ], [])

  const handleScrollToAbout = useCallback(() => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleOpenGithub = useCallback(() => {
    window.open('https://github.com/germanProgq', '_blank')
  }, [])


  return (
    <div className="hero-section">
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <motion.div
          className="hero-badge"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
        >
          <motion.span
            style={{ display: 'inline-block' }}
          >
            Neural Intelligence Systems
          </motion.span>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span className="gradient-text">TACS</span>
          <br />
          <span className="hero-subtitle">
            {typedText}
            <motion.span
              className="cursor"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              |
            </motion.span>
          </span>
        </motion.h1>

        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Experience the future of intelligent traffic control with our cutting-edge 
          C++ AI system. Real-time detection, accident prevention, and autonomous 
          optimization—all running at millisecond speeds.
        </motion.p>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="stat-item"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 1.2 + index * 0.1, 
                duration: 0.6,
                type: 'spring'
              }}
              whileHover={{ 
                scale: 1.1,
                y: -10,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div
                className="stat-value"
                style={{ color: stat.color }}
                animate={{
                  textShadow: [
                    `0 0 10px ${stat.color}40`,
                    `0 0 30px ${stat.color}80`,
                    `0 0 10px ${stat.color}40`
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {stat.value}
              </motion.div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <motion.button
            className="cta-button primary"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
              background: resolvedTheme === 'light' 
                ? 'linear-gradient(45deg, #2d5a4a, #2563eb, #ea580c)'
                : 'linear-gradient(45deg, #00ff88, #0088ff, #ff6b00)',
              backgroundSize: '200% 200%'
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              backgroundPosition: { duration: 3, repeat: Infinity }
            }}
            onClick={handleScrollToAbout}
          >
            <span>🔬 Learn More</span>
            <motion.div
              className="button-ripple"
              initial={{ scale: 0, opacity: 1 }}
              whileHover={{ scale: 1, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                background: 'rgba(255, 255, 255, 0.1)',
                pointerEvents: 'none'
              }}
            />
          </motion.button>
          
          <motion.button
            className="cta-button secondary"
            whileHover={{ 
              scale: 1.05,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: getAccentColor(),
              color: getAccentColor()
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenGithub}
          >
            <span>📚 GitHub Repository</span>
          </motion.button>
          
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-visual"
        animate={{
          rotateY: mousePosition.x * 10,
          rotateX: -mousePosition.y * 10,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <motion.div
          className="ai-brain"
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          <div className="brain-core" />
          <div className="neural-pathways">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className={`pathway pathway-${i}`}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 2 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="data-streams"
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`data-stream stream-${i}`}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      <div className="hero-particles">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
    </div>
  )
})

Hero.displayName = 'Hero'