import { motion } from 'framer-motion'
import { useState, useCallback, useMemo, memo } from 'react'
import { isMobile, isTablet } from 'react-device-detect'
import { useTheme } from '../contexts/ThemeContext'

interface FeaturesProps {
  mousePosition: { x: number; y: number }
}

export const Features = memo(({ mousePosition }: FeaturesProps) => {
  const [activeFeature, setActiveFeature] = useState(0)
  const isDevice = isMobile || isTablet
  const { resolvedTheme } = useTheme()
  const getAccentColor = useCallback(() => resolvedTheme === 'light' ? '#2d5a4a' : '#00ff88', [resolvedTheme])

  const handleFeatureInteraction = useCallback((index: number) => {
    if (isDevice) {
      // On mobile/tablet, toggle the active feature
      setActiveFeature(prev => prev === index ? -1 : index)
    } else {
      // On desktop, just set active
      setActiveFeature(index)
    }
  }, [isDevice])

  const features = useMemo(() => [
    {
      id: 'detection',
      title: 'Multi-Class Detection',
      description: 'Advanced computer vision with 92%+ accuracy for vehicles, pedestrians, and cyclists.',
      icon: '🚗',
      color: getAccentColor(),
      details: [
        'YOLOv3-lite architecture',
        'Real-time object tracking',
        'Hungarian algorithm optimization',
        'Kalman filter prediction'
      ]
    },
    {
      id: 'accident',
      title: 'Accident Prevention',
      description: 'AI-powered accident classification and emergency response with 88% accuracy.',
      icon: '🚨',
      color: resolvedTheme === 'light' ? '#dc2626' : '#ff4757',
      details: [
        'Real-time collision detection',
        '4-class accident types',
        'Emergency override system',
        'Automatic alert dispatch'
      ]
    },
    {
      id: 'weather',
      title: 'Weather Adaptation',
      description: 'Smart weather classification system adapting traffic flow to conditions.',
      icon: '🌦️',
      color: resolvedTheme === 'light' ? '#2563eb' : '#3742fa',
      details: [
        '85% weather accuracy',
        'Dynamic signal timing',
        'Visibility optimization',
        'Condition-based routing'
      ]
    },
    {
      id: 'reinforcement',
      title: 'RL Optimization',
      description: 'Reinforcement learning engine optimizing traffic flow in real-time.',
      icon: '🧠',
      color: resolvedTheme === 'light' ? '#f59e0b' : '#ffa502',
      details: [
        'A2C neural networks',
        'Multi-agent coordination',
        'Experience replay',
        'Continuous learning'
      ]
    },
    {
      id: 'edge',
      title: 'Edge Deployment',
      description: 'Ultra-fast ONNX runtime optimized for edge devices and embedded systems.',
      icon: '⚡',
      color: resolvedTheme === 'light' ? '#ea580c' : '#ff6b00',
      details: [
        'ONNX export system',
        'Hardware acceleration',
        'TensorRT optimization',
        '<1ms inference time'
      ]
    },
    {
      id: 'federated',
      title: 'Federated Learning',
      description: 'Distributed learning system with V2X protocol integration.',
      icon: '🌐',
      color: resolvedTheme === 'light' ? '#dc2626' : '#ff0066',
      details: [
        'Multi-intersection sync',
        'Knowledge distillation',
        'Catastrophic forgetting prevention',
        'V2X communication'
      ]
    }
  ], [resolvedTheme, getAccentColor])

  return (
    <div className="features-section">
      <motion.div
        className="features-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="section-title"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          Advanced AI Features
        </motion.h2>
        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Cutting-edge technology stack powering the future of traffic management
        </motion.p>
      </motion.div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            className={`feature-card ${activeFeature === index ? 'active' : ''}`}
            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.6,
              type: 'spring'
            }}
            onHoverStart={() => !isDevice && setActiveFeature(index)}
            onClick={() => handleFeatureInteraction(index)}
            onTap={() => handleFeatureInteraction(index)}
            onTapStart={() => isDevice && setActiveFeature(index)}
            whileHover={!isDevice ? {
              scale: 1.05,
              rotateY: 5,
              z: 50
            } : {}}
            whileTap={{
              scale: 0.95
            }}
            style={{
              transformStyle: 'preserve-3d',
              cursor: isDevice ? 'pointer' : 'default'
            }}
          >
            <motion.div
              className="feature-icon-container"
              style={{ position: 'relative', display: 'inline-block' }}
            >
              <motion.div
                className="feature-icon"
                animate={{
                  scale: activeFeature === index ? 1.1 : 1,
                  y: activeFeature === index ? -5 : 0
                }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
                style={{
                  filter: `drop-shadow(0 0 20px ${feature.color})`,
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {feature.icon}
              </motion.div>
              
              {/* Ripple Effects */}
              {activeFeature === index && (
                <>
                  <motion.div
                    className="ripple-1"
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '40px',
                      height: '40px',
                      border: `2px solid ${feature.color}`,
                      borderRadius: '50%',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                  <motion.div
                    className="ripple-2"
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '40px',
                      height: '40px',
                      border: `1px solid ${feature.color}`,
                      borderRadius: '50%',
                      pointerEvents: 'none',
                      zIndex: 1
                    }}
                  />
                  <motion.div
                    className="ripple-3"
                    initial={{ scale: 0, opacity: 0.4 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '40px',
                      height: '40px',
                      background: `radial-gradient(circle, ${feature.color}20, transparent)`,
                      borderRadius: '50%',
                      pointerEvents: 'none',
                      zIndex: 0
                    }}
                  />
                </>
              )}
            </motion.div>

            <motion.h3
              className="feature-title"
              style={{ color: feature.color }}
              animate={{
                textShadow: activeFeature === index 
                  ? `0 0 20px ${feature.color}80`  
                  : `0 0 0px ${feature.color}00`
              }}
            >
              {feature.title}
            </motion.h3>

            <motion.p
              className="feature-description"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: activeFeature === index ? 1 : 0.8 }}
            >
              {feature.description}
            </motion.p>

            <motion.div
              className="feature-details"
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: activeFeature === index ? 'auto' : 0,
                opacity: activeFeature === index ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <ul>
                {feature.details.map((detail, i) => (
                  <motion.li
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{
                      x: activeFeature === index ? 0 : -20,
                      opacity: activeFeature === index ? 1 : 0
                    }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                  >
                    {detail}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="feature-glow"
              animate={{
                opacity: activeFeature === index ? 0.3 : 0,
                scale: activeFeature === index ? 1 : 0.8
              }}
              style={{
                background: `radial-gradient(circle, ${feature.color}40 0%, transparent 70%)`
              }}
            />

            <motion.div
              className="neural-connections"
              animate={{
                opacity: activeFeature === index ? 0.6 : 0
              }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`connection connection-${i}`}
                  animate={{
                    pathLength: activeFeature === index ? [0, 1, 0] : 0,
                    opacity: activeFeature === index ? [0, 1, 0] : 0
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  style={{
                    background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)`
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="features-interactive"
        animate={{
          rotateX: mousePosition.y * 5,
          rotateY: mousePosition.x * 5
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >

        <motion.div
          className="performance-rings"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className={`perf-ring ring-${i}`}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      <div className="matrix-rain">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="matrix-column"
            style={{ left: `${i * 12.5}%` }}
            animate={{
              y: ['-100vh', '100vh']
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            {Math.random().toString(36).substr(2, 10).split('').map((char, j) => (
              <motion.span
                key={j}
                className="matrix-char"
                animate={{
                  opacity: [0, 1, 0],
                  color: [
                    getAccentColor(),
                    '#ffffff',
                    getAccentColor()
                  ]
                }}
                transition={{
                  duration: 0.5,
                  delay: j * 0.1,
                  repeat: Infinity
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
})

Features.displayName = 'Features'