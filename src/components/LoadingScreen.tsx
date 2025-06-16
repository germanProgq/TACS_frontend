import { motion } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'

interface LoadingScreenProps {
  componentsLoaded?: boolean
}

export const LoadingScreen = ({ componentsLoaded = false }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0)
  const [currentTask, setCurrentTask] = useState('Initializing Neural Networks')

  const tasks = useMemo(() => [
    'Initializing Neural Networks',
    'Loading TACSNet Architecture', 
    'Preloading Components',
    'Calibrating AI Models',
    'Optimizing Performance',
    'Ready for Launch'
  ], [])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        // Faster progress when components are loaded
        const increment = componentsLoaded ? Math.random() * 25 : Math.random() * 10
        const newProgress = Math.min(prev + increment, componentsLoaded ? 100 : 75)
        const taskIndex = Math.floor((newProgress / 100) * tasks.length)
        setCurrentTask(tasks[Math.min(taskIndex, tasks.length - 1)])
        return newProgress
      })
    }, componentsLoaded ? 100 : 200)

    return () => clearInterval(interval)
  }, [componentsLoaded, tasks])

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-container">
        <motion.div
          className="logo-container"
          initial={{ scale: 0.8, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div className="ai-logo">
            <motion.div
              className="neural-core"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
            />
            <div className="neural-rings">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`neural-ring ring-${i}`}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              ))}
            </div>
          </div>
          <motion.h1
            className="loading-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            TACS AI
          </motion.h1>
          <motion.p
            className="loading-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Traffic-Aware Control System
          </motion.p>
        </motion.div>

        <div className="progress-section">
          <motion.div
            className="progress-bar-container"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
              <div className="progress-glow" />
            </div>
          </motion.div>

          <motion.div
            className="loading-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="loading-percentage">{Math.round(progress)}%</div>
            <motion.div
              className="loading-task"
              key={currentTask}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentTask}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="neural-network-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="neural-node"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}