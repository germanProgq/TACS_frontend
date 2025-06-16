// TACS Database System - IndexedDB-based local database
// Provides persistent storage for admin credentials, news, and system data

export interface DatabaseSchema {
  adminUsers: AdminUser[]
  announcements: Announcement[]
  ipRecords: IPRecord[]
  auditLogs: AuditLog[]
  systemConfig: SystemConfig[]
}

export interface AdminUser {
  id: string
  username: string
  passwordHash: string
  role: 'admin' | 'moderator' | 'super_admin'
  permissions: string[]
  email?: string
  createdAt: Date
  lastLogin?: Date
  status: 'active' | 'suspended' | 'disabled'
  twoFactorEnabled: boolean
  loginAttempts: number
  lockoutUntil?: Date
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: 'news' | 'maintenance' | 'feature' | 'alert'
  priority: 'low' | 'medium' | 'high' | 'critical'
  isActive: boolean
  publishedAt: Date
  expiresAt?: Date
  createdBy: string
  tags: string[]
  viewCount: number
}

export interface IPRecord {
  id: string
  ip: string
  status: 'allowed' | 'blocked' | 'monitored'
  reason?: string
  timestamp: Date
  country?: string
  region?: string
  city?: string
  requests: number
  lastActivity: Date
  riskScore: number
}

export interface AuditLog {
  id: string
  action: string
  user: string
  target?: string
  timestamp: Date
  details: string
  ipAddress?: string
  userAgent?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
}

export interface SystemConfig {
  id: string
  key: string
  value: string | number | boolean | object
  category: 'security' | 'performance' | 'features' | 'ui'
  description: string
  updatedAt: Date
  updatedBy: string
}

class TacsDatabase {
  private db: IDBDatabase | null = null
  private readonly dbName = 'TacsAdminDatabase'
  private readonly version = 2 // Increment version to trigger database upgrade
  private initPromise: Promise<void> | null = null

