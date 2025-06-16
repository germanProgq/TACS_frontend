import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { announcementsService } from '../services/announcementsService'
import type { Announcement } from '../utils/database'
import { useTheme } from '../contexts/ThemeContext'

interface AnnouncementsProps {
  mousePosition: { x: number; y: number }
  isActive: boolean
}

export const Announcements = ({ mousePosition, isActive }: AnnouncementsProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)
  const headerRef = useRef(null)
  const filterRef = useRef(null)
  const gridRef = useRef(null)
  const { resolvedTheme } = useTheme()
  
  const isHeaderInView = useInView(headerRef, { once: false, amount: 0.1 })
  const isFilterInView = useInView(filterRef, { once: false, amount: 0.1 })


  // Load announcements from database
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setLoading(true)
        console.log('[ANNOUNCEMENTS] Loading announcements from database...')
        const activeAnnouncements = await announcementsService.getActiveAnnouncements()
        console.log('[ANNOUNCEMENTS] Loaded announcements:', activeAnnouncements)
        setAnnouncements(activeAnnouncements)
      } catch {
        console.error('[ANNOUNCEMENTS] Failed to load announcements')
        setAnnouncements([])
      } finally {
        setLoading(false)
      }
    }

    // Add delay to allow database to initialize, then retry if needed
    let retryCount = 0
    const maxRetries = 3
    
    const attemptLoad = async () => {
      try {
        await loadAnnouncements()
      } catch {
        if (retryCount < maxRetries) {
          retryCount++
          console.log(`[ANNOUNCEMENTS] Retry ${retryCount}/${maxRetries} in 2 seconds...`)
          setTimeout(attemptLoad, 2000)
        } else {
          console.error('[ANNOUNCEMENTS] Max retries reached, giving up')
          setLoading(false)
        }
      }
    }

    const timer = setTimeout(attemptLoad, 1000)

    return () => clearTimeout(timer)
  }, [])

  const types = [
    { key: 'all', label: 'All Announcements', icon: '📢' },
    { key: 'news', label: 'News', icon: '📰' },
    { key: 'feature', label: 'New Features', icon: '✨' },
    { key: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { key: 'alert', label: 'Alerts', icon: '🚨' }
  ]

  const filteredAnnouncements = selectedType === 'all' 
    ? announcements 
    : announcements.filter(a => a.type === selectedType)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return resolvedTheme === 'light' ? '#dc2626' : '#ff3333'
      case 'high': return resolvedTheme === 'light' ? '#ea580c' : '#ff8833'
      case 'medium': return resolvedTheme === 'light' ? '#f59e0b' : '#ffaa33'
      case 'low': return resolvedTheme === 'light' ? '#2d5a4a' : '#33aa33'
      default: return resolvedTheme === 'light' ? '#000000' : '#ffffff'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return '📰'
      case 'feature': return '✨'
      case 'maintenance': return '🔧'
      case 'alert': return '🚨'
      default: return '📢'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const incrementViewCount = async (id: string) => {
    try {
      await announcementsService.incrementViewCount(id)
    } catch (error) {
      console.error('[ANNOUNCEMENTS] Failed to increment view count:', error)
    }
  }

  return (
    <section className="announcements-section" ref={containerRef}>
      <div className="container">
        <motion.div
          className="announcements-header"
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: isHeaderInView || isActive ? 1 : 0, 
            y: isHeaderInView || isActive ? 0 : 30 
          }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">
            <span className="gradient-text">Latest Announcements</span>
            <motion.div 
              className="title-underline"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHeaderInView || isActive ? 1 : 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </h2>
          <p className="section-subtitle">
            Stay updated with the latest TACS developments, features, and important notices
          </p>
        </motion.div>

        {/* Type Filter */}
        <motion.div
          className="type-filter"
          ref={filterRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isFilterInView || isActive ? 1 : 0, 
            y: isFilterInView || isActive ? 0 : 20 
          }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {types.map((type, index) => (
            <motion.button
              key={type.key}
              className={`filter-button ${selectedType === type.key ? 'active' : ''}`}
              onClick={() => setSelectedType(type.key)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: isFilterInView || isActive ? 1 : 0, 
                x: isFilterInView || isActive ? 0 : -20 
              }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <span className="filter-icon">{type.icon}</span>
              <span className="filter-label">{type.label}</span>
              <motion.div 
                className="filter-highlight"
                initial={false}
                animate={{ opacity: selectedType === type.key ? 1 : 0 }}
              />
            </motion.button>
          ))}
        </motion.div>

        {loading ? (
          <motion.div
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="loading-spinner" />
            <p>Loading announcements...</p>
          </motion.div>
        ) : (
          <motion.div
            className="announcements-grid"
            ref={gridRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {filteredAnnouncements.length === 0 ? (
              <motion.div
                className="no-announcements"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="no-announcements-icon">📭</div>
                <h3>No announcements found</h3>
                <p>No announcements match the selected filter.</p>
              </motion.div>
            ) : (
              filteredAnnouncements.map((announcement, index) => (
                <motion.article
                  key={announcement.id}
                  className="announcement-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0 
                  }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02, 
                    rotateX: 2,
                    rotateY: mousePosition.x * 2,
                    boxShadow: "0 20px 40px rgba(0, 255, 136, 0.2)"
                  }}
                  onClick={() => incrementViewCount(announcement.id)}
                >
                  <div className="announcement-header">
                    <div className="announcement-meta">
                      <span className="announcement-type">
                        {getTypeIcon(announcement.type)} {announcement.type}
                      </span>
                      <span 
                        className="announcement-priority"
                        style={{ color: getPriorityColor(announcement.priority) }}
                      >
                        {announcement.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="announcement-date">
                      {formatDate(announcement.publishedAt)}
                    </div>
                  </div>

                  <h3 className="announcement-title">{announcement.title}</h3>
                  
                  <div className="announcement-content">
                    {announcement.content.length > 200 
                      ? `${announcement.content.substring(0, 200)}...`
                      : announcement.content
                    }
                  </div>

                  <div className="announcement-footer">
                    <div className="announcement-author">
                      by {announcement.createdBy}
                    </div>
                    <div className="announcement-tags">
                      {announcement.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                    <div className="announcement-stats">
                      👁️ {announcement.viewCount || 0}
                    </div>
                  </div>

                  <motion.div
                    className="announcement-glow"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      background: `radial-gradient(circle, ${getPriorityColor(announcement.priority)}22 0%, transparent 70%)`
                    }}
                  />
                </motion.article>
              ))
            )}
          </motion.div>
        )}
      </div>

      <style>{`
        .announcements-section {
          padding: 100px 0 80px 0;
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);
          position: relative;
          overflow: hidden;
        }

        .announcements-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 80%, var(--accent-primary) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, var(--accent-secondary) 0%, transparent 50%);
          opacity: 0.03;
          pointer-events: none;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .announcements-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .section-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          margin-bottom: 24px;
          position: relative;
          letter-spacing: -0.02em;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-underline {
          height: 4px;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          margin: 24px auto 0;
          width: 120px;
          border-radius: 2px;
        }

        .section-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
          opacity: 0.9;
        }

        .type-filter {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 56px;
          flex-wrap: wrap;
        }

        .filter-button {
          position: relative;
          padding: 10px 20px;
          border: 1px solid var(--border-color);
          background: var(--glass-bg);
          border-radius: 100px;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .filter-button:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
          background: rgba(0, 255, 136, 0.1);
          transform: translateY(-1px);
        }

        .filter-button.active {
          background: var(--accent-primary);
          color: var(--bg-primary);
          border-color: var(--accent-primary);
          font-weight: 600;
        }

        .filter-icon {
          font-size: 1rem;
        }

        .filter-highlight {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
          z-index: -1;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: var(--text-secondary);
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid var(--border-color);
          border-top: 3px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 24px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .announcements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
        }

        .announcement-card {
          position: relative;
          background: var(--glass-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 28px;
          backdrop-filter: blur(20px);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 280px;
        }

        .announcement-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-primary);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1),
                      0 4px 16px rgba(0, 255, 136, 0.2);
        }

        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .announcement-meta {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .announcement-type {
          background: rgba(0, 255, 136, 0.15);
          color: var(--accent-primary);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .announcement-priority {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .announcement-date {
          font-size: 0.875rem;
          color: var(--text-secondary);
          opacity: 0.7;
          white-space: nowrap;
        }

        .announcement-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 12px;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        .announcement-content {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 0.9375rem;
          flex-grow: 1;
          opacity: 0.85;
        }

        .announcement-footer {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 16px;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
          margin-top: auto;
        }

        .announcement-author {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .announcement-tags {
          display: flex;
          gap: 6px;
          justify-self: center;
          flex-wrap: wrap;
        }

        .tag {
          background: rgba(255, 87, 51, 0.15);
          color: var(--accent-secondary);
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .announcement-stats {
          font-size: 0.875rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
          justify-self: end;
        }

        .announcement-glow {
          position: absolute;
          inset: -50%;
          border-radius: 22px;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .announcement-card:hover .announcement-glow {
          opacity: 0.2;
        }

        .no-announcements {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          color: var(--text-secondary);
        }

        .no-announcements-icon {
          font-size: 4rem;
          margin-bottom: 24px;
          opacity: 0.5;
        }

        .no-announcements h3 {
          font-size: 1.5rem;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .no-announcements p {
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .announcements-section {
            padding: 80px 0;
          }
          
          .container {
            padding: 0 15px;
          }
          
          .section-title {
            font-size: 2.2rem;
          }
          
          .section-subtitle {
            font-size: 1rem;
            padding: 0 10px;
          }
          
          .announcements-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .announcement-card {
            padding: 20px;
            border-radius: 16px;
          }
          
          .announcement-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
            margin-bottom: 15px;
          }
          
          .announcement-meta {
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .announcement-date {
            font-size: 0.8rem;
          }
          
          .announcement-title {
            font-size: 1.2rem;
            line-height: 1.3;
          }
          
          .announcement-content {
            font-size: 0.9rem;
            margin-bottom: 15px;
          }
          
          .announcement-footer {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          
          .announcement-tags {
            order: 2;
          }
          
          .announcement-stats {
            order: 3;
            font-size: 0.8rem;
          }
          
          .filter-button {
            font-size: 0.85rem;
            padding: 8px 16px;
          }
          
          .filter-label {
            display: none;
          }
          
          .filter-icon {
            font-size: 1.2rem;
          }
        }
        
        @media (max-width: 480px) {
          .announcements-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .announcement-card {
            padding: 16px;
            border-radius: 12px;
          }
          
          .section-title {
            font-size: 1.8rem;
          }
          
          .announcement-title {
            font-size: 1.1rem;
          }
          
          .announcement-content {
            font-size: 0.85rem;
          }
          
          .type-filter {
            gap: 8px;
            justify-content: flex-start;
            overflow-x: auto;
            padding-bottom: 10px;
          }
          
          .filter-button {
            flex-shrink: 0;
            padding: 6px 12px;
          }
        }
      `}</style>
    </section>
  )
}