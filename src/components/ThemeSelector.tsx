import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTheme, type Theme } from '../contexts/ThemeContext'

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes: Array<{ value: Theme; label: string; icon: string; description: string }> = [
    { value: 'auto', label: 'Auto', icon: '🌗', description: 'Follows system preference' },
    { value: 'light', label: 'Light', icon: '☀️', description: 'Light mode for day use' },
    { value: 'dark', label: 'Dark', icon: '🌙', description: 'Dark mode for night use' }
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]

  return (
    <div className="theme-selector">
      <motion.button
        className={`theme-trigger ${resolvedTheme}`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          backgroundColor: resolvedTheme === 'dark' ? 'rgba(0, 17, 34, 0.8)' : 'rgba(248, 249, 250, 0.8)',
          color: resolvedTheme === 'dark' ? '#00ff88' : '#2d5a4a'
        }}
      >
        <motion.span
          className="theme-icon"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentTheme.icon}
        </motion.span>
        <span className="theme-label">{currentTheme.label}</span>
        <motion.span
          className="dropdown-arrow"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="theme-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <motion.div
              className="theme-dropdown"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {themes.map((themeOption, index) => (
                <motion.button
                  key={themeOption.value}
                  className={`theme-option ${theme === themeOption.value ? 'active' : ''}`}
                  onClick={() => {
                    setTheme(themeOption.value)
                    setIsOpen(false)
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  whileHover={{ 
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    x: 5
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="option-icon">{themeOption.icon}</span>
                  <div className="option-content">
                    <span className="option-label">{themeOption.label}</span>
                    <span className="option-description">{themeOption.description}</span>
                  </div>
                  {theme === themeOption.value && (
                    <motion.div
                      className="check-mark"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.button>
              ))}

              {/* Theme Preview */}
              <motion.div
                className="theme-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="preview-header">
                  <span>Current Theme</span>
                  <div className={`theme-indicator ${resolvedTheme}`}>
                    {resolvedTheme === 'dark' ? '🌙' : '☀️'}
                  </div>
                </div>
                <div className="preview-colors">
                  <div className="color-swatch primary" />
                  <div className="color-swatch secondary" />
                  <div className="color-swatch accent" />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .theme-selector {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 1000;
        }

        .theme-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 1px solid var(--border-color);
          border-radius: 25px;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          color: var(--text-accent);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .theme-trigger:hover {
          border-color: var(--accent-primary);
          box-shadow: 0 5px 20px rgba(0, 255, 136, 0.2);
        }

        .theme-icon {
          font-size: 16px;
        }

        .dropdown-arrow {
          font-size: 10px;
          opacity: 0.7;
        }

        .theme-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.2);
          z-index: 999;
        }

        .theme-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          width: 280px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: 15px;
          padding: 12px;
          box-shadow: 0 20px 60px var(--shadow-color);
          z-index: 1001;
        }

        .theme-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: var(--text-primary);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }

        .theme-option.active {
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
        }

        .option-icon {
          font-size: 20px;
        }

        .option-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .option-label {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }

        .option-description {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .check-mark {
          color: var(--accent-primary);
          font-weight: bold;
          font-size: 16px;
        }

        .theme-preview {
          margin-top: 12px;
          padding: 12px;
          border-top: 1px solid var(--border-color);
        }

        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .theme-indicator {
          font-size: 16px;
        }

        .preview-colors {
          display: flex;
          gap: 6px;
        }

        .color-swatch {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--border-color);
        }

        .color-swatch.primary {
          background: var(--accent-primary);
        }

        .color-swatch.secondary {
          background: var(--accent-secondary);
        }

        .color-swatch.accent {
          background: var(--accent-tertiary);
        }

        @media (max-width: 768px) {
          .theme-selector {
            top: 60px;
            right: 10px;
          }

          .theme-dropdown {
            width: 260px;
          }

          .theme-trigger {
            padding: 8px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}