  constructor() {
    this.initPromise = this.initDatabase()
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise
    }
    if (!this.db) {
      throw new Error('Database failed to initialize')
    }
  }

  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error('[DATABASE] Failed to open database:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('[DATABASE] Database opened successfully')
        this.seedInitialData()
        resolve()
      }

      request.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        const oldVersion = event.oldVersion
        
        // Clear existing object stores if upgrading from version 1
        if (oldVersion === 1) {
          const existingStores = ['announcements', 'adminUsers', 'ipRecords', 'auditLogs', 'systemConfig']
          existingStores.forEach(storeName => {
            if (this.db!.objectStoreNames.contains(storeName)) {
              this.db!.deleteObjectStore(storeName)
            }
          })
        }
        
        this.createTables()
      }
    })
  }

  private createTables(): void {
    if (!this.db) return

    // Admin Users table
    if (!this.db.objectStoreNames.contains('adminUsers')) {
      const adminStore = this.db.createObjectStore('adminUsers', { keyPath: 'id' })
      adminStore.createIndex('username', 'username', { unique: true })
      adminStore.createIndex('email', 'email', { unique: false })
      adminStore.createIndex('role', 'role', { unique: false })
    }

    // Announcements table
    if (!this.db.objectStoreNames.contains('announcements')) {
      const announcementStore = this.db.createObjectStore('announcements', { keyPath: 'id' })
      announcementStore.createIndex('type', 'type', { unique: false })
      announcementStore.createIndex('priority', 'priority', { unique: false })
      // Remove isActive index since boolean indexing is problematic in IndexedDB
      announcementStore.createIndex('publishedAt', 'publishedAt', { unique: false })
    }

    // IP Records table
    if (!this.db.objectStoreNames.contains('ipRecords')) {
      const ipStore = this.db.createObjectStore('ipRecords', { keyPath: 'id' })
      ipStore.createIndex('ip', 'ip', { unique: true })
      ipStore.createIndex('status', 'status', { unique: false })
      ipStore.createIndex('country', 'country', { unique: false })
    }

    // Audit Logs table
    if (!this.db.objectStoreNames.contains('auditLogs')) {
      const auditStore = this.db.createObjectStore('auditLogs', { keyPath: 'id' })
      auditStore.createIndex('user', 'user', { unique: false })
      auditStore.createIndex('action', 'action', { unique: false })
      auditStore.createIndex('timestamp', 'timestamp', { unique: false })
    }

    // System Config table
    if (!this.db.objectStoreNames.contains('systemConfig')) {
      const configStore = this.db.createObjectStore('systemConfig', { keyPath: 'id' })
      configStore.createIndex('key', 'key', { unique: true })
      configStore.createIndex('category', 'category', { unique: false })
    }
  }

  private async seedInitialData(): Promise<void> {
    try {
      console.log('[DATABASE] Starting to seed initial data...')
      // Check if data already exists
      const existingAnnouncements = await this.getAll<Announcement>('announcements')
      console.log('[DATABASE] Existing announcements:', existingAnnouncements)
      
      if (existingAnnouncements.length > 0) {
        console.log('[DATABASE] Data already exists, skipping seed')
        return
      }

      // Only seed initial announcements - no admin users
      // Admin users should be created through the setup process

      // Seed announcements
      console.log('[DATABASE] Seeding announcements...')
      const announcements: Announcement[] = [
        {
          id: 'ann_001',
          title: 'TACS System Launch',
          content: 'Welcome to the Traffic AI Control System (TACS). Our revolutionary AI-powered traffic management system is now live and optimizing traffic flow in real-time.',
          type: 'news',
          priority: 'high',
          isActive: true,
          publishedAt: new Date('2024-12-01'),
          createdBy: 'admin',
          tags: ['launch', 'ai', 'traffic'],
          viewCount: 0
        },
        {
          id: 'ann_002',
          title: 'Advanced AI Features Update',
          content: 'New neural network capabilities have been deployed including advanced pattern recognition, predictive analytics, and real-time optimization algorithms.',
          type: 'feature',
          priority: 'medium',
          isActive: true,
          publishedAt: new Date('2024-12-10'),
          createdBy: 'admin',
          tags: ['update', 'neural-network', 'optimization'],
          viewCount: 0
        },
        {
          id: 'ann_003',
          title: 'Performance Optimization Complete',
          content: 'System performance has been enhanced with 99.9% uptime, sub-millisecond response times, and improved scalability for handling millions of traffic data points.',
          type: 'news',
          priority: 'medium',
          isActive: true,
          publishedAt: new Date('2024-12-15'),
          createdBy: 'moderator',
          tags: ['performance', 'optimization', 'scalability'],
          viewCount: 0
        }
      ]

      // Insert only announcements
      console.log('[DATABASE] Inserting announcements...')
      const insertPromises = announcements.map(announcement => this.insert('announcements', announcement))
      await Promise.all(insertPromises)

      console.log('[DATABASE] Initial data seeded successfully')
      
      // Verify the data was inserted
      const verifyAnnouncements = await this.getAll<Announcement>('announcements')
      console.log('[DATABASE] Verification - announcements in DB:', verifyAnnouncements)
    } catch (error) {
      console.error('[DATABASE] Failed to seed initial data:', error)
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = 'TACS_SECURE_SALT_2024_DB'
    const encoder = new TextEncoder()
    const data = encoder.encode(password + salt)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  async insert<T>(tableName: string, data: T): Promise<string> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite')
      const store = transaction.objectStore(tableName)
      const request = store.add(data)

      request.onsuccess = () => {
        console.log(`[DATABASE] insert(${tableName}) success:`, request.result)
        resolve(request.result as string)
      }
      request.onerror = () => {
        console.error(`[DATABASE] insert(${tableName}) error:`, request.error)
        reject(request.error)
      }
    })
  }

  async getById<T>(tableName: string, id: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly')
      const store = transaction.objectStore(tableName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll<T>(tableName: string): Promise<T[]> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly')
      const store = transaction.objectStore(tableName)
      const request = store.getAll()

      request.onsuccess = () => {
        console.log(`[DATABASE] getAll(${tableName}) result:`, request.result)
        resolve(request.result || [])
      }
      request.onerror = () => {
        console.error(`[DATABASE] getAll(${tableName}) error:`, request.error)
        reject(request.error)
      }
    })
  }

  async update<T>(tableName: string, data: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite')
      const store = transaction.objectStore(tableName)
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(tableName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readwrite')
      const store = transaction.objectStore(tableName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async findByIndex<T>(tableName: string, indexName: string, value: string | number): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly')
      const store = transaction.objectStore(tableName)
      const index = store.index(indexName)
      const request = index.get(value)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async findAllByIndex<T>(tableName: string, indexName: string, value: string | number): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([tableName], 'readonly')
      const store = transaction.objectStore(tableName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // Authentication methods
  async authenticateUser(username: string, password: string): Promise<{
    success: boolean
    user?: AdminUser
    message?: string
  }> {
    try {
      const user = await this.findByIndex<AdminUser>('adminUsers', 'username', username)
      
      if (!user) {
        await this.logAuditAction('login_failed', username, undefined, 'User not found')
        return { success: false, message: 'Invalid credentials' }
      }

      if (user.status !== 'active') {
        await this.logAuditAction('login_blocked', username, undefined, `Account status: ${user.status}`)
        return { success: false, message: 'Account is not active' }
      }

      if (user.lockoutUntil && new Date() < user.lockoutUntil) {
        return { success: false, message: 'Account is locked. Try again later.' }
      }

      const hashedPassword = await this.hashPassword(password)
      
      if (user.passwordHash !== hashedPassword) {
        // Increment login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }
        
        await this.update('adminUsers', user)
        await this.logAuditAction('login_failed', username, undefined, 'Invalid password')
        
        return { success: false, message: 'Invalid credentials' }
      }

      // Successful login - reset attempts and update last login
      user.loginAttempts = 0
      user.lockoutUntil = undefined
      user.lastLogin = new Date()
      await this.update('adminUsers', user)
      
      await this.logAuditAction('login_success', username, undefined, 'Successful authentication')
      
      return { success: true, user }
    } catch (error) {
      console.error('[DATABASE] Authentication error:', error)
      return { success: false, message: 'Authentication system error' }
    }
  }

  // Audit logging
  async logAuditAction(action: string, user: string, target?: string, details?: string): Promise<void> {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      user,
      target,
      timestamp: new Date(),
      details: details || '',
      severity: action.includes('failed') || action.includes('blocked') ? 'warning' : 'info'
    }

    await this.insert('auditLogs', log)
  }

  // Announcement management
  async getActiveAnnouncements(): Promise<Announcement[]> {
    try {
      console.log('[DATABASE] Getting active announcements...')
      // Get all announcements and filter in JavaScript since IndexedDB boolean indexing is problematic
      const allAnnouncements = await this.getAll<Announcement>('announcements')
      console.log('[DATABASE] All announcements from DB:', allAnnouncements)
      const now = new Date()
      
      const activeAnnouncements = allAnnouncements
        .filter(ann => ann.isActive && (!ann.expiresAt || new Date(ann.expiresAt) > now))
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      
      console.log('[DATABASE] Filtered active announcements:', activeAnnouncements)
      return activeAnnouncements
    } catch (error) {
      console.error('[DATABASE] Error getting active announcements:', error)
      return []
    }
  }

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'viewCount'>): Promise<string> {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      viewCount: 0
    }

    await this.insert('announcements', newAnnouncement)
    await this.logAuditAction('announcement_created', announcement.createdBy, newAnnouncement.id, announcement.title)
    
    return newAnnouncement.id
  }

  // Admin user management
  async createAdminUser(userData: {
    username: string
    password: string
    email: string
    role: 'admin' | 'moderator' | 'super_admin'
    permissions: string[]
  }): Promise<string> {
    const existingUser = await this.findByIndex<AdminUser>('adminUsers', 'username', userData.username)
    if (existingUser) {
      throw new Error('Username already exists')
    }

    const newUser: AdminUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: userData.username,
      passwordHash: await this.hashPassword(userData.password),
      role: userData.role,
      permissions: userData.permissions,
      email: userData.email,
      createdAt: new Date(),
      status: 'active',
      twoFactorEnabled: false,
      loginAttempts: 0
    }

    await this.insert('adminUsers', newUser)
    await this.logAuditAction('admin_user_created', 'system', newUser.id, `Created ${userData.role} user: ${userData.username}`)
    
    return newUser.id
  }

  // Check if system has any admin users (for setup)
  async hasAdminUsers(): Promise<boolean> {
    const users = await this.getAll<AdminUser>('adminUsers')
    return users.length > 0
  }

  // Initialize first admin user (setup process)
  async initializeFirstAdmin(setupData: {
    username: string
    password: string
    email: string
  }): Promise<string> {
    const hasUsers = await this.hasAdminUsers()
    if (hasUsers) {
      throw new Error('Admin users already exist. Cannot initialize.')
    }

    return await this.createAdminUser({
      ...setupData,
      role: 'super_admin',
      permissions: ['read', 'write', 'delete', 'manage_users', 'manage_announcements', 'manage_ips', 'system_config']
    })
  }
}

// Create singleton instance
export const database = new TacsDatabase()
export default database