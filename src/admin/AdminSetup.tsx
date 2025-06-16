import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { database } from '../utils/database'
import { useTheme } from '../contexts/ThemeContext'

const AdminSetup = () => {
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  // Use CSS variables for consistent theming
  const getAccentColor = () => 'var(--accent-primary)'
  const getPrimaryBlue = () => 'var(--accent-secondary)'
  const getOrangeColor = () => resolvedTheme === 'light' ? '#ea580c' : '#ff6b00'
  const getPinkColor = () => resolvedTheme === 'light' ? '#dc2626' : '#ff0066'
  const getWarningColor = () => resolvedTheme === 'light' ? '#d97706' : '#ffa500'
  const [setupData, setSetupData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 12) errors.push('Password must be at least 12 characters long')
    if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letters')
    if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letters')
    if (!/[0-9]/.test(password)) errors.push('Password must contain numbers')
    if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special characters (!@#$%^&*)')
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate passwords match
      if (setupData.password !== setupData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Validate password strength
      const passwordErrors = validatePassword(setupData.password)
      if (passwordErrors.length > 0) {
        throw new Error(`Password validation failed: ${passwordErrors.join(', ')}`)
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(setupData.email)) {
        throw new Error('Please enter a valid email address')
      }

      // Check if admin users already exist
      const hasUsers = await database.hasAdminUsers()
      if (hasUsers) {
        throw new Error('Admin users already exist. Please use the login page.')
      }

      // Create first admin user
      await database.initializeFirstAdmin({
        username: setupData.username,
        password: setupData.password,
        email: setupData.email
      })

      console.log('[SETUP] First admin user created successfully')
      setStep(3) // Success step

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin')
      }, 3000)

    } catch (error: unknown) {
      console.error('[SETUP] Failed to create admin user:', error)
      setError(error instanceof Error ? error.message : 'Failed to create admin user')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setSetupData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  if (step === 3) {
    return (
      <div className="admin-setup">
        <div className="setup-container">
          <motion.div
            className="success-message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="success-icon">✅</div>
            <h2>Setup Complete!</h2>
            <p>Your admin account has been created successfully.</p>
            <p>Redirecting to login page...</p>
            
            <div className="setup-summary">
              <h3>Account Details:</h3>
              <div className="detail-item">
                <strong>Username:</strong> {setupData.username}
              </div>
              <div className="detail-item">
                <strong>Email:</strong> {setupData.email}
              </div>
              <div className="detail-item">
                <strong>Role:</strong> Super Administrator
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-setup">
      <div className="setup-container">
        <motion.div
          className="setup-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="setup-logo">
            <div className="logo-icon">🛡️</div>
            <h1>TACS Admin Setup</h1>
            <p>Initialize your admin account</p>
          </div>

          <div className="security-notice">
            <h3>⚠️ First-Time Setup</h3>
            <p>This is a one-time setup process to create your first admin account. 
               Once completed, this setup will be disabled for security.</p>
          </div>
        </motion.div>

        <motion.form
          className="setup-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h2>Create Admin Account</h2>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={setupData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              title="Username can only contain letters, numbers, and underscores"
              placeholder="Enter admin username"
            />
            <div className="field-hint">3-30 characters, letters, numbers, and underscores only</div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={setupData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              placeholder="admin@yourdomain.com"
            />
            <div className="field-hint">Used for account recovery and notifications</div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={setupData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              minLength={12}
              placeholder="Enter secure password"
            />
            <div className="password-requirements">
              <div className="req-title">Password Requirements:</div>
              <div className={`req-item ${setupData.password.length >= 12 ? 'valid' : ''}`}>
                ✓ At least 12 characters
              </div>
              <div className={`req-item ${/[A-Z]/.test(setupData.password) ? 'valid' : ''}`}>
                ✓ Uppercase letters
              </div>
              <div className={`req-item ${/[a-z]/.test(setupData.password) ? 'valid' : ''}`}>
                ✓ Lowercase letters
              </div>
              <div className={`req-item ${/[0-9]/.test(setupData.password) ? 'valid' : ''}`}>
                ✓ Numbers
              </div>
              <div className={`req-item ${/[!@#$%^&*]/.test(setupData.password) ? 'valid' : ''}`}>
                ✓ Special characters (!@#$%^&*)
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={setupData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              placeholder="Confirm your password"
            />
            {setupData.confirmPassword && (
              <div className={`password-match ${setupData.password === setupData.confirmPassword ? 'valid' : 'invalid'}`}>
                {setupData.password === setupData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="setup-button"
            disabled={loading || setupData.password !== setupData.confirmPassword}
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                Creating Account...
              </div>
            ) : (
              <>
                <span className="button-icon">🚀</span>
                Create Admin Account
              </>
            )}
          </button>
        </motion.form>

        <div className="setup-footer">
          <p>After setup, you'll be redirected to the login page.</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-setup {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .setup-container {
          max-width: 600px;
          width: 100%;
        }

        .setup-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .setup-logo .logo-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .setup-logo h1 {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, ${getAccentColor()}, ${getPrimaryBlue()});
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .setup-logo p {
          color: color-mix(in srgb, var(--text-primary) 70%, transparent);
          font-size: 1.1rem;
        }

        .security-notice {
          background: color-mix(in srgb, ${getWarningColor()} 10%, transparent);
          border: 1px solid color-mix(in srgb, ${getWarningColor()} 30%, transparent);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 2rem;
          text-align: left;
        }

        .security-notice h3 {
          color: ${getWarningColor()};
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .security-notice p {
          color: color-mix(in srgb, var(--text-primary) 80%, transparent);
          line-height: 1.5;
        }

        .setup-form {
          background: color-mix(in srgb, var(--text-primary) 5%, transparent);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          margin-bottom: 2rem;
        }

        .setup-form h2 {
          color: ${getAccentColor()};
          margin-bottom: 2rem;
          text-align: center;
          font-size: 1.8rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          color: color-mix(in srgb, var(--text-primary) 80%, transparent);
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .form-group input {
          width: 100%;
          padding: 1rem;
          background: color-mix(in srgb, var(--text-primary) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--text-primary) 20%, transparent);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: ${getAccentColor()};
          box-shadow: 0 0 20px color-mix(in srgb, var(--accent-primary) 30%, transparent);
        }

        .field-hint {
          font-size: 0.8rem;
          color: color-mix(in srgb, var(--text-primary) 60%, transparent);
          margin-top: 0.5rem;
        }

        .password-requirements {
          margin-top: 1rem;
          padding: 1rem;
          background: ${resolvedTheme === 'light' ? 'color-mix(in srgb, var(--text-primary) 10%, transparent)' : 'color-mix(in srgb, var(--bg-primary) 30%, transparent)'};
          border-radius: 8px;
        }

        .req-title {
          font-size: 0.9rem;
          color: color-mix(in srgb, var(--text-primary) 80%, transparent);
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .req-item {
          font-size: 0.8rem;
          color: color-mix(in srgb, var(--text-primary) 50%, transparent);
          margin: 0.3rem 0;
          transition: color 0.3s ease;
        }

        .req-item.valid {
          color: ${getAccentColor()};
        }

        .password-match {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .password-match.valid {
          color: ${getAccentColor()};
        }

        .password-match.invalid {
          color: ${getOrangeColor()};
        }

        .error-message {
          background: color-mix(in srgb, ${getPinkColor()} 10%, transparent);
          border: 1px solid color-mix(in srgb, ${getPinkColor()} 30%, transparent);
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
          color: ${getPinkColor()};
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .setup-button {
          width: 100%;
          padding: 1.2rem;
          background: linear-gradient(135deg, ${getAccentColor()}, ${getPrimaryBlue()});
          border: none;
          border-radius: 8px;
          color: var(--bg-primary);
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .setup-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .setup-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px color-mix(in srgb, var(--accent-primary) 40%, transparent);
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid var(--bg-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .button-icon {
          font-size: 1.2rem;
        }

        .setup-footer {
          text-align: center;
          color: color-mix(in srgb, var(--text-primary) 60%, transparent);
          font-size: 0.9rem;
        }

        .success-message {
          text-align: center;
          padding: 3rem;
          background: color-mix(in srgb, var(--text-primary) 5%, transparent);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 2rem;
        }

        .success-message h2 {
          color: ${getAccentColor()};
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .success-message p {
          color: color-mix(in srgb, var(--text-primary) 80%, transparent);
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .setup-summary {
          background: ${resolvedTheme === 'light' ? 'color-mix(in srgb, var(--text-primary) 10%, transparent)' : 'color-mix(in srgb, var(--bg-primary) 30%, transparent)'};
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
          text-align: left;
        }

        .setup-summary h3 {
          color: ${getPrimaryBlue()};
          margin-bottom: 1rem;
        }

        .detail-item {
          margin: 0.8rem 0;
          color: color-mix(in srgb, var(--text-primary) 80%, transparent);
        }

        .detail-item strong {
          color: ${getAccentColor()};
        }
      ` }} />
    </div>
  )
}

export default AdminSetup