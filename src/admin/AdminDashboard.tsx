import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getIPRecords, updateIPStatus, deleteIPRecord, getUsers, updateUserStatus, logAdminAction, getAuditLogs, validateToken, type IPRecord, type AdminUser } from '../utils/adminAuth'
const AdminDashboard = () => {
  const navigate = useNavigate()
  
  const [user, setUser] = useState<{
    username: string
    role: 'admin' | 'moderator'
    permissions: string[]
  } | null>(null)
  const [activeTab, setActiveTab] = useState('announcements')
  const [announcements, setAnnouncements] = useState<{
    id: string
    title: string
    content: string
    type: string
    priority: string
    timestamp: Date
    author: string
    tags: string[]
    readTime: number
  }[]>([])
  const [ipRecords, setIPRecords] = useState<IPRecord[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [auditLogs, setAuditLogs] = useState<{
    id: string
    timestamp: Date
    user: string
    action: string
    target?: string
    details?: string
  }[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'update',
    priority: 'medium'
  })

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')
    
    if (!token || !userData || !validateToken(token)) {
      navigate('/admin')
      return
    }
    
    setUser(JSON.parse(userData))
    loadData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    navigate('/admin')
  }

  const loadData = async () => {
    try {
      const [ipData, userData, auditData] = await Promise.all([
        getIPRecords(),
        getUsers(),
        getAuditLogs(50)
      ])
      
      setIPRecords(ipData)
      setUsers(userData)
      setAuditLogs(auditData)
    } catch (error) {
      console.error('Failed to load admin data:', error)
    }
  }

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return

    const announcement = {
      id: Math.random().toString(36).substr(2, 9),
      ...newAnnouncement,
      timestamp: new Date(),
      author: user?.username || 'unknown',
      tags: ['admin'],
      readTime: Math.ceil(newAnnouncement.content.length / 200)
    }

    setAnnouncements(prev => [announcement, ...prev])
    setNewAnnouncement({ title: '', content: '', type: 'update', priority: 'medium' })
    
    logAdminAction('CREATE_ANNOUNCEMENT', user?.username || 'unknown', announcement.title)
  }

  const handleIPAction = async (ip: string, action: 'block' | 'allow' | 'monitor' | 'delete') => {
    try {
      if (action === 'delete') {
        await deleteIPRecord(ip)
        setIPRecords(prev => prev.filter(record => record.ip !== ip))
      } else {
        const status = action === 'block' ? 'blocked' : action === 'allow' ? 'allowed' : 'monitored'
        await updateIPStatus(ip, status, `${action} by admin`)
        setIPRecords(prev => prev.map(record => 
          record.ip === ip ? { ...record, status, reason: `${action} by admin` } : record
        ))
      }
      
      logAdminAction(`IP_${action.toUpperCase()}`, user?.username || 'unknown', ip)
    } catch (error) {
      console.error(`Failed to ${action} IP:`, error)
    }
  }

  const handleUserAction = async (userId: string, action: 'suspend' | 'ban' | 'activate') => {
    try {
      const status = action === 'suspend' ? 'suspended' : action === 'ban' ? 'disabled' : 'active'
      await updateUserStatus(userId, status)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u))
      
      const targetUser = users.find(u => u.id === userId)
      logAdminAction(`USER_${action.toUpperCase()}`, user?.username || 'unknown', targetUser?.username)
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
    }
  }

  const tabs = [
    { id: 'announcements', label: 'Announcements', icon: '📢', permission: 'manage_announcements' },
    { id: 'ips', label: 'IP Management', icon: '🌐', permission: 'manage_ips' },
    { id: 'users', label: 'User Management', icon: '👥', permission: 'manage_users' },
    { id: 'audit', label: 'Audit Logs', icon: '📋', permission: 'read' },
    { id: 'system', label: 'System Config', icon: '⚙️', permission: 'system_config' }
  ].filter(tab => user?.permissions.includes(tab.permission))

  if (!user) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ color: 'var(--accent-primary)', fontSize: '24px' }}
        >
          ⚡
        </motion.div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <motion.header
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <div className="header-info">
            <h1>TACS Admin Dashboard</h1>
            <div className="user-info">
              <span className="user-role">{user.role}</span>
              <span className="user-name">{user.username}</span>
            </div>
          </div>
          
          <motion.button
            className="logout-button"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="logout-icon">🔓</span>
            Logout
          </motion.button>
        </div>
      </motion.header>

      <div className="dashboard-content">
        <motion.nav
          className="dashboard-nav"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05, backgroundColor: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </motion.button>
          ))}
        </motion.nav>

        <motion.main
          className="dashboard-main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'announcements' && (
              <motion.div
                key="announcements"
                className="admin-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2>Announcement Management</h2>
                
                <div className="announcement-form">
                  <h3>Create New Announcement</h3>
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Announcement Title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    />
                    
                    <select
                      value={newAnnouncement.type}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="update">System Update</option>
                      <option value="feature">New Feature</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="security">Security</option>
                      <option value="research">Research</option>
                    </select>
                    
                    <select
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  
                  <textarea
                    placeholder="Announcement Content (Markdown supported)"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                    rows={10}
                  />
                  
                  <motion.button
                    className="create-button"
                    onClick={handleCreateAnnouncement}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Create Announcement
                  </motion.button>
                </div>

                <div className="announcements-list">
                  <h3>Recent Announcements</h3>
                  {announcements.map((announcement, index) => (
                    <motion.div
                      key={announcement.id}
                      className="announcement-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="announcement-header">
                        <h4>{announcement.title}</h4>
                        <span className={`priority-badge ${announcement.priority}`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="announcement-preview">
                        {announcement.content.substring(0, 150)}...
                      </p>
                      <div className="announcement-meta">
                        <span>{announcement.timestamp.toLocaleDateString()}</span>
                        <span>{announcement.author}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'ips' && (
              <motion.div
                key="ips"
                className="admin-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2>IP Address Management</h2>
                
                <div className="ip-records">
                  {ipRecords.map((record, index) => (
                    <motion.div
                      key={record.ip}
                      className={`ip-record ${record.status}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="ip-info">
                        <div className="ip-address">{record.ip}</div>
                        <div className="ip-meta">
                          <span className={`status-badge ${record.status}`}>
                            {record.status}
                          </span>
                          <span className="ip-country">{record.country || 'Unknown'}</span>
                          <span className="ip-requests">{record.requests} requests</span>
                        </div>
                        {record.reason && (
                          <div className="ip-reason">{record.reason}</div>
                        )}
                      </div>
                      
                      <div className="ip-actions">
                        <motion.button
                          className="action-button allow"
                          onClick={() => handleIPAction(record.ip, 'allow')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Allow
                        </motion.button>
                        <motion.button
                          className="action-button monitor"
                          onClick={() => handleIPAction(record.ip, 'monitor')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Monitor
                        </motion.button>
                        <motion.button
                          className="action-button block"
                          onClick={() => handleIPAction(record.ip, 'block')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Block
                        </motion.button>
                        <motion.button
                          className="action-button delete"
                          onClick={() => handleIPAction(record.ip, 'delete')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Delete
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                className="admin-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2>User Management</h2>
                
                <div className="user-records">
                  {users.map((userRecord, index) => (
                    <motion.div
                      key={userRecord.id}
                      className={`user-record ${userRecord.status}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="user-info">
                        <div className="user-name">{userRecord.username}</div>
                        <div className="user-email">{userRecord.email}</div>
                        <div className="user-meta">
                          <span className={`role-badge ${userRecord.role}`}>
                            {userRecord.role}
                          </span>
                          <span className={`status-badge ${userRecord.status}`}>
                            {userRecord.status}
                          </span>
                          <span className="last-login">
                            Last login: {userRecord.lastLogin ? userRecord.lastLogin.toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="user-actions">
                        <motion.button
                          className="action-button activate"
                          onClick={() => handleUserAction(userRecord.id, 'activate')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Activate
                        </motion.button>
                        <motion.button
                          className="action-button suspend"
                          onClick={() => handleUserAction(userRecord.id, 'suspend')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Suspend
                        </motion.button>
                        <motion.button
                          className="action-button ban"
                          onClick={() => handleUserAction(userRecord.id, 'ban')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Ban
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div
                key="audit"
                className="admin-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2>Audit Logs</h2>
                
                <div className="audit-logs">
                  {auditLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      className="audit-log"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="log-timestamp">
                        {log.timestamp.toLocaleString()}
                      </div>
                      <div className="log-content">
                        <span className="log-user">{log.user}</span>
                        <span className="log-action">{log.action}</span>
                        {log.target && <span className="log-target">on {log.target}</span>}
                      </div>
                      {log.details && (
                        <div className="log-details">{log.details}</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  )
}

export default AdminDashboard