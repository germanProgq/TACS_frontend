import { motion, useInView } from 'framer-motion'
import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { isMobile, isTablet } from 'react-device-detect'
import PerformanceOptimizer from '../utils/performanceOptimizer'
import { useTheme } from '../contexts/ThemeContext'

interface PerformanceProps {
  isActive: boolean
  performanceOptimizer?: PerformanceOptimizer
}

export const Performance = ({ isActive, performanceOptimizer }: PerformanceProps) => {
  const { resolvedTheme } = useTheme()
  const containerRef = useRef(null)
  const metricsRef = useRef(null)
  const pipelineRef = useRef(null)
  const optimizationsRef = useRef(null)
  const monitorRef = useRef(null)
  
  const isInView = useInView(containerRef, { once: false, amount: 0.1 })
  const isMetricsInView = useInView(metricsRef, { once: false, amount: 0.1 })
  const isPipelineInView = useInView(pipelineRef, { once: false, amount: 0.1 })
  const isOptimizationsInView = useInView(optimizationsRef, { once: false, amount: 0.1 })
  const isMonitorInView = useInView(monitorRef, { once: false, amount: 0.1 })
  const [animatedValues, setAnimatedValues] = useState({
    latency: 0,
    accuracy: 0,
    throughput: 0,
    uptime: 0
  })
  const [cardsLoaded, setCardsLoaded] = useState(false)
  const [animationsStarted, setAnimationsStarted] = useState(false)
  const [realTimeFPS, setRealTimeFPS] = useState(60)
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null)
  const isDevice = isMobile || isTablet

  // Debug logging
  useEffect(() => {
    console.log('Selected metric changed:', selectedMetric)
  }, [selectedMetric])
  const lastUpdateRef = useRef(Date.now())
  const rafIdRef = useRef<number | undefined>(undefined)

  const targetValues = useMemo(() => ({
    latency: 8.4,
    accuracy: 94.2,
    throughput: 1250,
    uptime: 99.97
  }), [])

  // First: Load cards when in view - faster timing
  useEffect(() => {
    if (isMetricsInView || isActive) {
      setCardsLoaded(true)
      // Start animations after cards are loaded
      const timer = setTimeout(() => {
        setAnimationsStarted(true)
      }, 400) // Reduced from 800ms to 400ms
      
      return () => clearTimeout(timer)
    }
  }, [isActive, isMetricsInView])

  // Optimized animation with reduced calculations
  useEffect(() => {
    if (!animationsStarted) return

    const startTime = Date.now()
    const duration = 1500
    const initialValues = { ...animatedValues }

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Simplified easing
      const easeOutQuad = 1 - (1 - progress) * (1 - progress)
      
      const newValues = {
        latency: initialValues.latency + (targetValues.latency - initialValues.latency) * easeOutQuad,
        accuracy: initialValues.accuracy + (targetValues.accuracy - initialValues.accuracy) * easeOutQuad,
        throughput: initialValues.throughput + (targetValues.throughput - initialValues.throughput) * easeOutQuad,
        uptime: initialValues.uptime + (targetValues.uptime - initialValues.uptime) * easeOutQuad
      }
      
      setAnimatedValues(newValues)
      
      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate)
      }
    }
    
    rafIdRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [animationsStarted, animatedValues, targetValues])

  // Reset animations when metrics section is out of view and not active
  useEffect(() => {
    if (!isActive && !isMetricsInView) {
      setCardsLoaded(false)
      setAnimationsStarted(false)
      setAnimatedValues({
        latency: 0,
        accuracy: 0,
        throughput: 0,
        uptime: 0
      })
    }
  }, [isActive, isMetricsInView])

  // Throttled FPS updates with requestAnimationFrame
  const updateFPS = useCallback(() => {
    if (!performanceOptimizer || (!isActive && !isMonitorInView)) return
    
    const now = Date.now()
    if (now - lastUpdateRef.current >= 2000) { // Update every 2 seconds
      const currentFPS = performanceOptimizer.getCurrentFPS()
      setRealTimeFPS(currentFPS)
      lastUpdateRef.current = now
    }
  }, [performanceOptimizer, isActive, isMonitorInView])

  useEffect(() => {
    if (!performanceOptimizer || (!isActive && !isMonitorInView)) {
      setRealTimeFPS(60)
      return
    }

    const animate = () => {
      updateFPS()
      rafIdRef.current = requestAnimationFrame(animate)
    }
    
    rafIdRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [updateFPS, performanceOptimizer, isActive, isMonitorInView])

  // Helper function for theme-aware colors
  const getAccentColor = useCallback(() => resolvedTheme === 'light' ? '#2d5a4a' : '#00ff88', [resolvedTheme])

  // Memoize benchmarks to prevent unnecessary recalculations
  const benchmarks = useMemo(() => [
    {
      label: 'Inference Latency',
      value: animatedValues.latency,
      unit: 'ms',
      target: '< 50ms',
      color: getAccentColor(),
      description: 'Ultra-fast neural network inference'
    },
    {
      label: 'Detection Accuracy',
      value: animatedValues.accuracy,
      unit: '%',
      target: '> 92%',
      color: resolvedTheme === 'light' ? '#2563eb' : '#0088ff',
      description: 'Multi-class object detection precision'
    },
    {
      label: 'Throughput',
      value: animatedValues.throughput,
      unit: 'FPS',
      target: '> 1000',
      color: resolvedTheme === 'light' ? '#ea580c' : '#ff6b00',
      description: 'Real-time video processing capability'
    },
    {
      label: 'System Uptime',
      value: animatedValues.uptime,
      unit: '%',
      target: '> 99.9%',
      color: resolvedTheme === 'light' ? '#dc2626' : '#ff0066',
      description: 'Mission-critical reliability'
    }
  ], [animatedValues, resolvedTheme, getAccentColor])

  const architectureComponents = [
    { name: 'TACSNet', latency: 6.3, color: getAccentColor() },
    { name: 'AccidentNet', latency: 3.3, color: resolvedTheme === 'light' ? '#dc2626' : '#ff4757' },
    { name: 'WeatherNet', latency: 3.1, color: resolvedTheme === 'light' ? '#2563eb' : '#3742fa' },
    { name: 'RL Engine', latency: 0.04, color: resolvedTheme === 'light' ? '#f59e0b' : '#ffa502' },
    { name: 'Tracking', latency: 0.01, color: resolvedTheme === 'light' ? '#ea580c' : '#ff6b00' }
  ]

  const optimizations = [
    'SIMD Vectorization (AVX2/NEON)',
    'Depthwise Separable Convolutions',
    'Memory Pool Optimization',
    'FP16/INT8 Quantization',
    'Custom ONNX Runtime',
    'Cache-Optimized Algorithms'
  ]

  return (
    <div className="performance-section" ref={containerRef}>
      <motion.div
        className="performance-header"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isInView || isActive ? 1 : 0, scale: isInView || isActive ? 1 : 0.8 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="section-title"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          Performance Metrics
        </motion.h2>
        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInView || isActive ? 1 : 0, y: isInView || isActive ? 0 : 20 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Production-ready performance exceeding all industry benchmarks
        </motion.p>
      </motion.div>

      <div className="metrics-grid" ref={metricsRef}>
        {benchmarks.map((metric, index) => (
          <div
            key={metric.label}
            className={`metric-card ${selectedMetric === index ? 'selected' : ''} ${isDevice ? 'mobile-interactive' : ''}`}
            style={{
              opacity: cardsLoaded ? 1 : 0,
              transform: `translateY(${cardsLoaded ? 0 : 50}px) rotateX(${cardsLoaded ? 0 : -90}deg)`,
              transition: `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`,
              willChange: 'transform, opacity'
            }}
            onClick={isDevice ? (e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Metric card clicked:', index, metric.label)
              setSelectedMetric(selectedMetric === index ? null : index)
            } : undefined}
            onKeyDown={isDevice ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                console.log('Metric card key pressed:', index, metric.label)
                setSelectedMetric(selectedMetric === index ? null : index)
              }
            } : undefined}
            tabIndex={isDevice ? 0 : -1}
            role={isDevice ? "button" : undefined}
            aria-label={isDevice ? `${metric.label}: ${metric.value.toFixed(metric.unit === 'ms' ? 1 : 0)}${metric.unit}. Click for details.` : undefined}
          >
            <div
              className="metric-icon"
              style={{
                opacity: cardsLoaded ? 1 : 0,
                transform: `scale3d(${cardsLoaded ? 1 : 0}, ${cardsLoaded ? 1 : 0}, 1)`,
                background: `conic-gradient(from 0deg, ${metric.color}, transparent, ${metric.color})`,
                transition: `opacity 0.4s ease ${index * 0.05 + 0.2}s, transform 0.4s ease ${index * 0.05 + 0.2}s`,
                willChange: 'transform, opacity'
              }}
            />

            <div
              className="metric-value"
              style={{ 
                color: metric.color,
                opacity: cardsLoaded ? 1 : 0,
                transform: `scale3d(${cardsLoaded ? 1 : 0.8}, ${cardsLoaded ? 1 : 0.8}, 1)`,
                textShadow: animationsStarted ? `0 0 10px ${metric.color}40` : 'none',
                transition: `opacity 0.4s ease ${index * 0.05 + 0.25}s, transform 0.4s ease ${index * 0.05 + 0.25}s`,
                willChange: 'transform, opacity'
              }}
            >
              {metric.value.toFixed(metric.unit === 'ms' ? 1 : 0)}{metric.unit}
            </div>

            <div 
              className="metric-label"
              style={{
                opacity: cardsLoaded ? 1 : 0,
                transform: `translate3d(0, ${cardsLoaded ? 0 : 5}px, 0)`,
                transition: `opacity 0.3s ease ${index * 0.05 + 0.3}s, transform 0.3s ease ${index * 0.05 + 0.3}s`
              }}
            >
              {metric.label}
            </div>
            <div 
              className="metric-target"
              style={{
                opacity: cardsLoaded ? 1 : 0,
                transform: `translate3d(0, ${cardsLoaded ? 0 : 5}px, 0)`,
                transition: `opacity 0.3s ease ${index * 0.05 + 0.35}s, transform 0.3s ease ${index * 0.05 + 0.35}s`
              }}
            >
              Target: {metric.target}
            </div>
            <div 
              className="metric-description"
              style={{
                opacity: cardsLoaded ? 1 : 0,
                transform: `translate3d(0, ${cardsLoaded ? 0 : 5}px, 0)`,
                transition: `opacity 0.3s ease ${index * 0.05 + 0.4}s, transform 0.3s ease ${index * 0.05 + 0.4}s`
              }}
            >
              {metric.description}
            </div>

            <div
              className="metric-progress"
              style={{ 
                width: animationsStarted ? `${(metric.value / targetValues[Object.keys(targetValues)[index] as keyof typeof targetValues]) * 100}%` : 0,
                opacity: cardsLoaded ? 1 : 0,
                backgroundColor: metric.color,
                transition: `width 1s ease 0.8s, opacity 0.3s ease ${index * 0.1 + 0.4}s`,
                willChange: 'width'
              }}
            />

            {/* Simplified glow effect - static only */}
            <div
              className="metric-glow-static"
              style={{
                opacity: animationsStarted ? 0.2 : 0,
                background: `radial-gradient(circle, ${metric.color}15 0%, transparent 70%)`,
                transition: `opacity 0.6s ease 1s`
              }}
            />

            {/* Detailed info panel - shows when clicked on mobile only */}
            {selectedMetric === index && isDevice && (
              <div 
                className="metric-details"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  background: `linear-gradient(135deg, ${metric.color}10, rgba(0,0,0,0.9))`,
                  border: `1px solid ${metric.color}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  marginTop: '0.5rem',
                  zIndex: 10,
                  boxShadow: `0 8px 24px ${metric.color}20`,
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <h4 style={{ 
                  color: metric.color, 
                  margin: '0 0 0.5rem 0',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  📊 Performance Analysis
                </h4>
                <p style={{ 
                  color: resolvedTheme === 'light' ? '#000000' : '#ffffff', 
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  <strong>{metric.description}</strong>
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: resolvedTheme === 'light' ? '#666666' : '#cccccc'
                }}>
                  <span>Current: <strong style={{ color: metric.color }}>{metric.value.toFixed(metric.unit === 'ms' ? 1 : 0)}{metric.unit}</strong></span>
                  <span>Target: <strong>{metric.target}</strong></span>
                </div>
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: metric.value >= (metric.unit === '%' ? 90 : metric.unit === 'ms' ? 10 : 1000) ? getAccentColor() : '#ffa502'
                }}>
                  Status: {metric.value >= (metric.unit === '%' ? 90 : metric.unit === 'ms' ? 10 : 1000) ? '✅ Optimal' : '⚠️ Good'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <motion.div
        className="architecture-breakdown"
        ref={pipelineRef}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: isPipelineInView || isActive ? 1 : 0, y: isPipelineInView || isActive ? 0 : 100 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h3 className="breakdown-title">Pipeline Architecture</h3>
        <div className="pipeline-visual">
          {architectureComponents.map((component, index) => (
            <motion.div
              key={component.name}
              className="pipeline-component"
              initial={{ x: -100, opacity: 0 }}
              animate={{ 
                x: isPipelineInView || isActive ? 0 : -100, 
                opacity: isPipelineInView || isActive ? 1 : 0 
              }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="component-bar"
                initial={{ width: 0 }}
                animate={{ width: isPipelineInView || isActive ? `${(component.latency / 10) * 100}%` : 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                style={{ backgroundColor: component.color }}
              />
              <div className="component-info">
                <span className="component-name">{component.name}</span>
                <span className="component-latency">{component.latency}ms</span>
              </div>
              {/* Simplified static pulse */}
              <div
                className="component-pulse-static"
                style={{ 
                  backgroundColor: component.color,
                  opacity: 0.6
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="optimizations-grid"
        ref={optimizationsRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isOptimizationsInView || isActive ? 1 : 0, scale: isOptimizationsInView || isActive ? 1 : 0.8 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h3 className="optimizations-title">Performance Optimizations</h3>
        <div className="optimizations-list">
          {optimizations.map((optimization, index) => (
            <motion.div
              key={optimization}
              className="optimization-item"
              initial={{ opacity: 0, x: -50 }}
              animate={{ 
                opacity: isOptimizationsInView || isActive ? 1 : 0, 
                x: isOptimizationsInView || isActive ? 0 : -50 
              }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              whileHover={{
                scale: 1.05,
                backgroundColor: resolvedTheme === 'light' ? 'rgba(45, 90, 74, 0.1)' : 'rgba(0, 255, 136, 0.1)'
              }}
            >
              <motion.div
                className="optimization-check"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: isOptimizationsInView || isActive ? 1 : 0, 
                  rotate: isOptimizationsInView || isActive ? 0 : -180 
                }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              >
                ✓
              </motion.div>
              <span>{optimization}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="real-time-monitor"
        ref={monitorRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isMonitorInView || isActive ? 1 : 0,
          scale: isMonitorInView || isActive ? 1 : 0.8
        }}
        transition={{ 
          opacity: { duration: 0.4 },
          scale: { duration: 0.4 }
        }}
      >
        <div className="monitor-screen" style={{
          background: resolvedTheme === 'light' 
            ? 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(0, 20, 40, 0.95) 0%, rgba(0, 40, 60, 0.95) 100%)',
          border: `1px solid ${resolvedTheme === 'light' ? 'rgba(45, 90, 74, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(20px)',
          boxShadow: resolvedTheme === 'light' 
            ? '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
            : '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="monitor-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(0, 255, 136, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="status-indicator active" style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getAccentColor(),
                boxShadow: `0 0 10px ${getAccentColor()}`
              }} />
              <span style={{
                color: resolvedTheme === 'light' ? '#1f2937' : '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>Real-time Performance Monitor</span>
            </div>
            <div className="fps-display" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.3)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${resolvedTheme === 'light' ? 'rgba(45, 90, 74, 0.2)' : 'rgba(0, 255, 136, 0.2)'}`
            }}>
              <span className="fps-label" style={{
                color: resolvedTheme === 'light' ? '#6b7280' : '#aaa',
                fontSize: '12px',
                fontWeight: '500'
              }}>FPS:</span>
              <span 
                className="fps-value"
                style={{
                  color: realTimeFPS >= 60 ? getAccentColor() : realTimeFPS >= 30 ? '#ffa502' : '#ff4757',
                  textShadow: `0 0 8px ${realTimeFPS >= 60 ? getAccentColor() : realTimeFPS >= 30 ? '#ffa502' : '#ff4757'}`,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}
              >
                {realTimeFPS}
              </span>
            </div>
          </div>
          
          <div className="performance-graph" style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'space-between',
            height: '60px',
            marginBottom: '20px',
            padding: '8px',
            background: resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            border: `1px solid ${resolvedTheme === 'light' ? 'rgba(45, 90, 74, 0.1)' : 'rgba(0, 255, 136, 0.1)'}`
          }}>
            {/* Reduced from 20 to 10 bars for better performance */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="graph-bar-static"
                style={{
                  width: '4px',
                  height: `${40 + Math.sin(i * 0.6) * 20}%`,
                  backgroundColor: resolvedTheme === 'light' 
                    ? `hsl(${160 + i * 8}, 50%, 45%)`
                    : `hsl(${140 + i * 8}, 70%, 55%)`,
                  borderRadius: '2px',
                  margin: '0 2px'
                }}
              />
            ))}
          </div>

          <div className="system-stats" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div className="stat" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span className="stat-label" style={{
                color: resolvedTheme === 'light' ? '#6b7280' : '#ccc',
                fontSize: '12px',
                fontWeight: '500',
                minWidth: '80px'
              }}>CPU USAGE</span>
              <div style={{
                flex: 1,
                height: '6px',
                backgroundColor: resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                margin: '0 12px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div
                  className="stat-bar"
                  style={{
                    width: isMonitorInView || isActive ? '23%' : '0%',
                    height: '100%',
                    backgroundColor: getAccentColor(),
                    borderRadius: '3px',
                    transition: 'width 2s ease',
                    boxShadow: `0 0 6px ${getAccentColor()}`
                  }}
                />
              </div>
              <span style={{
                color: getAccentColor(),
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                minWidth: '30px',
                textAlign: 'right'
              }}>23%</span>
            </div>
            <div className="stat" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span className="stat-label" style={{
                color: resolvedTheme === 'light' ? '#6b7280' : '#ccc',
                fontSize: '12px',
                fontWeight: '500',
                minWidth: '80px'
              }}>MEMORY</span>
              <div style={{
                flex: 1,
                height: '6px',
                backgroundColor: resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                margin: '0 12px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div
                  className="stat-bar"
                  style={{
                    width: isMonitorInView || isActive ? '31%' : '0%',
                    height: '100%',
                    backgroundColor: resolvedTheme === 'light' ? '#f59e0b' : '#ffa502',
                    borderRadius: '3px',
                    transition: 'width 2s ease 0.2s',
                    boxShadow: resolvedTheme === 'light' ? '0 0 6px #f59e0b' : '0 0 6px #ffa502'
                  }}
                />
              </div>
              <span style={{
                color: resolvedTheme === 'light' ? '#f59e0b' : '#ffa502',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                minWidth: '30px',
                textAlign: 'right'
              }}>31%</span>
            </div>
            <div className="stat" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span className="stat-label" style={{
                color: resolvedTheme === 'light' ? '#6b7280' : '#ccc',
                fontSize: '12px',
                fontWeight: '500',
                minWidth: '80px'
              }}>GPU LOAD</span>
              <div style={{
                flex: 1,
                height: '6px',
                backgroundColor: resolvedTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                margin: '0 12px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div
                  className="stat-bar"
                  style={{
                    width: isMonitorInView || isActive ? '67%' : '0%',
                    height: '100%',
                    backgroundColor: resolvedTheme === 'light' ? '#ea580c' : '#ff6b00',
                    borderRadius: '3px',
                    transition: 'width 2s ease 0.4s',
                    boxShadow: resolvedTheme === 'light' ? '0 0 6px #ea580c' : '0 0 6px #ff6b00'
                  }}
                />
              </div>
              <span style={{
                color: resolvedTheme === 'light' ? '#ea580c' : '#ff6b00',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                minWidth: '30px',
                textAlign: 'right'
              }}>67%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Removed performance particles - causing instability */}
    </div>
  )
}