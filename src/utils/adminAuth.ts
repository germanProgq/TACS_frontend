// Database-backed admin authentication system
import { database, type AdminUser, type IPRecord, type AuditLog } from './database'

// Re-export types for easier access
export type { AdminUser, IPRecord, AuditLog }

// Simple SHA-256 implementation for password hashing
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Encrypt password with salt
export async function encryptPassword(password: string): Promise<string> {
  const salt = 'TACS_SECURE_SALT_2024'
  const saltedPassword = password + salt
  return await sha256(saltedPassword)
}

// Verify credentials against database
export async function verifyCredentials(username: string, password: string): Promise<{
  success: boolean
  role?: 'admin' | 'moderator' | 'super_admin'
  permissions?: string[]
  user?: AdminUser
}> {
  try {
    // Rate limiting simulation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Use database authentication
    const authResult = await database.authenticateUser(username, password)
    
    if (authResult.success && authResult.user) {
      console.log(`[ADMIN AUTH] Successful login for user: ${username} at ${new Date().toISOString()}`)
      
      return {
        success: true,
        role: authResult.user.role,
        permissions: authResult.user.permissions,
        user: authResult.user
      }
    } else {
      console.warn(`[ADMIN AUTH] Failed login attempt for user: ${username} - ${authResult.message}`)
      
      return { success: false }
    }
  } catch (error) {
    console.error('[ADMIN AUTH] Authentication error:', error)
    return { success: false }
  }
}

// Generate secure session token
export function generateSecureToken(): string {
  const timestamp = Date.now()
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  
  const randomString = Array.from(randomBytes, byte => 
    byte.toString(16).padStart(2, '0')
  ).join('')
  
  return btoa(`${timestamp}-${randomString}`)
}

// Validate session token
export function validateToken(token: string): boolean {
  try {
    const decoded = atob(token)
    const [timestamp] = decoded.split('-')
    const tokenAge = Date.now() - parseInt(timestamp)
    
    // Token expires after 4 hours
    const maxAge = 4 * 60 * 60 * 1000
    
    return tokenAge < maxAge
  } catch {
    return false
  }
}

// Database-backed IP management
export async function getIPRecords(): Promise<IPRecord[]> {
  return await database.getAll('ipRecords')
}

export async function updateIPStatus(ip: string, status: 'allowed' | 'blocked' | 'monitored', reason?: string): Promise<boolean> {
  try {
    const existingRecord = await database.findByIndex('ipRecords', 'ip', ip)
    
    if (existingRecord) {
      const updatedRecord = {
        ...existingRecord,
        status,
        reason,
        timestamp: new Date()
      }
      await database.update('ipRecords', updatedRecord)
    } else {
      const newRecord = {
        id: `ip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ip,
        status,
        reason,
        timestamp: new Date(),
        requests: 0,
        lastActivity: new Date(),
        riskScore: 0
      }
      await database.insert('ipRecords', newRecord)
    }
    
    await database.logAuditAction('ip_status_updated', 'system', ip, `Status changed to ${status}`)
    console.log(`[ADMIN] IP ${ip} status updated to ${status}`)
    return true
  } catch (error) {
    console.error('[ADMIN] Failed to update IP status:', error)
    return false
  }
}

export async function deleteIPRecord(ip: string): Promise<boolean> {
  try {
    const record = await database.findByIndex<IPRecord>('ipRecords', 'ip', ip)
    if (record) {
      await database.delete('ipRecords', record.id)
      await database.logAuditAction('ip_record_deleted', 'system', ip, 'IP record deleted')
      console.log(`[ADMIN] IP record ${ip} deleted`)
      return true
    }
    return false
  } catch (error) {
    console.error('[ADMIN] Failed to delete IP record:', error)
    return false
  }
}

// Database-backed user management
export async function getUsers(): Promise<AdminUser[]> {
  return await database.getAll('adminUsers')
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended' | 'disabled'): Promise<boolean> {
  try {
    const user = await database.getById<AdminUser>('adminUsers', userId)
    
    if (user) {
      const updatedUser = { ...user, status }
      await database.update('adminUsers', updatedUser)
      await database.logAuditAction('user_status_updated', 'system', userId, `Status changed to ${status}`)
      console.log(`[ADMIN] User ${user.username} status updated to ${status}`)
      return true
    }
    
    return false
  } catch (error) {
    console.error('[ADMIN] Failed to update user status:', error)
    return false
  }
}

// Database-backed audit logging
export function logAdminAction(action: string, user: string, target?: string, details?: string) {
  // Use database audit logging
  database.logAuditAction(action, user, target, details)
  console.log(`[AUDIT] ${user} performed ${action}${target ? ` on ${target}` : ''}`)
}

export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  const allLogs = await database.getAll('auditLogs') as AuditLog[]
  return allLogs
    .sort((a: AuditLog, b: AuditLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}