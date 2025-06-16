import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

interface AdminState {
  isAuthenticated: boolean
  token: string | null
  user: {
    username: string
    role: 'admin' | 'moderator'
    permissions: string[]
  } | null
}

export const AdminPanel = () => {
  const [adminState, setAdminState] = useState<AdminState>({
    isAuthenticated: false,
    token: null,
    user: null
  })

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('admin_token')
    const user = localStorage.getItem('admin_user')
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user)
        setAdminState({
          isAuthenticated: true,
          token,
          user: parsedUser
        })
      } catch {
        // Clear invalid session data
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    }
  }, [])


  return (
    <div className="admin-panel">
      <AnimatePresence mode="wait">
        {!adminState.isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <AdminLogin />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <AdminDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}