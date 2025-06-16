import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { isMobile } from 'react-device-detect'
import { useTheme, type Theme } from '../contexts/ThemeContext'

interface NavigationProps {
  currentSection: number
  onSectionChange: (section: number) => void
}

export const Navigation = ({ currentSection, onSectionChange }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  // Use CSS variables for theme colors instead of hardcoded values
  
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])
  
  const sections = [
    { name: 'Home', icon: '🏠', color: 'var(--accent-primary)', description: 'AI-Powered Home' },
    { name: 'Features', icon: '⚡', color: 'var(--accent-secondary)', description: 'Core Capabilities' },
    { name: 'Performance', icon: '📊', color: 'var(--accent-tertiary)', description: 'Speed Metrics' },
    { name: 'About', icon: '🔬', color: 'var(--accent-tertiary)', description: 'Tech Details' },
    { name: 'News', icon: '📢', color: 'var(--accent-secondary)', description: 'Latest Updates' }
  ]
  
  const themes: Array<{ value: Theme; label: string; icon: string }> = [
    { value: 'auto', label: 'Auto', icon: '🌗' },
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' }
  ]

  const handleScrollToSection = (index: number) => {
    onSectionChange(index)
    const sectionId = ['hero', 'features', 'performance', 'about', 'announcements'][index]
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }
  
  // Render hamburger menu button
  const menuBar = (
    <motion.div
      className={`nav-menu-bar ${isMobile ? 'mobile-portal' : ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      style={{
        position: 'fixed',
        top: isMobile ? '20px' : '20px',
        left: isMobile ? 'auto' : '20px',
        right: isMobile ? '20px' : 'auto',
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 16px',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '25px',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        boxShadow: '0 4px 20px var(--shadow-color)'
      }}
      onClick={() => setIsOpen(!isOpen)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isMobile ? (
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            width: '20px'
          }}
        >
          <motion.span 
            animate={{ 
              rotate: isOpen ? 45 : 0,
              y: isOpen ? 8 : 0
            }}
            style={{
              height: '2px',
              background: 'var(--accent-primary)',
              borderRadius: '1px',
              transformOrigin: 'center'
            }}
          />
          <motion.span 
            animate={{ 
              opacity: isOpen ? 0 : 1,
              scaleX: isOpen ? 0 : 1
            }}
            style={{
              height: '2px',
              background: 'var(--accent-primary)',
              borderRadius: '1px'
            }}
          />
          <motion.span 
            animate={{ 
              rotate: isOpen ? -45 : 0,
              y: isOpen ? -8 : 0
            }}
            style={{
              height: '2px',
              background: 'var(--accent-primary)',
              borderRadius: '1px',
              transformOrigin: 'center'
            }}
          />
        </motion.div>
      ) : (
        <>
          <motion.div
            animate={{ rotate: isOpen ? 0 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: '16px', transform: 'scaleX(1)' }}
          >
            🧠
          </motion.div>
          <span style={{ 
            fontSize: '12px', 
            color: 'var(--text-accent)',
            fontWeight: 'bold'
          }}>
            TACS
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: '12px', color: 'var(--text-primary)' }}
          >
            ▼
          </motion.div>
        </>
      )}
    </motion.div>
  )
  
  // Mobile navigation content
  const mobileNavContent = (
    <>
      {/* Close button */}
      <motion.button
        className="nav-close"
        onClick={() => setIsOpen(false)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '28px',
          cursor: 'pointer',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          transition: 'all 0.3s ease',
          zIndex: 2147483647
        }}
        whileHover={{ backgroundColor: 'var(--glass-bg)' }}
        whileTap={{ scale: 0.9 }}
      >
        ✕
      </motion.button>
      
      {/* Mobile Menu Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px',
        paddingTop: '80px',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'auto'
      }}>
        {/* Mobile Menu Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          marginTop: '60px',
          flexShrink: 0
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'var(--text-accent)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            🧠 TACS
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            margin: '10px 0 0 0'
          }}>
            Traffic AI Control System
          </p>
        </div>
        
        {/* Navigation items */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '500px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          {sections.map((section, index) => (
            <motion.button
              key={section.name}
              className={`nav-item ${currentSection === index ? 'active' : ''}`}
              onClick={() => {
                handleScrollToSection(index)
                setIsOpen(false)
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                backgroundColor: `${section.color}20`,
                borderColor: `${section.color}50`
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px 24px',
                margin: '3px 0',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                color: currentSection === index ? section.color : 'var(--text-primary)',
                transition: 'all 0.3s ease',
                fontSize: '16px',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              <motion.span
                className="nav-icon"
                animate={{
                  scale: currentSection === index ? 1.1 : 1
                }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: '24px' }}
              >
                {section.icon}
              </motion.span>
              
              <div style={{ flex: 1 }}>
                <div className="nav-label" style={{ 
                  fontSize: '18px', 
                  fontWeight: currentSection === index ? 'bold' : 'normal',
                  color: 'inherit'
                }}>
                  {section.name}
                </div>
                <div 
                  className="nav-description"
                  style={{ 
                    fontSize: '14px', 
                    opacity: 0.7,
                    color: currentSection === index ? section.color : 'var(--text-secondary)'
                  }}
                >
                  {section.description}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
        
        {/* Theme Selector for Mobile */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            Theme
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center'
          }}>
            {themes.map((themeOption) => (
              <motion.button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value)
                }}
                className="theme-option-mobile"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: theme === themeOption.value ? 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' : 'var(--glass-bg)',
                  border: theme === themeOption.value ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  color: theme === themeOption.value ? 'var(--accent-primary)' : 'var(--text-primary)'
                }}
              >
                <span style={{ fontSize: '24px' }}>{themeOption.icon}</span>
                <span style={{ 
                  fontSize: '14px',
                  fontWeight: theme === themeOption.value ? 'bold' : 'normal'
                }}>
                  {themeOption.label}
                </span>
              </motion.button>
            ))}
          </div>
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            Current: {resolvedTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </div>
        </div>
      </div>
    </>
  )
  
  // Desktop navigation content
  const desktopNavContent = (
    <motion.div
      className="nav-container"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '20px',
        paddingLeft: '25px',
        backdropFilter: 'blur(20px)',
        minWidth: '280px',
        overflow: 'visible'
      }}
    >
      <div className="nav-sections">
        {sections.map((section, index) => (
          <motion.button
            key={section.name}
            className={`nav-item ${currentSection === index ? 'active' : ''}`}
            onClick={() => {
              handleScrollToSection(index)
              setIsOpen(false)
            }}
            whileHover={{ 
              x: 5,
              backgroundColor: `${section.color}15`
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 15px',
              margin: '3px 0',
              background: 'transparent',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              color: currentSection === index ? section.color : 'var(--text-primary)',
              transition: 'all 0.3s ease'
            }}
          >
            {currentSection === index && (
              <motion.div
                className="nav-indicator"
                layoutId="nav-indicator"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  position: 'absolute',
                  left: '-3px',
                  top: '20%',
                  bottom: '20%',
                  width: '4px',
                  backgroundColor: section.color,
                  borderRadius: '2px',
                  boxShadow: `0 0 10px ${section.color}80`
                }}
              />
            )}
            
            <motion.span
              className="nav-icon"
              animate={{
                scale: currentSection === index ? 1.1 : 1
              }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: '16px' }}
            >
              {section.icon}
            </motion.span>
            
            <div style={{ flex: 1 }}>
              <div className="nav-label" style={{ 
                fontSize: '14px', 
                fontWeight: currentSection === index ? 'bold' : 'normal'
              }}>
                {section.name}
              </div>
              <div 
                className="nav-description"
                style={{ 
                  fontSize: '10px', 
                  opacity: 0.7,
                  color: currentSection === index ? section.color : 'var(--text-secondary)'
                }}
              >
                {section.description}
              </div>
            </div>
            
            {currentSection === index && (
              <motion.div
                className="nav-pulse"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: section.color,
                  boxShadow: `0 0 8px ${section.color}`
                }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )

  return (
    <>
      {/* Render menu bar through portal on mobile to escape scroll container */}
      {isMobile && typeof document !== 'undefined' ? 
        createPortal(menuBar, document.body) : 
        menuBar
      }

      {/* Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile navigation with backdrop */}
            {isMobile && typeof document !== 'undefined' ? (
              <>
                {createPortal(
                  <motion.div
                    className="nav-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsOpen(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'var(--shadow-color)',
                      zIndex: 2147483645
                    }}
                  />, 
                  document.body
                )}
                {createPortal(
                  <motion.nav
                    className="navigation mobile-portal-nav"
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 2147483646,
                      background: 'var(--bg-primary)',
                      pointerEvents: 'auto',
                      overflow: 'visible',
                      display: 'flex',
                      flexDirection: 'column',
                      isolation: 'isolate'
                    }}
                  >
                    {mobileNavContent}
                  </motion.nav>,
                  document.body
                )}
              </>
            ) : (
              // Desktop Navigation
              <motion.nav
                className="navigation"
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  top: '80px',
                  left: '20px',
                  zIndex: 999
                }}
              >
                {desktopNavContent}
              </motion.nav>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  )
}