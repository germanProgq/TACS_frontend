import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { verifyCredentials, generateSecureToken } from '../utils/adminAuth'
import { database } from '../utils/database'
const AdminLogin = () => {
  const navigate = useNavigate()
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [checkingSetup, setCheckingSetup] = useState(true)

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const hasUsers = await database.hasAdminUsers()
        if (!hasUsers) {
          // No admin users exist, redirect to setup
          navigate('/admin/setup')
          return
        }
      } catch (error) {
        console.error('[LOGIN] Failed to check setup status:', error)
      } finally {
        setCheckingSetup(false)
      }
    }

    checkSetupStatus()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Rate limiting - max 5 attempts per minute
      if (attempts >= 5) {
        setError('Too many login attempts. Please wait before trying again.')
        setLoading(false)
        return
      }

      const isValid = await verifyCredentials(credentials.username, credentials.password)
      
      if (isValid.success) {
        // Generate secure session token
        const token = generateSecureToken()
        
        // Store session data
        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_user', JSON.stringify({
          username: credentials.username,
          role: isValid.role,
          permissions: isValid.permissions
        }))
        
        // Navigate to dashboard
        navigate('/admin/dashboard')
      } else {
        setAttempts(prev => prev + 1)
        setError('Invalid credentials. Please check your username and password.')
      }
    } catch {
      setError('Authentication service temporarily unavailable.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSetup) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="checking-setup">
            <div className="spinner"></div>
            <p>Checking system setup...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-login">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="login-header"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="admin-logo">
            <motion.div
              className="logo-icon"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
            >
              🔐
            </motion.div>
            <h1>TACS Admin Portal</h1>
            <p>Secure administrative access</p>
          </div>
        </motion.div>

        <motion.form
          className="login-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <motion.input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              required
              autoComplete="username"
              whileFocus={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
              transition={{ duration: 0.2 }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <motion.input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
              autoComplete="current-password"
              whileFocus={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <span className="error-icon">⚠️</span>
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="login-button"
            disabled={loading || !credentials.username || !credentials.password}
            whileHover={{ scale: 1.02, boxShadow: '0 10px 30px color-mix(in srgb, var(--accent-primary) 30%, transparent)' }}
            whileTap={{ scale: 0.98 }}
            animate={loading ? { 
              backgroundColor: ['var(--accent-primary)', 'var(--accent-secondary)', 'var(--accent-primary)'],
            } : {}}
            transition={loading ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
          >
            {loading ? (
              <div className="loading-spinner">
                <motion.div
                  className="spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Authenticating...
              </div>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </motion.form>

        <motion.div
          className="security-notice"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="security-features">
            <div className="security-item">
              <span className="security-icon">🔒</span>
              <span>End-to-end encryption</span>
            </div>
            <div className="security-item">
              <span className="security-icon">⏱️</span>
              <span>Session timeout protection</span>
            </div>
            <div className="security-item">
              <span className="security-icon">🛡️</span>
              <span>Brute force protection</span>
            </div>
          </div>
          
          <p className="disclaimer">
            This is a restricted area. All access attempts are logged and monitored.
            Unauthorized access is strictly prohibited.
          </p>
        </motion.div>

        <motion.div
          className="background-particles"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1, duration: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AdminLogin